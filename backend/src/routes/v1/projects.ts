import { Router } from "express";
import { createProjectController } from "../../controllers/projectController.js";

const router = Router()

router.post('/',createProjectController)
export default router