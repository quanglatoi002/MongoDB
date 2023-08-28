const router = require("express").Router();
const ctrlc = require("../controllers/blogCategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrlc.createCategory);
router.get("/", ctrlc.getCategories);
router.put("/:bcid", [verifyAccessToken, isAdmin], ctrlc.updateCategory);
router.delete("/:bcid", [verifyAccessToken, isAdmin], ctrlc.deleteCategory);
module.exports = router;
