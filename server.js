const fastify = require("fastify")({ logger: true });
const path = require("path");
const fastifyStatic = require("@fastify/static");
const fastifyView = require("@fastify/view");
const ejs = require("ejs");
const multer = require("fastify-multer");
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

// Define Schema & Model
const ArticleSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  tags: [String],
  content: String,
  image: String, // Add an image field for articles
});

const Article = mongoose.model("Article", ArticleSchema);

// ✅ Register EJS Template Engine
fastify.register(fastifyView, {
  engine: { ejs: ejs },
  root: path.join(__dirname, "views"),
  layout: "layout.ejs",
});

// ✅ Register Fastify Static for public files
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// ✅ Home Route - Fetch Articles
fastify.get("/", async (req, reply) => {
  try {
    const posts = await Article.find().limit(6); // Get 6 latest articles
    return reply.view("layout.ejs", { currentPage: "pages/home.ejs", posts });
  } catch (err) {
    reply.status(500).send({ error: "Error fetching articles" });
  }
});

// ✅ Articles Page - Fetch All Articles
fastify.get("/articles", async (req, reply) => {
  try {
    const articles = await Article.find();
    return reply.view("layout.ejs", { currentPage: "pages/articles.ejs", articles });
  } catch (err) {
    reply.status(500).send({ error: "Error fetching articles" });
  }
});

// ✅ Articles Page - Fetch All Articles
fastify.get("/contact-us", async (req, reply) => {
  try {
    const articles = await Article.find();
    return reply.view("layout.ejs", { currentPage: "pages/contact.ejs", articles });
  } catch (err) {
    reply.status(500).send({ error: "Error Loading" });
  }
})

// Search route
fastify.get('/search', (req, res) => {
  const query = req.query.query.toLowerCase();
  const results = articles.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.content.toLowerCase().includes(query)
  );
  res.render('search-results', { results, query });
});

// ✅ API to fetch articles as JSON
fastify.get("/api/articles", async (req, reply) => {
  try {
    const articles = await Article.find();
    reply.send(articles);
  } catch (err) {
    reply.status(500).send({ error: "Error fetching articles" });
  }
});

// ✅ Single Post Route
fastify.get("/post/:id", async (req, reply) => {
  try {
    const post = await Article.findById(req.params.id);
    if (!post) return reply.status(404).send({ error: "Post not found" });

    const recentPosts = await Article.find().limit(3);
    return reply.view("layout.ejs", { currentPage: "pages/read-post.ejs", post, recentPosts });
  } catch (err) {
    reply.status(500).send({ error: "Error fetching post" });
  }
});

// ✅ Publish Article Page
fastify.get("/publish-article", async (req, reply) => {
  return reply.view("layout.ejs", { currentPage: "pages/publish-article.ejs" });
});

// ✅ Setup Storage for File Uploads
const upload = multer({ dest: "uploads/" });

// ✅ Submit Article Route
fastify.post("/submit-article", { preHandler: upload.single("image") }, async (req, reply) => {
  try {
    const { title, author, category, tags, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "/images/default.jpg";

    const newArticle = new Article({ title, author, category, tags, content, image });
    await newArticle.save();

    return reply.redirect("/articles");
  } catch (error) {
    console.error("Error submitting article:", error);
    return reply.status(500).send({ success: false, message: "Error submitting article" });
  }
});

// ✅ Start Server
fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
