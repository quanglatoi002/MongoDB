const router = require("express").Router();
const ctrlc = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/register", ctrlc.register);
router.post("/login", ctrlc.login);
router.get("/current", verifyAccessToken, ctrlc.getCurrent);
router.post("/refreshtoken", ctrlc.refreshAccessToken);
router.get("/logout", ctrlc.logout);
router.get("/forgotpassword", ctrlc.forgotPassword);
router.put("/resetPassword", ctrlc.resetPassword);
module.exports = router;
