import { Request, Response, NextFunction } from "express";
import { BootcampModel } from "../models/Bootcamp";
import { ErrorResponse } from "../utils/errorResponse";
import { asyncHandler } from "../middleware/async";
import { getGeoCodeLocation } from "../utils/geoCoder";

type Pagination = {
  next?: {
    page: number;
    limit: number;
    totalPage: number;
  };
  prev?: {
    page: number;
    limit: number;
    totalPage: number;
  };
};

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
export const getBootcamps = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let query;
  // copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "limit", "page"];

  // Loop over and removiefields
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = BootcampModel.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select && typeof req.query.select === "string") {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort fields
  if (req.query.sort && typeof req.query.sort === "string") {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  let limit: number = 100;
  let pageNumber: number = 1;

  // Pagination
  if (req.query.limit) {
    limit = Number(req.query.limit);
  }

  if (req.query.page) {
    pageNumber = Number(req.query.page);
  }

  const startIndex = (pageNumber - 1) * limit;
  const endIndex = pageNumber * limit;
  const totalPage = await BootcampModel.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const bootcamps = await query;

  // Pagination result
  const pagination: Pagination = {};
  if (endIndex < totalPage) {
    pagination.next = {
      page: pageNumber + 1,
      limit,
      totalPage,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: pageNumber - 1,
      limit,
      totalPage,
    };
  }
  res.status(200).json({ success: true, data: bootcamps, pagination });
});

// @desc Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
export const getBootcamp = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bootcamp = await BootcampModel.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc Get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:postcode/:distance
// @access Public
export const getBootcampsWithinRadius = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { postcode, distance } = req.params;

  // Get lat/lon from getGeoCodeLocation util
  const location = await getGeoCodeLocation({ postcodeOrAddress: postcode });

  const lat = location[0].latitude;
  const lon = location[0].longitude;

  // radius in miles
  // Calc radius using radians
  // Divide disttance by radius of the earth
  // Earth radius is 3,963 miles

  const radius = Number(distance) / 3963; // in radians

  const bootcamps = await BootcampModel.find({
    location: {
      $geoWithin: { $centerSphere: [[lon, lat], radius] },
    },
  });

  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res
    .status(200)
    .json({ success: true, data: bootcamps, count: bootcamps.length });
});

// @desc Create a single bootcamp
// @route POST /api/v1/bootcamps/
// @access Private
export const createBootcamp = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const newBootcamp = await BootcampModel.create(req.body);

  res.status(201).json({
    success: true,
    data: newBootcamp,
  });
});

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
export const updateBootcamp = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const newBootcamp = await BootcampModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!newBootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: newBootcamp });
});

// @desc Delete bootcamp
// @route Delete /api/v1/bootcamps/:id
// @access Private
export const deleteBootcamp = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id);

  if (!deletedBootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: deletedBootcamp });
});
