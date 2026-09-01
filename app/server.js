const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "DevOps Project #3 is running!",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
