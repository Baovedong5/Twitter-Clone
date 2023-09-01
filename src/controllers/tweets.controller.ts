import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { TweetReqBody } from "~/models/requests/Tweet.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import tweetsService from "~/services/tweets.services";

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetsService.createTweet(user_id, req.body);
  return res.json({
    message: "Create Tweet Successfully",
    data: result,
  });
};