# MeetingMind Backend

Django REST API backend for the AI-powered meeting assistant.

## Quick Start

### Development
\`\`\`bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
\`\`\`

### Environment Setup
\`\`\`bash
cp .env.example .env
# Edit .env with your API keys
\`\`\`

### Environment Variables
\`\`\`
BHASHINI_USER_ID=your_bhashini_user_id
ULCA_API_KEY=your_ulca_api_key
BHASHINI_AUTH_TOKEN=your_bhashini_auth_token
OPENAI_API_KEY=your_openai_api_key
DJANGO_SECRET_KEY=your_secret_key_here
DEBUG=True  # For development
\`\`\`

## Project Structure

\`\`\`
backend/
├── meeting_assistant/     # Django project
│   ├── __init__.py
│   ├── settings.py       # Django settings
│   ├── urls.py          # URL routing
│   ├── wsgi.py          # WSGI application
│   └── asgi.py          # ASGI application
├── api/                  # Main API app
│   ├── __init__.py
│   ├── apps.py          # App configuration
│   ├── urls.py          # API URL patterns
│   ├── views.py         # API views
│   ├── services.py      # Business logic
│   └── models.py        # Database models
├── requirements.txt      # Python dependencies
├── manage.py            # Django management
├── Dockerfile           # Container configuration
└── vercel.json          # Vercel deployment config
\`\`\`

## Tech Stack

- Framework: Django 4.2 + Django REST Framework
- Language: Python 3.11+
- AI Services: OpenAI GPT-4, Bhashini API
- Audio Processing: Built-in multipart handling
- Deployment: Render, Railway, or Vercel

## API Endpoints

### Health Check
\`\`\`
GET /api/health/
Response: {"status": "healthy", "timestamp": "..."}
\`\`\`

### Connection Test
\`\`\`
GET /api/test-connection/
Response: {"bhashini": "connected", "openai": "connected"}
\`\`\`

### Audio Processing
\`\`\`
POST /api/process-audio/
Content-Type: multipart/form-data

Fields:
- audio: Audio file (MP3, WAV, M4A, etc.)
- primaryLanguage: Source language code (e.g., "hi-IN")
- targetLanguage: Target language code (e.g., "en-US")
- preMeetingNotes: Optional context notes

Response:
{
  "transcript": "Transcribed text...",
  "summary": "AI-generated summary...",
  "translatedText": "Translated text...",
  "actionItems": [
    {
      "item": "Action description",
      "assignee": "Person name",
      "priority": "High",
      "dueDate": "2024-01-15"
    }
  ]
}
\`\`\`

## External API Integration

### Bhashini API
- Speech-to-text transcription
- Language translation
- Multi-language support

### OpenAI API
- Text summarization
- Action item extraction
- Content analysis

## Deployment

### Render (Recommended)
\`\`\`yaml
# render.yaml
services:
  - type: web
    name: meetingmind-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput
    startCommand: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 meeting_assistant.wsgi:application
    envVars:
      - key: DJANGO_SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
\`\`\`

### Railway
\`\`\`toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python manage.py migrate && gunicorn meeting_assistant.wsgi:application"
\`\`\`

### Vercel
\`\`\`json
{
  "builds": [
    {
      "src": "meeting_assistant/wsgi.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "meeting_assistant/wsgi.py"
    }
  ]
}
\`\`\`

## Testing

### Local Testing
\`\`\`bash
# Run development server
python manage.py runserver

# Test API endpoints
curl http://localhost:8000/api/health/
\`\`\`

### Credential Testing
\`\`\`bash
# Test Bhashini credentials
python test_bhashini_credentials.py

# Test production setup
python test_production_setup.py

# Quick environment test
python quick_test.py
\`\`\`

## Security

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",
]
