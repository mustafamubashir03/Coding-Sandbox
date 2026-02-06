import { Router } from 'express';
import projectRouter from '../v1/projects.js';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'You are at v1' });
});
router.use('/projects', projectRouter);

export default router;
