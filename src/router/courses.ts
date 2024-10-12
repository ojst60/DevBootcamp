import { Router } from 'express'
import {
  deleteCourse,
  getCourse,
  getCourses,
  updateCourse,
} from '../controllers/courses'
import { CourseModel, ICourseModel } from '../models/Course'
import { advancedResults } from '../middleware/advancedResult'

const router = Router({ mergeParams: true })

router.route('/').get(
  advancedResults({
    modelType: 'course',
    model: CourseModel as ICourseModel,    
    populate: {path: 'bootcamp', select: 'name description'}
  }),
  getCourses
)

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

export { router as coursesRouter }
