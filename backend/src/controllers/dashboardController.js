const Attendance = require("../models/Attendance");
const User = require("../models/User");

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const adminDashboard = async (req, res) => {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [students, teachers, todayAttendance, presentCount, absentCount, lateCount] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "teacher", isActive: true }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: "Present" }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: "Absent" }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: "Late" })
  ]);

  res.json({
    students,
    teachers,
    todayAttendance,
    statusBreakdown: {
      Present: presentCount,
      Absent: absentCount,
      Late: lateCount
    }
  });
};

const teacherDashboard = async (req, res) => {
  const [students, recordsMarked] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    Attendance.countDocuments({ teacher: req.user._id })
  ]);

  const recent = await Attendance.find({ teacher: req.user._id })
    .populate("student", "name studentCode")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ students, recordsMarked, recent });
};

const studentDashboard = async (req, res) => {
  const records = await Attendance.find({ student: req.user._id });
  const total = records.length;
  const present = records.filter((record) => record.status === "Present").length;
  const late = records.filter((record) => record.status === "Late").length;
  const attendancePercentage = total ? Number((((present + late * 0.5) / total) * 100).toFixed(2)) : 0;

  res.json({
    total,
    present,
    absent: records.filter((record) => record.status === "Absent").length,
    late,
    attendancePercentage
  });
};

module.exports = { adminDashboard, teacherDashboard, studentDashboard };
