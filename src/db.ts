import mongoose from "mongoose";
import "dotenv/config";

export async function connectDB() {
  if (process.env.MONGO_URI) {
    const dbCon = await mongoose.connect(process.env.MONGO_URI, {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });

    console.info(`Mongo Db connected: ${dbCon.connection.host}`.cyan.underline.bold);
  } else {
    throw new Error('MONGO_URI is not defined')
  }
}
