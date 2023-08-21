const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");

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
        const { password, role, refreshToken, ...userData } =
            response.toObject();
        const accessToken = generateAccessToken(response._id, role);
        // refresh token
        const newRefreshToken = generateRefreshToken(response._id);
        // Lưu refresh token vào database
        await User.findByIdAndUpdate(
            response._id,
            { refreshToken: newRefreshToken },
            { new: true }
        );
        //Lưu refresh token vào cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 10000,
        });
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
    // nhận _id từ phía client gửi về
    const { _id } = req.user;
    // tìm theo id đã lấy được từ client gửi xuống và lấy all loại trừ refreshToken, password, role
    const user = await User.findById({ _id }).select(
        "-refreshToken -password -role"
    );
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : "User not found",
    });
});

//refresh
//lấy lại accessToken thông qua refreshAccessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
    //lấy cookie
    const cookie = req.cookies;
    // check nếu như ko có cookie
    if (!cookie || !cookie?.refreshToken)
        throw new Error("No refresh token in cookie");
    //verify cookie đã được lưu trên trình duyệt
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
    // sau khi verify sẽ lấy được _id trước khi mã hóa. Tìm kiếm dựa vào id đã được mã hóa từ refresh token và refresh token đã lưu trên cookie
    const response = await User.findOne({
        _id: rs._id,
        refreshToken: cookie.refreshToken,
    });
    // tạo mới accessToken
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response
            ? generateAccessToken(response._id, response.role)
            : "Refresh token not invalid",
    });
});

//logout ở phía server
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    // nếu như không có resfreshToken trong cookie
    if (!cookie || !cookie.refreshToken)
        throw new Error("No refresh token in cookie");
    //new: true sẽ trả về kết quả sau khi cập nhật
    //xóa refresh token ở db
    await User.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        { refreshToken: "" },
        { new: true }
    );
    // xóa cookie trên trình duyệt
    res.cookie("refreshToken", "", {
        expires: new Date(0),
        httpOnly: true, // làm cho cookie không thể try cập = Js trong trình duyệt
        secure: true, // yêu cầu cookie chỉ được gửi qua kết nối an toàn HTTPS
    });
    return res.status(200).json({
        success: true,
        message: "Logout completed successfully",
    });
});

//Thay đổi mật khẩu
//client side gửi email
//Server check email có hợp lệ ko => Gửi email + kèm theo link (password change token)
//Client check mail => click vào link đã được phía server gửi về.
//Client gửi api kèm token
//Check token có giống với token mà server gửi email hay ko

const forgotPassword = asyncHandler(async (req, res) => {
    // nhận email khi user change password
    const { email } = req.query;
    // nếu user not input email then note miss email
    if (!email) throw new Error("Missing email");
    // có email thì tìm trg db email đó
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email not found");
    const resetToken = user.createPasswordChangeToken();
    //nếu tự định nghĩa 1 method trong module thì ph save() lại vì dữ liệu trg đối tượng user đã thay đổi nhưng ch lưu lại vào cơ sở dữ liệu
    await user.save();

    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn! Link này sẽ hết hạn trong 15 phút kể từ bây giờ <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`;

    const data = {
        email,
        html,
    };
    const rs = await sendMail(data);
    return res.status(200).json({
        success: true,
        rs,
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;
    if (!password || !token) throw new Error("Missing inputs");
    // mã hóa token để trùng trong tìm kiếm db
    const passwordResetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken,
        // $gt: lớn hơn
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Invalid reset token");
    // cập nhật lại mật khẩu
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({
        success: user ? true : false,
        mes: user ? "Updated password" : "Something went wrong",
    });
});

//lấy toàn bộ người dùng => để lấy toàn bộ ng dùng thì cần phải là admin
const getUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select("-refreshToken -password -role");
    return res
        .status(200)
        .json({ success: response ? true : false, user: response });
});
//Delete
const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query;
    if (!_id) throw new Error("Missing inputs");
    const response = await User.findByIdAndDelete(_id);
    return res.status(200).json({
        success: response ? true : false,
        deleteUser: response
            ? `User with email ${response.email} deleted`
            : "No user delete",
    });
});

//Update
const updateUser = asyncHandler(async (req, res) => {
    // req.user chứa _id sau khi verifyToken
    const { _id } = req.user;
    console.log(_id);
    //nếu như có id mà user ko có thay đổi thì cần phải kiểm tra độ dài của của mảng đó
    if (!_id || Object.keys(req.body).length === 0)
        throw new Error("Missing inputs");
    const response = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
    }).select("-password -role -refreshToken");
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : "Something went wrong",
    });
});

//updateUserByAdmin
const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { uid } = req.params;

    if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
    const response = await User.findByIdAndUpdate(uid, req.body, {
        new: true,
    }).select("-password -role -refreshToken");
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : "Some thing went wrong",
    });
});

module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
};
