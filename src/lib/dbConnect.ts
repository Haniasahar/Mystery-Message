import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("DB already connected");
    return;
  }

  try {
    const db_connection = await mongoose.connect(process.env.MONGO_URI!);
    // console.log(db_connection);
    //console.log(db_connection.connections)
    connection.isConnected = db_connection.connections[0].readyState;
    console.log("Database Connected Successfully !!");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
}

export default dbConnect;
