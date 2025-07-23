# MeetingMind - AI-Powered Meeting Assistant

A full-stack application that transforms audio recordings into actionable meeting insights using AI.

## Overview

MeetingMind processes audio files and live recordings to generate:
- Accurate transcriptions in multiple Indian languages
- AI-powered summaries
- Actionable items with priorities
- Language translations

## Architecture

\`\`\`
Frontend (Next.js)  →  Backend (Django)  →  AI Services
     ↓                      ↓                    ↓
   Vercel              Render/Railway      Bhashini + OpenAI
\`\`\`

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Language**: Python 3.11+
- **AI Services**: Bhashini API + OpenAI GPT-4
- **Deployment**: Render/Railway

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Git

### Frontend Setup
\`\`\`bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm run dev
\`\`\`

### Backend Setup
\`\`\`bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python manage.py migrate
python manage.py runserver
\`\`\`

## Deployment

### Option 1: Frontend Only (Use Existing Backend)
Deploy just the frontend to work with your existing backend:

1. **Upload to GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Add MeetingMind frontend"
   git push origin main
   \`\`\`

2. **Deploy to Vercel:**
   - Connect GitHub repository
   - Set root directory to `frontend/`
   - Add environment variable: `NEXT_PUBLIC_BACKEND_URL=https://backened-baby-one.onrender.com`
   - Deploy

### Option 2: Full Stack Deployment
Deploy both frontend and backend:

1. **Backend to Render:**
   - Connect GitHub repository
   - Set root directory to `backend/`
   - Add all environment variables from `.env.example`
   - Deploy

2. **Frontend to Vercel:**
   - Connect same GitHub repository
   - Set root directory to `frontend/`
   - Add environment variable with new backend URL
   - Deploy

## Project Structure

\`\`\`
meetingmind/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies
│   └── .env.example      # Environment template
├── backend/              # Django application
│   ├── meeting_assistant/ # Django project
│   ├── api/              # API endpoints
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment template
├── README.md             # This file
└── .gitignore           # Git ignore rules
\`\`\`

## Features

### Audio Processing
- Multiple format support (MP3, WAV, M4A, etc.)
- File upload with drag & drop
- Live recording capability
- Progress tracking

### AI-Powered Analysis
- Speech-to-text transcription
- Multi-language support (Hindi, English, Bengali, etc.)
- AI-generated summaries
- Action item extraction
- Language translation

### Modern UI
- Responsive design
- Dark/light theme
- Real-time updates
- Professional interface

## Supported Languages

- Hindi (hi)
- English (en)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Tamil (ta)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)
- Odia (or)
- Assamese (as)

## Environment Variables

### Frontend
\`\`\`bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
\`\`\`

### Backend
\`\`\`bash
DJANGO_SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-your-openai-key
BHASHINI_USER_ID=your-bhashini-user-id
ULCA_API_KEY=your-ulca-api-key
BHASHINI_AUTH_TOKEN=your-bhashini-token
DEBUG=False
\`\`\`

## API Endpoints

- `GET /api/health/` - Health check
- `GET /api/test-connection/` - Test AI service connections
- `POST /api/process-audio/` - Process audio files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License. See LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in service directories
- Review troubleshooting guides
