# AWS Amplify Deployment Guide

## Prerequisites

- AWS Account with Amplify access
- GitHub repository connected to AWS Amplify
- VAIL API Bearer Token

## Step 1: Create New Amplify App

1. Go to AWS Amplify Console
2. Click **"New app"** → **"Host web app"**
3. Connect your GitHub repository
4. Select the repository: `vail-zh`
5. Select the branch: `main`

## Step 2: Configure Build Settings

AWS Amplify should auto-detect `amplify.yml`. Verify it shows:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - .next/cache/**/*
```

## Step 3: Configure Environment Variables

**CRITICAL:** Add environment variables in Amplify Console:

1. In your Amplify app, go to **Environment variables** (left sidebar)
2. Click **"Manage variables"**
3. Add the following variables:

   | Variable Name | Value | Notes |
   |---------------|-------|-------|
   | `VAIL_API_BEARER_TOKEN` | `[Your Bearer Token]` | Your VAIL API token |
   | `NEXT_PUBLIC_API_URL` | `https://api.vail.report` | API endpoint |

4. Click **"Save"**

**Important Notes:**
- These variables are automatically available to your Next.js app at **runtime**
- Do NOT add them to `amplify.yml` (security risk)
- Server-side environment variables (without `NEXT_PUBLIC_` prefix) are only accessible in server components and API routes

## Step 4: Deploy

1. Click **"Save and deploy"**
2. Amplify will:
   - Clone your repository
   - Install dependencies (`npm ci`)
   - Build your Next.js app (`npm run build`)
   - Deploy the static and server files

## Step 5: Verify Deployment

1. Once deployed, click the generated URL
2. Test the following pages:
   - Home page: `/`
   - Chinese spaces list: `/chinese`
   - Individual space report: `/chinese/spaces/[id]`

## Architecture Details

### Next.js Configuration

The app uses Next.js standalone output mode for optimal Amplify deployment:

```typescript
// next.config.ts
output: 'standalone'
```

### Server-Side Rendering

Pages that need the VAIL API use `force-dynamic` rendering:

```typescript
// app/chinese/page.tsx
export const dynamic = 'force-dynamic';
```

This ensures:
- Pages are rendered at **request time** (not build time)
- Environment variables are available during rendering
- Fresh data on every request

### Environment Variable Access

- **Server Components/API Routes:** Can access `process.env.VAIL_API_BEARER_TOKEN`
- **Client Components:** Can only access `process.env.NEXT_PUBLIC_*` variables
- **Build Time:** Variables are NOT needed (all data fetching happens at runtime)

## Troubleshooting

### Error: "VAIL_API_BEARER_TOKEN environment variable is not set"

**Cause:** Environment variable not configured in Amplify Console

**Solution:** 
1. Go to Amplify Console → Your App → Environment variables
2. Verify `VAIL_API_BEARER_TOKEN` is set with the correct value
3. Redeploy the application

### Build Fails

**Check:**
1. `amplify.yml` is in repository root
2. Node.js version compatibility (Amplify uses Node 18 by default)
3. All dependencies are in `package.json`

### Pages Show Errors After Deployment

**Check:**
1. Environment variables are correctly set in Amplify Console
2. API endpoint (`NEXT_PUBLIC_API_URL`) is accessible
3. Bearer token is valid and not expired

## Security Best Practices

✅ **DO:**
- Store secrets in Amplify Console Environment Variables
- Use `NEXT_PUBLIC_` prefix only for client-accessible variables
- Keep `.env` file in `.gitignore`

❌ **DON'T:**
- Commit secrets to repository
- Put secrets in `amplify.yml`
- Use environment variables in client components

## Maintenance

### Updating Environment Variables

1. Go to Amplify Console → Your App → Environment variables
2. Click **"Manage variables"**
3. Update values
4. Click **"Save"**
5. Redeploy the app (Amplify should auto-deploy on save)

### Updating Code

1. Push changes to GitHub
2. Amplify automatically triggers a new build
3. Monitor build progress in Amplify Console

## Support

For issues with:
- **AWS Amplify:** Check AWS Amplify documentation or AWS Support
- **VAIL API:** Contact VAIL API support
- **Application code:** Check repository issues
