const router = require("express").Router();
const ctrlc = require("../controllers/coupon");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", ctrlc.getCoupons);
router.post("/", [verifyAccessToken, isAdmin], ctrlc.createNewCoupon);
router.put("/:cid", [verifyAccessToken, isAdmin], ctrlc.updateCoupon);
router.delete("/:cid", [verifyAccessToken, isAdmin], ctrlc.deleteCoupon);

module.exports = router;
