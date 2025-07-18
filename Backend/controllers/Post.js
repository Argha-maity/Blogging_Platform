const Post = require('../models/Post');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const authorId = req.user.id;
        const author = req.user.username || req.user.name || req.user.email || 'Unknown';

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

        res.status(201).json(post);
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

const deleteAllpost = async (req, res) => {
    try {
        await Post.deleteMany({});
        res.json({ message: 'All posts deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete posts' });
    }
}

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user._id;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        
        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ message: 'Valid comment text is required' });
        }

        // Validate post ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid post ID format' });
        }

        // Find the post
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Verify user exists and has proper ID
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User authentication invalid' });
        }

        // Create new comment with proper ObjectId
        const newComment = {
            userId: req.user._id, // Use the ObjectId version
            userName: req.user.name,
            text: text.trim(),
            createdAt: new Date()
        };

        // Add comment and save
        post.comments.unshift(newComment);
        const savedPost = await post.save();

        return res.status(201).json(savedPost);
        
    } catch (err) {
        console.error('Error adding comment:', {
            error: err.message,
            stack: err.stack,
            request: {
                params: req.params,
                body: req.body,
                user: req.user
            }
        });
        
        return res.status(500).json({ 
            message: 'Failed to add comment',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

module.exports = {
    createPost,
    getAllPosts,
    deletePost,
    updatePost,
    deleteAllpost,
    likePost,
    addComment,
};