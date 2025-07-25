#!/usr/bin/env python3
"""
Production readiness validation script.
Tests all components required for deployment.
"""
import os
import sys
import requests
import json
from datetime import datetime

class ProductionValidator:
    """Validates production deployment configuration."""
    
    def __init__(self):
        self.results = {
            'environment': {'status': 'unknown', 'details': {}},
            'bhashini': {'status': 'unknown', 'details': {}},
            'openai': {'status': 'unknown', 'details': {}},
            'overall': {'status': 'unknown', 'timestamp': datetime.now().isoformat()}
        }
    
    def validate_environment(self):
        """Validate environment variable configuration."""
        print("Validating environment configuration...")
        
        required_vars = [
            'BHASHINI_USER_ID',
            'ULCA_API_KEY', 
            'BHASHINI_AUTH_TOKEN',
            'OPENAI_API_KEY',
            'DJANGO_SECRET_KEY'
        ]
        
        missing = [var for var in required_vars if not os.getenv(var)]
        
        if missing:
            self.results['environment'] = {
                'status': 'fail',
                'details': {'missing_variables': missing}
            }
            print(f"FAIL: Missing variables: {', '.join(missing)}")
            return False
        
        self.results['environment'] = {
            'status': 'pass',
            'details': {'all_variables_present': True}
        }
        print("PASS: All environment variables configured")
        return True
    
    def validate_bhashini_connection(self):
        """Test Bhashini API connectivity."""
        print("Testing Bhashini API connection...")
        
        try:
            headers = {
                "userID": os.getenv("BHASHINI_USER_ID"),
                "ulcaApiKey": os.getenv("ULCA_API_KEY"),
                "Authorization": os.getenv("BHASHINI_AUTH_TOKEN"),
                "Content-Type": "application/json"
            }
            
            payload = {
                "pipelineTasks": [{
                    "taskType": "asr",
                    "config": {"language": {"sourceLanguage": "hi"}}
                }],
                "pipelineRequestConfig": {"pipelineId": "64392f96daac500b55c543cd"}
            }
            
            response = requests.post(
                "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.results['bhashini'] = {
                    'status': 'pass',
                    'details': {
                        'response_received': True,
                        'languages_supported': len(data.get('languages', []))
                    }
                }
                print("PASS: Bhashini API connection successful")
                return True
            else:
                self.results['bhashini'] = {
                    'status': 'fail',
                    'details': {'error': f"HTTP {response.status_code}: {response.text}"}
                }
                print(f"FAIL: Bhashini API error: {response.status_code}")
                return False
                
        except Exception as e:
            self.results['bhashini'] = {
                'status': 'fail',
                'details': {'error': str(e)}
            }
            print(f"FAIL: Bhashini connection error: {e}")
            return False
    
    def validate_openai_connection(self):
        """Test OpenAI API connectivity."""
        print("Testing OpenAI API connection...")
        
        try:
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": "Test connection"}],
                "max_tokens": 5
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                self.results['openai'] = {
                    'status': 'pass',
                    'details': {'connection_successful': True}
                }
                print("PASS: OpenAI API connection successful")
                return True
            else:
                self.results['openai'] = {
                    'status': 'fail',
                    'details': {'error': f"HTTP {response.status_code}"}
                }
                print(f"FAIL: OpenAI API error: {response.status_code}")
                return False
                
        except Exception as e:
            self.results['openai'] = {
                'status': 'fail',
                'details': {'error': str(e)}
            }
            print(f"FAIL: OpenAI connection error: {e}")
            return False
    
    def run_validation(self):
        """Run complete production validation."""
        print("Production Readiness Validation")
        print("=" * 60)
        
        # Load environment variables
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except ImportError:
            pass
        
        # Run validation tests
        env_valid = self.validate_environment()
        bhashini_valid = self.validate_bhashini_connection() if env_valid else False
        openai_valid = self.validate_openai_connection() if env_valid else False
        
        # Determine overall status
        if env_valid and bhashini_valid and openai_valid:
            overall_status = 'ready'
        elif env_valid and (bhashini_valid or openai_valid):
            overall_status = 'partial'
        else:
            overall_status = 'not_ready'
        
        self.results['overall']['status'] = overall_status
        
        print("=" * 60)
        print("VALIDATION SUMMARY")
        print("=" * 60)
        print(f"Environment: {self.results['environment']['status'].upper()}")
        print(f"Bhashini API: {self.results['bhashini']['status'].upper()}")
        print(f"OpenAI API: {self.results['openai']['status'].upper()}")
        print(f"Overall Status: {overall_status.upper()}")
        
        if overall_status == 'ready':
            print("\nSUCCESS: System is ready for production deployment")
            return True
        elif overall_status == 'partial':
            print("\nWARNING: Some services failed validation")
            return False
        else:
            print("\nERROR: System is not ready for deployment")
            return False
    
    def save_results(self, filename='validation_results.json'):
        """Save validation results to file."""
        try:
            with open(filename, 'w') as f:
                json.dump(self.results, f, indent=2)
            print(f"Results saved to {filename}")
        except Exception as e:
            print(f"Failed to save results: {e}")

def main():
    """Main execution function."""
    validator = ProductionValidator()
    success = validator.run_validation()
    validator.save_results()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
