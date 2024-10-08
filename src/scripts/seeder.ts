import fs from "fs";
import mongoose from "mongoose";
import "dotenv/config";
import { BootcampModel } from "../models/Bootcamp";
import { CourseModel } from "../models/Course";
import "colors";


/**
 * import bootcamps from _data/bootcampsbootcamps.json to database
 * remove all bootcamps from database
 * import bootcamps : "npm run seeder --i"
 * delete bootcamps: "npm run seeder --d"
 */

// Connect to mongo db
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  });
}

// Read JSON files (bootcamp)
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/../../_data/bootcamps.json`, "utf-8")
);

// Read JSON files (Course)
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/../../_data/courses.json`, "utf-8")
);

// import into DB
const importData = async () => {
  try {
    await BootcampModel.create(bootcamps);
    await CourseModel.create(courses)
    console.log("Data imported".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await BootcampModel.deleteMany();
    await CourseModel.deleteMany()
    console.log("Data destroyed".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "i") {
  importData();
} else if (process.argv[2] === "d") {
  deleteData();
} else {
  console.info(
    'Please add "-- i" to add bootcamps or "-- d" to remove bootcamps'.blue
  );
  process.exit();
}
