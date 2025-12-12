const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Just pass the URI, no options needed
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
