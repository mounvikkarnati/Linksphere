const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const Room = require("./models/Room");
const Message = require("./models/Message");
const User = require("./models/User");
const askAI = require("./utils/ai");

////////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////////

dotenv.config();

console.log(
  "Gemini key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

connectDB();

const app = express();
const server = http.createServer(app);

////////////////////////////////////////////////////////////
// SOCKET.IO SETUP
////////////////////////////////////////////////////////////

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://linksphere-bchat.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Make io available in routes
app.set("io", io);

////////////////////////////////////////////////////////////
// MIDDLEWARE
////////////////////////////////////////////////////////////

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://linksphere-bchat.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
// Attach io to every request
app.use((req, res, next) => {
  req.io = app.get("io");
  next();
});

////////////////////////////////////////////////////////////
// ROUTES
////////////////////////////////////////////////////////////

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("LinkSphere API running");
});

////////////////////////////////////////////////////////////
// SOCKET AUTH
////////////////////////////////////////////////////////////

io.use((socket, next) => {

  try {

    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("❌ Socket auth failed: No token");
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.id;

    next();

  }
  catch (err) {

    console.log("❌ Socket auth error:", err.message);

    next(new Error("Invalid token"));

  }

});

////////////////////////////////////////////////////////////
// SOCKET CONNECTION
////////////////////////////////////////////////////////////

io.on("connection", (socket) => {

  console.log("✅ User connected:", socket.userId);

  ////////////////////////////////////////////////////////////
  // JOIN ROOM
  ////////////////////////////////////////////////////////////

  socket.on("join_room", ({ roomId }) => {

    socket.join(roomId);

    console.log(`📥 User ${socket.userId} joined room ${roomId}`);

  });

  ////////////////////////////////////////////////////////////
  // USER TYPING
  ////////////////////////////////////////////////////////////

  socket.on("typing", async ({ roomId }) => {

    try {

      const user = await User.findById(socket.userId).select("username");

      if (!user) return;

      socket.to(roomId).emit("user_typing", {

        userId: socket.userId,
        username: user.username

      });

    }
    catch (err) {

      console.log("Typing error:", err.message);

    }

  });

  socket.on("stop_typing", ({ roomId }) => {

    socket.to(roomId).emit("user_stop_typing", {

      userId: socket.userId

    });

  });

  ////////////////////////////////////////////////////////////
  // NORMAL MESSAGE HANDLER
  ////////////////////////////////////////////////////////////

  socket.on("send_message", async ({ roomId, content }) => {

    try {

      if (!content || !content.trim()) return;

      const room = await Room.findOne({ roomId });

      if (!room) {
        console.log("❌ Room not found");
        return;
      }

      const message = await Message.create({

        room: room._id,
        sender: socket.userId,
        content: content.trim(),
        isAI: false

      });

      const populated = await message.populate("sender", "username");

      io.to(roomId).emit("receive_message", {

        _id: message._id,

        content: populated.content,

        sender: {
          _id: populated.sender._id,
          username: populated.sender.username
        },

        isAI: false,

        createdAt: message.createdAt

      });

      console.log("💬 User message saved");

    }
    catch (err) {

      console.error("❌ Message save error:", err);

    }

  });

  ////////////////////////////////////////////////////////////
  // AI CHAT HANDLER
  ////////////////////////////////////////////////////////////

  socket.on("ask_ai", async ({ roomId, question }) => {

    try {

      console.log("🤖 AI question received:", question);

      if (!question || !question.trim()) return;

      const room = await Room.findOne({ roomId });

      if (!room) {
        console.log("❌ Room not found");
        return;
      }

      ////////////////////////////////////////////////////////////
      // SHOW AI TYPING
      ////////////////////////////////////////////////////////////

      io.to(roomId).emit("user_typing", {

        userId: "ai",
        username: "LinkSphere AI"

      });

      ////////////////////////////////////////////////////////////
      // FETCH CHAT HISTORY
      ////////////////////////////////////////////////////////////

      const messages = await Message.find({
        room: room._id
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "username");

      const chatHistory = messages.reverse().map(msg => {

        if (msg.isAI)
          return `AI: ${msg.content}`;

        if (msg.sender?.username)
          return `${msg.sender.username}: ${msg.content}`;

        return "";

      }).join("\n");

      ////////////////////////////////////////////////////////////
      // BUILD PROMPT
      ////////////////////////////////////////////////////////////

      const prompt = `
You are LinkSphere AI inside a group chat.

You help users and answer questions based on chat history.

Chat History:
${chatHistory}

User Question:
${question}

Reply naturally and clearly.
`;

      ////////////////////////////////////////////////////////////
      // CALL GEMINI
      ////////////////////////////////////////////////////////////

      console.log("📤 Sending prompt to Gemini...");

      const aiReply = await askAI(prompt);

      console.log("📥 Gemini reply received");

      ////////////////////////////////////////////////////////////
      // SAVE AI MESSAGE
      ////////////////////////////////////////////////////////////

const aiMessage = await Message.create({
  room: room._id,
  sender: null,

  // save BOTH question and answer together
  content: `Question: ${question}\nAnswer: ${aiReply}`,

  isAI: true
});

      ////////////////////////////////////////////////////////////
      // STOP TYPING
      ////////////////////////////////////////////////////////////

      io.to(roomId).emit("user_stop_typing", {

        userId: "ai"

      });

      ////////////////////////////////////////////////////////////
      // SEND AI MESSAGE
      ////////////////////////////////////////////////////////////

  io.to(roomId).emit("receive_message", {
  _id: aiMessage._id,

  // show question + answer in UI
  content: `Question: ${question}\nAnswer: ${aiReply}`,

  sender: {
    _id: "ai",
    username: "LinkSphere AI"
  },

  isAI: true,
  createdAt: aiMessage.createdAt
});

      console.log("✅ AI reply saved and sent");

    }
    catch (err) {

      console.error("❌ AI ERROR:", err);

      io.to(roomId).emit("user_stop_typing", {

        userId: "ai"

      });

    }

  });

  ////////////////////////////////////////////////////////////
  // DISCONNECT
  ////////////////////////////////////////////////////////////

  socket.on("disconnect", () => {

    console.log("🔌 User disconnected:", socket.userId);

  });

});

////////////////////////////////////////////////////////////
// START SERVER
////////////////////////////////////////////////////////////

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);

});