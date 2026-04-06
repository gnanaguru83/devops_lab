const express = require("express");
const {
  markAttendance,
  getMyAttendance,
  getStudentAttendance,
  getAttendanceByDate,
  getStudentsForMarking
} = require("../controllers/attendanceController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/students", authorize("admin", "teacher"), getStudentsForMarking);
router.post("/mark", authorize("teacher", "admin"), markAttendance);
router.get("/me", authorize("student"), getMyAttendance);
router.get("/student/:studentId", authorize("admin", "teacher"), getStudentAttendance);
router.get("/", authorize("admin", "teacher"), getAttendanceByDate);

module.exports = router;
