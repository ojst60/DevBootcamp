import { Request, Response, NextFunction } from "express";
import { BootcampModel } from "../models/Bootcamp";
import { ErrorResponse } from "../utils/errorResponse";
import { asyncHandler } from "../middleware/async";
import { getGeoCodeLocation } from "../utils/geoCoder";
import { UploadedFile } from "express-fileupload";
import "dotenv/config";
import path from "path";

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
 
  res.status(200).json(res.advancedResults);
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
  const deletedBootcamp = await BootcampModel.findById(req.params.id);

  if (!deletedBootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  await deletedBootcamp.deleteOne();

  res.status(200).json({ success: true, data: deletedBootcamp });
});

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
export const bootcampPhotoUpload = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bootcamp = await BootcampModel.findById(req.params.id);
  console.log("running");
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 404));
  }

  const file = req.files.file as UploadedFile;

  if (!file.mimetype.startsWith("image")) {
    return next(
      new ErrorResponse("Please upload a file that is an image", 404)
    );
  }

  if (file.size > Number(process.env.MAX_FILE_UPLOAD)) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        404
      )
    );
  }

  // Create custome filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // Save file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      new ErrorResponse("Problem with file upload", 500);
    }
    await BootcampModel.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });

    res.status(200).json({ success: true, data: file.name });
  });
});
