import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wqrn7k4.mongodb.net/?retryWrites=true&w=majority`;

//Create a MongoClient with a MongoClientOptions

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function run() {
  try {
    //Connect the client to the server
    await client.connect();
    //Send a ping to confirm a sucessful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB");
  } finally {
    //Ensures that the client will close when you finish/error
    await client.close();
  }
}
