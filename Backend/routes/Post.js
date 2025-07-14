const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require("../middleware/auth");
const { 
    createPost, 
    getAllPosts, 
    deletePost,
    updatePost, 
    deleteAllpost,
} = require('../controllers/Post');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// POST /api/posts
router.post('/create', protect, upload.single('file'), createPost);
router.get('/', getAllPosts);
router.delete('/:id', protect, deletePost);
router.put('/:id', protect, upload.single('file'), updatePost);
router.delete('/clear/all',deleteAllpost);

module.exports = router;
