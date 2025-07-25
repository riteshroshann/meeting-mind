"""
Service layer for Bhashini and Gemini integrations with comprehensive error handling.
Implements complete Bhashini API pipeline according to official documentation.
"""
import os
import json
import logging
import requests
import base64
import tempfile
from datetime import datetime
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom exception for API errors"""
    def __init__(self, message: str, status_code: int = 500, service: str = "unknown"):
        self.message = message
        self.status_code = status_code
        self.service = service
        super().__init__(self.message)

class BhashiniService:
    """Service for Bhashini API integration following official documentation"""
    
    def __init__(self):
        self.user_id = os.getenv('BHASHINI_USER_ID')
        # Try multiple possible API key environment variables
        self.api_key = (
            os.getenv('ULCA_API_KEY') or 
            os.getenv('BHASHINI_API_KEY') or 
            os.getenv('BHASHINI_AUTH_TOKEN')
        )
        self.base_url = "https://meity-auth.ulcacontrib.org"
        self.compute_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        
        # Available pipeline IDs from documentation
        self.pipeline_id = "64392f96daac500b55c543cd"  # MeitY pipeline
        
        if not self.user_id:
            raise APIError("Bhashini User ID not configured. Please set BHASHINI_USER_ID environment variable.", 500, "bhashini")
        
        if not self.api_key:
            raise APIError("Bhashini API Key not configured. Please set ULCA_API_KEY, BHASHINI_API_KEY, or BHASHINI_AUTH_TOKEN environment variable.", 500, "bhashini")
        
        logger.info(f"Bhashini service initialized with User ID: {self.user_id[:8]}... and API Key: {self.api_key[:8]}...")
    
    def get_pipeline_config(self, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Get pipeline configuration from Bhashini"""
        try:
            logger.info(f"Getting Bhashini pipeline config for tasks: ['asr', 'translation']")
            
            auth_url = f"{self.base_url}/ulca/apis/v0/model/getModelsPipeline"
            headers = {
                'userID': self.user_id,
                'ulcaApiKey': self.api_key,
                'Content-Type': 'application/json'
            }
            
            # Build pipeline tasks based on your working Colab code
            tasks = [
                {
                    "taskType": "asr",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang
                        }
                    }
                },
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang
                        }
                    }
                }
            ]
            
            payload = {
                "pipelineTasks": tasks,
                "pipelineRequestConfig": {
                    "pipelineId": self.pipeline_id
                }
            }
            
            logger.info(f"Sending pipeline config request to: {auth_url}")
            logger.info(f"Headers: userID={self.user_id[:8]}..., ulcaApiKey={self.api_key[:8]}...")
            logger.info(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(auth_url, headers=headers, json=payload, timeout=30)
            
            logger.info(f"Pipeline config response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Bhashini pipeline config failed: {response.status_code} - {response.text}")
                raise APIError(f"Bhashini pipeline configuration failed: {response.status_code} - {response.text}", response.status_code, "bhashini")
            
            data = response.json()
            logger.info(f"Pipeline config response: {json.dumps(data, indent=2)}")
            
            if 'pipelineResponseConfig' not in data:
                logger.error(f"Invalid Bhashini pipeline config response: {data}")
                raise APIError("Invalid Bhashini pipeline configuration response", 500, "bhashini")
            
            logger.info("Bhashini pipeline config obtained successfully")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Bhashini pipeline config request failed: {str(e)}")
            raise APIError(f"Bhashini pipeline configuration request failed: {str(e)}", 500, "bhashini")
        except Exception as e:
            logger.error(f"Unexpected error in Bhashini pipeline config: {str(e)}")
            raise APIError(f"Bhashini pipeline configuration error: {str(e)}", 500, "bhashini")
    
    def process_audio(self, audio_base64: str, source_lang: str, target_lang: str, audio_format: str) -> Dict[str, Any]:
        """Process audio through Bhashini ASR and Translation pipeline"""
        try:
            # Normalize language codes (remove country codes like en-US -> en)
            source_lang = source_lang.split('-')[0].lower()
            target_lang = target_lang.split('-')[0].lower()
            
            logger.info(f"Processing audio: {source_lang} -> {target_lang}, format: {audio_format}")
            
            # Get pipeline configuration
            pipeline_config = self.get_pipeline_config(source_lang, target_lang)
            
            # Extract service configurations
            asr_service = None
            translation_service = None
            
            # Find service configurations
            for task_config in pipeline_config['pipelineResponseConfig']:
                if task_config['taskType'] == 'asr' and not asr_service:
                    # Find service for source language
                    for config in task_config['config']:
                        if config['language']['sourceLanguage'] == source_lang:
                            asr_service = config
                            break
                elif task_config['taskType'] == 'translation' and not translation_service:
                    # Find service for language pair
                    for config in task_config['config']:
                        if (config['language']['sourceLanguage'] == source_lang and 
                            config['language']['targetLanguage'] == target_lang):
                            translation_service = config
                            break
            
            if not asr_service:
                raise APIError(f"ASR service not found for language: {source_lang}", 500, "bhashini")
            
            if not translation_service:
                raise APIError(f"Translation service not found for {source_lang} -> {target_lang}", 500, "bhashini")
            
            # Get compute endpoint and auth token
            compute_endpoint = self.compute_url
            auth_token = None
            
            if 'pipelineInferenceAPIEndPoint' in pipeline_config:
                endpoint_config = pipeline_config['pipelineInferenceAPIEndPoint']
                compute_endpoint = endpoint_config.get('callbackUrl', self.compute_url)
                if 'inferenceApiKey' in endpoint_config:
                    auth_name = endpoint_config['inferenceApiKey']['name']
                    auth_value = endpoint_config['inferenceApiKey']['value']
                    auth_token = auth_value
            
            # Build compute request following your Colab code structure
            pipeline_tasks = [
                {
                    "taskType": "asr",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang
                        },
                        "serviceId": asr_service['serviceId'],
                        "audioFormat": audio_format,
                        "samplingRate": 16000
                    }
                },
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang
                        },
                        "serviceId": translation_service['serviceId']
                    }
                }
            ]
            
            # Build the compute payload exactly like your Colab code
            compute_payload = {
                "pipelineTasks": pipeline_tasks,
                "inputData": {
                    "audio": [{"audioContent": audio_base64}],
                    "input": [{"source": ""}]  # Empty string instead of null
                }
            }
            
            # Set up headers for compute request
            headers = {
                'Content-Type': 'application/json'
            }
            
            if auth_token:
                headers['Authorization'] = auth_token
            
            logger.info(f"Sending compute request to: {compute_endpoint}")
            logger.info(f"Compute payload tasks: {[task['taskType'] for task in pipeline_tasks]}")
            logger.info(f"Auth token: {auth_token[:20] if auth_token else 'None'}...")
            
            response = requests.post(compute_endpoint, headers=headers, json=compute_payload, timeout=120)
            
            logger.info(f"Compute response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Bhashini compute request failed: {response.status_code} - {response.text}")
                raise APIError(f"Bhashini processing failed: {response.status_code} - {response.text}", response.status_code, "bhashini")
            
            result = response.json()
            logger.info("Bhashini processing completed successfully")
            logger.info(f"Compute result: {json.dumps(result, indent=2)}")
            
            return result
            
        except APIError:
            raise
        except Exception as e:
            logger.error(f"Bhashini processing error: {str(e)}")
            raise APIError(f"Audio processing failed: {str(e)}", 500, "bhashini")
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get supported languages"""
        return [
            {"code": "hi", "name": "Hindi"},
            {"code": "en", "name": "English"},
            {"code": "bn", "name": "Bengali"},
            {"code": "te", "name": "Telugu"},
            {"code": "mr", "name": "Marathi"},
            {"code": "ta", "name": "Tamil"},
            {"code": "gu", "name": "Gujarati"},
            {"code": "kn", "name": "Kannada"},
            {"code": "ml", "name": "Malayalam"},
            {"code": "pa", "name": "Punjabi"},
            {"code": "or", "name": "Odia"},
            {"code": "as", "name": "Assamese"},
            {"code": "ur", "name": "Urdu"},
            {"code": "ne", "name": "Nepali"},
            {"code": "sa", "name": "Sanskrit"},
            {"code": "sd", "name": "Sindhi"},
            {"code": "ks", "name": "Kashmiri"},
            {"code": "mai", "name": "Maithili"},
            {"code": "mni", "name": "Manipuri"},
            {"code": "brx", "name": "Bodo"},
            {"code": "gom", "name": "Konkani"},
            {"code": "si", "name": "Sinhala"}
        ]
    
    def get_supported_audio_formats(self) -> List[str]:
        """Get supported audio formats"""
        return ["wav", "mp3", "flac", "m4a", "ogg"]

class GeminiService:
    """Service for Google Gemini AI integration"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
        
        if not self.api_key:
            raise APIError("Gemini API key not configured", 500, "gemini")
    
    def generate_summary_and_actions(self, text: str, pre_meeting_notes: str = "") -> Dict[str, Any]:
        """Generate summary and action items using Gemini AI"""
        try:
            logger.info("Starting Gemini AI analysis...")
            
            if not text or text.strip() == "":
                return {
                    'summary': "No content available for summary",
                    'actionItems': [],
                    'keyDecisions': []
                }
            
            # Build context-aware prompt
            context_parts = []
            
            if pre_meeting_notes and pre_meeting_notes.strip():
                context_parts.append(f"Pre-meeting context and notes:\n{pre_meeting_notes.strip()}")
            
            context_parts.append(f"Meeting transcript/content:\n{text}")
            full_context = "\n\n".join(context_parts)
            
            # Enhanced prompt for better AI analysis
            prompt = f"""
You are an AI meeting assistant. Analyze the following meeting content and provide a comprehensive summary with actionable insights.

{full_context}

Please provide:

1. **SUMMARY**: A detailed, well-structured summary that:
   - Captures key discussion points and decisions
   - Incorporates context from pre-meeting notes (if provided)
   - Highlights important outcomes and agreements
   - Uses clear, professional language
   - Is organized with bullet points or sections where appropriate

2. **ACTION ITEMS**: Extract specific, actionable tasks with:
   - Clear task description
   - Assigned person (if mentioned, otherwise "Not specified")
   - Priority level (High/Medium/Low based on context)
   - Due date (if mentioned, otherwise "Not specified")

3. **KEY DECISIONS**: Important decisions made during the meeting

Format your response as valid JSON:
{{
    "summary": "Your detailed summary here...",
    "actionItems": [
        {{
            "item": "Task description",
            "assignee": "Person name or 'Not specified'",
            "priority": "High/Medium/Low",
            "dueDate": "Date or 'Not specified'"
        }}
    ],
    "keyDecisions": [
        "Decision 1",
        "Decision 2"
    ]
}}

Focus on being comprehensive yet concise. If pre-meeting notes were provided, ensure they are integrated naturally into the summary.
"""
            
            headers = {
                'Content-Type': 'application/json',
            }
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 2048,
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            logger.info("Sending request to Gemini AI...")
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                logger.error(f"Gemini API request failed: {response.status_code} - {response.text}")
                raise APIError(f"Gemini AI request failed: {response.status_code}", response.status_code, "gemini")
            
            result = response.json()
            
            # Extract generated content
            if 'candidates' not in result or not result['candidates']:
                logger.error(f"No candidates in Gemini response: {result}")
                raise APIError("No response from Gemini AI", 500, "gemini")
            
            candidate = result['candidates'][0]
            if 'content' not in candidate or 'parts' not in candidate['content']:
                logger.error(f"Invalid Gemini response structure: {candidate}")
                raise APIError("Invalid Gemini AI response", 500, "gemini")
            
            generated_text = candidate['content']['parts'][0]['text']
            
            # Parse JSON response
            try:
                # Clean up the response (remove markdown code blocks if present)
                cleaned_text = generated_text.strip()
                if cleaned_text.startswith('```json'):
                    cleaned_text = cleaned_text[7:]
                if cleaned_text.endswith('```'):
                    cleaned_text = cleaned_text[:-3]
                cleaned_text = cleaned_text.strip()
                
                parsed_result = json.loads(cleaned_text)
                
                summary = parsed_result.get('summary', 'Summary not available')
                action_items = parsed_result.get('actionItems', [])
                key_decisions = parsed_result.get('keyDecisions', [])
                
                # Validate action items structure
                validated_action_items = []
                for item in action_items:
                    if isinstance(item, dict):
                        validated_action_items.append({
                            'item': str(item.get('item', 'No description')),
                            'assignee': str(item.get('assignee', 'Not specified')),
                            'priority': str(item.get('priority', 'Medium')),
                            'dueDate': str(item.get('dueDate', 'Not specified'))
                        })
                
                # Validate key decisions
                validated_key_decisions = []
                for decision in key_decisions:
                    if isinstance(decision, str):
                        validated_key_decisions.append(decision)
                
                logger.info(f"Gemini AI analysis completed successfully")
                logger.info(f"Summary length: {len(summary)} characters")
                logger.info(f"Action items: {len(validated_action_items)} items")
                logger.info(f"Key decisions: {len(validated_key_decisions)} decisions")
                
                return {
                    'summary': summary,
                    'actionItems': validated_action_items,
                    'keyDecisions': validated_key_decisions
                }
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Gemini JSON response: {str(e)}")
                logger.error(f"Raw response: {generated_text}")
                
                # Fallback: create a basic summary from the raw text
                return {
                    'summary': generated_text if generated_text else "AI analysis completed but summary format was invalid",
                    'actionItems': [],
                    'keyDecisions': []
                }
                
        except APIError:
            raise
        except Exception as e:
            logger.error(f"Gemini AI error: {str(e)}")
            raise APIError(f"AI analysis failed: {str(e)}", 500, "gemini")

