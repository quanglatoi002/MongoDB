const Order = require("../models/order");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

//create
const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userCart = await User.findById(_id).select("cart");

    return res.json({
        success: userCart ? true : false,
        createBlog: userCart ? userCart : "Can't create order",
    });
});

module.exports = {
    createOrder,
};
