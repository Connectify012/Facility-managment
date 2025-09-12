"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(config_1.config.MONGODB_URI);
        logger_1.logger.info('Connected to MongoDB');
        // Start the server with port fallback
        let currentPort = config_1.config.PORT;
        let server;
        while (!server) {
            try {
                server = await new Promise((resolve, reject) => {
                    const s = app_1.app.listen(currentPort, () => {
                        logger_1.logger.info(`Server is running on port ${currentPort}`);
                        resolve(s);
                    }).on('error', (err) => {
                        if (err.code === 'EADDRINUSE') {
                            logger_1.logger.warn(`Port ${currentPort} is in use, trying port ${currentPort + 1}`);
                            currentPort++;
                            resolve(null);
                        }
                        else {
                            reject(err);
                        }
                    });
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to start server:', error);
                throw error;
            }
        }
        // Handle unhandled rejections
        process.on('unhandledRejection', (err) => {
            logger_1.logger.error('Unhandled Rejection:', err);
            server.close(async () => {
                process.exit(1);
            });
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger_1.logger.error('Uncaught Exception:', err);
            server.close(async () => {
                process.exit(1);
            });
        });
        // Handle graceful shutdown
        process.on('SIGTERM', async () => {
            logger_1.logger.info('SIGTERM received, shutting down gracefully');
            server.close(async () => {
                await mongoose_1.default.disconnect();
                process.exit(0);
            });
        });
        process.on('SIGINT', async () => {
            logger_1.logger.info('SIGINT received, shutting down gracefully');
            server.close(async () => {
                await mongoose_1.default.disconnect();
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
