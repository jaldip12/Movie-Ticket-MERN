import mongoose from "mongoose";

const DB_NAME = "ticket-booking";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });
    console.log(
      `\n MongoDB connected !! DB HOST: ${conn.connection.host} | DB: ${conn.connection.name}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
