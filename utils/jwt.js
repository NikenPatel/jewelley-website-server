const crypto = require("crypto");

const base64Url = (input) => Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const parseExpiry = (value = "7d") => {
    const match = String(value).match(/^(\d+)([smhd])$/);
    if (!match) {
        return 7 * 24 * 60 * 60;
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return amount * multipliers[unit];
};

const getSecret = () => process.env.JWT_SECRET || process.env.ADMIN_KEY || "change_this_jwt_secret";

const signToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || "7d") => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + parseExpiry(expiresIn);
    const header = { alg: "HS256", typ: "JWT" };
    const body = { ...payload, iat: issuedAt, exp: expiresAt };
    const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
    const signature = crypto
        .createHmac("sha256", getSecret())
        .update(unsignedToken)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${unsignedToken}.${signature}`;
};

const verifyToken = (token) => {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid token");
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
        .createHmac("sha256", getSecret())
        .update(unsignedToken)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
    }

    return payload;
};

module.exports = { signToken, verifyToken };
