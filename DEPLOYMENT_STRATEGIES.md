# Deployment Strategies Guide

This document outlines different deployment strategies for the MeetingMind application.

## 🏗️ Architecture Overview

\`\`\`
Frontend (Next.js)     Backend (Django)
     ↓                      ↓
   Vercel               Render/Railway
     ↓                      ↓
Static Hosting         Python Runtime
     ↓                      ↓
CDN Distribution       API Endpoints
\`\`\`

## 📋 Strategy Comparison

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Combined Repo** | Single source of truth, easier development | Larger repo size, complex CI/CD | Development, small teams |
| **Separate Repos** | Independent deployments, cleaner separation | Sync challenges, more repos to manage | Production, large teams |
| **Monorepo Tools** | Best of both worlds, shared tooling | Additional complexity, learning curve | Enterprise, complex projects |

## 🚀 Deployment Configurations

### Strategy 1: Combined Repository

#### Overview
Deploy both frontend and backend from a single repository using root directory configuration.

#### Advantages
- Single repository to maintain
- Easier development workflow
- Shared documentation and configuration
- Simplified version control

#### Disadvantages
- Larger repository size
- Both services redeploy on any change
- Mixed technology stack in one repo

#### Implementation

**Vercel (Frontend):**
\`\`\`
Repository: your-repo
Root Directory: frontend/
Build Command: npm run build
Environment Variables: NEXT_PUBLIC_BACKEND_URL
\`\`\`

**Render (Backend):**
\`\`\`
Repository: your-repo
Root Directory: backend/
Build Command: pip install -r requirements.txt && python manage.py collectstatic --noinput
Start Command: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 meeting_assistant.wsgi:application
Environment Variables: BHASHINI_USER_ID, ULCA_API_KEY, etc.
\`\`\`

### Strategy 2: Separate Repositories

#### Overview
Split frontend and backend into separate repositories for independent deployment.

#### Advantages
- Independent deployment cycles
- Smaller, focused repositories
- Technology-specific tooling
- Better separation of concerns
- Team-specific access control

#### Disadvantages
- Multiple repositories to maintain
- Coordination required for breaking changes
- Duplicate documentation

#### Implementation

**Frontend Repository Setup:**
1. Create new repository
2. Copy `frontend/` contents to root
3. Move `frontend/README.md` to root
4. Use `frontend/.gitignore` as root `.gitignore`
5. Update package.json paths if needed

**Backend Repository Setup:**
1. Create new repository
2. Copy `backend/` contents to root
3. Move `backend/README.md` to root
4. Use `backend/.gitignore` as root `.gitignore`
5. Update import paths if needed

**Deployment:**
\`\`\`
Frontend Repository -> Vercel (auto-detects Next.js)
Backend Repository -> Render (auto-detects Python)
\`\`\`

## 🔧 Environment Variable Management

### Combined Repository
\`\`\`
# Root .env (for development)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BHASHINI_USER_ID=dev_user_id
# ... other variables

# Deployment platforms handle separation automatically
\`\`\`

### Separate Repositories
\`\`\`
# Frontend repository .env
NEXT_PUBLIC_BACKEND_URL=https://backend-app.onrender.com

# Backend repository .env
BHASHINI_USER_ID=your_user_id
ULCA_API_KEY=your_api_key
# ... other backend variables
\`\`\`

## 🔄 CI/CD Workflows

### Combined Repository GitHub Actions
\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    if: contains(github.event.head_commit.modified, 'frontend/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          working-directory: frontend

  deploy-backend:
    if: contains(github.event.head_commit.modified, 'backend/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        # Render auto-deploys on push
        run: echo "Backend deployment triggered"
\`\`\`

### Separate Repositories
Each repository has its own simple CI/CD:

**Frontend:**
\`\`\`yaml
name: Deploy Frontend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
\`\`\`

**Backend:**
\`\`\`yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: echo "Deployment triggered"
\`\`\`

## 🛠️ Migration Guide

### From Combined to Separate

**Frontend Migration:**
\`\`\`bash
# Create new frontend repository
git clone your-combined-repo frontend-repo
cd frontend-repo

# Keep only frontend files
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rm -rf backend/
rm -rf frontend/

# Update git history (optional)
git filter-branch --subdirectory-filter frontend -- --all
\`\`\`

**Backend Migration:**
\`\`\`bash
# Create new backend repository
git clone your-combined-repo backend-repo
cd backend-repo

# Keep only backend files
mv backend/* .
mv backend/.* . 2>/dev/null || true
rm -rf frontend/
rm -rf backend/

# Update git history (optional)
git filter-branch --subdirectory-filter backend -- --all
\`\`\`

### From Separate to Combined

\`\`\`bash
# Create new combined repository
mkdir meetingmind-combined
cd meetingmind-combined
git init

# Add frontend as subdirectory
git subtree add --prefix=frontend frontend-repo-url main

# Add backend as subdirectory
git subtree add --prefix=backend backend-repo-url main

# Add root-level files
cp frontend/README.md ./README.md
# Edit README.md to reflect combined structure
\`\`\`

## 🔍 Monitoring and Maintenance

### Combined Repository
- Single CI/CD pipeline
- Unified logging and monitoring
- Shared dependency management

### Separate Repositories
- Independent CI/CD pipelines
- Service-specific monitoring
- Independent dependency management
- Cross-service integration testing required
\`\`\`

## 🎯 Recommendations

### For New Projects
Start with **combined repository** for faster development, migrate to separate repositories as the team and requirements grow.

### For Existing Projects
Evaluate based on:
- Team size and structure
- Deployment complexity
- Release frequency
- Maintenance overhead

### For Enterprise
Consider **separate repositories** with proper tooling for dependency management and cross-repo coordination.

## 📈 Scaling Considerations

### Performance
- **Combined**: Larger clone times, single CI/CD pipeline
- **Separate**: Faster individual operations, parallel deployments

### Team Management
- **Combined**: Simpler permissions, single PR process
- **Separate**: Granular access control, independent workflows

### Maintenance
- **Combined**: Single dependency management, unified updates
- **Separate**: Independent updates, potential version drift

## 📊 Decision Matrix

### Choose Combined Repository If:
- ✅ Small to medium team (1-5 developers)
- ✅ Rapid prototyping and development
- ✅ Shared components between frontend/backend
- ✅ Simple deployment requirements
- ✅ Single product focus

### Choose Separate Repositories If:
- ✅ Large team with specialized roles
- ✅ Different release cycles for frontend/backend
- ✅ Multiple frontends for same backend
- ✅ Strict separation of concerns
- ✅ Independent scaling requirements

## 📚 Best Practices

### Combined Repository
- Use clear directory structure
- Implement proper .gitignore hierarchy
- Document deployment configurations clearly
- Use monorepo tools if complexity grows

### Separate Repositories
- Maintain API contract documentation
- Use semantic versioning for breaking changes
- Implement proper CI/CD pipelines
- Consider using git submodules for shared code
