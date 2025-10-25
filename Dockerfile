FROM php:8.2-fpm

# Install PHP extensions & system tools
RUN apt-get update && apt-get install -y \
    apt-utils \
    git \
    curl \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    sqlite3 \
    libsqlite3-dev \
    docker-php-ext-install pdo_pgsql \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy your application code
COPY . .

# Install PHP deps
RUN composer install --no-dev --optimize-autoloader

# Permissions & storage link
RUN chmod -R 775 storage bootstrap/cache \
 && php artisan storage:link

# Fix permissions for built assets
RUN chown -R www-data:www-data public/build \
 && chmod -R 755 public/build

#Create an SQLite Database
RUN touch database/database.sqlite


# Cache everything
# RUN php artisan config:cache \
#  && php artisan view:cache 

# Expose port & serve
EXPOSE 8000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
# CMD ["php","artisan","serve","--host=0.0.0.0","--port=8000"]
