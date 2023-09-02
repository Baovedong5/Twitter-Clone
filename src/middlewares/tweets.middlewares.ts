import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";

import { MediaType, TweetAudience, TweetType } from "~/constants/enum";
import httpStatus from "~/constants/httpStatus";
import { TWEETS_MESSAGE } from "~/constants/messages";
import databaseService from "~/database/database";
import { ErrorWithStatus } from "~/models/Errors";
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
          const tweet = await databaseService.tweets.findOne({
            _id: new ObjectId(value),
          });
          if (!tweet) {
            throw new ErrorWithStatus({
              message: TWEETS_MESSAGE.TWEET_NOT_FOUND,
              status: httpStatus.NOT_FOUND,
            });
          }
          return true;
        },
      },
    },
  },
  ["params", "body"]
);
