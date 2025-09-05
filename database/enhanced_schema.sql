-- Enhanced CRM MVP Database Schema
-- This file contains enhanced SQL commands with additional validation functions,
-- performance optimizations, and production-ready configurations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better indexing

-- Create enhanced validation functions
CREATE OR REPLACE FUNCTION validate_email(email_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_phone(phone_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove all non-digit characters and check length
    RETURN length(regexp_replace(phone_text, '[^0-9]', '', 'g')) BETWEEN 10 AND 15;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enhanced contacts table with additional constraints
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
    email VARCHAR(255) CHECK (email IS NULL OR validate_email(email)),
    phone VARCHAR(20) CHECK (phone IS NULL OR validate_phone(phone)),
    company VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'inactive')),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    last_contact_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure at least one contact method is provided
    CONSTRAINT contacts_require_contact_method CHECK (
        email IS NOT NULL OR phone IS NOT NULL
    ),
    
    -- Unique email per user (allow multiple NULL emails)
    CONSTRAINT contacts_unique_email_per_user UNIQUE (user_id, email)
);

-- Enhanced deals table with business logic constraints
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) > 0),
    notes TEXT,
    value DECIMAL(12,2) CHECK (value IS NULL OR value >= 0),
    stage VARCHAR(20) NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE CHECK (expected_close_date IS NULL OR expected_close_date >= CURRENT_DATE),
    actual_close_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Business logic constraints
    CONSTRAINT deals_close_date_logic CHECK (
        (stage IN ('closed_won', 'closed_lost') AND actual_close_date IS NOT NULL) OR
        (stage NOT IN ('closed_won', 'closed_lost') AND actual_close_date IS NULL)
    ),
    
    -- Probability should match stage expectations
    CONSTRAINT deals_probability_logic CHECK (
        (stage = 'lead' AND probability <= 25) OR
        (stage = 'qualified' AND probability BETWEEN 20 AND 50) OR
        (stage = 'proposal' AND probability BETWEEN 40 AND 75) OR
        (stage = 'negotiation' AND probability BETWEEN 60 AND 95) OR
        (stage = 'closed_won' AND probability = 100) OR
        (stage = 'closed_lost' AND probability = 0)
    )
);

-- Enhanced activities table with scheduling logic
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
    subject VARCHAR(200) CHECK (length(trim(subject)) > 0),
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure activity is linked to either a contact or deal
    CONSTRAINT activities_must_have_contact_or_deal CHECK (contact_id IS NOT NULL OR deal_id IS NOT NULL),
    
    -- Completed activities should have completion timestamp
    CONSTRAINT activities_completion_logic CHECK (
        (completed = false AND completed_at IS NULL) OR
        (completed = true AND completed_at IS NOT NULL)
    ),
    
    -- Scheduled activities cannot be in the past (with 1 hour buffer)
    CONSTRAINT activities_future_scheduling CHECK (
        scheduled_at IS NULL OR scheduled_at >= NOW() - INTERVAL '1 hour'
    )
);

