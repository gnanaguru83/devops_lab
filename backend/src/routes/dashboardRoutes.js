const express = require("express");
const {
  adminDashboard,
  teacherDashboard,
  studentDashboard
} = require("../controllers/dashboardController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/admin", auth, authorize("admin"), adminDashboard);
router.get("/teacher", auth, authorize("teacher"), teacherDashboard);
router.get("/student", auth, authorize("student"), studentDashboard);

module.exports = router;
