const router = require("express").Router();
const ctrlc = require("../controllers/product");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

router.post("/", [verifyAccessToken, isAdmin], ctrlc.createProduct);
router.get("/", ctrlc.getProducts);
router.put("/ratings", verifyAccessToken, ctrlc.ratings);

router.put(
    "/:pid/uploadImage",
    [verifyAccessToken, isAdmin],
    uploader.array("images", 10),
    ctrlc.uploadImagesProduct
);
router.put("/:pid", [verifyAccessToken, isAdmin], ctrlc.updateProduct);
router.delete("/:pid", [verifyAccessToken, isAdmin], ctrlc.deleteProduct);
router.get("/:pid", ctrlc.getProduct);

module.exports = router;
