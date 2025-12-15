# Backend Deployment Guide - Render.com

## Quick Deploy Steps:

1. **Go to [render.com](https://render.com)** and sign up/login (free account works)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `TejaswiRudraraju1/charity-backend`
   - Or use "Public Git repository" and paste: `https://github.com/TejaswiRudraraju1/charity-backend`

3. **Configure the Service:**
   - **Name:** `trustchain-backend` (or any name you like)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave empty (root of repo)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Plan:** Free (or paid if you prefer)

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   - `MONGO_URI` = `mongodb+srv://tejaswirudraraju1_db_user:tejaswingoproject@cluster0.b5ybg8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET` = `your-super-secret-jwt-key-change-this-in-production`
   - `PORT` = `10000` (Render uses this port)
   - `NODE_ENV` = `production`

5. **Click "Create Web Service"**

6. **Wait for deployment** (takes 2-5 minutes)

7. **Copy your backend URL** (will be like: `https://trustchain-backend.onrender.com`)

8. **Update Frontend Environment Variable:**
   - Go to [Vercel Dashboard](https://vercel.com/tejaswi-rudrarajus-projects/frontend/settings/environment-variables)
   - Update `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL
   - Redeploy frontend (or it auto-redeploys)

## Your website will be fully functional! 🎉

