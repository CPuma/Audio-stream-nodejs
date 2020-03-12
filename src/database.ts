import { MongoClient, Db, MongoClientOptions } from "mongodb";
let db: Db;
const clientOpts: MongoClientOptions = { useUnifiedTopology: true };

MongoClient.connect(
  "mongodb://localhost:tracksdb",
  clientOpts,
  (err, client) => {
    if (err) {
      console.log(err);
      process.exit(0);
    }

    db = client.db("tracksdb");
    console.log("Database is Connected");
  }
);

export const getConnection = () => db;
