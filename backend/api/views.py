"""
API Views for the Meeting Assistant with comprehensive error handling and CORS support.
"""
import base64
import logging
import json
import time
import os
import tempfile
from datetime import datetime
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods

from .services import get_bhashini_service, get_openai_service, APIError, get_service_health, normalize_language_code

logger = logging.getLogger(__name__)

def add_cors_headers(response):
    """Add comprehensive CORS headers to response"""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, HEAD'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response['Access-Control-Max-Age'] = '86400'
    return response

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@csrf_exempt
def health_check(request):
    """Health check endpoint - supports GET, HEAD, OPTIONS"""
    try:
        logger.info(f"Health check request ({request.method}) from: {request.META.get('HTTP_ORIGIN', 'unknown')}")
        
        if request.method == 'OPTIONS':
            response = JsonResponse({'status': 'ok'})
            return add_cors_headers(response)
        
        # Check environment variables
        required_vars = ['BHASHINI_USER_ID', 'ULCA_API_KEY', 'BHASHINI_AUTH_TOKEN', 'OPENAI_API_KEY']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        health_data = {
            'status': 'healthy' if not missing_vars else 'unhealthy',
            'version': '1.0.0',
            'django_version': '4.2.7',
            'timestamp': datetime.now().isoformat(),
            'method': request.method
        }
        
        if missing_vars:
            health_data['error'] = f'Missing environment variables: {", ".join(missing_vars)}'
            health_data['missing_vars'] = missing_vars
            response = JsonResponse(health_data, status=500)
        else:
            health_data['services'] = {
                'bhashini': 'configured',
                'openai': 'configured',
                'cors': 'enabled'
            }
            response = JsonResponse(health_data)
        
        return add_cors_headers(response)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        response = JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat(),
            'method': request.method
        }, status=500)
        return add_cors_headers(response)

@csrf_exempt
def test_connection(request):
    """Test connection endpoint - supports GET, HEAD, OPTIONS"""
    try:
        if request.method == 'OPTIONS':
            response = JsonResponse({'status': 'ok'})
            return add_cors_headers(response)
        
        logger.info(f"Test connection request from: {request.META.get('HTTP_ORIGIN', 'unknown')}")
        
        # Get comprehensive service health
        health_data = get_service_health()
        
        # Add connection test specific data
        health_data['connection_test'] = True
        health_data['cors_enabled'] = True
        health_data['request_method'] = request.method
        health_data['client_ip'] = get_client_ip(request)
        
        status_code = 200 if health_data["status"] == "healthy" else 503
        
        response = JsonResponse(health_data, status=status_code)
        return add_cors_headers(response)
        
    except Exception as e:
        logger.error(f"Test connection failed: {e}")
        response = JsonResponse({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat(),
            'connection_test': True
        }, status=500)
        return add_cors_headers(response)

