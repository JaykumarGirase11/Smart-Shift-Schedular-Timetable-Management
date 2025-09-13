# Smart Shift Scheduler - Installation & Deployment Guide

This guide provides detailed instructions for setting up, configuring, and deploying the Smart Shift Scheduler application in different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Configuration Options](#configuration-options)
4. [Database Setup](#database-setup)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing Smart Shift Scheduler, ensure you have the following:

- **Node.js**: Version 14.x or later
- **npm**: Version 6.x or later (included with Node.js)
- **MongoDB**: Version 4.x or later (optional for full mode)
- **Git**: For cloning the repository

## Development Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/smart-shift-scheduler.git
cd smart-shift-scheduler
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Build TypeScript files
npm run build

# Start development server
npm run dev
```

The backend server will run on http://localhost:5000 by default.

### Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend development server will run on http://localhost:3000 by default.

## Configuration Options

### Backend Configuration

The backend configuration is stored in `backend/src/config/config.ts`:

```typescript
export default {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/shift-scheduler',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h'
};
```

### Frontend Configuration

The frontend configuration is stored in `frontend/src/config.ts`:

```typescript
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  demoMode: process.env.REACT_APP_DEMO_MODE === 'true'
};
```

## Database Setup

### Local MongoDB Setup

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service:
   ```bash
   mongod --dbpath /path/to/data/directory
   ```
3. The application will automatically create the required collections when it first connects

### Using MongoDB Atlas (Cloud)

1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from the Atlas dashboard
4. Set the `MONGO_URI` environment variable to your connection string

## Production Deployment

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

The frontend build will be generated in the `frontend/build` directory.

### Serving the Application

#### Option 1: Using Express to Serve Frontend

1. Copy the frontend build to the backend's public directory:
   ```bash
   cp -r frontend/build/* backend/public/
   ```

2. Configure the backend to serve static files:
   ```typescript
   // In backend/src/index.ts
   app.use(express.static(path.join(__dirname, 'public')));
   
   // For any other routes, serve the index.html
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });
   ```

3. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

#### Option 2: Separate Frontend and Backend Hosting

1. Host the backend on a platform like Heroku, DigitalOcean, or AWS
2. Host the frontend build on a static hosting service like Netlify, Vercel, or GitHub Pages
3. Configure the frontend's `REACT_APP_API_URL` to point to your hosted backend API

## Docker Deployment

### Using Docker Compose

1. Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3'
services:
  mongodb:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network
    restart: always

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/shift-scheduler
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - app-network
    restart: always

  frontend:
    build: ./frontend
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:5000/api
    ports:
      - "3000:80"
    networks:
      - app-network
    restart: always

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
```

2. Create `Dockerfile` in the backend directory:

```dockerfile
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["node", "dist/index.js"]
```

3. Create `Dockerfile` in the frontend directory:

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

4. Deploy with Docker Compose:

```bash
docker-compose up -d
```

## Environment Variables

### Backend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port for the backend server | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/shift-scheduler |
| JWT_SECRET | Secret key for JWT tokens | your-secret-key |
| NODE_ENV | Environment (development/production) | development |

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | URL of the backend API | http://localhost:5000/api |
| REACT_APP_DEMO_MODE | Run in demo mode without backend | false |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Check if MongoDB is running
   - Verify the connection string is correct
   - Ensure network connectivity between application and database

2. **CORS Issues**
   - Ensure backend has proper CORS configuration for the frontend domain
   - Check for any proxy settings in the frontend package.json

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript version compatibility

### Debug Mode

To run the backend in debug mode:

```bash
cd backend
npm run dev:debug
```

For the frontend, enable React DevTools and Redux DevTools in your browser for enhanced debugging capabilities.