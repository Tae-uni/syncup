import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Ping successful!" });
});

export default router;