const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../middlewares/jwt");
//Register
const register = asyncHandler(async (req, res) => {
    //phải kiểm tra xem đã nhập đầy đủ thông tin cần thiết chưa
    const { email, password, firstName, lastName } = req.body;
    // if mà thiếu 1 in 4 thì cảnh báo là thiếu input liền
    if (!email || !password || !firstName || !lastName)
        return res.status(400).json({
            success: false,
            mes: "Missing inputs",
        });
    // if mà đã nhập đủ dữ kiện thì phải kiểm tra thêm email đã tồn tại hay ch?
    const user = await User.findOne({ email });
    // if email đã tồn tại thì phải cảnh báo là user đã tồn tại
    if (user) throw new Error("User has existed!");
    else {
        const newUser = await User.create(req.body);
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser
                ? "Register is successfully registered"
                : "Something went wrong",
        });
    }
});

//Login
//Nhiệm vụ của refresh token là cấp mới access token mà thôi
const login = asyncHandler(async (req, res) => {
    //phải kiểm tra xem đã nhập đầy đủ thông tin cần thiết chưa
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password)
        return res.status(400).json({
            success: false,
            mes: "Missing inputs",
        });
    //kiểm tra email có tồn tại trong db không
    //findOne trả về không phải là 1 object thuần
    const response = await User.findOne({ email });
    // nếu email có tồn tại và mật khẩu so sánh đúng
    if (response && (await response.isCorrectPassword(password))) {
        //ở đoạn này ko thể show password, role từ db lên được.
        const { password, role, ...userData } = response.toObject();
        const accessToken = generateAccessToken(response._id, role);
        // refresh token
        const refreshToken = generateRefreshToken(response._id);
        // Lưu refresh token vào database
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 10000,
        });
        await User.findByIdAndUpdate(
            response._id,
            { refreshToken },
            { new: true }
        );
        //Lưu refresh token vào cookie
        return res.status(200).json({
            success: true,
            accessToken,
            userData,
        });
    } else {
        throw new Error("Invalid credentials");
    }
});

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const user = await User.findById({ _id }).select(
        "-refreshToken -password -role"
    );
    return res.status(200).json({
        success: false,
        rs: user ? user : "User not found",
    });
});

module.exports = {
    register,
    login,
    getCurrent,
};
