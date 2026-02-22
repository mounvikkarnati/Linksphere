const Room = require("../models/Room");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const generateRoomId = require("../utils/generateRoomId");
const sendRoomDetailsEmail = require("../utils/sendRoomDetailsEmail");

// =======================
// CREATE ROOM
// =======================
exports.createRoom = async (req, res) => {
  try {
    const { name, password, expiresIn } = req.body;

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

    let expiresAt = null;

    if (expiresIn && expiresIn > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    const room = await Room.create({
      name,
      roomId,
      password: hashedPassword,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "admin",
          joinedAt: new Date()
        }
      ],
      expiresAt
    });
    // Send room details email to admin
await sendRoomDetailsEmail({
  to: req.user.email,
  roomName: name,
  roomId: roomId,
  password: password, // original password (not hashed)
  expiresAt: expiresAt
});
    res.status(201).json({
      message: "Room created successfully",
      roomId: room.roomId
    });

  } catch (error) {
    console.error("Create Room Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// JOIN ROOM
// =======================
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, password } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({ message: "Room ID and password required" });
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check expiry
    if (room.expiresAt && new Date() > room.expiresAt) {
      return res.status(400).json({ message: "Room has expired" });
    }

    const isMatch = await bcrypt.compare(password, room.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const alreadyMember = room.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already a member of this room" });
    }

    room.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date()
    });

    await room.save();

    res.status(200).json({ message: "Joined room successfully" });

  } catch (error) {
    console.error("Join Room Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// GET MY ROOMS
// =======================
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      "members.user": req.user._id
    });

    const formatted = rooms.map(room => {
      const member = room.members.find(
        m => m.user.toString() === req.user._id.toString()
      );

      return {
        id: room._id,
        name: room.name,
        roomId: room.roomId,
        role: member.role,
        members: room.members.length,
        expiresAt: room.expiresAt
      };
    });

    res.json({ rooms: formatted });

  } catch (error) {
    console.error("Get My Rooms Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// GET ROOM DETAILS
// =======================
exports.getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findOne({
      roomId: req.params.roomId
    }).populate("members.user", "username");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const member = room.members.find(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isExpired =
      room.expiresAt && new Date() > room.expiresAt;

    res.json({
      room,
      isAdmin: member.role === "admin",
      isExpired,
      membersCount: room.members.length
    });

  } catch (error) {
    console.error("Get Room Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// GET ROOM MESSAGES
// =======================
exports.getMessages = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await Message.find({
      room: room._id
    })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json({ messages });

  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteRoom = async (req, res) => {
  try {
    const room = req.room;

    await Message.deleteMany({ room: room._id });
    await room.deleteOne();

    res.json({ message: "Room deleted successfully" });

  } catch (error) {
    console.error("Delete Room Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const room = req.room;
    const { userId } = req.params;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        message: "Admin cannot remove themselves"
      });
    }

    room.members = room.members.filter(
      member => member.user.toString() !== userId
    );

    await room.save();

    res.json({ message: "Member removed successfully" });

  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// EXTEND ROOM EXPIRY
// =======================
exports.extendRoomExpiry = async (req, res) => {
  try {
    const { expiresIn } = req.body; // number of days
    const { roomId } = req.params;

    if (!expiresIn || expiresIn < 0) {
      return res.status(400).json({
        message: "Valid expiry duration required"
      });
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    let newExpiry = null;

    if (expiresIn > 0) {
      newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + expiresIn);
    }

    room.expiresAt = newExpiry;
    await room.save();

    res.json({
      message: "Room expiry updated successfully",
      expiresAt: room.expiresAt
    });

  } catch (error) {
    console.error("Extend Expiry Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadFileMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const message = await Message.create({
      room: room._id,
      sender: req.user._id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype
    });

    const populatedMessage = await message.populate("sender", "username");

    res.json({ message: populatedMessage });

  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};