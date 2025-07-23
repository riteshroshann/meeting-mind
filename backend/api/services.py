"""
Service layer for Bhashini and OpenAI integrations with comprehensive error handling.
"""
import os
import json
import logging
import requests
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom exception for API errors"""
    def __init__(self, message: str, status_code: int = 500, service: str = "unknown"):
        self.message = message
        self.status_code = status_code
        self.service = service
        super().__init__(self.message)
    
    def __str__(self):
        return f"[{self.service}] {self.message}"

def normalize_language_code(lang_code: str) -> str:
    """
    Normalize language codes to Bhashini format.
    Converts codes like 'hi-IN', 'en-US' to 'hi', 'en'
    """
    if not lang_code:
        return lang_code
    
    # Split by hyphen and take the first part (language code)
    base_code = lang_code.split('-')[0].lower()
    
    # Map common variations to Bhashini supported codes
    language_mapping = {
        'hi': 'hi',  # Hindi
        'en': 'en',  # English
        'bn': 'bn',  # Bengali
        'ta': 'ta',  # Tamil
        'te': 'te',  # Telugu
        'gu': 'gu',  # Gujarati
        'mr': 'mr',  # Marathi
        'kn': 'kn',  # Kannada
        'ml': 'ml',  # Malayalam
        'pa': 'pa',  # Punjabi
        'as': 'as',  # Assamese
        'or': 'or',  # Odia
        'ur': 'ur',  # Urdu
        'ne': 'ne',  # Nepali
        'si': 'si',  # Sinhala
        'my': 'my',  # Myanmar
    }
    
    normalized = language_mapping.get(base_code, base_code)
    logger.info(f"Normalized language code: {lang_code} -> {normalized}")
    return normalized

class BhashiniService:
    """Service for interacting with Bhashini API"""
    
    def __init__(self):
        self.user_id = os.getenv('BHASHINI_USER_ID')
        self.api_key = os.getenv('ULCA_API_KEY')
        self.auth_token = os.getenv('BHASHINI_AUTH_TOKEN')
        
        if not all([self.user_id, self.api_key, self.auth_token]):
            raise ValueError("Missing required Bhashini environment variables")
        
        # Bhashini API endpoints
        self.pipeline_url = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
        self.compute_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        
        # Primary pipeline configuration from context dump
        self.pipeline_id = "64392f96daac500b55c543cd"
        
        logger.info("BhashiniService initialized successfully")
    
    def get_pipeline_config(self, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Get pipeline configuration for given language pair"""
        try:
            # Normalize language codes
            source_lang = normalize_language_code(source_lang)
            target_lang = normalize_language_code(target_lang)
            
            headers = {
                "userID": self.user_id,
                "ulcaApiKey": self.api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "pipelineTasks": [
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
                ],
                "pipelineRequestConfig": {
                    "pipelineId": self.pipeline_id
                }
            }
            
            logger.info(f"Getting pipeline config for {source_lang} -> {target_lang}")
            response = requests.post(self.pipeline_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code != 200:
                raise APIError(
                    f"Pipeline config failed: {response.status_code} - {response.text}",
                    response.status_code,
                    "bhashini"
                )
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Pipeline config request failed: {e}")
            raise APIError(f"Pipeline config request failed: {str(e)}", 500, "bhashini")
    
    def process_audio(self, audio_base64: str, source_lang: str, target_lang: str, filename: str = "audio.wav") -> Dict[str, Any]:
        """Process audio through Bhashini pipeline"""
        try:
            # Normalize language codes
            source_lang = normalize_language_code(source_lang)
            target_lang = normalize_language_code(target_lang)
            
            # Get pipeline configuration
            pipeline_config = self.get_pipeline_config(source_lang, target_lang)
            logger.info(f"Pipeline config received: {json.dumps(pipeline_config, indent=2)}")
            
            # Extract service configurations from pipeline config
            pipeline_response_config = pipeline_config.get("pipelineResponseConfig", [])
            
            if not pipeline_response_config:
                raise APIError("No pipeline configuration received", 500, "bhashini")
            
            # Find ASR and Translation configurations
            asr_config = None
            translation_config = None
            
            for task_config in pipeline_response_config:
                if task_config["taskType"] == "asr":
                    # Get the first available ASR config for source language
                    configs = task_config.get("config", [])
                    for config in configs:
                        if config.get("language", {}).get("sourceLanguage") == source_lang:
                            asr_config = config
                            break
                    if not asr_config and configs:
                        asr_config = configs[0]  # Fallback to first available
                        
                elif task_config["taskType"] == "translation":
                    # Get the first available translation config for language pair
                    configs = task_config.get("config", [])
                    for config in configs:
                        lang_config = config.get("language", {})
                        if (lang_config.get("sourceLanguage") == source_lang and 
                            lang_config.get("targetLanguage") == target_lang):
                            translation_config = config
                            break
                    if not translation_config and configs:
                        translation_config = configs[0]  # Fallback to first available
            
            if not asr_config:
                raise APIError(f"No ASR configuration found for language: {source_lang}", 500, "bhashini")
            
            if not translation_config:
                raise APIError(f"No translation configuration found for {source_lang} -> {target_lang}", 500, "bhashini")
            
            logger.info(f"Selected ASR config: {json.dumps(asr_config, indent=2)}")
            logger.info(f"Selected Translation config: {json.dumps(translation_config, indent=2)}")
            
            # Create a consistent audio URI that matches the source field
            audio_uri = filename
            
            # Build compute payload according to Bhashini documentation
            # The key fix: source field must match audioUri
            compute_payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {
                                "sourceLanguage": source_lang
                            },
                            "serviceId": asr_config["serviceId"],
                            "audioFormat": "wav",
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
                            "serviceId": translation_config["serviceId"]
                        }
                    }
                ],
                "inputData": {
                    "input": [
                        {
                            "source": audio_uri  # This must match the audioUri below
                        }
                    ],
                    "audio": [
                        {
                            "audioContent": audio_base64,
                            "audioUri": audio_uri  # This must match the source above
                        }
                    ]
                }
            }
            
            # Get compute headers and URL from pipeline config
            pipeline_inference = pipeline_config.get("pipelineInferenceAPIEndPoint", {})
            inference_api_key = pipeline_inference.get("inferenceApiKey", {})
            
            # Use the authorization token from pipeline config or fallback to env
            auth_header_name = inference_api_key.get("name", "Authorization")
            auth_header_value = inference_api_key.get("value", self.auth_token)
            
            compute_headers = {
                auth_header_name: auth_header_value,
                "Content-Type": "application/json"
            }
            
            # Use the callback URL from pipeline config or fallback to default
            compute_url = pipeline_inference.get("callbackUrl", self.compute_url)
            
            logger.info(f"Processing audio through Bhashini: {source_lang} -> {target_lang}")
            logger.info(f"Using ASR serviceId: {asr_config['serviceId']}")
            logger.info(f"Using Translation serviceId: {translation_config['serviceId']}")
            logger.info(f"Audio URI: {audio_uri}")
            logger.info(f"Compute URL: {compute_url}")
            logger.info(f"Compute payload: {json.dumps(compute_payload, indent=2)}")
            
            response = requests.post(
                compute_url, 
                headers=compute_headers, 
                json=compute_payload,
                timeout=60
            )
            
            if response.status_code != 200:
                logger.error(f"Compute request failed with status {response.status_code}")
                logger.error(f"Response: {response.text}")
                raise APIError(
                    f"Audio processing failed: {response.status_code} - {response.text}",
                    response.status_code,
                    "bhashini"
                )
            
            result = response.json()
            logger.info("Audio processing completed successfully")
            logger.info(f"Bhashini result: {json.dumps(result, indent=2)}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Bhashini request failed: {e}")
            raise APIError(f"Bhashini request failed: {str(e)}", 500, "bhashini")
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get supported language codes"""
        return {
            "hi": "Hindi",
            "en": "English", 
            "bn": "Bengali",
            "ta": "Tamil",
            "te": "Telugu",
            "gu": "Gujarati",
            "mr": "Marathi",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi",
            "as": "Assamese",
            "or": "Odia"
        }

class OpenAIService:
    """Service for OpenAI API interactions"""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("Missing OPENAI_API_KEY environment variable")
        
        self.base_url = "https://api.openai.com/v1"
        logger.info("OpenAIService initialized successfully")
    
    def generate_summary_and_actions(self, transcript: str) -> Dict[str, Any]:
        """Generate meeting summary and action items using OpenAI"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            prompt = f"""
            Analyze the following meeting transcript and provide:
            1. A concise summary (2-3 sentences)
            2. Key action items (if any)
            3. Important decisions made (if any)
            
            Transcript: {transcript}
            
            Please respond in JSON format with keys: summary, actionItems, keyDecisions
            """
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a meeting assistant that analyzes transcripts and extracts key information."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "max_tokens": 500,
                "temperature": 0.3
            }
            
            logger.info("Generating AI summary and actions")
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise APIError(
                    f"OpenAI request failed: {response.status_code} - {response.text}",
                    response.status_code,
                    "openai"
                )
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            try:
                # Try to parse as JSON
                parsed_content = json.loads(content)
                return parsed_content
            except json.JSONDecodeError:
                # Fallback if not valid JSON
                return {
                    "summary": content[:200] + "..." if len(content) > 200 else content,
                    "actionItems": [],
                    "keyDecisions": []
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"OpenAI request failed: {e}")
            raise APIError(f"OpenAI request failed: {str(e)}", 500, "openai")

# Service instances
_bhashini_service = None
_openai_service = None

def get_bhashini_service() -> BhashiniService:
    """Get or create Bhashini service instance"""
    global _bhashini_service
    if _bhashini_service is None:
        _bhashini_service = BhashiniService()
    return _bhashini_service

def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service instance"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service

def get_service_health() -> Dict[str, Any]:
    """Get health status of all services"""
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    try:
        # Check Bhashini service
        bhashini_service = get_bhashini_service()
        health_data["services"]["bhashini"] = {
            "status": "healthy",
            "pipeline_id": bhashini_service.pipeline_id,
            "supported_languages": len(bhashini_service.get_supported_languages())
        }
    except Exception as e:
        health_data["services"]["bhashini"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_data["status"] = "degraded"
    
    try:
        # Check OpenAI service
        openai_service = get_openai_service()
        health_data["services"]["openai"] = {
            "status": "healthy",
            "model": "gpt-3.5-turbo"
        }
    except Exception as e:
        health_data["services"]["openai"] = {
            "status": "unhealthy", 
            "error": str(e)
        }
        health_data["status"] = "degraded"
    
    return health_data
