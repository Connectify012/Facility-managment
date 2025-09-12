import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server!`, 404));
};
