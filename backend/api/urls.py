"""
URL configuration for the API endpoints.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Main audio processing endpoint
    path('process-audio/', views.process_audio, name='process_audio'),
    
    # Utility endpoints
    path('health/', views.health_check, name='health_check'),
    path('supported-languages/', views.supported_languages, name='supported_languages'),
    path('supported-audio-formats/', views.supported_audio_formats, name='supported_audio_formats'),
]
