import express from 'express';
import multer from 'multer';
import {
  uploadVideo,
  triggerVideoPost,
  uploadMultipleVideos,
  triggerGroupPostMultiple,
} from '../controllers/videoController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: '/videos',
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `video_${timestamp}.mp4`);
  },
});

export const upload = multer({ storage });

router.post('/upload', upload.single('video'), uploadVideo);               // Envio individual
router.post('/post', triggerVideoPost);                                    // Post individual
router.post('/upload/multiple', upload.array('videos', 30), uploadMultipleVideos); // Envio em lote
router.post('/post/group', triggerGroupPostMultiple);                      // Novo: post por grupo

export default router;
