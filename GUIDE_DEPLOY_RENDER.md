# Deployment Guide: Render (Free)

This guide will help you deploy your **Forgotten Spins** Discord bot using **Render**.
Render has a specific "Web Service" free tier that works well for this, provided we keep it awake.

## Prerequisites
1.  A [GitHub Account](https://github.com/).
2.  A [Render Account](https://render.com/).
3.  Your bot code pushed to a GitHub repository.

## Steps

### 1. Create a New Web Service on Render
1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub account and select your `forgotten-spins` repository.

### 2. Configure the Service
- **Name**: `forgotten-spins` (or whatever you like).
- **Region**: Any (e.g., Ohio, Frankfurt).
- **Branch**: `master` (or `main`).
- **Runtime**: `Docker` (It should detect the Dockerfile automatically).
- **Instance Type**: **Free** (Run on free tier).

### 3. Environment Variables
Scroll down to "Environment Variables" and add these keys (from your `.env`):

| Key | Value |
| :--- | :--- |
| `DISCORD_TOKEN` | (Your Bot Token) |
| `DISCORD_CLIENT_ID` | (Your Client ID) |
| `LASTFM_API_KEY` | (Your Last.fm Key) |
| `LASTFM_USERNAME` | (Optional Default User) |
| `FORGOTTEN_PERIOD` | `12month` |
| `PORT` | `3000` (Optional, Render usually detects, but good to set) |

### 4. Deploy
1.  Click **Create Web Service**.
2.  Render will start building your Docker image. This might take a few minutes.
3.  Once finished, you should see "Your service is live".

### 5. Preventing "Sleep" (Free Tier Limitation)
Render's free tier spins down after 15 minutes of inactivity. Since this is a bot, we want it 24/7.
The `src/keep_alive.ts` script creates a web server. You can use a free "uptime monitor" service to ping your Render URL every 5 minutes to keep it awake.

1.  Copy your **Service URL** from the Render dashboard (e.g., `https://forgotten-spins.onrender.com`).
2.  Sign up for valid free monitoring service (e.g., UptimeRobot, Cron-job.org).
3.  Create a generic "HTTP" monitor pointing to your Render URL.
4.  Set interval to **5 minutes**.

Now your bot should stay online!
