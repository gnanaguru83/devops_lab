const Attendance = require("../models/Attendance");
const User = require("../models/User");

const getStartOfDay = (date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

const markAttendance = async (req, res) => {
  const { date, records } = req.body;
  const allowedStatus = ["Present", "Absent", "Late"];
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "records array is required" });
  }
  const hasInvalidRecord = records.some(
    (record) => !record.studentId || !allowedStatus.includes(record.status)
  );
  if (hasInvalidRecord) {
    return res.status(400).json({ message: "Each record must include valid studentId and status" });
  }

  const attendanceDate = getStartOfDay(date || new Date());
  const bulkOps = records.map((record) => ({
    updateOne: {
      filter: { student: record.studentId, date: attendanceDate },
      update: {
        $set: {
          status: record.status,
          remarks: record.remarks || "",
          teacher: req.user._id
        }
      },
      upsert: true
    }
  }));

  await Attendance.bulkWrite(bulkOps, { ordered: false });
  res.json({ message: "Attendance marked successfully" });
};

const getMyAttendance = async (req, res) => {
  const attendance = await Attendance.find({ student: req.user._id })
    .populate("teacher", "name")
    .sort({ date: -1 });
  res.json(attendance);
};

const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;
  const attendance = await Attendance.find({ student: studentId })
    .populate("student", "name studentCode className")
    .populate("teacher", "name")
    .sort({ date: -1 });
  res.json(attendance);
};

const getAttendanceByDate = async (req, res) => {
  const date = getStartOfDay(req.query.date || new Date());
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  const attendance = await Attendance.find({ date: { $gte: date, $lt: nextDate } })
    .populate("student", "name studentCode className")
    .populate("teacher", "name")
    .sort({ createdAt: -1 });
  res.json(attendance);
};

const getStudentsForMarking = async (req, res) => {
  const students = await User.find({ role: "student", isActive: true })
    .select("name studentCode className")
    .sort({ name: 1 });
  res.json(students);
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getStudentAttendance,
  getAttendanceByDate,
  getStudentsForMarking
};
