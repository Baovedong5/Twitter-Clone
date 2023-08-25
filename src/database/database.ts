import { Collection, Db, MongoClient } from "mongodb";
import "dotenv/config";
import User from "~/models/schemas/User.schemas";

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
}

//Tạo object từ class DatabaseService
const databaseService = new DatabaseService();
export default databaseService;
