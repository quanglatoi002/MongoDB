const router = require("express").Router();
const ctrlc = require("../controllers/product");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrlc.createProduct);
router.get("/", ctrlc.getProducts);
router.put("/ratings", verifyAccessToken, ctrlc.ratings);

router.put("/:pid", [verifyAccessToken, isAdmin], ctrlc.updateProduct);
router.delete("/:pid", [verifyAccessToken, isAdmin], ctrlc.deleteProduct);
router.get("/:pid", ctrlc.getProduct);

module.exports = router;
