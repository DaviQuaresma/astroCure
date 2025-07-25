import express from 'express';
import { registerOrUpdateAgent, agentPing } from '../controllers/agentController.js';

const router = express.Router();

router.post('/agent/register', registerOrUpdateAgent);
router.post('/agent/ping', agentPing);

export default router;