const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app=express();

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); //publically accessible

//Db connect
mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
    .then(() => console.log('MongoDb connected.'))
    .catch(err => console.error('MongoDB connection error:', err));

//routes
app.get("/",(req,res)=>{
    res.end("hello from server.");
});

const userRoutes = require("./routes/User");
const postRoutes = require("./routes/Post");
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);

const PORT = process.env.PORT || 8006;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
