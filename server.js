const fastify = require("fastify")({ logger: true });
const path = require("path");
const fastifyStatic = require("@fastify/static");
const fastifyView = require("@fastify/view");
const ejs = require("ejs");
const fs = require('fs');
const util = require('util');
const multer = require('fastify-multer');

// ✅ Register EJS Template Engine (Only Once)
fastify.register(fastifyView, {
    engine: { ejs: ejs },
    root: path.join(__dirname, "views"), // Ensure this is correct
    layout: "layout.ejs", // Ensure this file exists inside `views/`
});

// ✅ Register Fastify Static (for serving images, CSS, JS)
fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/", // Ensures static files are served from `/public`
});

// ✅ Home Route (Render `home.ejs`)
fastify.get("/", async (request, reply) => {
    const posts = [
        { id: 1, title: "First Blog Post", image: "/images/hero.jpg" },
        { id: 2, title: "Second Blog Post", image: "/images/hero.jpg" },
        { id: 3, title: "Third Blog Post", image: "/images/hero.jpg" }
    ];

    return reply.view("layout.ejs", { currentPage: "pages/home.ejs", posts });
});

fastify.get('/articles', async (req, reply) => {
    const articles = [
        { id: 1, title: "Breaking News", author: "John Doe", date: "March 30, 2025", excerpt: "This is a short preview of the article...", image: "/images/hero.jpg" },
        { id: 2, title: "Tech Innovations", author: "Jane Smith", date: "March 28, 2025", excerpt: "Latest advancements in technology...", image: "/images/hero.jpg" }
    ];
    
    return reply.view('layout.ejs', { 
        currentPage: "pages/articles.ejs",
        articles 
    });
});

fastify.get("/post/:id", async (request, reply) => {
    const post = {
        title: "How Travel Writer and Vlogger Overcomes Self-Doubt",
        image: "/images/hero.jpg",
        author: "John Doe",
        date: "March 30, 2025",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    };

    const recentPosts = [
        { title: "The Future of AI", image: "/images/hero.jpg", author: "Jane Smith" },
        { title: "How to Learn Programming", image: "/images/hero.jpg", author: "David Brown" }
    ];

    return reply.view("layout.ejs", { currentPage: "pages/read-post.ejs", post, recentPosts });
});

// Set up storage for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to render the create article page
fastify.get('/publish-article', async (req, reply) => {
    return reply.view('layout.ejs', { currentPage: "pages/publish-article.ejs" });
});


// Route to handle article submission
fastify.post('/submit-article', { preHandler: upload.array('files') }, async (req, reply) => {
    try {
        const { title, author, category, tags, content } = req.body;
        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: file.path
        }));

        // Example: Save article data (Replace with DB logic)
        const newArticle = {
            title,
            author,
            category,
            tags,
            content,
            files: uploadedFiles,
            createdAt: new Date()
        };

        console.log('Article received:', newArticle);

        return reply.send({ success: true, message: 'Article submitted successfully', article: newArticle });
    } catch (error) {
        console.error('Error submitting article:', error);
        return reply.status(500).send({ success: false, message: 'Error submitting article' });
    }
});

// Route to handle inline image uploads
fastify.post('/upload-image', { preHandler: upload.single('image') }, async (req, reply) => {
    try {
        if (!req.file) {
            return reply.status(400).send({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        return reply.send({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return reply.status(500).send({ success: false, message: 'Error uploading image' });
    }
});

module.exports = fastify;

// ✅ Start Server
fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`🚀 Server running at ${address}`);
});