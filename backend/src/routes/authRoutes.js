const express = require("express");
const { login, me, registerInitialAdmin } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/register-admin", registerInitialAdmin);
router.post("/login", login);
router.get("/me", auth, me);

module.exports = router;
