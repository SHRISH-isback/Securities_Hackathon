# Vercel Deployment Guide for InsightGuard

This guide will help you deploy the InsightGuard application to Vercel.

## Architecture

InsightGuard consists of two parts:
1. **Backend API** (Flask/Python) - Deployed from the root directory
2. **Frontend** (React/Vite) - Deployed from the `frontend/` directory

Both can be deployed to Vercel as separate projects.

## Prerequisites

- Vercel account (free tier works fine)
- GitHub account (recommended for automatic deployments)
- Git installed locally

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Backend Deployment

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: Leave empty (Vercel auto-detects Python)
   - **Output Directory**: Leave empty
5. Add Environment Variables (optional):
   - `FRONTEND_ORIGIN`: `*` (or your specific frontend URL)
6. Click "Deploy"
7. Copy your deployment URL (e.g., `https://your-project.vercel.app`)

### Frontend Deployment

1. In Vercel dashboard, click "Add New Project" again
2. Import the same Git repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
4. Add Environment Variables:
   - `VITE_API_BASE`: `https://your-backend.vercel.app` (from step 7 above)
5. Click "Deploy"

## Option 2: Deploy via Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy Backend

```bash
# From project root
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Deploy Frontend

```bash
# Navigate to frontend directory
cd frontend

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Configuration Files

The project includes the following Vercel configuration files:

### Root `vercel.json` (Backend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

### `frontend/vercel.json` (Frontend)
Configured for SPA routing.

## Environment Variables

### Backend Environment Variables

Set these in your Vercel backend project:

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_ORIGIN` | Allowed CORS origin | `https://your-frontend.vercel.app` or `*` |
| `NEWS_API_KEY` | News API key (optional) | `your_key_here` |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key (optional) | `your_key_here` |

### Frontend Environment Variables

Set these in your Vercel frontend project:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `https://your-backend.vercel.app` |

## Testing Your Deployment

1. Visit your backend URL: `https://your-backend.vercel.app`
   - You should see the Flask app homepage
2. Test an API endpoint: `https://your-backend.vercel.app/api/analyze`
   - Should return a 400 error (missing POST data) - this is expected
3. Visit your frontend URL: `https://your-frontend.vercel.app`
   - Should load the React application

## Troubleshooting

### Backend Issues

**Problem**: Import errors or module not found
- **Solution**: Check that all dependencies are in `requirements.txt`

**Problem**: 500 Internal Server Error
- **Solution**: Check Vercel function logs in the dashboard

**Problem**: CORS errors
- **Solution**: Set `FRONTEND_ORIGIN` environment variable correctly

### Frontend Issues

**Problem**: Cannot connect to backend
- **Solution**: Verify `VITE_API_BASE` environment variable is set correctly

**Problem**: 404 errors on page refresh
- **Solution**: Ensure `frontend/vercel.json` has proper rewrites configured

## Automatic Deployments

Once connected to Git:
- **Production**: Automatic deployment on push to `main` branch
- **Preview**: Automatic deployment for pull requests and other branches

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

## Cost

Vercel's free tier includes:
- Unlimited deployments
- Automatic SSL certificates
- 100 GB bandwidth per month
- Serverless function execution limits

This should be sufficient for most small to medium projects.

## Support

For more information:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/runtimes#official-runtimes/python)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
