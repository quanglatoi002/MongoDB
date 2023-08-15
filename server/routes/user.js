const router = require("express").Router();
const ctrlc = require("../controllers/user");

router.post("/register", ctrlc.register);
router.post("/login", ctrlc.login);

module.exports = router;
