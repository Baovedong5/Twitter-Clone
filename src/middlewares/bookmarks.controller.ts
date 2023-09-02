import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { BookmarkTweetReqBody } from "~/models/requests/Bookmark.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import bookmarkService from "~/services/bookmarks.services";
import { COMMENT_MESSAGE } from "~/constants/messages";

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await bookmarkService.bookmarkTweet(
    user_id,
    req.body.tweet_id
  );
  return res.json({
    message: COMMENT_MESSAGE.BOOKMARK_SUCCESSFULLY,
    data: result,
  });
};

export const unBookmarkTweetController = async (
  req: Request,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  await bookmarkService.unBookmarkTweet(user_id, req.params.tweet_id);
  return res.json({
    message: COMMENT_MESSAGE.UNBOOKMARK_SUCCESSFULLY,
  });
};
