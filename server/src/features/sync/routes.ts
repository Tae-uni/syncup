import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as syncController from "./sync.controller";
import * as voteController from "./vote.controller";
import { validateRequest } from "../../middlewares/validators";
import { paramsSchema, syncInputSchema, syncUpdateSchema, verifyLeaderSchema, voteSchema } from "./schemas";

const router = Router();

const passcodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts, please try again later" },
  },
});

// Sync routes
router.post('/', validateRequest(syncInputSchema), syncController.create);
router.get('/:id', validateRequest({ params: paramsSchema }), syncController.get);
router.put('/:id', validateRequest({ params: paramsSchema, body: syncUpdateSchema }), syncController.update);
router.delete('/:id', validateRequest({ params: paramsSchema, body: verifyLeaderSchema }), syncController.remove);

// Vote routes
router.post('/:id/votes', passcodeRateLimit, validateRequest({ params: paramsSchema, body: voteSchema.submit }), voteController.submitVote);
router.delete('/:id/votes', passcodeRateLimit, validateRequest({ params: paramsSchema, body: voteSchema.cancel }), voteController.cancelVote);

router.post('/:id/verify-leader', passcodeRateLimit, validateRequest({ params: paramsSchema, body: verifyLeaderSchema }), syncController.verifyLeader);

export default router;