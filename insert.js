const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ Connection Error:", err));

// Define Schema & Model
const ArticleSchema = new mongoose.Schema({
    title: String,
    author: String,
    category: String,
    tags: [String],
    content: String,
    image: String, // URL or local path to an image
    createdAt: { type: Date, default: Date.now }
});

const Article = mongoose.model("Article", ArticleSchema);

// Sample Articles
const articles = [
    {
        title: "The Future of AI",
        author: "Jane Smith",
        category: "Technology",
        tags: ["AI", "Machine Learning", "Future"],
        content: "Artificial intelligence is evolving rapidly and shaping the future...",
        image: "/images/ai.jpg"
    },
    {
        title: "How to Stay Productive as a Developer",
        author: "John Doe",
        category: "Programming",
        tags: ["Productivity", "Developers", "Time Management"],
        content: "Managing time effectively is crucial for developers...",
        image: "/images/productivity.jpg"
    },
    {
        title: "Top 10 JavaScript Frameworks in 2025",
        author: "Alice Brown",
        category: "Web Development",
        tags: ["JavaScript", "Frameworks", "Trends"],
        content: "JavaScript frameworks continue to evolve, here are the top 10...",
        image: "/images/javascript.jpg"
    }
];

// Insert Data
Article.insertMany(articles)
    .then(() => {
        console.log("✅ Sample Articles Inserted Successfully");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("❌ Error Inserting Articles:", err);
        mongoose.connection.close();
    });
