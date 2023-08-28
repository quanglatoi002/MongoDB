const router = require("express").Router();
const ctrlc = require("../controllers/blog");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", ctrlc.getBlogs);
router.post("/", [verifyAccessToken, isAdmin], ctrlc.createNewBlog);
router.put("/:bid/like", [verifyAccessToken], ctrlc.likeBlogs);
router.put("/:bid/dislike", [verifyAccessToken], ctrlc.dislikeBlogs);
router.put("/:bid", [verifyAccessToken, isAdmin], ctrlc.updateBlog);
module.exports = router;
