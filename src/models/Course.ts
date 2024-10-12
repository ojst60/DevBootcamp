import { Document, Model, Schema, model } from 'mongoose'

interface ICourseSchema {
  title: string
  description: string
  weeks: string
  tuition: number
  minimumSkill: 'beginner' | 'intermediate' | 'advanced'
  scholarshipAvailable: boolean
  bootcamp: Schema.Types.ObjectId
  user: string
  createdAt: Date
}

export interface ICourseModel extends Model<ICourseSchema, {}> {
  getAverageCost: (bootcampId: Schema.Types.ObjectId) => void
}

const CourseSchema = new Schema<ICourseSchema, ICourseModel>({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tution cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
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
    type: Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
})

// Static method to get average of cost tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {
          $avg: '$tuition',
        },
      },
    },
  ])

  try {
    await this.db.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: (Math.ceil(obj[0].averageCost) / 10) * 10,
    })
  } catch (err) {
    console.log(err)
  }
}
// Call getAverageCost after save
CourseSchema.post('save', function () {
  const modelConstructor = this.constructor as ICourseModel
  modelConstructor.getAverageCost(this.bootcamp)
})

// Call getAverageCost before save
CourseSchema.post('deleteOne', { document: true, query: false }, function () {
  const modelConstructor = this.constructor as ICourseModel
  modelConstructor.getAverageCost(this.bootcamp)
})

export const CourseModel = model('Course', CourseSchema)
