# Frontend Deployment Guide

## Files to Upload to Git Repository

### ✅ Include These Files/Folders:
```
app/                       # Next.js App Router pages
components/                # React components
lib/                      # Utility functions
public/                   # Static assets
hooks/                    # React hooks
styles/                   # CSS styles
package.json              # Dependencies
next.config.mjs           # Next.js configuration
tailwind.config.ts        # Tailwind CSS config
tsconfig.json             # TypeScript config
.env.example              # Environment template
.gitignore                # Git ignore rules
README.md                 # Documentation
```
\`\`\`
```
ai-meeting-assistant/
├── app/              # Next.js application (Vercel will use this)
├── components/       # React components
├── backend/          # Django backend (deploy separately to Render)
└── package.json      # Dependencies
```

## Key Points
- No need to set root directory in Vercel (project is at root level)
- Only one environment variable needed: `NEXT_PUBLIC_BACKEND_URL`

# Root level files (optional but recommended)
README.md                   # Project overview
.gitignore                 # Global git ignore
\`\`\`

### ❌ Exclude These Files/Folders:
\`\`\`
backend/                   # Django backend (separate deployment)
node_modules/              # Dependencies (auto-installed)
.next/                     # Build output
.env                       # Local environment file
.env.local                 # Local environment file
*.log                      # Log files
.DS_Store                  # macOS system files
\`\`\`

## Deployment Steps

### Step 1: Prepare Repository
1. Create new GitHub repository
2. Upload only the files listed above
3. Ensure `.gitignore` excludes backend directory

### Step 2: Deploy to Vercel
1. Connect GitHub repository to Vercel
2. Set **Root Directory** to `/` (root)
3. Add **Environment Variable**:
   \`\`\`
   NEXT_PUBLIC_BACKEND_URL=https://backened-baby-one-1-6ooz.onrender.com
   \`\`\`
4. Deploy

### Step 3: Verify Deployment
1. Check build logs for errors
2. Test the deployed URL
3. Verify API connection to backend

## Repository Structure After Upload
\`\`\`
your-repo/
├── frontend/              # Next.js app (Vercel will use this)
├── README.md             # Project documentation
└── .gitignore            # Excludes backend/
\`\`\`

## Important Notes
- Vercel will automatically detect it's a Next.js project
- Set Root Directory to `frontend/` in Vercel settings
- Backend stays on Render, frontend on Vercel
- Only one environment variable needed: `NEXT_PUBLIC_BACKEND_URL`
