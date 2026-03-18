require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
// ✅ THIS MUST BE CALLED
connectDB();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const isAllowedOrigin = (origin) => {
  return (
    !origin || origin.includes("vercel.app") || origin.includes("localhost")
  );
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

// ✅ FIX: allow dynamic origins (Vercel + localhost)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // ✅ VERY IMPORTANT: handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend working");
});

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/ml", require("./routes/mlRoutes"));

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
