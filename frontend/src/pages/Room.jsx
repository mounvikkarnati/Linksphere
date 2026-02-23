import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const skipScrollRef = useRef(false);
  const [activeReactionMessage, setActiveReactionMessage] = useState(null);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    fetchUser();
    fetchRoomDetails();
    fetchMessages();

    const newSocket = io('https://linksphere-backend-k60s.onrender.com/', {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomId });
    });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error) => {
      toast.error(error.message);
    });

    newSocket.on("user_typing", ({ userId, username }) => {
      if (userId === user?._id) return;

      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    });

    newSocket.on("user_stop_typing", ({ userId }) => {
      setTypingUsers(prev =>
        prev.filter(u => u.userId !== userId)
      );
    });

    // Handle window resize to close sidebar on larger screens
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      newSocket.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [roomId]);

  useEffect(() => {
    if (!skipScrollRef.current) {
      scrollToBottom();
    }
    skipScrollRef.current = false;
  }, [messages]);

  // ===============================
  // FETCH USER
  // ===============================
  const fetchUser = async () => {
    try {
      const res = await axios.get('https://linksphere-backend-k60s.onrender.com/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('User fetch failed');
    }
  };

  // ===============================
  // FETCH ROOM DETAILS
  // ===============================
  const fetchRoomDetails = async () => {
    try {
      const res = await axios.get(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/${roomId}/details`
      );

      setRoom({
        ...res.data.room,
        isAdmin: res.data.isAdmin
      });

      setMembers(res.data.room.members);

    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Not authorized');
        navigate('/dashboard');
      }
    }
  };

  // ===============================
  // FETCH MESSAGES
  // ===============================
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/${roomId}/messages`
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Message fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE ROOM
  // ===============================
  const handleDeleteRoom = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/${roomId}`
      );

      toast.success('Room deleted');
      navigate('/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ===============================
  // EXTEND ROOM EXPIRY (ADMIN ONLY)
  // ===============================
  const handleExtendExpiry = async (days) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/${roomId}/extend-expiry`,
        { expiresIn: days },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(`Room extended by ${days} days`);
      fetchRoomDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to extend room");
    }
  };

  // ===============================
  // REMOVE MEMBER
  // ===============================
  const handleRemoveMember = async (userId) => {
    const confirmRemove = window.confirm("Remove this member?");
    if (!confirmRemove) return;

    try {
      await axios.delete(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/${roomId}/remove/${userId}`
      );

      toast.success('Member removed');
      fetchRoomDetails();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  // ===============================
  // SEND MESSAGE
  // ===============================
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      roomId,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  // ===============================
  // REACT TO MESSAGE
  // ===============================
  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem("token");

      skipScrollRef.current = true;

      await axios.post(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/message/${messageId}/react`,
        { emoji },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchMessages();

    } catch (err) {
      console.log(err.response?.data || err.message);
      toast.error("Reaction failed");
    }
  };

  // ===============================
  // FILE UPLOAD
  // ===============================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `https://linksphere-backend-k60s.onrender.com/api/rooms/${roomId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages(prev => [...prev, res.data.message]);

    } catch (err) {
      toast.error("Upload failed");
    }
    e.target.value = null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-b border-white/10 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            ☰
          </button>
          
          <div className="flex-1 text-center mx-2">
            <h2 className="text-lg font-bold truncate">{room?.name}</h2>
            <p className="text-xs text-[#9CA3AF] truncate">{roomId}</p>
          </div>

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
            {members.length}
          </div>
        </div>
      </header>

      {/* ================= MOBILE BACKDROP ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ================= MOBILE SIDEBAR ================= */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-72 bg-black/95 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-50 md:hidden overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Room Info</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white text-xl p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <button
          onClick={() => {
            navigate('/dashboard');
            setSidebarOpen(false);
          }}
          className="text-[#9CA3AF] hover:text-white transition-colors duration-200 mb-4 text-left"
        >
          ← Back to Dashboard
        </button>

        <div className="border-b border-white/10 pb-4 mb-4">
          <h2 className="text-2xl font-bold break-words">{room?.name}</h2>
          <p className="text-sm text-[#9CA3AF] font-mono break-all">{roomId}</p>

          {room?.isAdmin && (
            <div className="space-y-2 mt-4">
              <button
                onClick={() => {
                  handleDeleteRoom();
                  setSidebarOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm w-full"
              >
                Delete Room
              </button>

              <button
                onClick={() => {
                  handleExtendExpiry(7);
                  setSidebarOpen(false);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm w-full"
              >
                Extend 7 Days
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm text-[#9CA3AF] mb-3 sticky top-0 bg-black/95 py-2">
            Members ({members.length})
          </h3>

          <div className="space-y-2">
            {members.map(member => (
              <div
                key={member.user._id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm block truncate">
                    {member.user.username}
                  </span>
                  {member.role === 'admin' && (
                    <span className="text-xs text-primary">
                      Admin
                    </span>
                  )}
                </div>

                {room?.isAdmin && member.user._id !== user?._id && (
                  <button
                    onClick={() => {
                      handleRemoveMember(member.user._id);
                      setSidebarOpen(false);
                    }}
                    className="text-red-400 text-xs hover:text-red-300 ml-2 flex-shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.aside>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:flex fixed left-0 top-0 h-full w-72 glass-card m-4 p-6 flex-col"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#9CA3AF] hover:text-white transition-colors duration-200 mb-4 text-left"
        >
          ← Back to Dashboard
        </button>

        <div className="border-b border-white/10 pb-4 mb-4">
          <h2 className="text-2xl font-bold break-words">{room?.name}</h2>
          <p className="text-sm text-[#9CA3AF] font-mono break-all">{roomId}</p>

          {room?.isAdmin && (
            <div className="space-y-2 mt-4">
              <button
                onClick={handleDeleteRoom}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm w-full"
              >
                Delete Room
              </button>

              <button
                onClick={() => handleExtendExpiry(7)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm w-full"
              >
                Extend 7 Days
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm text-[#9CA3AF] mb-3 sticky top-0 bg-black/95 py-2">
            Members ({members.length})
          </h3>

          <div className="space-y-2">
            {members.map(member => (
              <div
                key={member.user._id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm block truncate">
                    {member.user.username}
                  </span>
                  {member.role === 'admin' && (
                    <span className="text-xs text-primary">
                      Admin
                    </span>
                  )}
                </div>

                {room?.isAdmin && member.user._id !== user?._id && (
                  <button
                    onClick={() => handleRemoveMember(member.user._id)}
                    className="text-red-400 text-xs hover:text-red-300 ml-2 flex-shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.aside>

      {/* ================= MAIN CHAT AREA ================= */}
      <main className="md:ml-80 flex flex-col h-screen pt-16 md:pt-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.sender?._id === user?._id;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative flex items-start ${
                  isOwnMessage ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="relative group max-w-[85%] md:max-w-[70%]">
                  <div
                    className={`rounded-2xl p-3 ${
                      isOwnMessage
                        ? 'bg-primary/20 border border-primary/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs text-primary mb-1 font-semibold">
                        {message.sender?.username}
                      </p>
                    )}

                    {message.content && (
                      <p className="text-sm md:text-base break-words whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}

                    {message.fileUrl && (
                      <a
                        href={message.fileUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          fetch(message.fileUrl)
                            .then(res => res.blob())
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = message.fileName;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            });
                        }}
                        className="text-blue-400 hover:text-blue-300 underline mt-2 block cursor-pointer text-sm break-all"
                      >
                        📎 {message.fileName}
                      </a>
                    )}

                    <p className="text-xs text-[#9CA3AF] text-right mt-1">
                      {formatTime(message.createdAt)}
                    </p>

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(
                          message.reactions.reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([emoji, count]) => (
                          <span
                            key={message._id + emoji}
                            className="text-xs bg-white/10 px-2 py-1 rounded-full"
                          >
                            {emoji} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Button */}
                  <button
                    onClick={() =>
                      setActiveReactionMessage(
                        activeReactionMessage === message._id ? null : message._id
                      )
                    }
                    className={`absolute top-1 ${
                      isOwnMessage ? 'left-0 -translate-x-8' : 'right-0 translate-x-8'
                    } text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100`}
                  >
                    😊
                  </button>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {activeReactionMessage === message._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className={`
                          absolute z-50
                          ${isOwnMessage ? 'right-0' : 'left-0'}
                          -top-14
                          bg-black/95
                          backdrop-blur-md
                          border border-white/10
                          rounded-full
                          px-3 py-2
                          flex gap-2 md:gap-3
                          shadow-xl
                          flex-wrap
                          max-w-[200px] md:max-w-none
                        `}
                      >
                        {["🔥", "❤️", "😂", "👍", "😮", "🥲", "🎉", "👎"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              handleReaction(message._id, emoji);
                              setActiveReactionMessage(null);
                            }}
                            className="hover:scale-125 transition-transform duration-150 text-lg md:text-xl"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-2"
              >
                <p className="text-sm text-gray-400 italic">
                  {typingUsers.map(u => u.username).join(", ")} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ================= Message Input ================= */}
        <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-white/10 bg-black/80 backdrop-blur-lg">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="fileInput"
            />

            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-white/10 hover:bg-white/20 p-3 rounded-lg transition flex-shrink-0"
            >
              📎
            </label>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);

                if (!socket) return;

                socket.emit("typing", { roomId });

                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(() => {
                  socket.emit("stop_typing", { roomId });
                }, 1000);
              }}
              placeholder="Type your message..."
              className="flex-1 input-field text-sm md:text-base"
            />

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-primary px-4 md:px-6 py-3 disabled:opacity-50 text-sm md:text-base flex-shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Room;