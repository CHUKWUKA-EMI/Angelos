import { Router } from "express";
import { login, signUp } from "../Controllers/User";

const router = Router({ strict: true });

router.post("/create", signUp);
router.post("/login", login);

export default router;
