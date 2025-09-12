# TaurausAI Backend

This is the backend service for TaurausAI, built with Node.js, Express, TypeScript, and MongoDB.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── app.ts         # Express app setup
└── server.ts      # Server entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a .env file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/taurausai
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=1d
   ```

3. Development:
   ```bash
   npm run dev
   ```

4. Production build:
   ```bash
   npm run build
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run render-postbuild` - Build and install Chrome for Render deployment

## Deployment

### Render Deployment

This app is configured for deployment on Render with Puppeteer support for PDF generation.

#### Required Environment Variables:

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket
GEMINI_API_KEY=your-gemini-api-key
# Optional: Custom Chrome path for Puppeteer
PUPPETEER_EXECUTABLE_PATH=/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux*/chrome
```

#### Build Settings on Render:

- **Build Command**: `npm run render-postbuild`
- **Start Command**: `npm start`
- **Environment**: Node.js

The `render-postbuild` script automatically installs Chrome during deployment for PDF generation functionality.

#### Troubleshooting PDF Generation:

If you encounter Chrome/Puppeteer issues in production:

1. Ensure the `render-postbuild` script ran successfully
2. Check Chrome installation in build logs
3. Verify `PUPPETEER_EXECUTABLE_PATH` environment variable is set
4. PDF generation will gracefully fail with error logging if Chrome is unavailable

### Other Platforms

For other cloud platforms (Heroku, Railway, etc.), you may need to:

1. Install Chrome/Chromium in your build process
2. Set appropriate `PUPPETEER_EXECUTABLE_PATH` environment variable
3. Add necessary Chrome flags in the Puppeteer configuration
- `npm test` - Run tests
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

## API Documentation

API documentation will be available at `/api-docs` when the server is running.

## Testing

```bash
npm test
```

## License

This project is proprietary and confidential.
