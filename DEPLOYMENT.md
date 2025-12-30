# Deploying RationalistFront

This guide covers deploying your fork to various cloud platforms for testing.

## Quick Start Options

| Platform | Difficulty | Free Tier | Best For |
|----------|------------|-----------|----------|
| **Render** | Easiest | Yes | Quick testing, auto PR previews |
| **Railway** | Easy | Yes ($5 credit) | Branch environments, team use |
| **Fly.io** | Medium | Yes | Production, global edge |

---

## Option 1: Render (Recommended for Testing)

Render is the easiest option with a generous free tier and automatic preview deployments for PRs.

### Setup Steps

1. **Create a Render account** at [render.com](https://render.com)

2. **Deploy from Blueprint** (easiest):
   - Go to [dashboard.render.com/select-repo?type=blueprint](https://dashboard.render.com/select-repo?type=blueprint)
   - Select your forked repository
   - Render will auto-detect the `render.yaml` and configure everything

3. **Or deploy manually**:
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repo
   - Select "Docker" as the environment
   - Set Dockerfile path to `Dockerfile.simple`
   - Click "Create Web Service"

Your site will be available at `https://rationalistfront.onrender.com` (or similar).

### Preview Environments

Render automatically creates preview deployments for pull requests! Each PR gets its own URL.

---

## Option 2: Railway

Railway offers branch-based environments and a smooth developer experience.

### Setup Steps

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your forked repository

3. **Configure the deployment**:
   - Railway will auto-detect the Dockerfile
   - If it uses the wrong one, go to Settings → Build → Dockerfile Path
   - Set it to `Dockerfile.simple`

4. **Generate a domain**:
   - Go to Settings → Networking → Generate Domain
   - Your site will be at `https://your-project.up.railway.app`

### Enable CI/CD (Optional)

To enable automatic deployments via GitHub Actions:

1. Go to Railway Dashboard → Account Settings → Tokens
2. Generate a new token
3. In your GitHub repo, go to Settings → Secrets → Actions
4. Add a new secret named `RAILWAY_TOKEN` with the token value

Now every push to `main`, `claude/*`, `feature/*`, or `dev/*` branches will auto-deploy!

---

## Option 3: Fly.io

Fly.io is excellent for WebSocket applications with global edge deployment.

### Setup Steps

1. **Install the Fly CLI**:
   ```bash
   # macOS
   brew install flyctl

   # Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign up / Log in**:
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

3. **Launch the app**:
   ```bash
   fly launch --dockerfile Dockerfile.simple
   ```

   When prompted:
   - Choose a unique app name (e.g., `rationalistfront-yourname`)
   - Select a region close to you
   - Say "No" to creating a PostgreSQL database
   - Say "Yes" to deploy now

4. **Your app will be at**: `https://your-app-name.fly.dev`

### Subsequent Deployments

```bash
fly deploy --dockerfile Dockerfile.simple
```

---

## Local Development

For local testing before deploying:

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Build for production
npm run build

# Test production build locally with Docker
docker build -f Dockerfile.simple -t rationalistfront .
docker run -p 3000:3000 rationalistfront
```

---

## Environment Variables

All platforms support environment variables. Key ones:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `GAME_ENV` | Game environment | `prod` |
| `PORT` | Server port | `3000` |

---

## Troubleshooting

### Build fails with "proprietary" directory error

The simplified Dockerfile handles this automatically, but if you're using the main Dockerfile, create an empty directory:
```bash
mkdir -p proprietary
```

### WebSocket connections fail

Make sure your platform supports WebSockets:
- **Render**: Supported on all plans
- **Railway**: Supported
- **Fly.io**: Fully supported

### Site shows "502 Bad Gateway"

The server might still be starting. Wait 30-60 seconds and refresh. Check the platform logs for errors.

---

## Costs

- **Render Free**: 750 hours/month, sleeps after 15 min inactivity
- **Railway Free**: $5 credit/month, no sleep
- **Fly.io Free**: 3 shared-cpu VMs, 160GB bandwidth

For a personal test server, all free tiers should be sufficient.
