import mongoose from "mongoose";

mongoose.set("strict", false);

// Connects to a MongoDB database
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((con) => {
      console.log(
        `MongoDB database connected with HOST: ${con.connection.host}`
      );
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
};

export default connectDatabase;
