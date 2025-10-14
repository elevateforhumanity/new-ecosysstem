#!/bin/bash

set -e

echo "🚀 Starting deployment..."

if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh [environment]"
  echo "Example: ./deploy.sh production"
  exit 1
fi

ENVIRONMENT=$1

echo "📦 Environment: $ENVIRONMENT"

if [ "$ENVIRONMENT" = "production" ]; then
  ENV_FILE=".env.production"
elif [ "$ENVIRONMENT" = "staging" ]; then
  ENV_FILE=".env.staging"
else
  echo "❌ Invalid environment. Use 'production' or 'staging'"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Environment file $ENV_FILE not found"
  exit 1
fi

echo "🔄 Pulling latest changes..."
git pull origin main

echo "🐳 Building Docker images..."
docker-compose -f docker-compose.yml --env-file $ENV_FILE build

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml --env-file $ENV_FILE down

echo "🚀 Starting new containers..."
docker-compose -f docker-compose.yml --env-file $ENV_FILE up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.yml --env-file $ENV_FILE exec -T backend npx prisma migrate deploy

echo "🧹 Cleaning up old Docker images..."
docker system prune -f

echo "✅ Deployment completed successfully!"

echo "🔍 Checking service health..."
docker-compose -f docker-compose.yml --env-file $ENV_FILE ps

echo "📊 Checking logs..."
docker-compose -f docker-compose.yml --env-file $ENV_FILE logs --tail=50
