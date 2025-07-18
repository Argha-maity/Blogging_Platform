const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    authorId: String,
    date: String,
    fileContent: String, // CSV or plain content from the uploaded file
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'User'
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: String,
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);