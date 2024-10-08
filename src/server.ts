import express from "express";
import { bootcampRouter } from "./router/bootcamps";
import morgan from "morgan";
import { connectDB } from "./db";
import "colors";

import "dotenv/config";
import { errorHandler } from "./middleware/error";

connectDB();

// Initialise express
const app = express();

app.use(express.json());

// Log the request time, http version, method and URL
if (process.env.NODE_ENV === "development") {
  app.use(morgan(":date[web] :http-version :method :url"));
}

app.use("/api/v1/bootcamps", bootcampRouter);

app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Port is running on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections

process.on("uncaughtException", (err, promise) => {
  console.log(`Error : ${err.message}.red`);

  server.close(() => process.exit(1));
});
