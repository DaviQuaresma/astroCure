import express from 'express';
import { criarUser } from '../controllers/usersController.js';

const router = express.Router();

router.post('/create', criarUser);


export default router;
