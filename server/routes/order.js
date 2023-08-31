const router = require("express").Router();
const ctrlc = require("../controllers/order");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
// const uploader = require("../config/cloudinary.config");

router.post("/", [verifyAccessToken], ctrlc.createOrder);
router.put("/:oid/status", [verifyAccessToken, isAdmin], ctrlc.updateStatus);
// router.post("/", [verifyAccessToken, isAdmin], ctrlc.createNewBlog);

module.exports = router;
