#!/usr/bin/env python3
"""
Environment variable validation script for AI Meeting Assistant backend.
Verifies that all required environment variables are properly configured.
"""
import os
import sys

def validate_environment_variables():
    """
    Validate that all required environment variables are present.
    
    Returns:
        bool: True if all variables are present, False otherwise
    """
    print("Testing Environment Variables...")
    print("=" * 60)
    
    # Required environment variables
    required_variables = {
        'BHASHINI_USER_ID': 'Bhashini User ID for API authentication',
        'ULCA_API_KEY': 'ULCA API Key for Bhashini services',
        'BHASHINI_AUTH_TOKEN': 'Bhashini Authorization Token',
        'OPENAI_API_KEY': 'OpenAI API Key for GPT services',
        'DJANGO_SECRET_KEY': 'Django Secret Key for security'
    }
    
    missing_variables = []
    present_variables = []
    
    for variable_name, description in required_variables.items():
        value = os.getenv(variable_name)
        if value:
            # Mask sensitive values for security
            masked_value = f"{value[:8]}..." if len(value) > 8 else "***"
            print(f"PASS {variable_name}: {masked_value}")
            present_variables.append(variable_name)
        else:
            print(f"FAIL {variable_name}: Missing")
            missing_variables.append(variable_name)
    
    print("=" * 60)
    
    if missing_variables:
        print(f"ERROR: Missing {len(missing_variables)} required variables")
        print("Missing variables:", ", ".join(missing_variables))
        print("\nTo resolve:")
        print("1. Create .env file in backend directory")
        print("2. Add missing variables with actual values")
        print("3. For Render deployment, add variables in dashboard")
        return False
    else:
        print(f"SUCCESS: All {len(present_variables)} variables configured")
        return True

def main():
    """Main execution function."""
    # Attempt to load environment variables from .env file
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("INFO: Loaded environment variables from .env file")
    except ImportError:
        print("INFO: Using system environment variables")
    
    # Validate environment setup
    is_valid = validate_environment_variables()
    
    if is_valid:
        print("\nSUCCESS: Environment configuration is valid")
        print("Backend is ready for deployment")
        sys.exit(0)
    else:
        print("\nERROR: Environment configuration is invalid")
        print("Fix missing variables before deployment")
        sys.exit(1)

if __name__ == "__main__":
    main()
