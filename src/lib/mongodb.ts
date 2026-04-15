import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set");
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}
