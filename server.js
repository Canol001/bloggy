require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fastify-blog';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Serve static files (CSS, images)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

// Set view engine
fastify.register(require('@fastify/view'), {
  engine: { ejs: require('ejs') }
});

// Home Route
fastify.get('/', async (req, reply) => {
  return reply.view('/views/pages/home.ejs', { title: 'Welcome to Fastify Blog' });
});

// Start Server
const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
