const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");

//create
const createNewCoupon = asyncHandler(async (req, res) => {
    const { name, discount, expiry } = req.body;
    if (!name || !discount || !expiry) throw new Error("Missing inputs");
    const response = await Coupon.create({
        ...req.body,
        expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
    });
    return res.json({
        success: response ? true : false,
        createCoupon: response ? response : "Can't create new coupon",
    });
});

//get
const getCoupons = asyncHandler(async (req, res) => {
    const response = await Coupon.find().select("-createdAt -updatedAt");
    return res.json({
        success: response ? true : false,
        createCoupon: response ? response : "Can't get coupons",
    });
});

//update
const updateCoupon = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
    if (req.body.expiry)
        req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000;
    const response = await Coupon.findByIdAndUpdate(cid, req.body, {
        new: true,
    });
    return res.json({
        success: response ? true : false,
        updatedCoupon: response ? response : "Can't update coupon",
    });
});

//delete
const deleteCoupon = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const response = await Coupon.findByIdAndDelete(cid);
    return res.json({
        success: response ? true : false,
        deletedCoupon: response ? response : "Can't delete coupon",
    });
});

module.exports = {
    getCoupons,
    createNewCoupon,
    updateCoupon,
    deleteCoupon,
};
