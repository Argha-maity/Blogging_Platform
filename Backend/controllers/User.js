const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const generateToken = (User) => {
    return jwt.sign(
        { id: User._id, email: User.email },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
};

async function handleUserSignup(req, res) {
    const { username, email, password } = req.body;
    
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user),
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide both email and password" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        if (!user.password) {
            console.error('User found but password field missing:', user._id);
            return res.status(500).json({ error: "Authentication system error" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user),
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Server error" });
    }
}

async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    getCurrentUser,
};