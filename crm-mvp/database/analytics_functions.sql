-- Advanced Database Functions for CRM Analytics
-- Additional functions to support advanced reporting and business intelligence

-- Function to calculate deal conversion rates
CREATE OR REPLACE FUNCTION get_conversion_rates(target_user_id UUID, date_range_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_deals INTEGER;
    won_deals INTEGER;
    lost_deals INTEGER;
    conversion_rate DECIMAL;
    avg_deal_value DECIMAL;
    avg_time_to_close DECIMAL;
BEGIN
    -- Get deal statistics for the specified period
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN stage = 'closed_won' THEN 1 END) as won,
        COUNT(CASE WHEN stage = 'closed_lost' THEN 1 END) as lost,
        AVG(CASE WHEN stage = 'closed_won' THEN value END) as avg_value,
        AVG(CASE WHEN actual_close_date IS NOT NULL THEN 
            EXTRACT(days FROM actual_close_date - created_at::date) 
        END) as avg_days
    INTO total_deals, won_deals, lost_deals, avg_deal_value, avg_time_to_close
    FROM public.deals 
    WHERE user_id = target_user_id 
    AND created_at >= NOW() - INTERVAL '1 day' * date_range_days;
    
    -- Calculate conversion rate
    IF total_deals > 0 THEN
        conversion_rate := (won_deals::DECIMAL / total_deals::DECIMAL) * 100;
    ELSE
        conversion_rate := 0;
    END IF;
    
    -- Build result JSON
    result := json_build_object(
        'total_deals', total_deals,
        'won_deals', won_deals,
        'lost_deals', lost_deals,
        'conversion_rate', ROUND(conversion_rate, 2),
        'average_deal_value', ROUND(COALESCE(avg_deal_value, 0), 2),
        'average_time_to_close_days', ROUND(COALESCE(avg_time_to_close, 0), 1),
        'date_range_days', date_range_days,
        'calculated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contact engagement metrics
CREATE OR REPLACE FUNCTION get_contact_engagement_metrics(target_user_id UUID, date_range_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_contacts', (
            SELECT COUNT(*) 
            FROM public.contacts 
            WHERE user_id = target_user_id
        ),
        'active_contacts', (
            SELECT COUNT(DISTINCT contact_id) 
            FROM public.activities 
            WHERE user_id = target_user_id 
            AND created_at >= NOW() - INTERVAL '1 day' * date_range_days
            AND contact_id IS NOT NULL
        ),
        'contacts_with_recent_activity', (
            SELECT COUNT(*) 
            FROM public.contacts 
            WHERE user_id = target_user_id 
            AND last_contact_date >= NOW() - INTERVAL '1 day' * date_range_days
        ),
        'contacts_needing_follow_up', (
            SELECT COUNT(*) 
            FROM public.contacts c
            WHERE c.user_id = target_user_id 
            AND c.status IN ('lead', 'prospect')
            AND (c.last_contact_date IS NULL OR c.last_contact_date < NOW() - INTERVAL '7 days')
        ),
        'engagement_rate', (
            SELECT CASE 
                WHEN total.count > 0 THEN 
                    ROUND((active.count::DECIMAL / total.count::DECIMAL) * 100, 2)
                ELSE 0 
            END
            FROM 
                (SELECT COUNT(*) as count FROM public.contacts WHERE user_id = target_user_id) total,
                (SELECT COUNT(DISTINCT contact_id) as count 
                 FROM public.activities 
                 WHERE user_id = target_user_id 
                 AND created_at >= NOW() - INTERVAL '1 day' * date_range_days
                 AND contact_id IS NOT NULL) active
        ),
        'date_range_days', date_range_days,
        'calculated_at', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity productivity metrics
CREATE OR REPLACE FUNCTION get_activity_productivity_metrics(target_user_id UUID, date_range_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_activities', (
            SELECT COUNT(*) 
            FROM public.activities 
            WHERE user_id = target_user_id 
            AND created_at >= NOW() - INTERVAL '1 day' * date_range_days
        ),
        'completed_activities', (
            SELECT COUNT(*) 
            FROM public.activities 
            WHERE user_id = target_user_id 
            AND completed = true
            AND created_at >= NOW() - INTERVAL '1 day' * date_range_days
        ),
        'overdue_activities', (
            SELECT COUNT(*) 
            FROM public.activities 
            WHERE user_id = target_user_id 
            AND completed = false
            AND scheduled_at IS NOT NULL 
            AND scheduled_at < NOW()
        ),
        'upcoming_activities', (
            SELECT COUNT(*) 
            FROM public.activities 
            WHERE user_id = target_user_id 
            AND completed = false
            AND scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        ),
        'completion_rate', (
            SELECT CASE 
                WHEN total.count > 0 THEN 
                    ROUND((completed.count::DECIMAL / total.count::DECIMAL) * 100, 2)
                ELSE 0 
            END
            FROM 
                (SELECT COUNT(*) as count 
                 FROM public.activities 
                 WHERE user_id = target_user_id 
                 AND created_at >= NOW() - INTERVAL '1 day' * date_range_days) total,
                (SELECT COUNT(*) as count 
                 FROM public.activities 
                 WHERE user_id = target_user_id 
                 AND completed = true
                 AND created_at >= NOW() - INTERVAL '1 day' * date_range_days) completed
        ),
        'activities_by_type', (
            SELECT json_object_agg(type, activity_count)
            FROM (
                SELECT type, COUNT(*) as activity_count
                FROM public.activities 
                WHERE user_id = target_user_id 
                AND created_at >= NOW() - INTERVAL '1 day' * date_range_days
                GROUP BY type
            ) type_stats
        ),
        'date_range_days', date_range_days,
        'calculated_at', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate sales velocity
CREATE OR REPLACE FUNCTION get_sales_velocity_metrics(target_user_id UUID, date_range_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    avg_deal_size DECIMAL;
    deals_closed INTEGER;
    avg_sales_cycle DECIMAL;
    velocity DECIMAL;
BEGIN
    -- Calculate average deal size for closed-won deals
    SELECT 
        AVG(value),
        COUNT(*),
        AVG(EXTRACT(days FROM actual_close_date - created_at::date))
    INTO avg_deal_size, deals_closed, avg_sales_cycle
    FROM public.deals 
    WHERE user_id = target_user_id 
    AND stage = 'closed_won'
    AND actual_close_date >= NOW() - INTERVAL '1 day' * date_range_days;
    
    -- Calculate sales velocity (deals * avg_size / avg_cycle)
    IF avg_sales_cycle > 0 AND deals_closed > 0 THEN
        velocity := (deals_closed * COALESCE(avg_deal_size, 0)) / avg_sales_cycle;
    ELSE
        velocity := 0;
    END IF;
    
    result := json_build_object(
        'average_deal_size', ROUND(COALESCE(avg_deal_size, 0), 2),
        'deals_closed', deals_closed,
        'average_sales_cycle_days', ROUND(COALESCE(avg_sales_cycle, 0), 1),
        'sales_velocity_per_day', ROUND(velocity, 2),
        'monthly_projection', ROUND(velocity * 30, 2),
        'quarterly_projection', ROUND(velocity * 90, 2),
        'date_range_days', date_range_days,
        'calculated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pipeline health score
CREATE OR REPLACE FUNCTION get_pipeline_health_score(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_pipeline_value DECIMAL;
    weighted_probability DECIMAL;
    stage_distribution JSON;
    health_score INTEGER;
    pipeline_quality TEXT;
BEGIN
    -- Calculate total pipeline value and weighted probability
    SELECT 
        COALESCE(SUM(value), 0),
        COALESCE(AVG(probability), 0)
    INTO total_pipeline_value, weighted_probability
    FROM public.deals 
    WHERE user_id = target_user_id 
    AND stage NOT IN ('closed_won', 'closed_lost');
    
    -- Get stage distribution
    SELECT json_object_agg(stage, stage_count)
    INTO stage_distribution
    FROM (
        SELECT stage, COUNT(*) as stage_count
        FROM public.deals 
        WHERE user_id = target_user_id 
        AND stage NOT IN ('closed_won', 'closed_lost')
        GROUP BY stage
    ) stage_stats;
    
    -- Calculate health score (0-100)
    -- Based on pipeline value, probability distribution, and stage balance
    health_score := CASE
        WHEN total_pipeline_value = 0 THEN 0
        WHEN weighted_probability >= 75 AND total_pipeline_value > 10000 THEN 95
        WHEN weighted_probability >= 60 AND total_pipeline_value > 5000 THEN 85
        WHEN weighted_probability >= 45 AND total_pipeline_value > 2000 THEN 75
        WHEN weighted_probability >= 30 AND total_pipeline_value > 1000 THEN 65
        WHEN weighted_probability >= 20 THEN 55
        WHEN weighted_probability >= 10 THEN 45
        ELSE 25
    END;
    
    -- Determine pipeline quality
    pipeline_quality := CASE
        WHEN health_score >= 90 THEN 'Excellent'
        WHEN health_score >= 75 THEN 'Good'
        WHEN health_score >= 60 THEN 'Fair'
        WHEN health_score >= 40 THEN 'Poor'
        ELSE 'Critical'
    END;
    
    result := json_build_object(
        'total_pipeline_value', total_pipeline_value,
        'weighted_average_probability', ROUND(weighted_probability, 1),
        'health_score', health_score,
        'pipeline_quality', pipeline_quality,
        'stage_distribution', COALESCE(stage_distribution, '{}'::json),
        'calculated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comprehensive dashboard data
CREATE OR REPLACE FUNCTION get_comprehensive_dashboard_data(target_user_id UUID, date_range_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    result := json_build_object(
        'conversion_metrics', get_conversion_rates(target_user_id, date_range_days),
        'engagement_metrics', get_contact_engagement_metrics(target_user_id, date_range_days),
        'productivity_metrics', get_activity_productivity_metrics(target_user_id, date_range_days),
        'velocity_metrics', get_sales_velocity_metrics(target_user_id, date_range_days),
        'pipeline_health', get_pipeline_health_score(target_user_id),
        'basic_stats', (SELECT row_to_json(stats) FROM user_dashboard_stats stats WHERE user_id = target_user_id),
        'generated_at', NOW(),
        'user_id', target_user_id,
        'date_range_days', date_range_days
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top performing contacts
CREATE OR REPLACE FUNCTION get_top_performing_contacts(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(contact_data)
    INTO result
    FROM (
        SELECT json_build_object(
            'contact_id', c.id,
            'name', c.name,
            'company', c.company,
            'status', c.status,
            'total_deal_value', COALESCE(deal_stats.total_value, 0),
            'deal_count', COALESCE(deal_stats.deal_count, 0),
            'won_deals', COALESCE(deal_stats.won_deals, 0),
            'activity_count', COALESCE(activity_stats.activity_count, 0),
            'last_activity_date', activity_stats.last_activity_date,
            'conversion_rate', CASE 
                WHEN deal_stats.deal_count > 0 THEN 
                    ROUND((deal_stats.won_deals::DECIMAL / deal_stats.deal_count::DECIMAL) * 100, 1)
                ELSE 0 
            END
        ) as contact_data
        FROM public.contacts c
        LEFT JOIN (
            SELECT 
                contact_id,
                SUM(CASE WHEN stage = 'closed_won' THEN value ELSE 0 END) as total_value,
                COUNT(*) as deal_count,
                COUNT(CASE WHEN stage = 'closed_won' THEN 1 END) as won_deals
            FROM public.deals 
            WHERE user_id = target_user_id AND contact_id IS NOT NULL
            GROUP BY contact_id
        ) deal_stats ON c.id = deal_stats.contact_id
        LEFT JOIN (
            SELECT 
                contact_id,
                COUNT(*) as activity_count,
                MAX(created_at) as last_activity_date
            FROM public.activities 
            WHERE user_id = target_user_id AND contact_id IS NOT NULL
            GROUP BY contact_id
        ) activity_stats ON c.id = activity_stats.contact_id
        WHERE c.user_id = target_user_id
        ORDER BY COALESCE(deal_stats.total_value, 0) DESC, COALESCE(activity_stats.activity_count, 0) DESC
        LIMIT limit_count
    ) ranked_contacts;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get deal forecasting
CREATE OR REPLACE FUNCTION get_deal_forecasting(target_user_id UUID, forecast_months INTEGER DEFAULT 3)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'conservative_forecast', conservative.forecast,
        'optimistic_forecast', optimistic.forecast,
        'realistic_forecast', realistic.forecast,
        'deals_closing_this_month', current_month.deals,
        'forecast_months', forecast_months,
        'forecast_details', forecast_breakdown.details
    )
    INTO result
    FROM 
        -- Conservative forecast (only high probability deals)
        (SELECT SUM(value * (probability::DECIMAL / 100)) as forecast 
         FROM public.deals 
         WHERE user_id = target_user_id 
         AND stage NOT IN ('closed_won', 'closed_lost')
         AND probability >= 75
         AND expected_close_date <= NOW() + INTERVAL '1 month' * forecast_months) conservative,
        
        -- Optimistic forecast (all deals at full value)
        (SELECT SUM(value) as forecast 
         FROM public.deals 
         WHERE user_id = target_user_id 
         AND stage NOT IN ('closed_won', 'closed_lost')
         AND expected_close_date <= NOW() + INTERVAL '1 month' * forecast_months) optimistic,
        
        -- Realistic forecast (probability weighted)
        (SELECT SUM(value * (probability::DECIMAL / 100)) as forecast 
         FROM public.deals 
         WHERE user_id = target_user_id 
         AND stage NOT IN ('closed_won', 'closed_lost')
         AND expected_close_date <= NOW() + INTERVAL '1 month' * forecast_months) realistic,
        
        -- Current month deals
        (SELECT json_agg(json_build_object('name', name, 'value', value, 'probability', probability))
         FROM public.deals 
         WHERE user_id = target_user_id 
         AND stage NOT IN ('closed_won', 'closed_lost')
         AND expected_close_date >= DATE_TRUNC('month', NOW())
         AND expected_close_date < DATE_TRUNC('month', NOW()) + INTERVAL '1 month') current_month(deals),
        
        -- Monthly breakdown
        (SELECT json_agg(json_build_object(
            'month', month_year,
            'deal_count', deal_count,
            'total_value', total_value,
            'weighted_value', weighted_value
        ))
         FROM (
            SELECT 
                TO_CHAR(expected_close_date, 'YYYY-MM') as month_year,
                COUNT(*) as deal_count,
                SUM(value) as total_value,
                SUM(value * (probability::DECIMAL / 100)) as weighted_value
            FROM public.deals 
            WHERE user_id = target_user_id 
            AND stage NOT IN ('closed_won', 'closed_lost')
            AND expected_close_date <= NOW() + INTERVAL '1 month' * forecast_months
            AND expected_close_date >= NOW()
            GROUP BY TO_CHAR(expected_close_date, 'YYYY-MM')
            ORDER BY month_year
         ) monthly_stats) forecast_breakdown(details);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION get_conversion_rates(UUID, INTEGER) IS 'Calculate deal conversion rates and metrics for specified time period';
COMMENT ON FUNCTION get_contact_engagement_metrics(UUID, INTEGER) IS 'Analyze contact engagement and follow-up needs';
COMMENT ON FUNCTION get_activity_productivity_metrics(UUID, INTEGER) IS 'Track activity completion rates and productivity metrics';
COMMENT ON FUNCTION get_sales_velocity_metrics(UUID, INTEGER) IS 'Calculate sales velocity and revenue projections';
COMMENT ON FUNCTION get_pipeline_health_score(UUID) IS 'Assess overall pipeline health and quality';
COMMENT ON FUNCTION get_comprehensive_dashboard_data(UUID, INTEGER) IS 'Get complete dashboard analytics in single call';
COMMENT ON FUNCTION get_top_performing_contacts(UUID, INTEGER) IS 'Identify highest value contacts by deal performance';
COMMENT ON FUNCTION get_deal_forecasting(UUID, INTEGER) IS 'Generate sales forecasts with conservative, realistic, and optimistic scenarios';