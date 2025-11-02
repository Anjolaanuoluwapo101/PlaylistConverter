# PlaylistConverter

LINK: https://playlistconverter-tw1g.onrender.com

A modern, secure web application that seamlessly converts and synchronizes music playlists between Spotify and YouTube Music platforms. Built with Laravel 12, React 19, and TypeScript for a robust, scalable experience.

## Features

### 🎵 **Playlist Conversion**
- Convert playlists between Spotify and YouTube Music with high accuracy
- Advanced track matching algorithm handles large playlists effortlessly
- Real-time progress tracking with detailed status updates
- Support for both playlist URLs and IDs

### **Real-Time Sync**
- Bidirectional synchronization between platforms
- Automatic updates when playlists change on either platform
- Option to remove extra tracks during sync
- Background job processing for reliability

### **Custom Playlist Builder**
- Create new playlists from scratch across multiple platforms
- Search and add tracks from both Spotify and YouTube Music
- Build playlists with up to 5 tracks per creation
- Simultaneous creation on multiple platforms

### **Secure Authentication**
- OAuth integration with Spotify and YouTube Music APIs
- Encrypted data handling with no storage of user credentials
- Secure token management and refresh handling
- Complete privacy protection

### **Social Features**
- Share converted playlists with friends
- Collaborate on playlist builds
- Cross-platform sharing capabilities

### **Personalized Settings**
- Customizable themes and UI preferences
- Platform-specific settings
- Notification preferences
- User profile management

## Tech Stack

### Backend
- **Laravel 12** - PHP web framework
- **PHP 8.2+** - Server-side scripting
- **MySQL/PostgreSQL** - Database
- **Redis** - Caching and session storage
- **Queue System** - Background job processing

### Frontend
- **React 19** - Modern JavaScript library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Inertia.js** - SPA framework for Laravel

### APIs & Services
- **Spotify Web API** - Music data and playlist management
- **YouTube Data API v3** - YouTube Music integration
- **Laravel Sanctum** - API authentication
- **Laravel Socialite** - OAuth integration

### DevOps & Tools
- **Docker** - Containerization
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Composer** - PHP dependency management
- **NPM** - JavaScript dependency management

##  Getting Started

### Prerequisites
- PHP 8.2 or higher
- Node.js 18+ and npm
- Composer
- Docker (optional, for containerized setup)
- MySQL/PostgreSQL database
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/playlistconverter.git
   cd playlistconverter
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure environment variables**
   Edit `.env` file with your database credentials and API keys:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=playlistconverter
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   REDIS_HOST=127.0.0.1
   REDIS_PASSWORD=null
   REDIS_PORT=6379

   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   YOUTUBE_CLIENT_ID=your_youtube_client_id
   YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   ```

6. **Database setup**
   ```bash
   php artisan migrate
   ```

7. **Build assets**
   ```bash
   npm run build
   ```

### Running the Application

#### Development Mode
```bash
composer run dev
```
This starts the Laravel server, queue worker, logs, and Vite dev server concurrently.

#### Production Build
```bash
npm run build
php artisan serve
```

#### Using Docker (Alternative)
```bash
docker-compose up -d
```

##  API Documentation

### Authentication Endpoints
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout

### Conversion Endpoints
- `POST /api/convert` - Start playlist conversion
- `GET /api/convert/status/{jobId}` - Get conversion status
- `GET /api/convert/history` - Get conversion history
- `DELETE /api/convert/{jobId}` - Cancel conversion

### Sync Endpoints
- `POST /api/sync` - Start playlist sync
- `GET /api/sync/status/{jobId}` - Get sync status
- `GET /api/sync/jobs` - Get sync history

### Build Endpoints
- `POST /api/build` - Create new playlist
- `GET /api/build/status/{jobId}` - Get build status
- `GET /api/build/jobs` - Get build history

### Platform Endpoints
- `GET /api/platforms` - Get available platforms
- `GET /api/platforms/connected` - Get connected platforms
- `GET /api/playlists/{platform}` - Get user playlists
- `GET /api/playlists/{platform}/{playlistId}/tracks` - Get playlist tracks

## 🔧 Configuration

### API Keys Setup

#### Spotify
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add your redirect URI: `http://localhost:8000/auth/spotify/callback`
4. Copy Client ID and Client Secret to `.env`

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/auth/youtube/callback`
6. Copy Client ID and Client Secret to `.env`

### Queue Configuration
The application uses Laravel's queue system for background processing. Configure your queue driver in `.env`:

```env
QUEUE_CONNECTION=database  # or redis, sync for development
```

Start the queue worker:
```bash
php artisan queue:work
```

##  Testing

Run the test suite:
```bash
php artisan test
```

Run with coverage:
```bash
php artisan test --coverage
```

##  Deployment

### Using Docker
```bash
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment
1. Set up web server (Apache/Nginx)
2. Configure SSL certificate
3. Set environment to production
4. Run database migrations
5. Build and optimize assets
6. Set up queue workers
7. Configure cron jobs for scheduled tasks

### Environment Variables for Production
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
# ... database config

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

MAIL_MAILER=smtp
# ... mail config
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PSR-12 coding standards for PHP
- Use TypeScript for all React components
- Write tests for new features
- Update documentation for API changes
- Ensure code passes linting and formatting

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Laravel](https://laravel.com/) - The PHP framework
- [React](https://reactjs.org/) - The JavaScript library
- [Tailwind CSS](https://tailwindcss.com/) - The CSS framework
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [YouTube Data API](https://developers.google.com/youtube/v3)

##  Support

For support, email support@playlistconverter.com or join our Discord community.

---

**Made with ❤️ for music lovers worldwide**
