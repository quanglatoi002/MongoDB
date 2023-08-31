const Order = require("../models/order");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");

//create
const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { coupon } = req.body;
    const userCart = await User.findById(_id)
        .select("cart")
        .populate("cart.product", "title price");
    const products = userCart?.cart?.map((el) => ({
        product: el.product._id,
        count: el.quantity,
        color: el.color,
    }));
    let total = userCart?.cart?.reduce(
        (sum, el) => el.product.price * el.quantity + sum,
        0
    );
    // 10000 * (1 - 30% / 100) = 70 / 1000 = 0,10 * 1000 => 100
    if (coupon) {
        const selectedCoupon = await coupon.findById(coupon);
        total =
            Math.round((total * (1 - +selectedCoupon?.discount / 100)) / 1000) *
            1000;
    }

    const rs = await Order.create({ products, total, orderBy: _id });
    return res.json({
        success: rs ? true : false,
        rs: rs ? rs : "Something went wrong",
    });
});

//update
const updateStatus = asyncHandler(async (req, res) => {
    const { oid } = req.params;
    const { status } = req.body;
    if (!status) throw new Error("Missing status");
    const response = await Order.findByIdAndUpdate(
        oid,
        { status },
        { new: true }
    );
    return res.json({
        success: response ? true : false,
        rs: response ? response : "Something went wrong",
    });
});

//get
const getUserOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const response = await Order.find({ orderBy: _id });
    return res.json({
        success: response ? true : false,
        rs: response ? response : "Something went wrong",
    });
});

module.exports = {
    createOrder,
    updateStatus,
    getUserOrder,
};
