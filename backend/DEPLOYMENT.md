# Deployment Configuration Guide

## Environment Variables

### Backend Deployment (Render)

The following environment variables must be configured in your Render service:

\`\`\`
BHASHINI_USER_ID=your_bhashini_user_id
ULCA_API_KEY=your_ulca_api_key
BHASHINI_AUTH_TOKEN=your_bhashini_auth_token
OPENAI_API_KEY=your_openai_api_key
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=False
\`\`\`

### Frontend Deployment (Vercel)

Configure the following environment variable in your Vercel project:

\`\`\`
NEXT_PUBLIC_BACKEND_URL=https://your-render-app.onrender.com
\`\`\`

## Validation Steps

### Local Testing

1. Create environment file:
   \`\`\`bash
   cd backend
   cp .env.example .env
   \`\`\`

2. Edit .env with your actual credentials

3. Run validation script:
   \`\`\`bash
   python quick_test.py
   \`\`\`

### Production Deployment

1. **Render Configuration:**
   - Navigate to Render dashboard
   - Select your backend service
   - Go to Environment tab
   - Add all required variables
   - Deploy service

2. **Vercel Configuration:**
   - Navigate to Vercel dashboard
   - Select your frontend project
   - Go to Settings > Environment Variables
   - Add NEXT_PUBLIC_BACKEND_URL
   - Redeploy

## Health Check Endpoints

After deployment, verify service health:

- Backend Health: `https://your-render-app.onrender.com/api/health/`
- Frontend: `https://your-vercel-app.vercel.app/`

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Verify all variables are set in deployment platform
   - Check for typos in variable names
   - Ensure values don't contain extra whitespace

2. **API Connection Failures**
   - Validate API credentials using test script
   - Check network connectivity
   - Verify API quotas and limits

3. **CORS Errors**
   - Ensure frontend URL is in CORS_ALLOWED_ORIGINS
   - Verify backend URL in frontend configuration

### Debug Commands

\`\`\`bash
# Test environment variables
python quick_test.py

# Test API connections
python test_bhashini_credentials.py

# Check Django configuration
python manage.py check
