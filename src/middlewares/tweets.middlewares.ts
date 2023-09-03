import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";

import {
  MediaType,
  TweetAudience,
  TweetType,
  UserVerifyStatus,
} from "~/constants/enum";
import httpStatus from "~/constants/httpStatus";
import { TWEETS_MESSAGE, usersMessage } from "~/constants/messages";
import databaseService from "~/database/database";
import { ErrorWithStatus } from "~/models/Errors";
import Tweet from "~/models/schemas/Tweet.schemas";
import { numberEnumToArray } from "~/utils/common";

const tweetTypes = numberEnumToArray(TweetType);
const tweetAuidiences = numberEnumToArray(TweetAudience);
const mediaTypes = numberEnumToArray(MediaType);

export const createTweetValidator = checkSchema({
  type: {
    isIn: {
      options: [tweetTypes],
      errorMessage: TWEETS_MESSAGE.INVALID_TYPE,
    },
  },
  audience: {
    isIn: {
      options: [tweetAuidiences],
      errorMessage: TWEETS_MESSAGE.INVALID_AUDIENCE,
    },
  },
  parent_id: {
    custom: {
      options: (value, { req }) => {
        const type = req.body.type as TweetType;
        if (
          [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(
            type
          ) &&
          !ObjectId.isValid(value)
        ) {
          throw new Error(TWEETS_MESSAGE.PARENT_ID_MUST_BE_A_VALID_TWEET_ID);
        }
        if (type === TweetType.Tweet && value !== null) {
          throw new Error(TWEETS_MESSAGE.PARENT_ID_MUST_BE_NULL);
        }
        return true;
      },
    },
  },
  content: {
    isString: true,
    custom: {
      options: (value, { req }) => {
        const type = req.body.type as TweetType;
        const hashtags = req.body.hashtags as string[];
        const mentions = req.body.mentions as string[];
        //Neu type la comment, tweet, quotetweet va khong co mentions va hashtags thi content phai la string va khong duoc rong
        if (
          [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(
            type
          ) &&
          isEmpty(hashtags) &&
          isEmpty(mentions) &&
          value === ""
        ) {
          throw new Error(TWEETS_MESSAGE.CONTENT_MUST_BE_A_NON_EMPTY_STRING);
        }
        //Neu "type" la retweet thi content phai la ""
        if (type === TweetType.Retweet && value !== "") {
          throw new Error(TWEETS_MESSAGE.CONTENT_MUST_BE_EMPTY_STRING);
        }
        return true;
      },
    },
  },

  hashtags: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        //Yeu cau moi phan tu trong array la string
        if (!value.every((item: any) => typeof item === "string")) {
          throw new Error(TWEETS_MESSAGE.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING);
        }
        return true;
      },
    },
  },

  mentions: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        //Yeu cau moi phan tu trong array la user_id
        if (!value.every((item: any) => ObjectId.isValid(item))) {
          throw new Error(TWEETS_MESSAGE.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
        }
        return true;
      },
    },
  },

  medias: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        //Yeu cau moi phan tu trong array la media object
        if (
          value.some((item: any) => {
            return (
              typeof item.url !== "string" || !mediaTypes.includes(item.type)
            );
          })
        ) {
          throw new Error(
            TWEETS_MESSAGE.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT
          );
        }
        return true;
      },
    },
  },
});

export const tweetIdValidator = checkSchema(
  {
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              status: httpStatus.BAD_REQUEST,
              message: TWEETS_MESSAGE.INVALID_TWEET_ID,
            });
          }
          const tweet = (
            await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value),
                  },
                },
                {
                  $lookup: {
                    from: "hashtags",
                    localField: "hashtags",
                    foreignField: "_id",
                    as: "hashtags",
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "mentions",
                    foreignField: "_id",
                    as: "mentions",
                  },
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: "$mentions",
                        as: "mention",
                        in: {
                          _id: "$$mention._id",
                          name: "$$mention.name",
                          username: "$$mention.username",
                          email: "$$mention.email",
                        },
                      },
                    },
                  },
                },
                {
                  $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "parent_id",
                    as: "tweets_children",
                  },
                },
                {
                  $lookup: {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "tweet_id",
                    as: "bookmarks",
                  },
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: "$bookmarks",
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: "$tweets_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", TweetType.Retweet],
                          },
                        },
                      },
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: "$tweets_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", TweetType.Comment],
                          },
                        },
                      },
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: "$tweets_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", TweetType.QuoteTweet],
                          },
                        },
                      },
                    },
                  },
                },
                {
                  $project: {
                    tweets_children: 0,
                  },
                },
              ])
              .toArray()
          )[0];
          if (!tweet) {
            throw new ErrorWithStatus({
              message: TWEETS_MESSAGE.TWEET_NOT_FOUND,
              status: httpStatus.NOT_FOUND,
            });
          }
          (req as Request).tweet = tweet;
          return true;
        },
      },
    },
  },
  ["params", "body"]
);

export const audienceValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tweet = req.tweet as Tweet;
  if (tweet.audience === TweetAudience.TwitterCircle) {
    //Kiem tra nguoi xem tweet nay da dang nhap hay chua
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: httpStatus.UNAUTHOZIZED,
        message: usersMessage.ACCESS_TOKEN_IS_REQUIRED,
      });
    }
    //Kiem tra tai khoan tac gia co on (bi khoa hay bi xoa chua) khong
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id),
    });
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: httpStatus.NOT_FOUND,
        message: usersMessage.USER_NOT_FOUND,
      });
    }
    //kiem tra nguoi xem tweet nay co trong twitter Circle cua tac gia khong
    const { user_id } = req.decoded_authorization;
    const isInTweetCircle = author.twitter_circle.some((user_circle_id) =>
      user_circle_id.equals(user_id)
    );
    //Neu ban khong phai la tac gia va khong nam trong twiiter circle thi bao loi
    if (!isInTweetCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        status: httpStatus.FORBIDDEN,
        message: TWEETS_MESSAGE.TWEET_IS_NOT_PUBLIC,
      });
    }
  }
  next();
};

export const getTweetChildrenValidator = checkSchema(
  {
    tweet_type: {
      isIn: {
        options: [TweetType],
        errorMessage: TWEETS_MESSAGE.INVALID_TYPE,
      },
    },
    limit: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value);
          if (num > 100 || num < 1) {
            throw new Error("1 <= Limit <= 100 ");
          }
          return true;
        },
      },
    },
    page: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value);
          if (num < 1) {
            throw new Error("page >= 1");
          }
          return true;
        },
      },
    },
  },
  ["query"]
);

export const paginationValidator = checkSchema(
  {
    limit: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value);
          if (num > 100 || num < 1) {
            throw new Error("1 <= Limit <= 100 ");
          }
          return true;
        },
      },
    },
    page: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value);
          if (num < 1) {
            throw new Error("page >= 1");
          }
          return true;
        },
      },
    },
  },
  ["query"]
);
