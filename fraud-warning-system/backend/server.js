require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ FINAL CORS FIX (simple + working)
app.use(cors());

// ✅ IMPORTANT: handle preflight
app.options("*", cors());

// Middleware
app.use(express.json());

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store io globally
global.io = io;

// Socket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/ml", require("./routes/mlRoutes"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", message: "Fraud Warning System Backend Running" }),
);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for real-time alerts`);
});

module.exports = { app, io };
