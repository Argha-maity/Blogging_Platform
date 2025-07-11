const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require("../middleware/auth");
const { 
    createPost, 
    getAllPosts, 
    deletePost,
    updatePost, 
} = require('../controllers/Post');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// POST /api/posts
router.post('/create', upload.single('file'), createPost);
router.get('/', getAllPosts);
router.delete('/:id', protect, deletePost);
router.put('/:id', protect, upload.single('file'), updatePost);

module.exports = router;
