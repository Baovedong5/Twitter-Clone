import { Collection, Db, MongoClient } from "mongodb";
import "dotenv/config";
import User from "~/models/schemas/User.schemas";
import RefreshToken from "~/models/schemas/RefreshToken.schemas";
import Follower from "~/models/schemas/Follower.schemas";
import VideoStatus from "~/models/schemas/VideoStatus.schemas";
import Tweet from "~/models/schemas/Tweet.schemas";
import Hashtag from "~/models/schemas/Hashtag.schemas";
import Bookmark from "~/models/schemas/Bookmark.schemas";
import Conversation from "~/models/schemas/Conversations.schema";

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wqrn7k4.mongodb.net/?retryWrites=true&w=majority`;

//Create a MongoClient with a MongoClientOptions

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME);
  }

  async connect() {
    try {
      //Send a ping to confirm a sucessful connection
      await this.db.command({ ping: 1 });
      console.log("You successfully connected to MongoDB");
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  }

  get users(): Collection<User> {
    return this.db.collection("users");
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection("refresh_tokens");
  }

  get followers(): Collection<Follower> {
    return this.db.collection("followers");
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection("video_status");
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection("tweets");
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection("hashtags");
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection("bookmarks");
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection("conversations");
  }
}

//Tạo object từ class DatabaseService
const databaseService = new DatabaseService();
export default databaseService;
