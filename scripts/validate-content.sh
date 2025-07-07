#!/bin/bash

# Content Validation Script for Full-Stack Developer Educational Resources
# This script helps validate the repository content before committing

set -e  # Exit on any error

echo "🚀 Starting content validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_error() {
    print_status $RED "❌ ERROR: $1"
    ((ERRORS++))
}

print_warning() {
    print_status $YELLOW "⚠️  WARNING: $1"
    ((WARNINGS++))
}

print_success() {
    print_status $GREEN "✅ $1"
}

print_info() {
    print_status $BLUE "ℹ️  $1"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    local deps=("git" "find" "grep" "wc")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            print_error "Required tool '$dep' is not installed"
        fi
    done
    
    # Optional tools
    if command -v markdownlint &> /dev/null; then
        print_success "markdownlint found"
        HAS_MARKDOWNLINT=true
    else
        print_warning "markdownlint not found - install with: npm install -g markdownlint-cli"
        HAS_MARKDOWNLINT=false
    fi
    
    if command -v markdown-link-check &> /dev/null; then
        print_success "markdown-link-check found"
        HAS_LINK_CHECK=true
    else
        print_warning "markdown-link-check not found - install with: npm install -g markdown-link-check"
        HAS_LINK_CHECK=false
    fi
}

# Validate repository structure
validate_structure() {
    print_info "Validating repository structure..."
    
    # Check required files
    local required_files=("README.md" "LICENSE" "CONTRIBUTING.md" ".gitignore")
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "Found required file: $file"
        else
            print_error "Missing required file: $file"
        fi
    done
    
    # Check required directories
    local required_dirs=(
        "01-Frontend-Development"
        "02-Backend-Development" 
        "03-Database-Management"
        "04-Data-Engineering"
        "05-Software-Engineering-Principles"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_success "Found required directory: $dir"
        else
            print_error "Missing required directory: $dir"
        fi
    done
}

# Validate markdown files
validate_markdown() {
    print_info "Validating markdown files..."
    
    local md_files=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*")
    local md_count=$(echo "$md_files" | wc -l)
    
    print_info "Found $md_count markdown files"
    
    # Check for empty markdown files
    while IFS= read -r file; do
        if [[ ! -s "$file" ]]; then
            print_warning "Empty markdown file: $file"
        fi
    done <<< "$md_files"
    
    # Run markdownlint if available
    if [[ "$HAS_MARKDOWNLINT" == true ]]; then
        print_info "Running markdownlint..."
        if markdownlint $md_files --ignore node_modules; then
            print_success "Markdown formatting is valid"
        else
            print_warning "Markdown formatting issues found"
        fi
    fi
}

# Validate code examples
validate_code() {
    print_info "Validating code examples..."
    
    # Check JavaScript/TypeScript files
    local js_files=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v node_modules)
    if [[ -n "$js_files" ]]; then
        print_info "Checking JavaScript/TypeScript syntax..."
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                if node -c "$file" 2>/dev/null; then
                    print_success "Valid syntax: $file"
                else
                    print_error "Syntax error in: $file"
                fi
            fi
        done <<< "$js_files"
    fi
    
    # Check Python files
    local py_files=$(find . -name "*.py" | grep -v __pycache__)
    if [[ -n "$py_files" ]]; then
        print_info "Checking Python syntax..."
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                if python3 -m py_compile "$file" 2>/dev/null; then
                    print_success "Valid syntax: $file"
                else
                    print_error "Syntax error in: $file"
                fi
            fi
        done <<< "$py_files"
    fi
}

# Check for example directories
validate_examples() {
    print_info "Validating example directories..."
    
    local example_dirs=$(find . -type d -name "examples")
    while IFS= read -r dir; do
        if [[ -n "$dir" ]]; then
            if [[ -f "$dir/README.md" ]]; then
                print_success "Example directory has README: $dir"
            else
                print_warning "Example directory missing README: $dir"
            fi
        fi
    done <<< "$example_dirs"
}

# Check for sensitive information
check_security() {
    print_info "Checking for sensitive information..."
    
    # Patterns to avoid
    local patterns=(
        "password\s*=\s*['\"][^'\"]*['\"]"
        "api_key\s*=\s*['\"][^'\"]*['\"]"
        "secret\s*=\s*['\"][^'\"]*['\"]"
        "token\s*=\s*['\"][^'\"]*['\"]"
    )
    
    for pattern in "${patterns[@]}"; do
        local matches=$(grep -r -i -E "$pattern" --include="*.md" --include="*.js" --include="*.py" --include="*.json" . || true)
        if [[ -n "$matches" ]]; then
            print_warning "Potential sensitive information found with pattern: $pattern"
            echo "$matches"
        fi
    done
}

# Generate statistics
generate_stats() {
    print_info "Generating repository statistics..."
    
    local total_files=$(find . -type f | wc -l)
    local total_dirs=$(find . -type d | wc -l)
    local md_files=$(find . -name "*.md" | wc -l)
    local js_files=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | wc -l)
    local py_files=$(find . -name "*.py" | wc -l)
    local example_dirs=$(find . -type d -name "examples" | wc -l)
    
    echo ""
    print_info "📊 Repository Statistics:"
    echo "   Total files: $total_files"
    echo "   Total directories: $total_dirs"
    echo "   Markdown files: $md_files"
    echo "   JavaScript/TypeScript files: $js_files"
    echo "   Python files: $py_files"
    echo "   Example directories: $example_dirs"
}

# Main execution
main() {
    echo "🔍 Full-Stack Developer Educational Resources - Content Validator"
    echo "================================================================"
    echo ""
    
    check_dependencies
    echo ""
    
    validate_structure
    echo ""
    
    validate_markdown
    echo ""
    
    validate_code
    echo ""
    
    validate_examples
    echo ""
    
    check_security
    echo ""
    
    generate_stats
    echo ""
    
    # Summary
    echo "📋 Validation Summary:"
    echo "====================="
    
    if [[ $ERRORS -eq 0 ]]; then
        print_success "No errors found! ✨"
    else
        print_error "Found $ERRORS error(s)"
    fi
    
    if [[ $WARNINGS -eq 0 ]]; then
        print_success "No warnings"
    else
        print_warning "Found $WARNINGS warning(s)"
    fi
    
    echo ""
    
    if [[ $ERRORS -eq 0 ]]; then
        print_success "🎉 Repository is ready for commit/push!"
        exit 0
    else
        print_error "❌ Please fix errors before committing"
        exit 1
    fi
}

# Run main function
main "$@"
