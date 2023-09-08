import { Router } from "express";

import { getConversationsController } from "~/controllers/conversations.controller";
import { paginationValidator } from "~/middlewares/tweets.middlewares";
import {
  accessTokenValidator,
  getConversationValidator,
  verifiedUserValidator,
} from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
import { validate } from "~/utils/validation";

const conversationsRouter = Router();

conversationsRouter.get(
  "/receivers/:receiver_id",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(paginationValidator),
  validate(getConversationValidator),
  wrapRequestHandler(getConversationsController)
);

export default conversationsRouter;
