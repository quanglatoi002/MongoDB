const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

//create Product
const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
    //sử dụng slugify để loai bỏ dấu và thêm dấu - vào khoảng cách của từ
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const newProduct = await Product.create(req.body);
    return res.status(200).json({
        success: newProduct ? true : false,
        createProduct: newProduct ? newProduct : "Could not create product",
    });
});

//get a product
const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    console.log(pid);
    const product = await Product.findById(pid);
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : "Could not get product",
    });
});

//get products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find();
    return res.status(200).json({
        success: products ? true : false,
        productsData: products ? products : "Could not get products",
    });
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (!pid) throw new Error("Missing pid");
    // nếu user có sửa title thì cần phải cập nhật lại
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
        new: true,
    });
    return res.status(200).json({
        success: updatedProduct ? true : false,
        productData: updatedProduct
            ? updatedProduct
            : "Could not updating product",
    });
});

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (!pid) throw new Error("Missing pid");
    // nếu user có sửa title thì cần phải cập nhật lại
    const deleteProduct = await Product.findByIdAndDelete(pid);
    return res.status(200).json({
        success: deleteProduct ? true : false,
        productData: deleteProduct ? deleteProduct : "Could not delete product",
    });
});
module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
};
