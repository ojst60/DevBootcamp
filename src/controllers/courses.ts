import { Request, Response, NextFunction } from 'express'
import { CourseModel } from '../models/Course'
import { asyncHandler } from '../middleware/async'
import { ErrorResponse } from '../utils/errorResponse'
import { BootcampModel } from '../models/Bootcamp'

type Pagination = {
  next?: {
    page: number
    limit: number
    totalPage: number
  }
  prev?: {
    page: number
    limit: number
    totalPage: number
  }
}

// @desc Get all Courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
export const getCourses = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.params.bootcampId) {
    const courses = await CourseModel.find({ bootcamp: req.params.bootcampId })
    res
      .status(200)
      .json({ success: true, data: courses, count: courses.length })
  } else {
    res.status(200).json(res.advancedResults)
  }
})

// @desc get a course
// @route GET /api/v1/courses/:id
// @access Public
export const getCourse = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const course = await CourseModel.findById(req.params.courseId).populate({
    path: 'bootcamp',
    select: 'name description',
  })

  if (!course) {
    return next(new ErrorResponse(`No course with Id of ${req.params.id}`, 404))
  }

  res.status(200).json({ success: true, data: course })
})

// @desc add a course
// @route GET /api/v1/bootcamp/:bootcampId/
// @access Public
export const addCourse = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.bootcamp = req.params.bootcampId

  const bootcamp = await BootcampModel.findById(req.params.bootcampId)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with Id of ${req.params.id}`, 404)
    )
  }

  const course = await CourseModel.create(req.body)

  res.status(200).json({ success: true, data: course })
})

// @desc Update course
// @route PUT /api/v1/courses/:id/
// @access Private
export const updateCourse = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const course = await CourseModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!course) {
    next(new ErrorResponse(`No Course with Id of ${req.params.id}`, 404))
  }

  res.status(200).json({ success: true, data: course })
})

// @desc Delete course
// @route DELETE /api/v1/courses/:id/
// @access Private
export const deleteCourse = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const course = await CourseModel.findById(req.params.id)

  if (!course) {
    next(new ErrorResponse(`No Course with Id of ${req.params.id}`, 404))
  }

  await course?.deleteOne()

  res.status(200).json({ success: true, data: course })
})
