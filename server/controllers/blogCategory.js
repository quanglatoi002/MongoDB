const BlogCategory = require("../models/blogCategory");
const asyncHandler = require("express-async-handler");

//create
const createCategory = asyncHandler(async (req, res) => {
    const response = await BlogCategory.create(req.body);
    return res.json({
        success: response ? true : false,
        createCategory: response ? response : "Can't create new blog category",
    });
});

//get category
const getCategories = asyncHandler(async (req, res) => {
    const response = await BlogCategory.find().select("title _id");
    return res.json({
        success: response ? true : false,
        prodCategories: response ? response : "Can't get blog categories",
    });
});

//update category
const updateCategory = asyncHandler(async (req, res) => {
    const { bcid } = req.params;
    const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, {
        new: true,
    });
    return res.json({
        success: response ? true : false,
        updateCategory: response ? response : "Can't update blog category",
    });
});

//delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const { bcid } = req.params;
    const response = await BlogCategory.findByIdAndDelete(bcid, req.body);
    return res.json({
        success: response ? true : false,
        deletedCategory: response ? response : "Can't delete blog category",
    });
});

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
