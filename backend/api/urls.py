from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('test-connection/', views.test_connection, name='test_connection'),
    path('process-audio/', views.process_audio, name='process_audio'),
    path('supported-languages/', views.supported_languages, name='supported_languages'),
]
