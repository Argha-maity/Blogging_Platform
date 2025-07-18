const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Authorization header missing or improperly formatted');
        return res.status(401).json({
            error: "Authentication required",
            details: "Authorization header missing or malformed"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const userId = decoded.id || decoded._id;

        if (!userId) {
            return res.status(401).json({ error: "Invalid token payload" });
        }

        if (!decoded || (!decoded.id && !decoded._id)) {
            console.error('Decoded token missing expected fields:', decoded);
            return res.status(401).json({ error: "Invalid token payload" });
        }

        req.user = {
            id: userId,
            _id: userId,
            name: decoded.name || decoded.username || 'Unknown'
        };
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).json({ error: "Not authorized, token invalid" });
    }
};

module.exports = { protect };