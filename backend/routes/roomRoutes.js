const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const checkRoomAdmin = require("../middleware/checkRoomAdmin");
const upload = require("../middleware/upload");

const {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomDetails,
  getMessages,
  deleteRoom,
  removeMember,
  reactToMessage,
  uploadFileMessage,
  extendRoomExpiry
} = require("../controllers/roomController");

//////////////////////////////////////////////////////
// ROOM CREATION & JOIN
//////////////////////////////////////////////////////

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);

//////////////////////////////////////////////////////
// FETCH DATA
//////////////////////////////////////////////////////

router.get("/my-rooms", protect, getMyRooms);
router.get("/:roomId/details", protect, getRoomDetails);
router.get("/:roomId/messages", protect, getMessages);

//////////////////////////////////////////////////////
// FILE UPLOAD (Realtime handled inside controller)
//////////////////////////////////////////////////////

router.post(
  "/:roomId/upload",
  protect,
  upload.single("file"),
  uploadFileMessage
);

//////////////////////////////////////////////////////
// MESSAGE REACTIONS (Realtime handled inside controller)
//////////////////////////////////////////////////////

router.post(
  "/message/:messageId/react",
  protect,
  reactToMessage
);

//////////////////////////////////////////////////////
// ADMIN ROUTES
//////////////////////////////////////////////////////

router.delete(
  "/:roomId",
  protect,
  checkRoomAdmin,
  deleteRoom
);

router.delete(
  "/:roomId/remove/:userId",
  protect,
  checkRoomAdmin,
  removeMember
);

router.put(
  "/:roomId/extend-expiry",
  protect,
  checkRoomAdmin,
  extendRoomExpiry
);

//////////////////////////////////////////////////////

module.exports = router;