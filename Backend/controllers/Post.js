const Post = require('../models/Post');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path'); // 👈 make sure to import this

const createPost = async (req, res) => {
    try {
        const { title, content, author, authorId } = req.body;

        let fileContent = '';

        if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase();

            if (ext === '.xlsx' || ext === '.xls') {
                const workbook = XLSX.readFile(req.file.path);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                fileContent = XLSX.utils.sheet_to_csv(sheet);
            } else {
                fileContent = `/uploads/${req.file.filename}`; // Save file path for image/video preview
            }
        }

        const post = new Post({
            title,
            content,
            author,
            authorId,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            fileContent
        });

        await post.save();

        res.status(201).json(post); // ✅ Send complete post (with fileContent) to frontend
    } catch (err) {
        console.error('Error in createPost:', err);
        res.status(500).json({ error: 'Post creation failed.' });
    }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id; //  middleware added it from token

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.authorId !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only delete your own post' });
        }

        await Post.findByIdAndDelete(postId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
};

const updatePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.authorId !== userId) {
            return res.status(403).json({ error: "You can only edit your own posts" });
        }

        // Update fields
        if (req.body.title) post.title = req.body.title;
        if (req.body.content) post.content = req.body.content;

        // Replace file if uploaded
        if (req.file) {
            if (post.fileContent && fs.existsSync(path.join(__dirname, `../${post.fileContent}`))) {
                fs.unlinkSync(path.join(__dirname, `../${post.fileContent}`)); // Delete old file
            }
            post.fileContent = `/uploads/${req.file.filename}`;
        }

        const updated = await post.save();
        res.status(200).json(updated);

    } catch (err) {
        console.error("Update failed:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    deletePost,
    updatePost,
};