#!/bin/bash

domains=(jarawheels.com www.jarawheels.com)
email="wahomesamuel2003@gmail.com"
staging=0 # Set to 1 if you're testing your setup

# Create required directories
mkdir -p ./certbot/conf/live/jarawheels.com
mkdir -p ./certbot/www

# Stop existing containers
docker-compose down

# Delete any existing certificates (be careful with this in production)
rm -rf ./certbot/conf/*

# Start nginx
docker-compose up --force-recreate -d nginx

# Wait for nginx to start
echo "### Waiting for nginx to start..."
sleep 5

# Request new certificates
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $email \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    ${staging:+"--staging"} \
    -d jarawheels.com -d www.jarawheels.com \
    --expand

# Restart nginx to load the new certificates
docker-compose restart nginx

echo "### Done! Certificate should now be downloaded." 