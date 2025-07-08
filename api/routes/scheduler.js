import express from 'express';
import { runSchedulerNow } from '../controllers/schedulerController.js';

const router = express.Router();

router.post('/scheduler/run', runSchedulerNow);

export default router;
