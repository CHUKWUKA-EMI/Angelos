import { Router } from "express";
import { createTopic } from "../Controllers/Topic";

const router = Router();

router.post("/create", createTopic);

export default router;
