import { Router } from "express";
import {
  getBootcamp,
  getBootcamps,
  deleteBootcamp,
  createBootcamp,
  updateBootcamp,
} from "../controllers/bootcamps";

const router = Router();

router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .post(createBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

export { router as bootcampRouter };
