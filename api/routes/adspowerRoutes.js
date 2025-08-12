import { Router } from 'express';
import { addAdsPowerEndpoint, allAdsPowerEndpoint, setActiveAdsPowerEndpoint } from '../controllers/adsPowerController.js';

const router = Router();

router.post('/adsPower', addAdsPowerEndpoint);
router.get('/adsPower', allAdsPowerEndpoint);
router.post('/adsPower/active/:id', setActiveAdsPowerEndpoint);

export default router;
