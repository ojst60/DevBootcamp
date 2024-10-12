import { Model, model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { Document } from 'mongoose'

export interface IUserSchema {
  name: string
  email: string
  role: 'user' | 'publisher'
  password: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
}

export interface IUserMethods {
  getSignedJwtToken: () => string
  matchPassword: (enteredPassword: string) => Promise<boolean>
}

export type IUserModel = Model<IUserSchema, {}, IUserMethods>

const schema = new Schema<IUserSchema, IUserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email address. Please enter a valid email in the format example@domain.com.',
    ],
    required: [true, 'Please add an email'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Encrypt password before saving
schema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Sign JWT and return
schema.methods.getSignedJwtToken = function () {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables')
  }
  return jwt.sign({ id: this._id }, jwtSecret, { expiresIn: '5d' })
}

// Match user password to password in database
schema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export const UserModel = model<IUserSchema, IUserModel>('User', schema)
