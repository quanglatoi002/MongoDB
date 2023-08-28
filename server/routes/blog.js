const router = require("express").Router();
const ctrlc = require("../controllers/blog");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", ctrlc.getBlogs);
router.post("/", [verifyAccessToken, isAdmin], ctrlc.createNewBlog);
// router.put("/:bid", [verifyAccessToken, isAdmin], ctrlc.updateBlog);
router.put("/:like", [verifyAccessToken, isAdmin], ctrlc.likeBlogs);
module.exports = router;
