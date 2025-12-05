const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI missing in .env — using local fallback.');
    }

    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/charity';

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }

  app.listen(PORT, () => {
    console.log('🚀 Server running on port', PORT);
  });
}

start();
