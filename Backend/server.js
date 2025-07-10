const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app=express();

//middleware
app.use(cors());
app.use(express.json());

//Db connect
mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
    .then(() => console.log('MongoDb connected.'))
    .catch(err => console.error('MongoDB connection error:', err));

//routes
app.get("/",(req,res)=>{
    res.end("hello from server.");
});

const userRoutes = require("./routes/User");
app.use("/api/users",userRoutes);

const PORT = process.env.PORT || 8006;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
