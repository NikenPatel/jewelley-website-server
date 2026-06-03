const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        resetToken: String,
        verificationToken: String
    },
    {
        timestamps: true
    });

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) {
        return;
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = await new Promise((resolve, reject) => {
        crypto.pbkdf2(this.password, salt, 120000, 64, "sha512", (error, derivedKey) => {
            if (error) reject(error);
            else resolve(derivedKey.toString("hex"));
        });
    });

    this.password = `pbkdf2_sha512$120000$${salt}$${hash}`;
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
    const [algorithm, iterations, salt, storedHash] = this.password.split("$");

    if (algorithm !== "pbkdf2_sha512" || !iterations || !salt || !storedHash) {
        return false;
    }

    const candidateHash = await new Promise((resolve, reject) => {
        crypto.pbkdf2(candidatePassword, salt, Number(iterations), 64, "sha512", (error, derivedKey) => {
            if (error) reject(error);
            else resolve(derivedKey.toString("hex"));
        });
    });

    return crypto.timingSafeEqual(Buffer.from(candidateHash, "hex"), Buffer.from(storedHash, "hex"));
};

userSchema.methods.toSafeObject = function toSafeObject() {
    const user = this.toObject();
    delete user.password;
    delete user.resetToken;
    delete user.verificationToken;
    return user;
};

module.exports = mongoose.model("User", userSchema);
