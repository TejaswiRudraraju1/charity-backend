# Deployment Guide for TrustChain

## Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked "Set up and deploy?", choose **Yes**
   - When asked "Which scope?", select your account
   - When asked "Link to existing project?", choose **No** (first time) or **Yes** (if redeploying)
   - When asked "What's your project's name?", enter: `trustchain` or press Enter for default
   - When asked "In which directory is your code located?", press Enter (it's `./`)
   - When asked about environment variables, we'll add them in the Vercel dashboard

5. **Add Environment Variables in Vercel Dashboard**:
   - Go to your project on [vercel.com](https://vercel.com)
   - Navigate to **Settings** → **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-url.vercel.app` (or your backend URL)

6. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Web Interface

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `.next` (should auto-detect)

6. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL` = Your backend API URL

7. **Click "Deploy"**

## Backend Deployment

Your backend (Node.js + Express) needs to be deployed separately. Options:

### Option A: Deploy Backend to Vercel (Serverless Functions)

You'll need to convert your Express routes to Vercel serverless functions.

### Option B: Deploy Backend to Railway/Render/Heroku

1. **Railway** (Recommended - Easy MongoDB integration):
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect GitHub repo
   - Add MongoDB service
   - Set environment variables from your `.env` file
   - Deploy

2. **Render**:
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repo
   - Set build command: `npm install`
   - Set start command: `node src/server.js`
   - Add environment variables
   - Deploy

### Environment Variables Needed for Backend:

- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A long random string
- `PORT` - Usually 5000 or let the platform assign
- `ETH_RPC_URL` - (Optional) For blockchain integration
- `ETH_PRIVATE_KEY` - (Optional) For blockchain integration
- `DONATION_REGISTRY_ADDRESS` - (Optional) For blockchain integration

## After Deployment

1. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel to point to your deployed backend URL
2. Redeploy the frontend
3. Test the full flow: register → login → create cause → donate

