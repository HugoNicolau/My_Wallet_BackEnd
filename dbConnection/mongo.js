import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
} catch (err) {
  console.log(err);
}

const db = mongoClient.db("myWalletDb");
const objectId = ObjectId;
export { db, objectId };
