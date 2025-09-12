"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const errorHandler_1 = require("./errorHandler");
const notFoundHandler = (req, _res, next) => {
    next(new errorHandler_1.AppError(`Cannot find ${req.method} ${req.originalUrl} on this server!`, 404));
};
exports.notFoundHandler = notFoundHandler;
