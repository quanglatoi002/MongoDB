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
//Tiếp theo là Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = { ...req.query };
    //Tách các trường đặc biệt ra khỏi query
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);
    //Format
    let queryString = JSON.stringify(queries);
    console.log(queryString);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (el) => `$${el}`);
    const formattedQueries = JSON.parse(queryString);
    console.log(formattedQueries);
    // price : {}
    //Filtering
    // chỉ cần 1 chữ tồn tại trong nd cần tìm thì nó sẽ hiện ra toàn bộ, "i" không phân biệt chữ hoa và thường.
    if (queries?.title)
        formattedQueries.title = { $regex: queries.title, $options: "i" };
    let queryCommand = Product.find(formattedQueries);

    //Sorting
    // quang, thai, van => [quang, thai, van] => quang thai van
    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        console.log(sortBy);
        //sort(title firstname)

        queryCommand = queryCommand.sort(sortBy);
    }
    //Execute the query
    // tìm ra số lượng thỏa đk và số lượng sp gọi ra từ API
    try {
        const response = await queryCommand.exec();
        // tìm ra số lượng thoải đk vd price : {"$gt : 5000"}
        const counts = await Product.find(formattedQueries).countDocuments();

        return res.status(200).json({
            success: response ? true : false,
            products: response ? response : "Could not get products",
            counts,
        });
    } catch (err) {
        throw new Error(err.message);
    }
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
