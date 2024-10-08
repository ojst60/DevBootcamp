import mongoose, { Schema, Error } from "mongoose";
import slugify from "slugify";
import { geocoder } from "../utils/geoCoder";

interface IBootcampSchema {
  name: string;
  nameSlug: string;
  description: string;
  website: string;
  email: string;
  address: string;
  phone: string;
  location?: {
    type: string;
    coordinates: [number, number];
    formattedAddress: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  careers: string[];
  averageRating: number;
  averageCost: number;
  photo: string;
  housing: boolean;
  jobAssistance: boolean;
  jobGuarantee: boolean;
  acceptGi: boolean;
  createdAt: Date;
}

const BootcampSchema = new Schema<IBootcampSchema>({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [100, "Name can not be more than 100 characters"],
  },
  nameSlug: String,
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Name can not be more than 500 characters"],
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?([\/\w .-]*)*\/?$/,
      "Invalid URL. Please ensure the URL starts with http:// or https://, followed by a valid domain name.",
    ],
  },
  email: {
    type: String,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email address. Please enter a valid email in the format example@domain.com.",
    ],
  },
  phone: {
    type: String,
    maxLength: [20, "Phone number can not be longer than 20 characters"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Please add address"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],

      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    postcode: String,
    country: String,
    countryCode: String,
  },
  careers: {
    type: [String],
    required: true,
    enu: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other",
    ],
  },
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [10, "Rating must not be more than 10"],
  },
  averageCost: {
    type: Number,
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarantee: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create botcamp slug from name

BootcampSchema.pre("save", function (next) {
  this.nameSlug = slugify(this.name, { lower: true, replacement: "_" });
  next();
});

// GeoCode and create location field

BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);

  // Need to use Zod for infering and validation
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude] as [number, number],
    formattedAddress: loc[0].formattedAddress as string,
    street: loc[0].streetName as string,
    city: loc[0].city as string,
    state: loc[0].stateCode as string,
    postcode: loc[0].zipcode as string,
    country: loc[0].countryCode as string,
  };
  this.address = "a"
  next()
});
export const BootcampModel = mongoose.model("Bootcamp", BootcampSchema);
