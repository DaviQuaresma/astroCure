import express from 'express';
import multer from 'multer';
import { uploadVideo, triggerVideoPost } from '../controllers/videoController.js';

const router = express.Router();
const storage = multer.diskStorage({
    destination: '/videos',
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `video_${timestamp}.mp4`);
    },
});

export const upload = multer({ storage });

router.post('/upload', upload.single('video'), uploadVideo);
router.post('/post', triggerVideoPost);

export default router;
