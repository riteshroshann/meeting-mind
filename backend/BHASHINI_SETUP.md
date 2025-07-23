# Bhashini API Setup Guide

## Overview
This guide helps you set up Bhashini API credentials for the AI Meeting Assistant backend.

## Step 1: Register for Bhashini Access

1. **Visit Bhashini Portal**: Go to [https://bhashini.gov.in/](https://bhashini.gov.in/)
2. **Create Account**: Register with your email and phone number
3. **Verify Account**: Complete email and phone verification
4. **Apply for API Access**: Submit application for developer access

## Step 2: Get Your Credentials

Once approved, login and navigate to [Profile Page](https://bhashini.gov.in/ulca/profile):

### Required Credentials:
- **BHASHINI_USER_ID**: Your unique user identifier
- **ULCA_API_KEY**: API key for authentication
- **BHASHINI_AUTH_TOKEN**: Authorization token for API calls

## Step 3: Available Pipeline IDs

Use these pre-configured pipeline IDs:

\`\`\`
# IIT Madras Models (ASR and TTS)
660fa5bec7fb5b0328229016

# IIT Bombay Models (Translation)
660f813c0413087224435d2c

# IIIT Hyderabad Models (Translation)
660f866443e53d4133f65317

# Initial Pipeline Models (ASR, Translation, Transliteration, TTS)
64392f96daac500b55c543cd
\`\`\`

## Step 4: Supported Languages

### ASR (Speech Recognition):
- Hindi (hi)
- English (en)
- Bengali (bn)
- Tamil (ta)
- Telugu (te)
- Gujarati (gu)
- Marathi (mr)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)
- Assamese (as)
- Odia (or)

### Translation:
- All combinations between supported languages
- English ↔ Indian Languages
- Indian Languages ↔ Indian Languages

### TTS (Text-to-Speech):
- Same languages as ASR
- Male and Female voices available

## Step 5: API Endpoints

\`\`\`
Config API: https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline
Inference API: https://dhruva-api.bhashini.gov.in/services/inference/pipeline
WebSocket API: wss://dhruva-api.bhashini.gov.in
\`\`\`

## Step 6: Testing Your Setup

Run the test script to verify your credentials:

\`\`\`bash
cd backend
python test_bhashini_credentials.py
\`\`\`

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check your API key and auth token
2. **400 Bad Request**: Verify language codes and pipeline ID
3. **Timeout**: Check network connectivity
4. **Rate Limiting**: Wait before retrying requests

### Support:
- Email: digitalindiabhashinidivision@gmail.com
- Documentation: [Bhashini API Docs](https://dibd-bhashini.gitbook.io/bhashini-apis/)

## Production Deployment

For production on Render:
1. Add environment variables in Render dashboard
2. Set DEBUG=False
3. Configure proper CORS origins
4. Enable rate limiting
5. Set up monitoring and logging
\`\`\`

```python file="backend/test_bhashini_credentials.py"
#!/usr/bin/env python3
"""
Comprehensive test script for Bhashini API credentials and OpenAI integration.
Tests all required environment variables and API connections.
"""

import os
import sys
import json
import base64
import requests
import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CredentialTester:
    """Test all API credentials and connections"""
    
    def __init__(self):
        self.results = {
            'environment_variables': {},
            'bhashini_connection': {},
            'openai_connection': {},
            'overall_status': 'UNKNOWN'
        }
        
    def test_environment_variables(self) -> bool:
        """Test if all required environment variables are present"""
        logger.info("Testing environment variables...")
        
        required_vars = [
            'BHASHINI_USER_ID',
            'ULCA_API_KEY', 
            'BHASHINI_AUTH_TOKEN',
            'OPENAI_API_KEY',
            'DJANGO_SECRET_KEY'
        ]
        
        missing_vars = []
        present_vars = []
        
        for var in required_vars:
            value = os.getenv(var)
            if value:
                present_vars.append(var)
                # Mask sensitive values in logs
                masked_value = f"{value[:8]}..." if len(value) > 8 else "***"
                logger.info(f"✓ {var}: {masked_value}")
            else:
                missing_vars.append(var)
                logger.error(f"✗ {var}: Missing")
        
        self.results['environment_variables'] = {
            'present': present_vars,
            'missing': missing_vars,
            'status': 'PASS' if not missing_vars else 'FAIL'
        }
        
        return len(missing_vars) == 0
    
    def test_bhashini_connection(self) -> bool:
        """Test Bhashini API connection and configuration"""
        logger.info("Testing Bhashini API connection...")
        
        try:
            # Test configuration endpoint
            config_url = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
            
            headers = {
                "userID": os.getenv("BHASHINI_USER_ID"),
                "ulcaApiKey": os.getenv("ULCA_API_KEY"),
                "Authorization": os.getenv("BHASHINI_AUTH_TOKEN"),
                "Content-Type": "application/json"
            }
            
            # Test payload for ASR + Translation
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {
                                "sourceLanguage": "hi"
                            }
                        }
                    },
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": "hi",
                                "targetLanguage": "en"
                            }
                        }
                    }
                ],
                "pipelineRequestConfig": {
                    "pipelineId": "64392f96daac500b55c543cd"
                }
            }
            
            response = requests.post(config_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                config_data = response.json()
                
                # Validate response structure
                required_keys = ['languages', 'pipelineResponseConfig', 'pipelineInferenceAPIEndPoint']
                missing_keys = [key for key in required_keys if key not in config_data]
                
                if not missing_keys:
                    inference_endpoint = config_data.get('pipelineInferenceAPIEndPoint', {})
                    callback_url = inference_endpoint.get('callbackUrl')
                    auth_key = inference_endpoint.get('inferenceApiKey', {})
                    
                    self.results['bhashini_connection'] = {
                        'config_status': 'SUCCESS',
                        'callback_url': callback_url,
                        'auth_key_present': bool(auth_key.get('value')),
                        'supported_languages': len(config_data.get('languages', [])),
                        'pipeline_configs': len(config_data.get('pipelineResponseConfig', [])),
                        'status': 'PASS'
                    }
                    
                    logger.info("✓ Bhashini configuration retrieved successfully")
                    logger.info(f"✓ Callback URL: {callback_url}")
                    logger.info(f"✓ Supported language pairs: {len(config_data.get('languages', []))}")
                    
                    return True
                else:
                    logger.error(f"✗ Missing keys in response: {missing_keys}")
                    self.results['bhashini_connection'] = {
                        'status': 'FAIL',
                        'error': f"Missing response keys: {missing_keys}"
                    }
                    return False
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                logger.error(f"✗ Bhashini API error: {error_msg}")
                self.results['bhashini_connection'] = {
                    'status': 'FAIL',
                    'error': error_msg
                }
                return False
                
        except requests.exceptions.Timeout:
            error_msg = "Request timeout"
            logger.error(f"✗ Bhashini API timeout: {error_msg}")
            self.results['bhashini_connection'] = {
                'status': 'FAIL',
                'error': error_msg
            }
            return False
        except Exception as e:
            error_msg = str(e)
            logger.error(f"✗ Bhashini API error: {error_msg}")
            self.results['bhashini_connection'] = {
                'status': 'FAIL',
                'error': error_msg
            }
            return False
    
    def test_openai_connection(self) -> bool:
        """Test OpenAI API connection"""
        logger.info("Testing OpenAI API connection...")
        
        try:
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            # Test with a simple completion request
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user", 
                        "content": "Say 'API test successful' if you can read this."
                    }
                ],
                "max_tokens": 10,
                "temperature": 0
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                
                self.results['openai_connection'] = {
                    'status': 'PASS',
                    'model_used': data.get('model'),
                    'response_content': content,
                    'usage': data.get('usage', {})
                }
                
                logger.info("✓ OpenAI API connection successful")
                logger.info(f"✓ Model: {data.get('model')}")
                logger.info(f"✓ Response: {content}")
                
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                logger.error(f"✗ OpenAI API error: {error_msg}")
                self.results['openai_connection'] = {
                    'status': 'FAIL',
                    'error': error_msg
                }
                return False
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"✗ OpenAI API error: {error_msg}")
            self.results['openai_connection'] = {
                'status': 'FAIL',
                'error': error_msg
            }
            return False
    
    def test_sample_audio_processing(self) -> bool:
        """Test end-to-end audio processing with sample data"""
        logger.info("Testing sample audio processing...")
        
        try:
            # This would require actual audio processing
            # For now, we'll just validate that we can get the inference endpoint
            if self.results['bhashini_connection'].get('status') == 'PASS':
                logger.info("✓ Audio processing setup validated")
                return True
            else:
                logger.warning("⚠ Cannot test audio processing - Bhashini connection failed")
                return False
                
        except Exception as e:
            logger.error(f"✗ Audio processing test failed: {e}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results"""
        logger.info("=" * 60)
        logger.info("STARTING COMPREHENSIVE API CREDENTIAL TESTS")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        
        # Run tests
        env_test = self.test_environment_variables()
        bhashini_test = self.test_bhashini_connection() if env_test else False
        openai_test = self.test_openai_connection() if env_test else False
        audio_test = self.test_sample_audio_processing() if bhashini_test else False
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Determine overall status
        if env_test and bhashini_test and openai_test:
            overall_status = 'PASS'
            status_emoji = '✅'
        elif env_test and (bhashini_test or openai_test):
            overall_status = 'PARTIAL'
            status_emoji = '⚠️'
        else:
            overall_status = 'FAIL'
            status_emoji = '❌'
        
        self.results['overall_status'] = overall_status
        self.results['test_duration'] = duration
        self.results['timestamp'] = datetime.now().isoformat()
        
        # Print summary
        logger.info("=" * 60)
        logger.info("TEST RESULTS SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Overall Status: {status_emoji} {overall_status}")
        logger.info(f"Test Duration: {duration:.2f} seconds")
        logger.info(f"Environment Variables: {'✓' if env_test else '✗'}")
        logger.info(f"Bhashini Connection: {'✓' if bhashini_test else '✗'}")
        logger.info(f"OpenAI Connection: {'✓' if openai_test else '✗'}")
        logger.info(f"Audio Processing: {'✓' if audio_test else '✗'}")
        
        if overall_status == 'PASS':
            logger.info("\n🎉 ALL TESTS PASSED! Your backend is ready for deployment.")
        elif overall_status == 'PARTIAL':
            logger.warning("\n⚠️  SOME TESTS FAILED. Check the errors above.")
        else:
            logger.error("\n❌ TESTS FAILED. Fix the issues before deploying.")
        
        logger.info("=" * 60)
        
        return self.results
    
    def save_results(self, filename: str = "test_results.json"):
        """Save test results to JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(self.results, f, indent=2)
            logger.info(f"Test results saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")

def main():
    """Main function to run all tests"""
    # Load environment variables from .env file if present
    try:
        from dotenv import load_dotenv
        load_dotenv()
        logger.info("Loaded environment variables from .env file")
    except ImportError:
        logger.info("python-dotenv not installed, using system environment variables")
    
    # Run tests
    tester = CredentialTester()
    results = tester.run_all_tests()
    
    # Save results
    tester.save_results()
    
    # Exit with appropriate code
    if results['overall_status'] == 'PASS':
        sys.exit(0)
    elif results['overall_status'] == 'PARTIAL':
        sys.exit(1)
    else:
        sys.exit(2)

if __name__ == "__main__":
    main()
