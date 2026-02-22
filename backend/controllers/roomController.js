const Room = require("../models/Room");
const bcrypt = require("bcryptjs");
const generateRoomId = require("../utils/generateRoomId");

// CREATE ROOM
exports.createRoom = async (req, res) => {
  try {
    const { name, password, expiresAt } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Name and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let roomId;
    let existingRoom;

    // Ensure unique roomId
    do {
      roomId = generateRoomId();
      existingRoom = await Room.findOne({ roomId });
    } while (existingRoom);

    const room = await Room.create({
      name,
      roomId,
      password: hashedPassword,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "admin",
        },
      ],
      expiresAt: expiresAt || null,
    });

    res.status(201).json({
      message: "Room created successfully",
      roomId: room.roomId,
    });

  } catch (error) {
    console.log("Create Room Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};