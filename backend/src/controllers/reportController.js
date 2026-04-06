const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const Attendance = require("../models/Attendance");

const buildDateRange = (type, value) => {
  let start;
  let end;

  if (type === "daily") {
    start = new Date(value || new Date());
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else {
    const [year, month] = (value || "").split("-").map(Number);
    if (!year || !month) {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(year, month - 1, 1);
    }
    end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  }

  return { start, end };
};

const fetchReportData = async (start, end) => {
  const records = await Attendance.find({ date: { $gte: start, $lt: end } })
    .populate("student", "name studentCode className")
    .populate("teacher", "name")
    .sort({ date: -1, createdAt: -1 });

  return records.map((record) => ({
    date: new Date(record.date).toISOString().split("T")[0],
    studentName: record.student?.name || "N/A",
    studentCode: record.student?.studentCode || "N/A",
    className: record.student?.className || "N/A",
    status: record.status,
    markedBy: record.teacher?.name || "N/A",
    remarks: record.remarks || ""
  }));
};

const exportCsv = (res, data, filename) => {
  const fields = ["date", "studentName", "studentCode", "className", "status", "markedBy", "remarks"];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);
  res.header("Content-Type", "text/csv");
  res.attachment(filename);
  res.send(csv);
};

const exportPdf = (res, data, title, filename) => {
  const doc = new PDFDocument({ margin: 36, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(title);
  doc.moveDown();
  doc.fontSize(10);

  data.forEach((row, index) => {
    doc.text(
      `${index + 1}. ${row.date} | ${row.studentName} (${row.studentCode}) | ${row.className} | ${row.status} | ${row.markedBy}`
    );
    if (row.remarks) doc.text(`   Remarks: ${row.remarks}`);
  });

  if (!data.length) {
    doc.text("No attendance records found for selected range.");
  }

  doc.end();
};

const dailyReport = async (req, res) => {
  const { date, format = "csv" } = req.query;
  const { start, end } = buildDateRange("daily", date);
  const data = await fetchReportData(start, end);

  if (format === "pdf") {
    return exportPdf(res, data, `Daily Attendance Report (${start.toISOString().split("T")[0]})`, "daily-report.pdf");
  }

  return exportCsv(res, data, "daily-report.csv");
};

const monthlyReport = async (req, res) => {
  const { month, format = "csv" } = req.query;
  const { start, end } = buildDateRange("monthly", month);
  const data = await fetchReportData(start, end);

  const monthLabel = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
  if (format === "pdf") {
    return exportPdf(res, data, `Monthly Attendance Report (${monthLabel})`, "monthly-report.pdf");
  }

  return exportCsv(res, data, "monthly-report.csv");
};

module.exports = { dailyReport, monthlyReport };
