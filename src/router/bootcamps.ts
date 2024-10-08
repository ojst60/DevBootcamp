import { Router } from "express";
import {
  getBootcamp,
  getBootcamps,
  deleteBootcamp,
  createBootcamp,
  updateBootcamp,
  getBootcampsWithinRadius,
} from "../controllers/bootcamps";

const router = Router();

router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

  router.route("/radius/:postcode/:distance").get(getBootcampsWithinRadius)

export { router as bootcampRouter };
