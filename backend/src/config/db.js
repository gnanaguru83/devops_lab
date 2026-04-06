const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/attendance_db";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

module.exports = connectDB;
