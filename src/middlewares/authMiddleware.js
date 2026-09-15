const jwt = require("jsonwebtoken");

// ==============================
// Authenticate User
// ==============================
const authenticate = (req, res, next) => {
    try {

        // Get Authorization Header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token is missing."
            });
        }

        // Extract Token
        const token = authHeader
            .replace(/^Bearer\s+/i, "")
            .trim();

        // Verify Token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save user data in request
        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }
};

module.exports = authenticate;