const express = require("express");
const { dailyReport, monthlyReport } = require("../controllers/reportController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth, authorize("admin", "teacher"));
router.get("/daily", dailyReport);
router.get("/monthly", monthlyReport);

module.exports = router;
