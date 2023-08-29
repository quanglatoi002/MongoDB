const router = require("express").Router();
const ctrlc = require("../controllers/brand");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrlc.createNewBrand);
router.get("/", ctrlc.getBrands);
router.put("/:bid", [verifyAccessToken, isAdmin], ctrlc.updateBrand);
router.delete("/:bid", [verifyAccessToken, isAdmin], ctrlc.deleteBrand);
module.exports = router;
