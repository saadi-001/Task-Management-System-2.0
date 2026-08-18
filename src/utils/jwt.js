const jwt = require("jsonwebtoken");

const generateToken = (user) => {

    return jwt.sign(

        {
            UserID: user.UserID,
            Email: user.Email,
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1d",
        }

    );

};

module.exports = {
    generateToken,
};