"""
API views for the meeting assistant backend.
Handles audio processing, transcription, translation, and AI analysis.
"""
import json
import logging
import base64
import time
from datetime import datetime
from typing import Dict, Any

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.core.files.uploadedfile import InMemoryUploadedFile

from .services import (
    get_bhashini_service, 
    get_gemini_service, 
    validate_audio_file, 
    get_audio_format_from_filename,
    get_service_health,
    APIError
)

logger = logging.getLogger(__name__)

def add_cors_headers(response):
    """Add CORS headers to response"""
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

def log_request_info(request, endpoint_name):
    """Log request information for debugging"""
    origin = request.META.get('HTTP_ORIGIN', 'Unknown')
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
    logger.info(f"Processing {endpoint_name} request from: {origin}")
    logger.info(f"User agent: {user_agent}")

def create_error_response(error: APIError, request_start_time: float) -> JsonResponse:
    """Create standardized error response"""
    duration = time.time() - request_start_time
    logger.error(f"API error after {duration:.2f}s: {error.message}")
    
    response = JsonResponse({
        'success': False,
        'error': error.message,
        'service': error.service,
        'duration': f"{duration:.2f}s"
    }, status=error.status_code)
    
    return add_cors_headers(response)

def create_success_response(data: Dict[str, Any], request_start_time: float) -> JsonResponse:
    """Create standardized success response"""
    duration = time.time() - request_start_time
    logger.info(f"Request completed successfully in {duration:.2f}s")
    
    response_data = {
        'success': True,
        'duration': f"{duration:.2f}s",
        **data
    }
    
    response = JsonResponse(response_data)
    return add_cors_headers(response)

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def process_audio(request):
    """Handle audio processing requests"""
    if request.method == "OPTIONS":
        response = JsonResponse({})
        return add_cors_headers(response)
    
    request_start_time = time.time()
    log_request_info(request, "audio processing")
    
    try:
        # Parse request data
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle multipart form data
            audio_file = request.FILES.get('audio')
            source_lang = request.POST.get('sourceLanguage', 'hi')
            target_lang = request.POST.get('targetLanguage', 'en')
            pre_meeting_notes = request.POST.get('preMeetingNotes', '')
            
            if not audio_file:
                raise APIError("No audio file provided", 400, "validation")
            
            # Validate audio file
            validation_result = validate_audio_file(audio_file)
            if not validation_result['valid']:
                raise APIError(validation_result['error'], 400, "validation")
            
            # Read and encode audio file
            audio_content = audio_file.read()
            audio_base64 = base64.b64encode(audio_content).decode('utf-8')
            audio_format = get_audio_format_from_filename(audio_file.name)
            
            logger.info(f"Processing: {audio_file.name} ({len(audio_content)} bytes) | {source_lang} -> {target_lang}")
            
        else:
            # Handle JSON data
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                raise APIError("Invalid JSON data", 400, "validation")
            
            audio_base64 = data.get('audioData')
            source_lang = data.get('sourceLanguage', 'hi')
            target_lang = data.get('targetLanguage', 'en')
            pre_meeting_notes = data.get('preMeetingNotes', '')
            audio_format = data.get('audioFormat', 'wav')
            
            if not audio_base64:
                raise APIError("No audio data provided", 400, "validation")
            
            logger.info(f"Processing: JSON audio data ({len(audio_base64)} chars) | {source_lang} -> {target_lang}")
        
        # Normalize language codes
        source_lang = source_lang.split('-')[0].lower()
        target_lang = target_lang.split('-')[0].lower()
        
        # Log pre-meeting notes status
        logger.info(f"Pre-meeting notes provided: {'Yes' if pre_meeting_notes.strip() else 'No'}")
        
        # Process audio through Bhashini
        bhashini_service = get_bhashini_service()
        bhashini_result = bhashini_service.process_audio(
            audio_base64, source_lang, target_lang, audio_format
        )
        
        # Extract transcript and translation from Bhashini result
        transcript = ""
        translation = ""
        
        if 'pipelineResponse' in bhashini_result:
            for response in bhashini_result['pipelineResponse']:
                if response['taskType'] == 'asr' and response.get('output'):
                    transcript = response['output'][0].get('source', '')
                elif response['taskType'] == 'translation' and response.get('output'):
                    translation = response['output'][0].get('target', '')
        
        # If no translation was performed (same language), use transcript as translation
        if not translation and transcript:
            translation = transcript
        
        # Generate AI summary using Gemini
        gemini_service = get_gemini_service()
        ai_analysis = gemini_service.generate_summary_and_actions(
            translation or transcript, pre_meeting_notes
        )
        
        # Prepare response data
        response_data = {
            'data': {
                'transcript': transcript,
                'translation': translation,
                'summary': ai_analysis['summary'],
                'actionItems': ai_analysis['actionItems'],
                'keyDecisions': ai_analysis['keyDecisions']
            },
            'metadata': {
                'sourceLanguage': source_lang,
                'targetLanguage': target_lang,
                'audioFormat': audio_format,
                'processedAt': datetime.now().isoformat(),
                'preMeetingNotesProvided': bool(pre_meeting_notes.strip())
            }
        }
        
        return create_success_response(response_data, request_start_time)
        
    except APIError as e:
        return create_error_response(e, request_start_time)
    except Exception as e:
        logger.error(f"Unexpected error in audio processing: {str(e)}")
        error = APIError(f"Internal server error: {str(e)}", 500, "server")
        return create_error_response(error, request_start_time)

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def health_check(request):
    """Health check endpoint"""
    if request.method == "OPTIONS":
        response = JsonResponse({})
        return add_cors_headers(response)
    
    try:
        health_data = get_service_health()
        status_code = 200 if health_data['status'] == 'healthy' else 503
        response = JsonResponse(health_data, status=status_code)
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        response = JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=503)
        return add_cors_headers(response)

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def supported_languages(request):
    """Get supported languages"""
    if request.method == "OPTIONS":
        response = JsonResponse({})
        return add_cors_headers(response)
    
    try:
        bhashini_service = get_bhashini_service()
        languages = bhashini_service.get_supported_languages()
        response = JsonResponse({
            'success': True,
            'languages': languages,
            'count': len(languages)
        })
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"Error getting supported languages: {str(e)}")
        response = JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
        return add_cors_headers(response)

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def supported_audio_formats(request):
    """Get supported audio formats"""
    if request.method == "OPTIONS":
        response = JsonResponse({})
        return add_cors_headers(response)
    
    try:
        bhashini_service = get_bhashini_service()
        formats = bhashini_service.get_supported_audio_formats()
        response = JsonResponse({
            'success': True,
            'formats': formats,
            'count': len(formats)
        })
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"Error getting supported audio formats: {str(e)}")
        response = JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
        return add_cors_headers(response)
