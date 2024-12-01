#!/bin/bash

domains=(jarawheels.com www.jarawheels.com)
email="wahomesamuel2003@gmail.com" # Change this to your email
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

# Request certificates
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $email \
    --agree-tos \
    --no-eff-email \
    ${staging:+"--staging"} \
    ${domains[@]/#/-d }

# Restart nginx
docker-compose restart nginx 