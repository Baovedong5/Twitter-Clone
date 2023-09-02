import { Router } from "express";
import {
  bookmarkTweetController,
  unBookmarkTweetController,
} from "~/middlewares/bookmarks.controller";

import {
  accessTokenValidator,
  verifiedUserValidator,
} from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
import { validate } from "~/utils/validation";

const bookmarksRouter = Router();

bookmarksRouter.post(
  "/",
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(bookmarkTweetController)
);

bookmarksRouter.delete(
  "/tweets/:tweet_id",
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(unBookmarkTweetController)
);

export default bookmarksRouter;
