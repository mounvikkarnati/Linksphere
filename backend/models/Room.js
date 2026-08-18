const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ⚡ LATENCY: index for `Room.find({ "members.user": userId })` used
// by the dashboard ("my rooms") — avoids a full collection scan.
roomSchema.index({ "members.user": 1 });

module.exports = mongoose.model("Room", roomSchema);