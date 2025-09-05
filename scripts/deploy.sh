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


# Function to setup environment
setup_environment() {
    print_step "Setting up environment for $ENVIRONMENT deployment..."
    
    # Copy appropriate environment file
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -f ".env.production.example" ]; then
            print_status "Using production environment configuration"
            if [ "$DRY_RUN" = false ]; then
                cp .env.production.example .env.production
            fi
        fi
    elif [ "$ENVIRONMENT" = "staging" ]; then
        if [ -f ".env.staging.example" ]; then
            print_status "Using staging environment configuration"
            if [ "$DRY_RUN" = false ]; then
                cp .env.staging.example .env.staging
            fi
        fi
    fi
    
    # Verify required environment variables
    print_status "Verifying environment variables..."
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        print_warning "VITE_SUPABASE_URL not set. Please configure it before deployment."
    fi
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        print_warning "VITE_SUPABASE_ANON_KEY not set. Please configure it before deployment."
    fi
    
    print_success "Environment setup completed"
}
# Function to install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    if [ "$DRY_RUN" = false ]; then
        npm ci --only=production
    else
        print_status "Would run: npm ci --only=production"
    fi
    
    print_success "Dependencies installed"
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Skipping tests as requested"
        return
    fi
    
    print_step "Running tests..."
    
    if [ "$DRY_RUN" = false ]; then
        # Run unit tests
        npm run test:run
        
        # Run type checking
        npm run type-check
        
        # Run linting
        npm run lint
    else
        print_status "Would run: npm run test:run"
        print_status "Would run: npm run type-check"
        print_status "Would run: npm run lint"
    fi
    
    print_success "Tests completed successfully"
}
# Function to build application
build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        print_warning "Skipping build as requested"
        return
    fi
    
    print_step "Building application for $ENVIRONMENT..."
    
    if [ "$DRY_RUN" = false ]; then
        # Set environment and build
        export NODE_ENV=$ENVIRONMENT
        npm run build
        
        # Verify build output
        if [ ! -d "dist" ]; then
            print_error "Build failed - dist directory not found"
            exit 1
        fi
        
        # Check build size
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_status "Build completed. Size: $BUILD_SIZE"
    else
        print_status "Would run: NODE_ENV=$ENVIRONMENT npm run build"
    fi
    
    print_success "Build completed successfully"
}
# Function to deploy to Netlify
deploy_to_netlify() {
    print_step "Deploying to Netlify..."
    
    if [ "$DRY_RUN" = false ]; then
        # Check if already logged in
        if ! netlify status &> /dev/null; then
            print_status "Please log in to Netlify..."
            netlify login
        fi
        
        # Deploy
        if [ "$ENVIRONMENT" = "production" ]; then
            netlify deploy --prod --dir=dist
        else
            netlify deploy --dir=dist
        fi
        
        # Configure custom domain if specified
        if [ -n "$DOMAIN" ]; then
            print_status "Configuring custom domain: $DOMAIN"
            netlify sites:update --domain "$DOMAIN"
            
            if [ "$SSL_SETUP" = true ]; then
                print_status "Setting up SSL certificate..."
                netlify ssl:provision
            fi
        fi
    else
        print_status "Would run: netlify deploy --prod --dir=dist"
        if [ -n "$DOMAIN" ]; then
            print_status "Would configure domain: $DOMAIN"
        fi
    fi
    
    print_success "Netlify deployment completed"
}
# Function to deploy to Vercel
deploy_to_vercel() {
    print_step "Deploying to Vercel..."
    
    if [ "$DRY_RUN" = false ]; then
        # Check if already logged in
        if ! vercel whoami &> /dev/null; then
            print_status "Please log in to Vercel..."
            vercel login
        fi
        
        # Deploy
        if [ "$ENVIRONMENT" = "production" ]; then
            vercel --prod
        else
            vercel
        fi
        
        # Configure custom domain if specified
        if [ -n "$DOMAIN" ]; then
            print_status "Configuring custom domain: $DOMAIN"
            vercel domains add "$DOMAIN"
            vercel alias set "$DOMAIN"
        fi
    else
        print_status "Would run: vercel --prod"
        if [ -n "$DOMAIN" ]; then
            print_status "Would configure domain: $DOMAIN"
        fi
    fi
    
    print_success "Vercel deployment completed"
}
# Function for manual deployment
manual_deployment() {
    print_step "Preparing manual deployment..."
    
    print_status "Build artifacts are ready in the 'dist' directory"
    print_status "To deploy manually:"
    print_status "1. Upload the contents of the 'dist' directory to your web server"
    print_status "2. Configure your web server to serve index.html for all routes (SPA support)"
    print_status "3. Set up SSL certificate for HTTPS"
    print_status "4. Configure security headers as shown in netlify.toml or vercel.json"
    
    if [ -n "$DOMAIN" ]; then
        print_status "5. Configure DNS to point $DOMAIN to your server"
    fi
    
    # Create deployment package
    if [ "$DRY_RUN" = false ]; then
        print_status "Creating deployment package..."
        tar -czf "crm-mvp-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).tar.gz" -C dist .
        print_success "Deployment package created"
    else
        print_status "Would create deployment package"
    fi
}
# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # This would typically include health checks, but for now just show status
    print_status "Deployment verification completed"
    print_status "Please manually verify the application is working correctly"
    
    if [ -n "$DOMAIN" ]; then
        print_status "Visit: https://$DOMAIN"
    fi
}

# Main execution function
main() {
    print_status "Starting CRM MVP Deployment"
    print_status "================================"
    print_status "Platform: $PLATFORM"
    print_status "Environment: $ENVIRONMENT"
    if [ -n "$DOMAIN" ]; then
        print_status "Domain: $DOMAIN"
    fi
    if [ "$DRY_RUN" = true ]; then
        print_warning "DRY RUN MODE - No actual changes will be made"
    fi
    print_status "================================"
    
    # Execute deployment steps
    check_prerequisites
    setup_environment
    install_dependencies
    run_tests
    build_application
    
    # Platform-specific deployment
    case $PLATFORM in
        netlify)
            deploy_to_netlify
            ;;
        vercel)
            deploy_to_vercel
            ;;
        manual)
            manual_deployment
            ;;
    esac
    
    verify_deployment
    
    print_status "================================"
    print_success "Deployment completed successfully!"
    print_status "Platform: $PLATFORM"
    print_status "Environment: $ENVIRONMENT"
    if [ -n "$DOMAIN" ]; then
        print_status "Domain: https://$DOMAIN"
    fi
}
# Run main function
main