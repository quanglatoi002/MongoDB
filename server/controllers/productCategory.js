const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");

//create
const createCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.create(req.body);
    return res.json({
        success: response ? true : false,
        createCategory: response
            ? response
            : "Can't create new product category",
    });
});

//get category
const getCategories = asyncHandler(async (req, res) => {
    const response = await ProductCategory.find().select("title _id");
    return res.json({
        success: response ? true : false,
        prodCategories: response ? response : "Can't get product categories",
    });
});

//update category
const updateCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params;
    console.log(pcid);
    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
        new: true,
    });
    return res.json({
        success: response ? true : false,
        updateCategory: response ? response : "Can't update product category",
    });
});

//delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params;
    const response = await ProductCategory.findByIdAndDelete(pcid, req.body);
    return res.json({
        success: response ? true : false,
        deletedCategory: response ? response : "Can't delete product category",
    });
});

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
