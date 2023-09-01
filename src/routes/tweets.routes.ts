import { Router } from "express";
import { createTweetController } from "~/controllers/tweets.controller";
import { createTweetValidator } from "~/middlewares/tweets.middlewares";
import {
  accessTokenValidator,
  verifiedUserValidator,
} from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
import { validate } from "~/utils/validation";

const tweetRouter = Router();

tweetRouter.post(
  "/",
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(createTweetValidator),
  wrapRequestHandler(createTweetController)
);

export default tweetRouter;
