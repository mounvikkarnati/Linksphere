const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomDetails,
  getMessages
} = require("../controllers/roomController");

// Create room
router.post("/create", protect, createRoom);

// Join room
router.post("/join", protect, joinRoom);

// Get all rooms for logged-in user
router.get("/my-rooms", protect, getMyRooms);

// Get single room details
router.get("/:roomId/details", protect, getRoomDetails);

// Get room messages
router.get("/:roomId/messages", protect, getMessages);

module.exports = router;