# Fix Frontend Connection to Backend

## Step 1: Add Environment Variable in Vercel

1. Go to: https://vercel.com/tejaswi-rudrarajus-projects/frontend/settings/environment-variables

2. Click **"Add Environment Variable"**

3. Enter:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://trustchain-backend-ayq1.onrender.com`
   - **Environments:** Select all three (Production, Preview, Development)

4. Click **"Save"**

5. Go to: https://vercel.com/tejaswi-rudrarajus-projects/frontend/deployments

6. Find the latest deployment and click the **three dots (⋯)** → **"Redeploy"**

## Step 2: Wait for Backend to Redeploy

- Go to your Render dashboard: https://dashboard.render.com
- Check if the backend is redeploying (it should auto-redeploy after the git push)
- Wait for it to show "Live" status

## Step 3: Test

- Visit: https://frontend-3g95og4vw-tejaswi-rudrarajus-projects.vercel.app
- The causes should now load!

