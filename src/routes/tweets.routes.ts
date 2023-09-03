import { Router } from "express";

import {
  createTweetController,
  getTweetChildrenController,
  getTweetController,
} from "~/controllers/tweets.controller";
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator,
} from "~/middlewares/tweets.middlewares";
import {
  accessTokenValidator,
  isUserLoggedInValidator,
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

tweetRouter.get(
  "/:tweet_id",
  validate(tweetIdValidator),
  isUserLoggedInValidator(validate(accessTokenValidator)),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetController)
);

tweetRouter.get(
  "/:tweet_id/children",
  validate(tweetIdValidator),
  validate(getTweetChildrenValidator),
  isUserLoggedInValidator(validate(accessTokenValidator)),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetChildrenController)
);

export default tweetRouter;
