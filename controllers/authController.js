const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const createAuthResponse = (user) => ({
    status: "ok",
    token: signToken({ id: user._id.toString(), role: user.role }),
    user: user.toSafeObject()
});

const ADMIN_SIGNUP_KEY = process.env.ADMIN_SIGNUP_KEY || process.env.ADMIN_KEY;
const signup = async (req, res) => {
    try {
        const { name, email, password, role, adminKey } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: "error",
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "User already exists with this email"
            });
        }

        const requestedRole = role === "admin" ? "admin" : "user";
        if (requestedRole === "admin") {
            const validAdminKey = process.env.ADMIN_SIGNUP_KEY || process.env.ADMIN_KEY;
            if (!validAdminKey || adminKey !== validAdminKey) {
                return res.status(403).json({
                    status: "error",
                    message: "Valid admin signup key is required"
                });
            }
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: requestedRole,
            isVerified: true
        });

        res.status(201).json(createAuthResponse(user));
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
        }

        res.json(createAuthResponse(user));
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

const me = async (req, res) => {
    res.json({
        status: "ok",
        user: req.user.toSafeObject()
    });
};

const updateProfile = async (req, res) => {
    try {
        const { address } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        if (address) {
            user.address = {
                ...user.address,
                ...address
            };
        }

        await user.save();

        res.json({
            status: "ok",
            message: "Profile updated successfully",
            user: user.toSafeObject()
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

module.exports = { signup, signin, me, updateProfile };