-- Create comprehensive indexes for performance
-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.contacts(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON public.contacts(updated_at);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contact_date ON public.contacts(last_contact_date) WHERE last_contact_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON public.contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_name_search ON public.contacts USING GIN(name gin_trgm_ops);

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON public.deals(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_value ON public.deals(value) WHERE value IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at);
CREATE INDEX IF NOT EXISTS idx_deals_updated_at ON public.deals(updated_at);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date) WHERE expected_close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_actual_close_date ON public.deals(actual_close_date) WHERE actual_close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_name_search ON public.deals USING GIN(name gin_trgm_ops);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON public.activities(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON public.activities(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_at ON public.activities(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_completed ON public.activities(completed);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_updated_at ON public.activities(updated_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_user_scheduled ON public.activities(user_id, scheduled_at) WHERE scheduled_at IS NOT NULL AND completed = false;
CREATE INDEX IF NOT EXISTS idx_deals_user_stage_value ON public.deals(user_id, stage, value) WHERE value IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_user_status_updated ON public.contacts(user_id, status, updated_at);

-- Enhanced trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_completion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Set completed_at when activity is marked as completed
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = NOW();
    ELSIF NEW.completed = false AND OLD.completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_contact_last_contact_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_contact_date when a new activity is created or completed
    IF (TG_OP = 'INSERT' AND NEW.contact_id IS NOT NULL) OR 
       (TG_OP = 'UPDATE' AND NEW.contact_id IS NOT NULL AND NEW.completed = true AND OLD.completed = false) THEN
        UPDATE public.contacts 
        SET last_contact_date = COALESCE(NEW.completed_at, NEW.created_at)
        WHERE id = NEW.contact_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at 
    BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_activity_completion_timestamp
    BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION set_completion_timestamp();

CREATE TRIGGER update_contact_last_contact_date_trigger
    AFTER INSERT OR UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION update_contact_last_contact_date();

-- Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS policies with better security
-- Contacts policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

CREATE POLICY "contacts_select_policy" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "contacts_insert_policy" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_update_policy" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_delete_policy" ON public.contacts
    FOR DELETE USING (auth.uid() = user_id);

-- Deals policies
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;

CREATE POLICY "deals_select_policy" ON public.deals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "deals_insert_policy" ON public.deals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deals_update_policy" ON public.deals
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deals_delete_policy" ON public.deals
    FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON public.activities;

CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "activities_insert_policy" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_update_policy" ON public.activities
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_delete_policy" ON public.activities
    FOR DELETE USING (auth.uid() = user_id);

-- Create helpful database views for analytics
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
    user_id,
    
    -- Contact statistics
    (SELECT COUNT(*) FROM public.contacts WHERE user_id = u.user_id) AS total_contacts,
    (SELECT COUNT(*) FROM public.contacts WHERE user_id = u.user_id AND status = 'lead') AS leads_count,
    (SELECT COUNT(*) FROM public.contacts WHERE user_id = u.user_id AND status = 'prospect') AS prospects_count,
    (SELECT COUNT(*) FROM public.contacts WHERE user_id = u.user_id AND status = 'customer') AS customers_count,
    
    -- Deal statistics
    (SELECT COUNT(*) FROM public.deals WHERE user_id = u.user_id) AS total_deals,
    (SELECT COALESCE(SUM(value), 0) FROM public.deals WHERE user_id = u.user_id AND stage != 'closed_lost') AS pipeline_value,
    (SELECT COUNT(*) FROM public.deals WHERE user_id = u.user_id AND stage = 'closed_won') AS won_deals,
    (SELECT COUNT(*) FROM public.deals WHERE user_id = u.user_id AND stage = 'closed_lost') AS lost_deals,
    
    -- Activity statistics
    (SELECT COUNT(*) FROM public.activities WHERE user_id = u.user_id AND completed = false AND scheduled_at <= NOW()) AS overdue_activities,
    (SELECT COUNT(*) FROM public.activities WHERE user_id = u.user_id AND completed = false AND scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '7 days') AS upcoming_activities
    
FROM (SELECT DISTINCT user_id FROM public.contacts 
      UNION SELECT DISTINCT user_id FROM public.deals 
      UNION SELECT DISTINCT user_id FROM public.activities) u;

-- Grant necessary permissions (these will be handled by Supabase RLS)
-- The view inherits RLS from the underlying tables

-- Create a function to get pipeline statistics
CREATE OR REPLACE FUNCTION get_pipeline_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'stages', json_agg(
            json_build_object(
                'stage', stage,
                'count', deal_count,
                'total_value', total_value
            )
        )
    ) INTO result
    FROM (
        SELECT 
            stage,
            COUNT(*) as deal_count,
            COALESCE(SUM(value), 0) as total_value
        FROM public.deals 
        WHERE user_id = target_user_id 
        AND stage NOT IN ('closed_won', 'closed_lost')
        GROUP BY stage
        ORDER BY 
            CASE stage
                WHEN 'lead' THEN 1
                WHEN 'qualified' THEN 2
                WHEN 'proposal' THEN 3
                WHEN 'negotiation' THEN 4
                ELSE 5
            END
    ) stage_stats;
    
    RETURN COALESCE(result, '{"stages": []}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.contacts IS 'Stores contact information with enhanced validation and search capabilities';
COMMENT ON TABLE public.deals IS 'Manages sales opportunities with business logic constraints and pipeline tracking';
COMMENT ON TABLE public.activities IS 'Tracks all interactions and scheduled follow-ups with automatic completion handling';

COMMENT ON FUNCTION validate_email(TEXT) IS 'Validates email address format using regex pattern';
COMMENT ON FUNCTION validate_phone(TEXT) IS 'Validates phone number format, accepting 10-15 digits with optional formatting';
COMMENT ON FUNCTION get_pipeline_stats(UUID) IS 'Returns aggregated pipeline statistics for dashboard display';

-- Final verification queries (for manual testing)
-- SELECT 'Schema setup completed successfully' AS status;