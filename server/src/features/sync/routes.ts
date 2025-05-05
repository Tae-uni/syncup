import { Router } from "express";
import * as syncController from "./controller";
import { validateRequest } from "../../middlewares/validators";
import { syncInputSchema } from "./schemas";

const router = Router();

router.post('/', validateRequest(syncInputSchema), syncController.create);
router.get('/:id', syncController.getSync);

// router.put('/:id', updateSync);
// router.delete('/:id', deleteSync);

export default router;