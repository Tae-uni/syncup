import { Router } from "express";
import * as syncController from "./sync.controller";
import * as voteController from "./vote.controller";
import { validateRequest } from "../../middlewares/validators";
import { syncInputSchema, voteSchema } from "./schemas";
const router = Router();

// Sync routes
router.post('/', validateRequest(syncInputSchema), syncController.create);
router.get('/:id', syncController.getSync);

// router.put('/:id', updateSync);
// router.delete('/:id', deleteSync);

// Vote routes
router.post('/:id/votes', validateRequest(voteSchema.submit), voteController.submitVote);
router.delete('/:id/votes', validateRequest(voteSchema.cancel), voteController.cancelVote);

export default router;