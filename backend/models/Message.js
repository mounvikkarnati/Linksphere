const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
{
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },

  // ✅ FIX: sender NOT required (AI messages use null)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // ✅ NEW: identify AI messages
  isAI: {
    type: Boolean,
    default: false,
  },

  content: {
    type: String,
    trim: true,
    maxlength: 2000,
  },

  // FILE SUPPORT (unchanged)
  fileUrl: String,
  publicId: String,
  fileType: String,
  fileName: String,
  fileSize: Number,

  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: String,
    },
  ],

},
{ timestamps: true }
);

/////////////////////////////////////////////////////
// ✅ FIX: correct validator (NO next parameter)
/////////////////////////////////////////////////////

messageSchema.pre("validate", function () {

  if (!this.content && !this.fileUrl) {
    throw new Error("Message must contain text or file");
  }

});

// ⚡ LATENCY: compound index so the hot chat-history query
// (filter by room + sort by createdAt) is index-backed instead of
// an in-memory sort over the entire room's messages.
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);