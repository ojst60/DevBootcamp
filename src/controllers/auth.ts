import { ErrorResponse } from '../utils/errorResponse'
import { asyncHandler } from '../middleware/async'
import {
  IUserModel,
  UserModel,
  IUserSchema,
  IUserMethods,
} from '../models/User'
import { CookieOptions, NextFunction, Request, Response } from 'express'
import { Document, Types } from 'mongoose'

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body
    const user = await UserModel.create({
      name,
      email,
      password,
      role,
    })

    // Create token
    const token = user.getSignedJwtToken()

    res.status(200).json({ success: true, token })
  }
)

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
      return next(
        new ErrorResponse('Please provide an valid password and email', 400)
      )
    }

    const user = await UserModel.findOne({ email }).select('+password')

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    sendTokenResponse(user, 200, res)
  }
)

// Get token from modal, create cookie and send response
function sendTokenResponse(
  user: Document<unknown, {}, IUserSchema> &
    Omit<
      IUserSchema & {
        _id: Types.ObjectId
      },
      keyof IUserMethods
    > &
    IUserMethods,
  statusCode: Response['statusCode'],
  res: Response
) {
  const token = user.getSignedJwtToken()

  const option: CookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  res
    .status(statusCode)
    .cookie('token', token, option)
    .json({ success: true, token })
}
