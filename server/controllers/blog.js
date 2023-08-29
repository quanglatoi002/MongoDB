const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");

//create
const createNewBlog = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;
    if (!title || !description || !category) throw new Error("Missing inputs");
    const response = await Blog.create(req.body);
    return res.json({
        success: response ? true : false,
        createBlog: response ? response : "Can't create new blog",
    });
});

//update blog
const updateBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
    const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true });
    return res.json({
        success: response ? true : false,
        updatedBlog: response ? response : "Can't update blog",
    });
});

//get blog
const getBlogs = asyncHandler(async (req, res) => {
    const response = await Blog.find();
    return res.json({
        success: response ? true : false,
        updatedBlog: response ? response : "Can't get blogs",
    });
});
// Có 2 nút LIKE và DISLIKE
/*
 Khi người dùng like 1 bài blog thì:
 b1 Check xem ng đó tc khi nhấn like đã nhấn dislike ch? if rồi thì bỏ dislike
 b2 Check xem tc đó ng đó đã like ch ch => nếu like rồi thì bỏ like / thêm like
*/

//like in blog
const likeBlogs = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { bid } = req.params;
    if (!bid) throw new Error("Missing inputs");
    const blog = await Blog.findById(bid);
    const alreadyDisliked = blog?.dislikes?.includes(_id);
    // kéo id và cập nhật lại giá trị
    if (alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(
            bid,
            {
                $pull: { dislikes: _id },
            },
            { new: true }
        );
        return res.json({
            success: response ? true : false,
            rs: response,
        });
    }
    //kiểm tra xem đã like ch?
    const isLiked = blog?.likes?.includes(_id);
    if (isLiked) {
        const response = await Blog.findByIdAndUpdate(
            bid,
            {
                $pull: { likes: _id },
            },
            { new: true }
        );
        return res.json({
            success: response ? true : false,
            rs: response,
        });
    } else {
        const response = await Blog.findByIdAndUpdate(
            bid,
            {
                $push: { likes: _id },
            },
            { new: true }
        );
        return res.json({
            success: response ? true : false,
            rs: response,
        });
    }
});

//dislike in blog
const dislikeBlogs = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { bid } = req.params;
    console.log(bid);
    if (!bid) throw new Error("Missing inputs");
    const blog = await Blog.findById(bid);
    const alreadyLiked = blog?.likes?.includes(_id);
    // kéo id và cập nhật lại giá trị
    if (alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(
            bid,
            {
                $pull: { likes: _id },
            },
            { new: true }
        );
        return res.json({
            success: response ? true : false,
            rs: response,
        });
    }
    //kiểm tra xem đã dislike ch?
    const isDisliked = blog?.dislikes?.includes(_id);
    if (isDisliked) {
        const response = await Blog.findByIdAndUpdate(
            bid,
            {
                $pull: { dislikes: _id },
            },
            { new: true }
        );
        return res.json({
            success: response ? true : false,
            rs: response,
        });
    } else {
        const response = await Blog.findByIdAndUpdate(
            bid,
            {
                $push: { dislikes: _id },
            },
            { new: true }
        );
        return res.json({
            success: response ? true : false,
            rs: response,
        });
    }
});

// lấy thông tin người like và disliked
const getBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    // tự động tăng thêm 1 khi có ng click vào bài
    const blog = await Blog.findByIdAndUpdate(
        bid,
        { $inc: { numberViews: +1 } },
        { new: true }
    )
        .populate("likes", "firstName lastName")
        .populate("dislikes", "firstName lastName");
    return res.json({
        success: blog ? true : false,
        rs: blog,
    });
});

//delete
const deleteBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params;
    // tự động tăng thêm 1 khi có ng click vào bài
    const blog = await Blog.findByIdAndDelete(bid);

    return res.json({
        success: blog ? true : false,
        deletedBlog: blog || "Something went wrong",
    });
});

module.exports = {
    createNewBlog,
    updateBlog,
    getBlogs,
    likeBlogs,
    dislikeBlogs,
    getBlog,
    deleteBlog,
};
