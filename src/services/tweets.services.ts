import { ObjectId, WithId } from "mongodb";

import databaseService from "~/database/database";
import { TweetReqBody } from "~/models/requests/Tweet.requests";
import Hashtag from "~/models/schemas/Hashtag.schemas";
import Tweet from "~/models/schemas/Tweet.schemas";

class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        //Tim hashtag trong database , neu co thi lay khong thi tao moi
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag }),
          },
          {
            upsert: true,
            returnDocument: "after",
          }
        );
      })
    );
    return hashtagDocuments.map(
      (hashtag) => (hashtag.value as WithId<Hashtag>)._id
    );
  }

  async createTweet(user_id: string, body: TweetReqBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags);

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id),
      })
    );
    const tweet = await databaseService.tweets.findOne({
      _id: result.insertedId,
    });
    return tweet;
  }
}

const tweetsService = new TweetsService();
export default tweetsService;
