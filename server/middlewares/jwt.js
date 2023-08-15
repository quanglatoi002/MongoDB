const jwt = require("jsonwebtoken");

//accessToken với jwt
const generateAccessToken = (uid, role) => {
    return jwt.sign({ _id: uid, role }, process.env.JWT_SECRET, {
        expiresIn: "3d",
    });
};

module.exports = {
    generateAccessToken,
};