@method_decorator(csrf_exempt, name='dispatch')
class ProcessAudioView(View):
    """Audio processing endpoint"""
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS request"""
        logger.info("Handling OPTIONS request for process-audio")
        response = JsonResponse({'status': 'ok', 'methods': ['POST', 'OPTIONS']})
        return add_cors_headers(response)
    
    def post(self, request):
        start_time = time.time()
        
        try:
            logger.info(f"Processing audio request from: {request.META.get('HTTP_ORIGIN', 'unknown')}")
            
            # Validate audio file
            audio_file = request.FILES.get('audio')
            if not audio_file:
                logger.error("No audio file provided")
                response = JsonResponse({
                    'error': 'Audio file is required',
                    'success': False
                }, status=400)
                return add_cors_headers(response)
            
            # Validate file size (50MB max)
            max_size = 50 * 1024 * 1024
            if audio_file.size > max_size:
                logger.error(f"Audio file too large: {audio_file.size} bytes")
                response = JsonResponse({
                    'error': f'Audio file too large. Maximum size is {max_size // (1024*1024)}MB',
                    'success': False
                }, status=400)
                return add_cors_headers(response)
            
            # Get parameters and normalize language codes
            primary_language = normalize_language_code(request.POST.get('primaryLanguage', 'hi'))
            target_language = normalize_language_code(request.POST.get('targetLanguage', 'en'))
            pre_meeting_notes = request.POST.get('preMeetingNotes', '')
            
            logger.info(f"Normalized languages: {request.POST.get('primaryLanguage')} -> {primary_language}, {request.POST.get('targetLanguage')} -> {target_language}")
            
            # Validate languages (using normalized codes)
            supported_languages = ['hi', 'en', 'bn', 'ta', 'te', 'gu', 'mr', 'kn', 'ml', 'pa', 'as', 'or']
            if primary_language not in supported_languages or target_language not in supported_languages:
                logger.error(f"Unsupported language: {primary_language} -> {target_language}")
                response = JsonResponse({
                    'error': f'Unsupported language combination: {primary_language} -> {target_language}',
                    'supported_languages': supported_languages,
                    'success': False,
                    'original_languages': {
                        'primary': request.POST.get('primaryLanguage'),
                        'target': request.POST.get('targetLanguage')
                    }
                }, status=400)
                return add_cors_headers(response)
            
            logger.info(f"Processing: {audio_file.name} ({audio_file.size} bytes) | {primary_language} -> {target_language}")
            
            # Convert to base64
            audio_content = audio_file.read()
            audio_base64 = base64.b64encode(audio_content).decode('utf-8')
            
            # Get services
            bhashini_service = get_bhashini_service()
            openai_service = get_openai_service()
            
            # Process through Bhashini - pass the filename for proper URI matching
            bhashini_start = time.time()
            bhashini_result = bhashini_service.process_audio(
                audio_base64, 
                primary_language, 
                target_language, 
                filename=audio_file.name
            )
            bhashini_time = time.time() - bhashini_start
            
            # Extract transcript and translation
            pipeline_response = bhashini_result.get("pipelineResponse", [])
            
            # Get ASR result
            asr_result = next((task for task in pipeline_response if task["taskType"] == "asr"), None)
            if not asr_result or not asr_result.get("output", [{}])[0].get("source"):
                response = JsonResponse({
                    'error': 'No transcription result received from speech recognition',
                    'success': False
                }, status=500)
                return add_cors_headers(response)
            
            transcript = asr_result["output"][0]["source"]
            
            # Get translation result
            translation_result = next((task for task in pipeline_response if task["taskType"] == "translation"), None)
            translated_text = "Translation not available"
            if translation_result and translation_result.get("output"):
                translated_text = translation_result["output"][0].get("target", "Translation not available")
            
            # Generate AI analysis
            openai_start = time.time()
            ai_result = openai_service.generate_summary_and_actions(transcript)
            openai_time = time.time() - openai_start
            
            total_time = time.time() - start_time
            
            # Prepare response
            response_data = {
                "success": True,
                "transcript": transcript,
                "translatedText": translated_text,
                "summary": ai_result.get("summary", "Summary not available"),
                "actionItems": [
                    {
                        "item": item,
                        "assignee": "TBD",
                        "priority": "Medium",
                        "dueDate": "TBD"
                    } for item in ai_result.get("actionItems", [])
                ],
                "keyDecisions": ai_result.get("keyDecisions", []),
                "metadata": {
                    "processing_time": {
                        "total": round(total_time, 2),
                        "bhashini": round(bhashini_time, 2),
                        "openai": round(openai_time, 2)
                    },
                    "audio_info": {
                        "filename": audio_file.name,
                        "size_bytes": audio_file.size,
                        "content_type": audio_file.content_type
                    },
                    "languages": {
                        "source": primary_language,
                        "target": target_language,
                        "original_source": request.POST.get('primaryLanguage'),
                        "original_target": request.POST.get('targetLanguage')
                    },
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            logger.info(f"Processing completed successfully in {total_time:.2f}s")
            response = JsonResponse(response_data)
            return add_cors_headers(response)
            
        except APIError as e:
            processing_time = time.time() - start_time
            logger.error(f"API error after {processing_time:.2f}s: {e}")
            response = JsonResponse({
                'error': str(e),
                'processing_time': round(processing_time, 2),
                'success': False
            }, status=min(e.status_code, 500))
            return add_cors_headers(response)
            
        except ValueError as e:
            processing_time = time.time() - start_time
            logger.error(f"Configuration error after {processing_time:.2f}s: {e}")
            response = JsonResponse({
                'error': f'Configuration error: {str(e)}',
                'processing_time': round(processing_time, 2),
                'success': False
            }, status=500)
            return add_cors_headers(response)
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Unexpected error after {processing_time:.2f}s: {e}", exc_info=True)
            response = JsonResponse({
                'error': f'Processing failed: {str(e)}',
                'processing_time': round(processing_time, 2),
                'success': False
            }, status=500)
            return add_cors_headers(response)

@csrf_exempt
def supported_languages(request):
    """Get supported languages - supports GET, HEAD, OPTIONS"""
    try:
        if request.method == 'OPTIONS':
            response = JsonResponse({'status': 'ok'})
            return add_cors_headers(response)
        
        logger.info(f"Supported languages request ({request.method}) from: {request.META.get('HTTP_ORIGIN', 'unknown')}")
        
        languages = [
            {'code': 'hi', 'name': 'Hindi'},
            {'code': 'en', 'name': 'English'},
            {'code': 'bn', 'name': 'Bengali'},
            {'code': 'te', 'name': 'Telugu'},
            {'code': 'mr', 'name': 'Marathi'},
            {'code': 'ta', 'name': 'Tamil'},
            {'code': 'gu', 'name': 'Gujarati'},
            {'code': 'kn', 'name': 'Kannada'},
            {'code': 'ml', 'name': 'Malayalam'},
            {'code': 'pa', 'name': 'Punjabi'},
            {'code': 'as', 'name': 'Assamese'},
            {'code': 'or', 'name': 'Odia'}
        ]
        
        response_data = {
            'languages': languages,
            'total_count': len(languages),
            'success': True
        }
        
        response = JsonResponse(response_data)
        return add_cors_headers(response)
        
    except Exception as e:
        logger.error(f"Error getting supported languages: {str(e)}")
        response = JsonResponse({'error': str(e), 'success': False}, status=500)
        return add_cors_headers(response)

# Create view instances
process_audio = ProcessAudioView.as_view()
