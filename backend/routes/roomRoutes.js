const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const checkRoomAdmin = require("../middleware/checkRoomAdmin");

const {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomDetails,
  getMessages,
  deleteRoom,
  removeMember
} = require("../controllers/roomController");

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);

router.get("/my-rooms", protect, getMyRooms);
router.get("/:roomId/details", protect, getRoomDetails);
router.get("/:roomId/messages", protect, getMessages);

// Admin routes
router.delete("/:roomId", protect, checkRoomAdmin, deleteRoom);
router.delete("/:roomId/remove/:userId", protect, checkRoomAdmin, removeMember);

module.exports = router;