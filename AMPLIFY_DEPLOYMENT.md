# AWS Amplify Deployment Guide for Next.js SSR

## Overview

This application is configured for AWS Amplify's **WEB_COMPUTE** platform, which supports Next.js Server-Side Rendering (SSR) with full access to environment variables at runtime.

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

**IMPORTANT:** When creating the app, Amplify will ask you to select the **platform type**:

- ✅ **Select: "Web Compute"** (required for Next.js SSR)
- ❌ **Do NOT select: "Web Dynamic" or "Static"**

AWS Amplify will auto-detect `amplify.yml`. Verify it shows:

```yaml
version: 1
applications:
  - appRoot: .
    platform: WEB_COMPUTE
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

**Key Configuration:**
- `platform: WEB_COMPUTE` - Enables SSR with runtime environment variables
- `baseDirectory: .next` - Next.js output directory
- Caching configured for npm and Next.js build cache

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
- These variables are automatically available to your Next.js app at **runtime** on WEB_COMPUTE
- Do NOT add them to `amplify.yml` (security risk)
- Server-side environment variables (without `NEXT_PUBLIC_` prefix) are only accessible in server components and API routes
- With WEB_COMPUTE, environment variables work correctly in SSR contexts

## Step 4: Deploy

1. Click **"Save and deploy"**
2. Amplify will:
   - Clone your repository
   - Install dependencies (`npm ci`)
   - Build your Next.js app (`npm run build`)
   - Deploy with SSR support

## Step 5: Verify Deployment

1. Once deployed, click the generated URL
2. Test the following pages:
   - Home page: `/`
   - Chinese spaces list: `/chinese` (tests SSR with env vars)
   - Individual space report: `/chinese/spaces/[id]` (tests dynamic SSR)

**Expected Behavior:**
- Pages should load without "environment variable not set" errors
- Data should be fetched and displayed correctly
- All API calls should work with the bearer token

## Architecture Details

### Next.js Configuration

The app uses default Next.js configuration optimized for Amplify WEB_COMPUTE:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // No special output mode needed
  // Amplify WEB_COMPUTE handles deployment automatically
};
```

**Why no `output: 'standalone'`?**
- `standalone` mode is for custom Node.js deployments
- Amplify WEB_COMPUTE manages the deployment infrastructure
- Default Next.js output works best with Amplify

### Server-Side Rendering (SSR)

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

**With WEB_COMPUTE Platform:**
- ✅ **Server Components:** Can access `process.env.VAIL_API_BEARER_TOKEN`
- ✅ **API Routes:** Can access all environment variables
- ✅ **Runtime:** Variables are injected at runtime (not build time)
- ⚠️ **Client Components:** Can only access `process.env.NEXT_PUBLIC_*` variables

**Build Time vs Runtime:**
- Variables are NOT needed at build time
- All data fetching happens at runtime
- SSR pages get fresh environment variables on each request

## Troubleshooting

### Error: "VAIL_API_BEARER_TOKEN environment variable is not set"

**Common Causes:**

1. **Wrong Platform Type**
   - **Problem:** App is using "Static" or "Web Dynamic" instead of "Web Compute"
   - **Solution:** 
     - Delete the current Amplify app
     - Create a new app and select **"Web Compute"** platform
     - Redeploy

2. **Environment Variables Not Set**
   - **Problem:** Variables not configured in Amplify Console
   - **Solution:**
     - Go to Amplify Console → Your App → Environment variables
     - Verify `VAIL_API_BEARER_TOKEN` is set with correct value
     - Click "Save" and redeploy

3. **Cache Issues**
   - **Problem:** Old build cached without environment variables
   - **Solution:**
     - Go to Amplify Console → Your App
     - Click "Redeploy this version"
     - Or push a new commit to trigger fresh build

### Build Fails

**Check:**
1. `amplify.yml` contains `platform: WEB_COMPUTE`
2. Node.js version compatibility (Amplify uses Node 18+ by default)
3. All dependencies are in `package.json`
4. No syntax errors in `next.config.ts`

### Pages Show Errors After Deployment

**Check:**
1. Platform is set to **WEB_COMPUTE** (not Static or Web Dynamic)
2. Environment variables correctly set in Amplify Console
3. API endpoint (`NEXT_PUBLIC_API_URL`) is accessible
4. Bearer token is valid and not expired
5. Check Amplify logs for SSR errors

### How to Verify Platform Type

1. Go to Amplify Console → Your App
2. Look at "App settings" → "General"
3. Under "Platform," it should show **"Web Compute"**
4. If it shows "Static" or "Web Dynamic," you need to recreate the app

## Migration from Static to Web Compute

If your existing Amplify app was created with "Static" platform:

1. **Export current environment variables:**
   - Go to Environment variables
   - Copy all variable names and values

2. **Delete the static app:**
   - Amplify Console → Your App → Actions → Delete app

3. **Create new Web Compute app:**
   - New app → Host web app
   - Connect GitHub repository
   - **Select "Web Compute" platform**
   - Configure build settings (auto-detected)

4. **Restore environment variables:**
   - Add all variables from step 1
   - Save and deploy

## Security Best Practices

✅ **DO:**
- Store secrets in Amplify Console Environment Variables
- Use `NEXT_PUBLIC_` prefix only for client-accessible variables
- Keep `.env` file in `.gitignore`
- Use WEB_COMPUTE platform for SSR applications

❌ **DON'T:**
- Commit secrets to repository
- Put secrets in `amplify.yml`
- Use environment variables in client components (except NEXT_PUBLIC_*)
- Use Static platform for apps that need runtime environment variables

## Performance Considerations

### WEB_COMPUTE vs Static

**WEB_COMPUTE (Current Setup):**
- ✅ Server-side rendering on each request
- ✅ Dynamic data fetching
- ✅ Runtime environment variables
- ✅ API routes work
- ⚠️ Slightly slower than static (but necessary for our use case)

**Static (Not Suitable):**
- ❌ No runtime environment variables
- ❌ No server-side rendering
- ❌ No API routes
- ✅ Faster (but cannot access VAIL API)

### Caching Strategy

The app uses:
- `force-dynamic` rendering for fresh data
- `cache: 'no-store'` in fetch calls
- Next.js build cache for faster builds
- npm cache for faster installs

## Maintenance

### Updating Environment Variables

1. Go to Amplify Console → Your App → Environment variables
2. Click **"Manage variables"**
3. Update values
4. Click **"Save"**
5. Trigger redeploy (Amplify may auto-deploy on save)

### Updating Code

1. Push changes to GitHub `main` branch
2. Amplify automatically triggers a new build
3. Monitor build progress in Amplify Console
4. Check logs if deployment fails

### Monitoring

**Check logs for:**
- Build errors: Amplify Console → Build logs
- Runtime errors: Amplify Console → Monitoring → Logs
- SSR errors: CloudWatch logs (linked from Amplify)

## Support

For issues with:
- **AWS Amplify Platform:** Check [Amplify Hosting Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- **Next.js on Amplify:** Check [Amplify Next.js Guide](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
- **VAIL API:** Contact VAIL API support
- **Application code:** Check repository issues

## Additional Resources

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)
