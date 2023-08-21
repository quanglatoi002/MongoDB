const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    //Bearer token
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        // nhận token trả về từ phía client gửi về server và xác thực token vừa lấy được với mã đã được dùng trước đó để mã hóa access token
        const token = req.headers?.authorization?.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err)
                return res.status(401).json({
                    success: false,
                    mes: "Invalid access token",
                });
            req.user = decode;
            next();
        });
    } else {
        return res.status(401).json({
            success: false,
            mes: "Required authentication!",
        });
    }
});

//isAdmin
const isAdmin = asyncHandler((req, res, next) => {
    const { role } = req.user;
    if (role !== "admin")
        return res.status(401).json({
            success: false,
            mes: "REQUIRE ADMIN ROLE",
        });
    next();
});

module.exports = {
    verifyAccessToken,
    isAdmin,
};
