const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

const getBearerToken = (req) => {
    const header = req.headers.authorization || "";
    const match = header.match(/^\s*Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
};

const protect = async (req, res, next) => {
    try {
        const token = getBearerToken(req);
        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: Missing bearer token"
            });
        }

        const payload = verifyToken(token);
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: User no longer exists"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: "error",
            message: "Unauthorized: Invalid or expired token"
        });
    }
};

const adminAuth = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            status: "error",
            message: "Forbidden: Admin access required"
        });
    }

    next();
};

module.exports = { protect, adminAuth };
