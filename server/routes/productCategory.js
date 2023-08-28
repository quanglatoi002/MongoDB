const router = require("express").Router();
const ctrlc = require("../controllers/productCategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrlc.createCategory);
router.get("/", ctrlc.getCategories);
router.put("/:pcid", [verifyAccessToken, isAdmin], ctrlc.updateCategory);
router.delete("/:pcid", [verifyAccessToken, isAdmin], ctrlc.deleteCategory);
module.exports = router;
