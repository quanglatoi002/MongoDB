const router = require("express").Router();
const ctrlc = require("../controllers/blog");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

router.get("/", ctrlc.getBlogs);
router.get("/:bid/one", ctrlc.getBlog);
router.post("/", [verifyAccessToken, isAdmin], ctrlc.createNewBlog);
router.put(
    "/:bid/image",
    [verifyAccessToken, isAdmin],
    uploader.single("image"),
    ctrlc.uploadImageBlog
);

router.put("/:bid/like", [verifyAccessToken], ctrlc.likeBlogs);
router.put("/:bid/dislike", [verifyAccessToken], ctrlc.dislikeBlogs);
router.put("/:bid", [verifyAccessToken, isAdmin], ctrlc.updateBlog);
router.delete("/:bid", [verifyAccessToken, isAdmin], ctrlc.deleteBlog);
module.exports = router;
