# Docker Deployment Guide for Playlist Converter

This guide will help you dockerize and deploy your Laravel + React playlist converter application to Render.

## Prerequisites

- Docker and Docker Compose installed locally
- Render account
- Git repository with your code

## Local Development with Docker

### 1. Build and Run Locally

```bash
# Build the Docker image
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

Your application will be available at `http://localhost:8000`

### 2. Run Database Migrations (if needed)

```bash
# Access the running container
docker-compose exec app php artisan migrate

# Or run other artisan commands
docker-compose exec app php artisan key:generate
```

## Deploying to Render

### Option 1: Using Render's Docker Support

1. **Connect your Git repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your Git repository

2. **Configure the service**
   - **Name**: playlist-converter (or your preferred name)
   - **Runtime**: Docker
   - **Build Command**: `docker build -t playlist-converter .`
   - **Start Command**: `docker run -p $PORT:80 playlist-converter`

3. **Set Environment Variables**
   Add these environment variables in Render:

   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=<generate-a-new-key>
   DB_CONNECTION=sqlite
   QUEUE_CONNECTION=database
   CACHE_STORE=file
   SESSION_DRIVER=file
   LOG_CHANNEL=single
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   YOUTUBE_API_KEY=your_youtube_api_key
   APP_URL=https://your-app-name.onrender.com
   ```

4. **Deploy**
   - Render will automatically build and deploy your application
   - The first build may take several minutes

### Option 2: Using render.yaml (Blueprint)

If you prefer using Render's blueprint deployment:

1. **Update render.yaml**
   - Replace `your-app-name` with your actual Render service name
   - Add your API keys for Spotify and YouTube

2. **Deploy via Blueprint**
   - Push the `render.yaml` file to your repository
   - In Render dashboard, go to "Blueprints" and select your repository
   - Render will create the service based on the blueprint

## Environment Variables Setup

### Required API Keys

You'll need to obtain API keys from:

1. **Spotify API**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy Client ID and Client Secret

2. **YouTube Data API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create credentials (API Key)

### Laravel Configuration

The application uses SQLite for simplicity, but you can switch to PostgreSQL if needed:

```env
DB_CONNECTION=sqlite  # or pgsql for PostgreSQL
```

## File Structure

```
PlaylistConverter/
├── Dockerfile              # Docker configuration
├── docker-compose.yml     # Local development setup
├── .dockerignore          # Files to exclude from Docker build
├── render.yaml           # Render deployment configuration
└── ...                   # Your Laravel application files
```

## Troubleshooting

### Common Issues

1. **Port Issues**: Render assigns a random port via `$PORT` environment variable
2. **Storage Permissions**: Ensure storage directories are writable
3. **Database**: SQLite database is created automatically in the container

### Checking Logs

```bash
# View application logs
docker-compose logs app

# Or in Render dashboard under your service logs
```

### Database Issues

If you need to run migrations after deployment:

```bash
# Via SSH (if enabled) or update your Dockerfile to run migrations
php artisan migrate --force
```

## Production Optimizations

1. **Enable OPcache**: Already configured in Dockerfile
2. **Use Redis for caching**: Update docker-compose.yml if needed
3. **Enable compression**: Apache configuration includes basic setup
4. **SSL**: Render provides automatic SSL certificates

## Scaling Considerations

- For higher traffic, consider:
  - Using PostgreSQL instead of SQLite
  - Adding Redis for caching and sessions
  - Implementing queue workers for background jobs
  - Using a CDN for static assets

## Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables are set correctly
3. Ensure API keys have proper permissions
4. Test locally with Docker first
