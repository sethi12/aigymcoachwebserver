require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authroutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const exerciseRoutes =require("./routes/exerciseRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// Log every API request
app.use((req, res, next) => {
  const time = new Date().toLocaleString();

  console.log("\n=================================");
  console.log(`Time   : ${time}`);
  console.log(`Method : ${req.method}`);
  console.log(`Route  : ${req.originalUrl}`);
  console.log(`IP     : ${req.ip}`);

  if (Object.keys(req.body || {}).length > 0) {
    console.log("Body   :", req.body);
  }

  console.log("=================================\n");

  next();
});

app.use("/api/auth", authroutes);
app.use("/api/member", memberRoutes);
app.use(
  "/api/exercise",
  exerciseRoutes
);
app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});