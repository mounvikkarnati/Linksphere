const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    fileUrl: String,
    fileType: String,
    fileName: String,
    fileSize: Number,

    // ✅ REACTIONS FIELD
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure message has text OR file
messageSchema.pre("validate", function () {
  if (!this.content && !this.fileUrl) {
    throw new Error("Message must contain text or file");
  }
});

module.exports = mongoose.model("Message", messageSchema);