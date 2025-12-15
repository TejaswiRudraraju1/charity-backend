const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI missing in .env — using local fallback.");
    }

    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/charity";

    // Mongoose 9+ no longer needs useNewUrlParser/useUnifiedTopology options
    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }

  app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
  });
}

start();
