# CRM MVP Database

This directory contains the comprehensive database schema and setup files for the CRM MVP application with enhanced security, validation, and performance optimizations.

## Files

- `schema.sql` - Original database schema with tables, indexes, RLS policies
- `enhanced_schema.sql` - **Enhanced schema with advanced validation, constraints, and analytics features**
- `setup.sh` - **Automated database setup script for development and production**
- `debug-rls.sql` - Debugging queries for Row Level Security issues
- `migrations/` - Database migration files

## Quick Start

### Automated Setup (Recommended)

```bash
# Make the setup script executable
chmod +x database/setup.sh

# For local Supabase development
export SUPABASE_DB_URL="postgresql://postgres:your-password@localhost:54322/postgres"
./database/setup.sh

# For hosted Supabase (requires Supabase CLI)
export SUPABASE_PROJECT_REF="your-project-ref"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
./database/setup.sh

# With sample data for development
./database/setup.sh --with-sample-data
```

### Manual Setup

1. Create a new Supabase project
2. Copy the contents of `enhanced_schema.sql` and run it in the Supabase SQL Editor
3. Run any migration files from the `migrations/` directory
4. Verify setup using the verification queries in the setup script

## Enhanced Schema Features

### Advanced Validation

- **Email Validation**: `validate_email()` function with regex pattern matching
- **Phone Validation**: `validate_phone()` function accepting 10-15 digits
- **Business Logic Constraints**: Deal probability matching stage expectations
- **Data Integrity**: Required contact methods, unique constraints per user

### Automated Triggers

- **Timestamp Management**: Automatic `updated_at` field updates
- **Activity Completion**: Auto-set completion timestamps
- **Contact Tracking**: Update `last_contact_date` on activity completion

### Performance Optimizations

- **Text Search**: Full-text search indexes using `pg_trgm` extension
- **Composite Indexes**: Optimized for common query patterns
- **Partial Indexes**: Conditional indexes for better performance
- **GIN Indexes**: Array and text search optimization

### Analytics & Reporting

- **Dashboard View**: `user_dashboard_stats` for real-time metrics
- **Pipeline Function**: `get_pipeline_stats()` for deal analysis
- **Comprehensive Statistics**: Contact, deal, and activity aggregations

## Schema Overview

### Tables

#### contacts
- **Enhanced Features**: Email uniqueness per user, contact method requirements
- **Validation**: Email format, phone number format, name length
- **Search**: Full-text search on names, GIN indexes on tags
- **Fields**: name, email, phone, company, status, tags, notes, last_contact_date

#### deals
- **Business Logic**: Stage-probability validation, close date constraints
- **Pipeline**: Six-stage pipeline with automatic validation
- **Analytics**: Value calculations, win/loss tracking
- **Fields**: name, contact_id, value, stage, probability, expected_close_date, actual_close_date

#### activities
- **Smart Scheduling**: Future scheduling validation, completion tracking
- **Auto-Timestamps**: Completion time tracking
- **Flexible Linking**: Connect to contacts or deals
- **Fields**: type, subject, description, scheduled_at, completed, completed_at

### Enhanced Security

- **Row Level Security (RLS)**: Enabled on all tables with comprehensive policies
- **Policy Naming**: Clear, descriptive policy names for better management
- **User Isolation**: Complete data separation between users
- **Secure Functions**: `SECURITY DEFINER` for analytics functions

### Performance Features

#### Comprehensive Indexing
- **User-based**: All user_id foreign keys indexed
- **Status/Stage**: Enum field indexes for filtering
- **Temporal**: Date and timestamp indexes for time-based queries
- **Search**: Text search indexes for names and content
- **Composite**: Multi-column indexes for complex queries

#### Query Optimization
- **Partial Indexes**: Only index non-null values where appropriate
- **Conditional Indexes**: Filtered indexes for specific use cases
- **Extension Usage**: `pg_trgm` for fuzzy text search, `btree_gin` for better performance

## Database Functions

### Validation Functions
```sql
-- Email validation with regex
SELECT validate_email('user@example.com'); -- Returns true/false

-- Phone validation (10-15 digits)
SELECT validate_phone('+1-555-123-4567'); -- Returns true/false
```

### Analytics Functions
```sql
-- Get pipeline statistics for authenticated user
SELECT get_pipeline_stats(auth.uid());

-- Dashboard statistics view
SELECT * FROM user_dashboard_stats WHERE user_id = auth.uid();
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <repository>
cd crm-mvp
./database/setup.sh
```

### 2. Schema Changes
1. Create migration file in `migrations/` directory
2. Test migration locally
3. Apply to production using setup script

### 3. Testing
```bash
# Run RLS debugging queries
psql $SUPABASE_DB_URL -f database/debug-rls.sql

# Verify schema integrity
./database/setup.sh  # Includes verification step
```

## Production Deployment

### Environment Variables
```bash
# For hosted Supabase
export SUPABASE_PROJECT_REF="your-project-ref"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# For self-hosted
export SUPABASE_DB_URL="postgresql://user:pass@host:port/db"
export SUPABASE_DB_PASSWORD="your-db-password"
```

### Deployment Steps
1. Backup existing database
2. Run setup script with production credentials
3. Verify all functions and policies are active
4. Test application connectivity

## Monitoring & Maintenance

### Performance Monitoring
- Monitor index usage with `pg_stat_user_indexes`
- Check query performance with `pg_stat_statements`
- Review RLS policy performance impact

### Regular Maintenance
- Update table statistics: `ANALYZE;`
- Monitor database size growth
- Review and optimize slow queries

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Use `debug-rls.sql` to check policy configuration
2. **Permission Denied**: Verify user authentication and policy conditions
3. **Slow Queries**: Check if appropriate indexes exist
4. **Constraint Violations**: Review validation function logic

### Debug Commands
```sql
-- Check current user
SELECT auth.uid(), auth.role();

-- List all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

## Migration Guide

To upgrade from the basic schema to the enhanced schema:

1. **Backup** your existing database
2. **Test** the enhanced schema on a copy
3. **Apply** migrations in the correct order
4. **Verify** all data integrity constraints
5. **Update** application code if needed

```bash
# Upgrade process
./database/setup.sh  # Will detect and apply enhanced schema
```

## Support

For issues with the database setup:
1. Check the setup script output for specific errors
2. Review the debug-rls.sql queries for RLS issues
3. Verify all environment variables are correctly set
4. Ensure Supabase CLI is installed and authenticated (for hosted setup)
```