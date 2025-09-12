import mongoose from 'mongoose';
import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Start the server with port fallback
    let currentPort = config.PORT;
    let server;

    while (!server) {
      try {
        server = await new Promise((resolve, reject) => {
          const s = app.listen(currentPort, () => {
            logger.info(`Server is running on port ${currentPort}`);
            resolve(s);
          }).on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
              logger.warn(`Port ${currentPort} is in use, trying port ${currentPort + 1}`);
              currentPort++;
              resolve(null);
            } else {
              reject(err);
            }
          });
        });
      } catch (error) {
        logger.error('Failed to start server:', error);
        throw error;
      }
    }

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      server.close(async () => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      server.close(async () => {
        process.exit(1);
      });
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
