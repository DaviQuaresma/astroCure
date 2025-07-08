import express from "express";
import { getLogs, listarProfiles, startProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/profiles", listarProfiles);
router.post("/profiles/:id/start", startProfile);
router.get("/profiles/:id/logs", getLogs);

export default router;
