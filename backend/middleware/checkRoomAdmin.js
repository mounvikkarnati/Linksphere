const Room = require("../models/Room");

const checkRoomAdmin = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isAdmin = room.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.room = room; // attach room for next controller
    next();

  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkRoomAdmin;