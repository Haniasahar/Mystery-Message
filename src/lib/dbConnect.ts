// import mongoose from "mongoose";

// type ConnectionObject = {
//   isConnected?: number;
// };

// const connection: ConnectionObject = {};

// async function dbConnect(): Promise<void> {
//   if (connection.isConnected) {
//     console.log("DB already connected");
//     return;
//   }

//   try {
//     const db_connection = await mongoose.connect(process.env.MONGO_URI!);
//     // console.log(db_connection);
//     //console.log(db_connection.connections)
//     connection.isConnected = db_connection.connections[0].readyState;
//     console.log("Database Connected Successfully !!");
//   } catch (error) {
//     console.log("Database connection failed", error);
//     process.exit(1);
//   }
// }

// export default dbConnect;


import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("Please define MONGO_URI in env");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// 👇 global cache (survives serverless cold starts better)
let cached = (global as any).mongoose as MongooseCache;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