# Service instances
_bhashini_service = None
_gemini_service = None

def get_bhashini_service() -> BhashiniService:
    """Get or create Bhashini service instance"""
    global _bhashini_service
    if _bhashini_service is None:
        _bhashini_service = BhashiniService()
    return _bhashini_service

def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service

def validate_audio_file(audio_file) -> Dict[str, Any]:
    """Validate uploaded audio file"""
    try:
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if audio_file.size > max_size:
            return {
                "valid": False,
                "error": f"File size too large. Maximum allowed size is {max_size // (1024*1024)}MB"
            }
        
        # Check file extension
        allowed_extensions = ['.wav', '.mp3', '.flac', '.m4a', '.ogg']
        file_extension = os.path.splitext(audio_file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return {
                "valid": False,
                "error": f"Unsupported file format. Supported formats: {', '.join(allowed_extensions)}",
                "supported_formats": allowed_extensions
            }
        
        return {"valid": True}
        
    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        return {
            "valid": False,
            "error": f"File validation failed: {str(e)}"
        }

def get_audio_format_from_filename(filename: str) -> str:
    """Get audio format from filename"""
    extension = os.path.splitext(filename)[1].lower()
    format_mapping = {
        '.wav': 'wav',
        '.mp3': 'mp3',
        '.flac': 'flac',
        '.m4a': 'm4a',
        '.ogg': 'ogg'
    }
    return format_mapping.get(extension, 'wav')

def get_service_health() -> Dict[str, Any]:
    """Check health of all services"""
    try:
        health_data = {
            "status": "healthy",
            "services": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Check Bhashini service
        try:
            bhashini_service = get_bhashini_service()
            # Simple health check - just verify credentials are configured
            if bhashini_service.user_id and bhashini_service.api_key:
                health_data["services"]["bhashini"] = "healthy"
            else:
                health_data["services"]["bhashini"] = "unhealthy - credentials missing"
                health_data["status"] = "degraded"
        except Exception as e:
            health_data["services"]["bhashini"] = f"unhealthy - {str(e)}"
            health_data["status"] = "degraded"
        
        # Check Gemini service
        try:
            gemini_service = get_gemini_service()
            # Simple health check - just verify API key is configured
            if gemini_service.api_key:
                health_data["services"]["gemini"] = "healthy"
            else:
                health_data["services"]["gemini"] = "unhealthy - API key missing"
                health_data["status"] = "degraded"
        except Exception as e:
            health_data["services"]["gemini"] = f"unhealthy - {str(e)}"
            health_data["status"] = "degraded"
        
        return health_data
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
