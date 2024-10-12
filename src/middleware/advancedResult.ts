import { Request, Response, NextFunction } from 'express'
import { Query, Model, PopulateOptions } from 'mongoose'
import { ICourseModel } from '../models/Course'
import { IBootcampModel } from '../models/Bootcamp'

interface IAdvancedResultsBootcamp {
  modelType: 'bootcamp'
  model: IBootcampModel
  populate?: PopulateOptions
}

interface IAdvancedResultsCourse {
  modelType: 'course'
  model: ICourseModel
  populate?: PopulateOptions
}


// Combined union type for the interface
type IAdvancedResults = IAdvancedResultsCourse | IAdvancedResultsBootcamp

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

// Extending the Response interface to allow advancedResults property
declare global {
  namespace Express {
    interface Response {
      advancedResults?: any
    }
  }
}

export function advancedResults({
  model,
  populate,
  modelType,
}: IAdvancedResults) {
  return async function (req: Request, res: Response, next: NextFunction) {
    let query: Query<
      (IBootcampModel | ICourseModel)[],
      ICourseModel | IBootcampModel
    >
    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'limit', 'page']
    removeFields.forEach((param) => delete reqQuery[param])

    // Create query string
    let queryStr = JSON.stringify(reqQuery)

    // Create operators ($gt, $gte, etc.)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    )

    // Finding resource
    if (modelType === 'course') {
      query = model.find(JSON.parse(queryStr))
    } else {
      query = model.find(JSON.parse(queryStr))
    }

    // Populate if modelType is bootcamp
    if (populate && (req as any).modelType === 'bootcamp') {
      query = query.populate('courses')
    }

    // Select fields
    if (
      req.query.select &&
      typeof req.query.select === 'string' &&
      modelType === 'bootcamp'
    ) {
      const fields = req.query.select.split(',').join(' ')

      query = query.select(fields)
    }

    // Sort fields
    if (req.query.sort && typeof req.query.sort === 'string') {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    // Pagination
    let limit: number = 100
    let pageNumber: number = 1

    if (req.query.limit) {
      limit = Number(req.query.limit)
    }
    if (req.query.page) {
      pageNumber = Number(req.query.page)
    }

    const startIndex = (pageNumber - 1) * limit
    const endIndex = pageNumber * limit
    const totalPage = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Populate if specified
    if (populate) {
      query = query.populate(populate)
    }

    // Executing query
    const results = await query

    // Pagination result
    const pagination: Pagination = {}
    if (endIndex < totalPage) {
      pagination.next = {
        page: pageNumber + 1,
        limit,
        totalPage,
      }
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: pageNumber - 1,
        limit,
        totalPage,
      }
    }

    const response = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    }
    res.advancedResults = response
    next()
  }
}
