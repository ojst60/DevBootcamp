import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../utils/errorResponse";

export function errorHandler(
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error = { ...err };
  console.log(err);
  error.message = err.message;

  if (err.name === "ValidationError") {
    const errorFields = Object.keys(err.errors).join(", ");
    const message = `The following fields are missing or invalid: ${errorFields}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose objectId error
  if (err.name === "CastError") {
    const message = `Bootcamp not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message,
  });
}
