import { Router } from "express";
import * as syncController from "./sync.controller";
import * as voteController from "./vote.controller";
import { validateRequest } from "../../middlewares/validators";
import { passcodeRateLimit, createRateLimit } from "../../middlewares/rateLimiters";
import { paramsSchema, syncInputSchema, syncUpdateSchema, verifyLeaderSchema, voteSchema } from "./schemas";

const router = Router();

// Sync routes
router.post('/', createRateLimit, validateRequest(syncInputSchema), syncController.create);
router.get('/:id', validateRequest({ params: paramsSchema }), syncController.get);
router.put('/:id', passcodeRateLimit, validateRequest({ params: paramsSchema, body: syncUpdateSchema }), syncController.update);
router.delete('/:id', passcodeRateLimit, validateRequest({ params: paramsSchema, body: verifyLeaderSchema }), syncController.remove);

// Vote routes
router.post('/:id/votes', passcodeRateLimit, validateRequest({ params: paramsSchema, body: voteSchema.submit }), voteController.submitVote);
router.delete('/:id/votes', passcodeRateLimit, validateRequest({ params: paramsSchema, body: voteSchema.cancel }), voteController.cancelVote);

router.post('/:id/verify-leader', passcodeRateLimit, validateRequest({ params: paramsSchema, body: verifyLeaderSchema }), syncController.verifyLeader);

export default router;