FROM php:8.2-fpm

# Install system tools & PHP extensions
RUN apt-get update && apt-get install -y \
    apt-utils \
    git \
    curl \
    zip \
    unzip \
    nodejs \
    npm \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libpq-dev \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy app code
COPY . .

#  Install PHP deps
RUN composer install --no-dev --optimize-autoloader

#  Install Node deps & build assets
RUN npm install && npm run build

# Fix permissions & create SQLite DB
RUN chmod -R 775 storage bootstrap/cache \
 && php artisan storage:link \
 && chown -R www-data:www-data public/build \
 && chmod -R 755 public/build \
 && touch database/database.sqlite

EXPOSE 8000

# Run migrations & start app
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
