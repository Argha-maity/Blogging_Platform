const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    authorId: String,
    date: String,
    fileContent: String, // CSV or plain content from the uploaded file
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
