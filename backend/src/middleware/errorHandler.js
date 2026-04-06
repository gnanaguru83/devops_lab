const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate value found" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
