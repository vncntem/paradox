# Paradox Email Subscription API

A Node.js API for handling email subscriptions with MongoDB storage and Discord notifications.

## Features

- Email subscription endpoint
- MongoDB storage
- Discord webhook notifications
- CORS support
- Health check endpoint
- Optional SMTP email notifications

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies: `npm install`
4. Start the server: `npm start`

## Environment Variables

See `.env.example` for all required environment variables.

## API Endpoints

- `POST /api/subscribe` - Subscribe with email
- `GET /health` - Health check
- `GET /test` - API test endpoint

## Docker Deployment

1. Update environment variables in `.env`
2. Run `docker-compose up -d`

## Development

1. Set `NODE_ENV=development` in `.env`
2. Update `ALLOWED_ORIGINS` for your development domains
3. Run `npm start`

## Security

- MongoDB is not exposed publicly
- CORS is configured for specific origins
- Environment variables for sensitive data
