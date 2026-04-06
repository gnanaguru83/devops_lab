const express = require("express");
const {
  createUserByRole,
  listUsersByRole,
  updateUser,
  deleteUser
} = require("../controllers/adminController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth, authorize("admin"));

router.post("/users", createUserByRole);
router.get("/users/:role", listUsersByRole);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
