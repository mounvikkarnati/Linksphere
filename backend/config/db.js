const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ⚡ PRODUCTION LATENCY TUNING
      // Keep a modest pool — Render free tier caps connections; a small pool
      // avoids churn when several requests (e.g. /me + /my-rooms + /messages)
      // hit the server at once.
      maxPoolSize: 10,
      // Fail fast if Mongo is unreachable instead of hanging every request
      // for the default 30s during a flaky network / cold-start window.
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;