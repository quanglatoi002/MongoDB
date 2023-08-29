const Brand = require("../models/brand");
const asyncHandler = require("express-async-handler");

//create
const createNewBrand = asyncHandler(async (req, res) => {
    const response = await Brand.create(req.body);
    return res.json({
        success: response ? true : false,
        createBrand: response ? response : "Can't create new brand",
    });
});

//get category
const getBrands = asyncHandler(async (req, res) => {
    const response = await Brand.find();
    return res.json({
        success: response ? true : false,
        brands: response ? response : "Can't get brands",
    });
});

//update category
const updateBrand = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    const response = await Brand.findByIdAndUpdate(bid, req.body, {
        new: true,
    });
    return res.json({
        success: response ? true : false,
        updateBrand: response ? response : "Can't update brand",
    });
});

//delete category
const deleteBrand = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    const response = await Brand.findByIdAndDelete(bid, req.body);
    return res.json({
        success: response ? true : false,
        deletedBrand: response ? response : "Can't delete brand",
    });
});

module.exports = {
    createNewBrand,
    getBrands,
    updateBrand,
    deleteBrand,
};
