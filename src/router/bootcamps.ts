import { Router } from 'express'
import {
  getBootcamp,
  getBootcamps,
  deleteBootcamp,
  createBootcamp,
  updateBootcamp,
  getBootcampsWithinRadius,
  bootcampPhotoUpload,
} from '../controllers/bootcamps'
import { addCourse, getCourses } from '../controllers/courses'
import { coursesRouter } from './courses'
import { advancedResults } from '../middleware/advancedResult'
import { BootcampModel } from '../models/Bootcamp'

const router = Router()

router.use('/:bootcampID/courses', coursesRouter)

router
  .route('/')
  .get(
    advancedResults({
      model: BootcampModel,
      populate: {path: 'courses'},
      modelType: 'bootcamp',
    }),
    getBootcamps
  )
  .post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route('/:id/photo').put(bootcampPhotoUpload)

router.route('/:bootcampId/courses').get(getCourses).post(addCourse)

router.route('/radius/:postcode/:distance').get(getBootcampsWithinRadius)

export { router as bootcampRouter }
