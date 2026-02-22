import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

  const messagesEndRef = useRef(null);

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

    const newSocket = io('http://localhost:5001', {
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

    return () => {
      newSocket.disconnect();
    };

  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===============================
  // FETCH USER
  // ===============================
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/me');
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
        `http://localhost:5001/api/rooms/${roomId}/details`
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
        `http://localhost:5001/api/rooms/${roomId}/messages`
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Message fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE ROOM (ADMIN ONLY)
  // ===============================
  const handleDeleteRoom = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5001/api/rooms/${roomId}`
      );

      toast.success('Room deleted');
      navigate('/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ===============================
  // REMOVE MEMBER (ADMIN ONLY)
  // ===============================
  const handleRemoveMember = async (userId) => {
    const confirmRemove = window.confirm(
      "Remove this member?"
    );

    if (!confirmRemove) return;

    try {
      await axios.delete(
        `http://localhost:5001/api/rooms/${roomId}/remove/${userId}`
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
    <div className="min-h-screen bg-black flex">

      {/* ================= Sidebar ================= */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-72 glass-card m-4 p-6 flex flex-col"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#9CA3AF] hover:text-primary mb-4"
        >
          ← Back to Dashboard
        </button>

        <div className="border-b border-white/10 pb-4 mb-4">
          <h2 className="text-2xl font-bold">{room?.name}</h2>
          <p className="text-sm text-[#9CA3AF] font-mono">{roomId}</p>

          {room?.isAdmin && (
            <button
              onClick={handleDeleteRoom}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Delete Room
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm text-[#9CA3AF] mb-3">
            Members ({members.length})
          </h3>

          {members.map(member => (
            <div
              key={member.user._id}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5"
            >
              <div>
                <span className="text-sm">
                  {member.user.username}
                </span>
                {member.role === 'admin' && (
                  <span className="text-xs text-primary ml-2">
                    Admin
                  </span>
                )}
              </div>

              {room?.isAdmin &&
                member.user._id !== user?._id && (
                  <button
                    onClick={() =>
                      handleRemoveMember(member.user._id)
                    }
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
                )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ================= Chat Area ================= */}
      <main className="flex-1 ml-72 p-4 flex flex-col h-screen">

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => {
            const isOwnMessage =
              message.sender?._id === user?._id;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  isOwnMessage
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-3 ${
                    isOwnMessage
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs text-primary mb-1">
                      {message.sender.username}
                    </p>
                  )}

                  <p className="text-sm break-words">
                    {message.content}
                  </p>

                  <p className="text-xs text-[#9CA3AF] text-right mt-1">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) =>
                setNewMessage(e.target.value)
              }
              placeholder="Type your message..."
              className="flex-1 input-field"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-primary px-6 disabled:opacity-50"
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