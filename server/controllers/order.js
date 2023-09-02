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
    // total khi chưa có coupon
    let total = userCart?.cart?.reduce(
        (sum, el) => el.product.price * el.quantity + sum,
        0
    );
    const createData = { products, total, orderBy: _id };
    //30% <=> 30 / 100
    // 10000 * (1 - 30 / 100) = 70 / 1000 = 0,10 * 1000 => 100
    if (coupon) {
        const selectedCoupon = await Coupon.findById(coupon);
        total =
            Math.round((total * (1 - +selectedCoupon?.discount / 100)) / 1000) *
                1000 || total;
        createData.total = total;
        createData.coupon = coupon;
    }
    console.log(total);
    const rs = await Order.create(createData);
    return res.json({
        success: rs ? true : false,
        response: rs ? rs : "Something went wrong",
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
        response: response ? response : "Something went wrong",
    });
});

//getUserOrder
const getUserOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const response = await Order.find({ orderBy: _id });
    return res.json({
        success: response ? true : false,
        response: response ? response : "Something went wrong",
    });
});

//getOrders admin
const getOrders = asyncHandler(async (req, res) => {
    const response = await Order.find();
    return res.json({
        success: response ? true : false,
        response: response ? response : "Something went wrong",
    });
});

module.exports = {
    createOrder,
    updateStatus,
    getUserOrder,
    getOrders,
};
