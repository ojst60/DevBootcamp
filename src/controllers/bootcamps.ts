import { Request, Response, NextFunction } from "express";
import { BootcampModel } from "../models/Bootcamp";

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
export async function getBootcamps(req: Request, res: Response, next: NextFunction) {
  const allBootcamp = await BootcampModel.find({})
  res.status(200).json({ success: true, data: allBootcamp });
}

// @desc Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
export function getBootcamp(req: Request, res: Response, next: NextFunction) {
  res
    .status(200)
    .json({ success: true, msg: `${req.params.id} was retrieved` });
}

// @desc Create a single bootcamp
// @route POST /api/v1/bootcamps/
// @access Private
export async function createBootcamp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const newBootcamp = await BootcampModel.create(req.body)

  res.status(201).json({
    success: true,
    data: newBootcamp
  })
}

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
export function updateBootcamp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(200).json({ success: true, msg: `${req.params.id} was updated` });
}

// @desc Delete bootcamp
// @route Delete /api/v1/bootcamps/:id
// @access Private
export function deleteBootcamp(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.status(200).json({ success: true, msg: `${req.params.id} was deleted` });
  }
  