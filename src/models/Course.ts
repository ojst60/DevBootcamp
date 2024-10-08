import { Schema, model } from "mongoose";

interface ICourseSchema {
  title: string;
  description: string;
  weeks: string;
  tution: number;
  minimumSkill: "beginner" | "intermediate" | "advanced";
  scholarshipAvailable: boolean;
  bootcamp: typeof Schema.ObjectId;
  user: string;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourseSchema>({
  title: {
    type: String,
    required: [true, "Please add a course title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a course description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tution: {
    type: Number,
    required: [true, "Please add a tution cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

export const CourseModel = model("Course", CourseSchema);
