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
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

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

    // Connect to socket
    const newSocket = io('http://localhost:5001', {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join_room', { roomId });
    });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_joined', (data) => {
      toast.success(data.message);
      fetchRoomDetails(); // Refresh members list
    });

    newSocket.on('user_left', (data) => {
      toast.info(data.message);
      fetchRoomDetails(); // Refresh members list
    });

    newSocket.on('error', (error) => {
      toast.error(error.message);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room');
        newSocket.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUser = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5001/api/auth/me'
    );
    setUser(response.data); // FIXED
  } catch (error) {
    console.error('Failed to fetch user');
  }
};

  const fetchRoomDetails = async () => {
    try {
      // You'll need to add this endpoint
      const response = await axios.get(`http://localhost:5001/api/rooms/${roomId}/details`);
      setRoom(response.data.room);
      setMembers(response.data.room.members);
    } catch (error) {
      console.error('Failed to fetch room details');
      if (error.response?.status === 403) {
        toast.error('You are not a member of this room');
        navigate('/dashboard');
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/rooms/${roomId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      roomId,
      content: newMessage.trim()
    });

    setNewMessage('');
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
      {/* Sidebar - Room Info & Members */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-72 glass-card m-4 p-6 flex flex-col"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#9CA3AF] hover:text-primary mb-4 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </button>

        <div className="border-b border-white/10 pb-4 mb-4">
          <h2 className="text-2xl font-bold mb-1">{room?.name}</h2>
          <p className="text-sm text-[#9CA3AF] font-mono">{roomId}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold text-[#9CA3AF] mb-3">
            Members ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.user._id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">{member.user.username}</span>
                </div>
                {member.role === 'admin' && (
                  <span className="text-xs text-primary">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <main className="flex-1 ml-72 p-4 flex flex-col h-screen">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.sender?._id === user?._id;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-white/5 border border-white/10'
                  } rounded-2xl p-3`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs text-primary mb-1">{message.sender.username}</p>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs text-[#9CA3AF] text-right mt-1">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="mt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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