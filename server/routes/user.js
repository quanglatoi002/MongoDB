const router = require("express").Router();
const ctrlc = require("../controllers/user");
router.post("/register", ctrlc.register);

module.exports = router;
