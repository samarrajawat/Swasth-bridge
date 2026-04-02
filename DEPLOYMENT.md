# 🚀 SwasthBridge Deployment & Hosting Guide

This guide provides step-by-step instructions on how to properly sync your code to GitHub and host both the frontend and backend for free on professional platforms, making it completely live for your interviewer.

---

## 🛑 Phase 1: Preparation (IMPORTANT)

Before pushing, you MUST make sure your API calls connect properly when hosted!

1. Open `frontend/src/api/axios.js` (or wherever your Axios instance is defined).
2. Change the `baseURL` to use an environment variable so Vercel knows how to talk to your backend:
   ```javascript
   const API = axios.create({
     // Use the hosted URL if available, otherwise fallback to localhost for local testing
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
   });
   ```

---

## 📁 Phase 2: Pushing to GitHub

*Make sure you have Git installed and are logged into GitHub.*

1. **Create a GitHub Repository**: Go to GitHub.com and create a new public repository named `swasth-bridge`. Do **not** check the "Add README" box.
2. **Open Terminal in your Root folder (`D:\SwasthyaBridge`)**
3. Run the following commands sequentially:
   ```bash
   git init
   
   # Important: Make sure you have a .gitignore file in root so you don't push node_modules!
   # If you don't have one, run: echo "node_modules/" > .gitignore
   
   git add .
   git commit -m "Initial SwasthBridge Commit"
   
   # Link to your new repo (replace YOUR_USERNAME)
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/swasth-bridge.git
   git push -u origin main
   ```

---

## 🗄️ Phase 3: Host the Database (MongoDB Atlas)

You cannot use `localhost` on the live internet. Let's get a free cloud database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a Free Cluster (M0 tier in AWS or GCP).
3. **Network Access**: Go to Network Access (left panel) -> Add IP Address -> Choose **Allow Access From Anywhere** (`0.0.0.0/0`).
4. **Database Access**: Create a Database User. Put highly secure credentials (e.g. user: `admin`, pass: `BridgePass123`).
5. **Get URI**: Click "Connect" -> Drivers (Node.js) -> Copy the Connection String.
   *(It will look like `mongodb+srv://admin:<password>@cluster0.abcd.mongodb.net/?retryWrites=true&w=majority`)*

---

## ⚙️ Phase 4: Host the Backend (Render.com)

Render is an excellent, free cloud provider for Node.js backends.

1. Go to [Render.com](https://render.com/) and sign up with GitHub.
2. Click **New +** -> **Web Service**.
3. Select "Build and deploy from a Git repository" and select your `swasth-bridge` GitHub Repo.
4. **Configuration Settings**:
   - **Name**: `swasthbridge-api`
   - **Root Directory**: `backend` *(Crucial! Tells Render your backend is inside this folder)*
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**: Click Advanced -> Add Environment Variables. Adding these is critical:
   - `PORT`: `10000`
   - `MONGO_URI`: *(Paste the Atlas link you copied in Phase 3. Remember to replace `<password>` with your real password)*
   - `JWT_SECRET`: *(A random long string, e.g. `SwasthyaSecureProductionKey99x`)*
   - `JWT_EXPIRE`: `7d`
6. Click **Create Web Service**. 
   *(Wait ~3 minutes. Once it says "Live", copy the Render URL it gives you, e.g. `https://swasthbridge-api.onrender.com`)*

> **Database Note:** Once your backend is live, you can "post" mock data. If you need to run your seeder remotely, Render provides a "Shell" tab on your Web Service. Type `node utils/seeder.js` in that shell to populate your MongoDB Atlas with your fake doctors/patients.

---

## 💻 Phase 5: Host the Frontend (Vercel)

Vercel is the absolute best ecosystem for hosting React/Vite frontends.

1. Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. Click **Add New Project** and Import your `swasth-bridge` GitHub Repository.
3. **Configuration Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" and select `frontend` *(Extremely important!)*
4. **Environment Variables**: Open the environment variables drop down and add your Backend API URL:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://swasthbridge-api.onrender.com/api` *(Paste your exact Render URL here, making sure to add `/api` to the end if that's how your routes are typed)*
5. Click **Deploy**.

🎉 **You are completely done.** 

Vercel will give you a live `.vercel.app` link. You can send this link to your interviewer, and they can register themselves as a patient, book an OPD timing, and it will actually hit your Render backend and persist to your MongoDB Cloud Database!
