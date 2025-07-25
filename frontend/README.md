# MeetingMind Frontend

Next.js application for the MeetingMind AI meeting assistant.

## Overview

A modern web application built with Next.js 14 that provides an intuitive interface for uploading audio files and viewing AI-generated meeting insights.

## Features

- Audio file upload with drag-and-drop support
- Real-time processing status updates
- Responsive design for all devices
- Dark/light theme toggle
- Modern UI with shadcn/ui components
- TypeScript for type safety

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment setup:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. **Configure environment variables:**
   \`\`\`bash
   # .env.local
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   \`\`\`

4. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open browser:**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Project Structure

\`\`\`
frontend/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── audio-upload.tsx  # Audio upload component
│   ├── navigation.tsx    # Navigation component
│   └── ...               # Other components
├── lib/                  # Utility functions
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
\`\`\`

## Environment Variables

### Required
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL

### Development
\`\`\`bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
\`\`\`

### Production
\`\`\`bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
\`\`\`

## Deployment

### Vercel (Recommended)

1. **Connect repository:**
   - Import project from GitHub
   - Select this repository

2. **Configure build settings:**
   - Framework Preset: Next.js
   - Root Directory: `frontend/` (if using combined repo)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment variables:**
   - Add `NEXT_PUBLIC_BACKEND_URL`

4. **Deploy:**
   - Automatic deployment on push to main branch

### Manual Deployment

1. **Build the application:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server:**
   \`\`\`bash
   npm run start
   \`\`\`

## API Integration

The frontend communicates with the Django backend through REST API calls:

\`\`\`typescript
// Example API call
const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/process-audio/`, {
  method: 'POST',
  body: formData,
});
\`\`\`

## Component Architecture

### Key Components
- `AudioUpload` - Handles file upload and processing
- `ProcessingResults` - Displays AI-generated results
- `Navigation` - App navigation and theme toggle
- `FeatureShowcase` - Landing page features

### UI Components
Built with shadcn/ui for consistent design:
- Button, Card, Progress, Dialog
- Form components with validation
- Responsive layout components

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom design system
- Responsive design patterns
- Dark mode support

### Theme Configuration
\`\`\`typescript
// tailwind.config.ts
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  // ... theme configuration
}
\`\`\`

## Performance Optimization

- **Next.js App Router** for optimal performance
- **Static generation** where possible
- **Image optimization** with Next.js Image component
- **Code splitting** automatic with Next.js
- **Bundle analysis** with @next/bundle-analyzer

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**Build Errors:**
\`\`\`bash
npm run lint
npm run type-check
\`\`\`

**Environment Variables:**
- Ensure all required variables are set
- Check variable names (must start with NEXT_PUBLIC_ for client-side)

**API Connection:**
- Verify backend URL is correct
- Check CORS configuration on backend
- Ensure backend is running and accessible

### Development Tips

1. **Hot Reload**: Changes auto-refresh in development
2. **TypeScript**: Use strict mode for better type safety
3. **ESLint**: Fix linting errors before committing
4. **Components**: Keep components small and focused

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new components
3. Test components thoroughly
4. Update documentation for new features

## License

MIT License - see root README.md for details.
