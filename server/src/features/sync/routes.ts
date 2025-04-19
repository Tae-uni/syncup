import { Router } from "express";
import * as syncController from "./controller";

const router = Router();

router.post('/', syncController.create);
// router.get('/:id', getSync);

// router.put('/:id', updateSync);
// router.delete('/:id', deleteSync);

export default router;