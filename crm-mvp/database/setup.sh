#!/bin/bash

# Database Setup Script for CRM MVP
# This script sets up the database schema for both development and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -z "$SUPABASE_DB_URL" ] && [ -z "$SUPABASE_PROJECT_REF" ]; then
        print_error "Either SUPABASE_DB_URL or SUPABASE_PROJECT_REF must be set"
        print_error "For local development: set SUPABASE_DB_URL to your local Supabase instance"
        print_error "For hosted Supabase: set SUPABASE_PROJECT_REF to your project reference"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -z "$SUPABASE_DB_PASSWORD" ]; then
        print_error "Either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_DB_PASSWORD must be set"
        exit 1
    fi
    
    print_success "Environment variables are properly configured"
}

# Function to execute SQL file
execute_sql_file() {
    local file_path=$1
    local description=$2
    
    print_status "Executing $description..."
    
    if [ ! -f "$file_path" ]; then
        print_error "SQL file not found: $file_path"
        exit 1
    fi
    
    # Check if we're using local Supabase or hosted
    if [ -n "$SUPABASE_DB_URL" ]; then
        # Local Supabase setup
        psql "$SUPABASE_DB_URL" -f "$file_path"
    elif [ -n "$SUPABASE_PROJECT_REF" ]; then
        # Hosted Supabase setup using Supabase CLI
        if ! command -v supabase &> /dev/null; then
            print_error "Supabase CLI is required for hosted setup"
            print_error "Install it from: https://supabase.com/docs/guides/cli"
            exit 1
        fi
        
        supabase db push --project-ref "$SUPABASE_PROJECT_REF" --file "$file_path"
    fi
    
    print_success "$description completed successfully"
}

# Function to setup database schema
setup_schema() {
    print_status "Setting up database schema..."
    
    # Check which schema file to use
    if [ -f "./database/enhanced_schema.sql" ]; then
        execute_sql_file "./database/enhanced_schema.sql" "Enhanced database schema"
    elif [ -f "./database/schema.sql" ]; then
        execute_sql_file "./database/schema.sql" "Basic database schema"
    else
        print_error "No schema file found in ./database/ directory"
        exit 1
    fi
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ -d "./database/migrations" ]; then
        for migration_file in ./database/migrations/*.sql; do
            if [ -f "$migration_file" ]; then
                migration_name=$(basename "$migration_file")
                execute_sql_file "$migration_file" "Migration: $migration_name"
            fi
        done
    else
        print_warning "No migrations directory found, skipping migrations"
    fi
}

# Function to verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Create a temporary verification script
    cat > /tmp/verify_db.sql << 'EOF'
-- Verify tables exist
SELECT 'Tables created:' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('contacts', 'deals', 'activities');

-- Verify RLS is enabled
SELECT 'RLS Status:' AS status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'deals', 'activities');

-- Verify policies exist
SELECT 'RLS Policies:' AS status;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'deals', 'activities')
GROUP BY tablename;

-- Verify indexes exist
SELECT 'Indexes created:' AS status;
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'deals', 'activities')
GROUP BY tablename;

-- Verify functions exist
SELECT 'Functions created:' AS status;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('validate_email', 'validate_phone', 'get_pipeline_stats');

SELECT 'Database setup verification completed successfully' AS final_status;
EOF

    if [ -n "$SUPABASE_DB_URL" ]; then
        psql "$SUPABASE_DB_URL" -f /tmp/verify_db.sql
    elif [ -n "$SUPABASE_PROJECT_REF" ]; then
        supabase db push --project-ref "$SUPABASE_PROJECT_REF" --file /tmp/verify_db.sql
    fi
    
    # Clean up
    rm -f /tmp/verify_db.sql
    
    print_success "Database verification completed"
}

# Function to create sample data (optional)
create_sample_data() {
    if [ "$1" = "--with-sample-data" ]; then
        print_status "Creating sample data..."
        
        cat > /tmp/sample_data.sql << 'EOF'
-- Sample data for development (only create if no existing data)
DO $$
BEGIN
    -- Only insert sample data if tables are empty
    IF NOT EXISTS (SELECT 1 FROM public.contacts LIMIT 1) THEN
        -- This would typically be done by the application after user authentication
        -- For development purposes, you can manually insert data after creating a test user
        RAISE NOTICE 'No sample data inserted - create a user account first through the application';
    ELSE
        RAISE NOTICE 'Existing data found - skipping sample data creation';
    END IF;
END $$;
EOF

        if [ -n "$SUPABASE_DB_URL" ]; then
            psql "$SUPABASE_DB_URL" -f /tmp/sample_data.sql
        elif [ -n "$SUPABASE_PROJECT_REF" ]; then
            supabase db push --project-ref "$SUPABASE_PROJECT_REF" --file /tmp/sample_data.sql
        fi
        
        rm -f /tmp/sample_data.sql
        print_success "Sample data setup completed"
    fi
}

# Main execution
main() {
    print_status "Starting CRM MVP Database Setup"
    print_status "================================"
    
    # Parse command line arguments
    SAMPLE_DATA=false
    for arg in "$@"; do
        case $arg in
            --with-sample-data)
                SAMPLE_DATA=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--with-sample-data] [--help]"
                echo ""
                echo "Options:"
                echo "  --with-sample-data    Create sample data for development"
                echo "  --help               Show this help message"
                echo ""
                echo "Environment variables:"
                echo "  SUPABASE_DB_URL             Database URL for local Supabase"
                echo "  SUPABASE_PROJECT_REF        Project reference for hosted Supabase"
                echo "  SUPABASE_SERVICE_ROLE_KEY   Service role key for authentication"
                echo "  SUPABASE_DB_PASSWORD        Database password for direct connection"
                exit 0
                ;;
        esac
    done
    
    # Execute setup steps
    check_environment
    setup_schema
    run_migrations
    verify_setup
    
    if [ "$SAMPLE_DATA" = true ]; then
        create_sample_data --with-sample-data
    fi
    
    print_status "================================"
    print_success "Database setup completed successfully!"
    print_status "Your CRM MVP database is ready to use."
    print_status ""
    print_status "Next steps:"
    print_status "1. Start your application server"
    print_status "2. Create a user account through the registration flow"
    print_status "3. Begin using the CRM features"
}

# Run main function with all arguments
main "$@"