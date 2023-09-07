import { ObjectId } from "mongodb";
import {
  MediaType,
  MediaTypeQuery,
  PeopleFollow,
  TweetType,
} from "~/constants/enum";
import databaseService from "~/database/database";
import { SearchQuery } from "~/models/requests/search.requests";

class SearchService {
  async search({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_follow,
  }: {
    limit: number;
    page: number;
    content: string;
    user_id: string;
    media_type?: MediaTypeQuery;
    people_follow?: PeopleFollow;
  }) {
    const match: any = {
      $text: {
        $search: content,
      },
    };

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        match["medias.type"] = MediaType.Image;
      }
      if (media_type === MediaTypeQuery.VIdeo) {
        match["medias.type"] = {
          $in: [MediaType.Video, MediaType.HLS],
        };
      }
    }

    if (people_follow && people_follow === PeopleFollow.Following) {
      const user_id_obj = new ObjectId(user_id);
      const followed_user_ids = await databaseService.followers
        .find(
          {
            user_id: user_id_obj,
          },
          {
            projection: {
              followed_user_id: 1,
              _id: 0,
            },
          }
        )
        .toArray();
      const ids = followed_user_ids.map((item) => item.followed_user_id);
      // Mong muon newfeeds se lay luon ca tweet cua minh
      ids.push(user_id_obj);
      match["user_id"] = {
        $in: ids,
      };
    }

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: match,
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $match: {
              $or: [
                {
                  audience: 0,
                },
                {
                  $and: [
                    {
                      audience: 1,
                    },
                    {
                      "user.tweet_circle": {
                        $in: [new ObjectId(user_id)],
                      },
                    },
                  ],
                },
              ],
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
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0,
                verify: 0,
              },
            },
          },
          {
            $skip: limit * (page - 1),
          },
          {
            $limit: limit,
          },
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: match,
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $match: {
              $or: [
                {
                  audience: 0,
                },
                {
                  $and: [
                    {
                      audience: 1,
                    },
                    {
                      "user.tweet_circle": {
                        $in: [new ObjectId(user_id)],
                      },
                    },
                  ],
                },
              ],
            },
          },

          {
            $count: "total",
          },
        ])
        .toArray(),
    ]);
    const tweet_id = tweets.map((tweet) => tweet._id as ObjectId);
    const date = new Date();
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_id,
        },
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date,
        },
      }
    ),
      tweets.forEach((tweet) => {
        tweet.updated_at = date;
        tweet.user_views += 1;
      });
    return {
      total: total[0]?.total || 0,
      tweets,
    };
  }
}

const searchService = new SearchService();

export default searchService;