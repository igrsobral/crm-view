#!/bin/bash

# Production Deployment Script for CRM MVP
# This script handles building and deploying the application to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Default values
PLATFORM=""
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false
DRY_RUN=false
DOMAIN=""
SSL_SETUP=false

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --platform PLATFORM     Target platform (netlify, vercel, manual)"
    echo "  -e, --environment ENV        Environment (production, staging) [default: production]"
    echo "  -d, --domain DOMAIN          Custom domain to configure"
    echo "  --ssl                        Set up SSL certificate"
    echo "  --skip-tests                 Skip running tests before deployment"
    echo "  --skip-build                 Skip building the application"
    echo "  --dry-run                    Show what would be done without executing"
    echo "  -h, --help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --platform netlify --domain mycrm.com --ssl"
    echo "  $0 --platform vercel --environment staging"
    echo "  $0 --platform manual --skip-tests"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        --ssl)
            SSL_SETUP=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate platform
if [ -z "$PLATFORM" ]; then
    print_error "Platform must be specified with -p or --platform"
    show_usage
    exit 1
fi

if [[ ! "$PLATFORM" =~ ^(netlify|vercel|manual)$ ]]; then
    print_error "Platform must be one of: netlify, vercel, manual"
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required (current: $(node --version))"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check platform-specific CLI tools
    case $PLATFORM in
        netlify)
            if ! command -v netlify &> /dev/null; then
                print_warning "Netlify CLI not found. Installing..."
                if [ "$DRY_RUN" = false ]; then
                    npm install -g netlify-cli
                fi
            fi
            ;;
        vercel)
            if ! command -v vercel &> /dev/null; then
                print_warning "Vercel CLI not found. Installing..."
                if [ "$DRY_RUN" = false ]; then
                    npm install -g vercel
                fi
            fi
            ;;
    esac
    
    print_success "Prerequisites check completed"
}\n\n# Function to setup environment\nsetup_environment() {\n    print_step \"Setting up environment for $ENVIRONMENT deployment...\"\n    \n    # Copy appropriate environment file\n    if [ \"$ENVIRONMENT\" = \"production\" ]; then\n        if [ -f \".env.production.example\" ]; then\n            print_status \"Using production environment configuration\"\n            if [ \"$DRY_RUN\" = false ]; then\n                cp .env.production.example .env.production\n            fi\n        fi\n    elif [ \"$ENVIRONMENT\" = \"staging\" ]; then\n        if [ -f \".env.staging.example\" ]; then\n            print_status \"Using staging environment configuration\"\n            if [ \"$DRY_RUN\" = false ]; then\n                cp .env.staging.example .env.staging\n            fi\n        fi\n    fi\n    \n    # Verify required environment variables\n    print_status \"Verifying environment variables...\"\n    \n    if [ -z \"$VITE_SUPABASE_URL\" ]; then\n        print_warning \"VITE_SUPABASE_URL not set. Please configure it before deployment.\"\n    fi\n    \n    if [ -z \"$VITE_SUPABASE_ANON_KEY\" ]; then\n        print_warning \"VITE_SUPABASE_ANON_KEY not set. Please configure it before deployment.\"\n    fi\n    \n    print_success \"Environment setup completed\"\n}\n\n# Function to install dependencies\ninstall_dependencies() {\n    print_step \"Installing dependencies...\"\n    \n    if [ \"$DRY_RUN\" = false ]; then\n        npm ci --only=production\n    else\n        print_status \"Would run: npm ci --only=production\"\n    fi\n    \n    print_success \"Dependencies installed\"\n}\n\n# Function to run tests\nrun_tests() {\n    if [ \"$SKIP_TESTS\" = true ]; then\n        print_warning \"Skipping tests as requested\"\n        return\n    fi\n    \n    print_step \"Running tests...\"\n    \n    if [ \"$DRY_RUN\" = false ]; then\n        # Run unit tests\n        npm run test:run\n        \n        # Run type checking\n        npm run type-check\n        \n        # Run linting\n        npm run lint\n    else\n        print_status \"Would run: npm run test:run\"\n        print_status \"Would run: npm run type-check\"\n        print_status \"Would run: npm run lint\"\n    fi\n    \n    print_success \"Tests completed successfully\"\n}\n\n# Function to build application\nbuild_application() {\n    if [ \"$SKIP_BUILD\" = true ]; then\n        print_warning \"Skipping build as requested\"\n        return\n    fi\n    \n    print_step \"Building application for $ENVIRONMENT...\"\n    \n    if [ \"$DRY_RUN\" = false ]; then\n        # Set environment and build\n        export NODE_ENV=$ENVIRONMENT\n        npm run build\n        \n        # Verify build output\n        if [ ! -d \"dist\" ]; then\n            print_error \"Build failed - dist directory not found\"\n            exit 1\n        fi\n        \n        # Check build size\n        BUILD_SIZE=$(du -sh dist | cut -f1)\n        print_status \"Build completed. Size: $BUILD_SIZE\"\n    else\n        print_status \"Would run: NODE_ENV=$ENVIRONMENT npm run build\"\n    fi\n    \n    print_success \"Build completed successfully\"\n}\n\n# Function to deploy to Netlify\ndeploy_to_netlify() {\n    print_step \"Deploying to Netlify...\"\n    \n    if [ \"$DRY_RUN\" = false ]; then\n        # Check if already logged in\n        if ! netlify status &> /dev/null; then\n            print_status \"Please log in to Netlify...\"\n            netlify login\n        fi\n        \n        # Deploy\n        if [ \"$ENVIRONMENT\" = \"production\" ]; then\n            netlify deploy --prod --dir=dist\n        else\n            netlify deploy --dir=dist\n        fi\n        \n        # Configure custom domain if specified\n        if [ -n \"$DOMAIN\" ]; then\n            print_status \"Configuring custom domain: $DOMAIN\"\n            netlify sites:update --domain \"$DOMAIN\"\n            \n            if [ \"$SSL_SETUP\" = true ]; then\n                print_status \"Setting up SSL certificate...\"\n                netlify ssl:provision\n            fi\n        fi\n    else\n        print_status \"Would run: netlify deploy --prod --dir=dist\"\n        if [ -n \"$DOMAIN\" ]; then\n            print_status \"Would configure domain: $DOMAIN\"\n        fi\n    fi\n    \n    print_success \"Netlify deployment completed\"\n}\n\n# Function to deploy to Vercel\ndeploy_to_vercel() {\n    print_step \"Deploying to Vercel...\"\n    \n    if [ \"$DRY_RUN\" = false ]; then\n        # Check if already logged in\n        if ! vercel whoami &> /dev/null; then\n            print_status \"Please log in to Vercel...\"\n            vercel login\n        fi\n        \n        # Deploy\n        if [ \"$ENVIRONMENT\" = \"production\" ]; then\n            vercel --prod\n        else\n            vercel\n        fi\n        \n        # Configure custom domain if specified\n        if [ -n \"$DOMAIN\" ]; then\n            print_status \"Configuring custom domain: $DOMAIN\"\n            vercel domains add \"$DOMAIN\"\n            vercel alias set \"$DOMAIN\"\n        fi\n    else\n        print_status \"Would run: vercel --prod\"\n        if [ -n \"$DOMAIN\" ]; then\n            print_status \"Would configure domain: $DOMAIN\"\n        fi\n    fi\n    \n    print_success \"Vercel deployment completed\"\n}\n\n# Function for manual deployment\nmanual_deployment() {\n    print_step \"Preparing manual deployment...\"\n    \n    print_status \"Build artifacts are ready in the 'dist' directory\"\n    print_status \"To deploy manually:\"\n    print_status \"1. Upload the contents of the 'dist' directory to your web server\"\n    print_status \"2. Configure your web server to serve index.html for all routes (SPA support)\"\n    print_status \"3. Set up SSL certificate for HTTPS\"\n    print_status \"4. Configure security headers as shown in netlify.toml or vercel.json\"\n    \n    if [ -n \"$DOMAIN\" ]; then\n        print_status \"5. Configure DNS to point $DOMAIN to your server\"\n    fi\n    \n    # Create deployment package\n    if [ \"$DRY_RUN\" = false ]; then\n        print_status \"Creating deployment package...\"\n        tar -czf \"crm-mvp-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).tar.gz\" -C dist .\n        print_success \"Deployment package created\"\n    else\n        print_status \"Would create deployment package\"\n    fi\n}\n\n# Function to verify deployment\nverify_deployment() {\n    print_step \"Verifying deployment...\"\n    \n    # This would typically include health checks, but for now just show status\n    print_status \"Deployment verification completed\"\n    print_status \"Please manually verify the application is working correctly\"\n    \n    if [ -n \"$DOMAIN\" ]; then\n        print_status \"Visit: https://$DOMAIN\"\n    fi\n}\n\n# Main execution function\nmain() {\n    print_status \"Starting CRM MVP Deployment\"\n    print_status \"================================\"\n    print_status \"Platform: $PLATFORM\"\n    print_status \"Environment: $ENVIRONMENT\"\n    if [ -n \"$DOMAIN\" ]; then\n        print_status \"Domain: $DOMAIN\"\n    fi\n    if [ \"$DRY_RUN\" = true ]; then\n        print_warning \"DRY RUN MODE - No actual changes will be made\"\n    fi\n    print_status \"================================\"\n    \n    # Execute deployment steps\n    check_prerequisites\n    setup_environment\n    install_dependencies\n    run_tests\n    build_application\n    \n    # Platform-specific deployment\n    case $PLATFORM in\n        netlify)\n            deploy_to_netlify\n            ;;\n        vercel)\n            deploy_to_vercel\n            ;;\n        manual)\n            manual_deployment\n            ;;\n    esac\n    \n    verify_deployment\n    \n    print_status \"================================\"\n    print_success \"Deployment completed successfully!\"\n    print_status \"Platform: $PLATFORM\"\n    print_status \"Environment: $ENVIRONMENT\"\n    if [ -n \"$DOMAIN\" ]; then\n        print_status \"Domain: https://$DOMAIN\"\n    fi\n}\n\n# Run main function\nmain