# Setting Up Public BASE_URL for BLAND AI Webhooks

BLAND AI needs a publicly accessible URL to send webhook callbacks to your server. Here are several options:

## Option 1: Using ngrok (Best for Local Development/Testing)

ngrok creates a secure tunnel to your local server, making it publicly accessible.

### Step 1: Install ngrok

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

Or download from: https://ngrok.com/download

### Step 2: Start Your Server
```bash
npm start
```

### Step 3: In a New Terminal, Run ngrok
```bash
ngrok http 3000
```

This will output something like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Copy the HTTPS URL
Use the HTTPS URL (e.g., `https://abc123.ngrok.io`) in your `.env` file:

```env
BASE_URL=https://abc123.ngrok.io
```

### Step 5: Restart Your Server
Restart your Node.js server so it picks up the new BASE_URL.

**Note:** Free ngrok URLs change every time you restart ngrok. For a stable URL, consider ngrok's paid plans or use a permanent hosting solution.

---

## Option 2: Deploy to a Cloud Platform (Best for Production)

### A. Railway

1. Go to https://railway.app
2. Sign up and create a new project
3. Connect your GitHub repository (or deploy directly)
4. Railway will automatically provide a public URL (e.g., `https://your-app.railway.app`)
5. Add environment variables in Railway dashboard:
   - `BLAND_AI_API_KEY=your_key`
   - `BLAND_AI_VOICE_ID=e1289219-0ea2-4f22-a994-c542c2a48a0f`
   - `BASE_URL=https://your-app.railway.app`
   - `TARGET_PHONE_NUMBER=+13614259843`
   - `PORT=3000` (Railway sets this automatically)

### B. Render

1. Go to https://render.com
2. Sign up and create a new "Web Service"
3. Connect your repository
4. Render provides a URL like `https://your-app.onrender.com`
5. Add environment variables:
   - `BLAND_AI_API_KEY=your_key`
   - `BASE_URL=https://your-app.onrender.com`
   - etc.

### C. Heroku

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create app:
   ```bash
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set BLAND_AI_API_KEY=your_key
   heroku config:set BASE_URL=https://your-app-name.herokuapp.com
   heroku config:set BLAND_AI_VOICE_ID=e1289219-0ea2-4f22-a994-c542c2a48a0f
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```

### D. Vercel / Netlify

These platforms work great for frontend, but you'll need to deploy your API separately or use their serverless functions.

---

## Option 3: Use Your Own Domain with Port Forwarding

If you have a domain and static IP:

1. Point your domain to your server's IP address
2. Set up port forwarding on your router (forward port 3000)
3. Use a reverse proxy like nginx for HTTPS
4. Set BASE_URL to your domain: `BASE_URL=https://yourdomain.com`

**Note:** This requires maintaining your own server and is more complex.

---

## Quick Setup Guide

### For Local Testing (ngrok):

1. Install ngrok (see above)
2. Start your server: `npm start`
3. In another terminal: `ngrok http 3000`
4. Copy the HTTPS URL from ngrok
5. Update `.env`:
   ```env
   BASE_URL=https://abc123.ngrok.io
   ```
6. Restart your server

### For Production (Railway/Render):

1. Deploy your code to the platform
2. Set `BASE_URL` to your deployment URL (e.g., `https://your-app.railway.app`)
3. Make sure all other environment variables are set
4. Test the webhook endpoint is accessible: Visit `https://your-app.railway.app/api/bland-webhook` (should return an error, but confirms it's accessible)

---

## Testing Your Webhook

Once BASE_URL is set, you can test if BLAND AI can reach it:

1. Make a test call through your application
2. Check your server logs for webhook callbacks
3. BLAND AI should send POST requests to `${BASE_URL}/api/bland-webhook`

---

## Troubleshooting

**Issue:** Webhooks not being received
- **Solution:** Make sure BASE_URL is HTTPS (not HTTP) and publicly accessible
- Check if your server is running and accessible from the internet
- Verify firewall/security group settings allow incoming connections

**Issue:** ngrok URL changes frequently
- **Solution:** Use ngrok's paid plan for static URLs, or deploy to a permanent hosting solution

**Issue:** Can't access server from outside
- **Solution:** Check if your hosting provider requires specific ports or configurations
- Verify DNS settings if using a custom domain

---

## Recommended Setup

- **Development:** Use ngrok for quick testing
- **Production:** Deploy to Railway, Render, or Heroku for a permanent, stable URL

