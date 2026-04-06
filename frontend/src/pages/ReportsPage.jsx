import { useState } from "react";
import api from "../api/client";

const ReportsPage = () => {
  const [type, setType] = useState("daily");
  const [format, setFormat] = useState("csv");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState("");

  const download = async () => {
    try {
      setStatus("Generating report...");
      const endpoint = type === "daily" ? "/reports/daily" : "/reports/monthly";
      const params = { format };
      if (type === "daily") params.date = date;
      if (type === "monthly") params.month = month;

      const response = await api.get(endpoint, { params, responseType: "blob" });
      const contentType = response.headers["content-type"] || "";
      const extension = contentType.includes("pdf") ? "pdf" : "csv";

      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-attendance-report.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("Report downloaded");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to generate report");
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Attendance Reports</h2>
        <p>Download daily or monthly reports as CSV or PDF.</p>
      </section>
      <section className="card">
        <div className="form-grid">
          <label>
            Report Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          {type === "daily" ? (
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          ) : (
            <label>
              Month
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </label>
          )}
          <label>
            Format
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          <button className="primary-btn" type="button" onClick={download}>
            Download Report
          </button>
          {status && <div className="success">{status}</div>}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
