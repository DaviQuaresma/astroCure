import express from "express";
import { atualizarProfile, criarProfile, deletarProfile, getLogs, listarProfiles, startProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/profiles", listarProfiles);
router.post("/profiles", criarProfile);
router.post("/profiles/:id/start", startProfile);
router.get("/profiles/:id/logs", getLogs);
router.put("/profiles/:id", atualizarProfile);
router.delete("/profiles/:id", deletarProfile);

export default router;