import express from 'express';
import { criarUser, getUsers } from '../controllers/usersController.js';

const router = express.Router();

router.post('/create', criarUser);
router.get('/getUsers', getUsers);


export default router;
