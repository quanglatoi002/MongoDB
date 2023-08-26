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
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (el) => `$${el}`);
    const formattedQueries = JSON.parse(queryString);

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
        //sort(title firstname)
        queryCommand = queryCommand.sort(sortBy);
    }

    //Field Limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        console.log(fields);
        queryCommand = queryCommand.select(fields);
    }

    //Pagination
    // page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page 3
    const page = +req.query.page * 1 || 1;
    const limit = +req.query.limit * 1 || process.env.LIMIT_PRODUCTS;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);
    //Execute the query
    // tìm ra số lượng thỏa đk và số lượng sp gọi ra từ API
    try {
        const response = await queryCommand.exec();
        // tìm ra số lượng thoải đk vd price : {"$gt : 5000"}
        const counts = await Product.find(formattedQueries).countDocuments();

        return res.status(200).json({
            success: response ? true : false,
            counts,
            products: response ? response : "Could not get products",
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

//RATINGS
const ratings = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, comment, pid } = req.body;
    if (!star || !pid) throw new Error("Missing input");
    const ratingProduct = await Product.findById(pid);
    const alreadyRating = ratingProduct?.ratings?.find(
        (el) => el.postedBy.toString() === _id
    );
    //update star & cm
    //$elemMatch đc sử dụng để tìm các tài liệu trong 1 mảng sao cho 1 || nhiều điều kiện được xác định, thường dùng như mảng các đối tượng hoặc mảng các giá trị
    if (alreadyRating) {
        await Product.updateOne(
            {
                ratings: { $elemMatch: alreadyRating },
            },
            // $ ở đây là đại diện cho phần tử mà bạn đã tìm thấy qua đk truy vấn
            { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
            { new: true }
        );
    } else {
        await Product.findByIdAndUpdate(
            pid,
            {
                $push: { ratings: { star, comment, postedBy: _id } },
            },
            { new: true }
        );
    }

    //sum ratings
    const updatedProduct = await Product.findById(pid);
    const ratingCount = updatedProduct.ratings.length;
    const sumRatings = updatedProduct.ratings.reduce(
        (sum, el) => sum + +el.star,
        0
    );

    updatedProduct.totalRatings =
        Math.round((sumRatings * 10) / ratingCount) / 10;

    await updatedProduct.save();

    return res.status(200).json({
        status: true,
        updatedProduct,
    });
});

module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings,
};
