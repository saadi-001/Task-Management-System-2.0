const authService = require("../services/authService");

// ==========================
// Signup
// ==========================
const signup = async (req, res) => {

    try {

        const { name, email, password, dateOfBirth } = req.body;

        const user = await authService.signup({
            name,
            email,
            password,
            dateOfBirth,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });

    } catch (error) {

    console.error(error);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
    });

}

};

// ==========================
// Login
// ==========================
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await authService.login(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

module.exports = {
    signup,
    login,
};