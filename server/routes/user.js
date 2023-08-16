const router = require("express").Router();
const ctrlc = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/register", ctrlc.register);
router.post("/login", ctrlc.login);
router.get("/current", verifyAccessToken, ctrlc.getCurrent);

module.exports = router;
