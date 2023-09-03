import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import {
  Pagination,
  TweetParam,
  TweetQuery,
  TweetReqBody,
} from "~/models/requests/Tweet.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import tweetsService from "~/services/tweets.services";
import { TweetType } from "~/constants/enum";

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

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetsService.increaseView(
    req.params.tweet_id,
    req.decoded_authorization?.user_id
  );

  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at,
  };

  return res.json({
    message: "Get Tweet Successfully",
    data: tweet,
  });
};

export const getTweetChildrenController = async (
  req: Request<TweetParam, any, any, TweetQuery>,
  res: Response
) => {
  const tweet_type = Number(req.query.tweet_type) as TweetType;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const user_id = req.decoded_authorization?.user_id;

  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id,
  });
  return res.json({
    message: "Get Tweet Children Successfully",
    data: {
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit),
      tweets,
    },
  });
};

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id as string;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const result = await tweetsService.getNewFeeds({ user_id, limit, page });
  return res.json({
    message: "Get newfeeds successfully",
    data: {
      page,
      limit,
      total_page: Math.ceil(result.total / limit),
      tweets: result.tweets,
    },
  });
};
