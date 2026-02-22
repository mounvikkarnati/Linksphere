const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const Room = require("./models/Room");
const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BChat API Running...");
});

const protect = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);


// 🔐 SOCKET AUTH
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Not authorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});


// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("join_room", async ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("send_message", async ({ roomId, content }) => {
    try {
      if (!content) return;

      const room = await Room.findOne({ roomId });
      if (!room) return;

      const message = await Message.create({
        room: room._id,
        sender: socket.userId,
        content
      });

      const populatedMessage = await message.populate("sender", "username");

      io.to(roomId).emit("receive_message", {
        content: populatedMessage.content,
       sender: {
  _id: populatedMessage.sender._id,
  username: populatedMessage.sender.username
},
        createdAt: populatedMessage.createdAt
      });

    } catch (err) {
      console.error("Message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});