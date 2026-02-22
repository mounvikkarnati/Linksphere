import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUser();
    fetchRooms();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/rooms/my-rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleEnterRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return 'Never expires';
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} days left` : 'Expired';
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-64 glass-card m-4 p-6 flex flex-col"
      >
        <div className="text-2xl font-bold mb-8">
          <span className="glow-text">B</span>
          <span className="text-white">Chat</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full btn-primary text-left px-4 py-3 rounded-xl flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Create Room</span>
          </button>
          
          <button 
            onClick={() => setShowJoinModal(true)}
            className="w-full btn-secondary text-left px-4 py-3 rounded-xl flex items-center space-x-2"
          >
            <span>🔗</span>
            <span>Join Room</span>
          </button>

          <div className="pt-4 mt-4 border-t border-white/10">
            <h3 className="text-sm text-[#9CA3AF] mb-2 px-4">Your Rooms</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleEnterRoom(room.roomId)}
                  className="w-full text-left px-4 py-2 rounded-lg text-[#EAEAEA] hover:bg-white/5 transition-all"
                >
                  <div className="font-medium truncate">{room.name}</div>
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span>{room.members} members</span>
                    <span className={room.role === 'admin' ? 'text-primary' : 'text-secondary'}>
                      {room.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-left px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-secondary hover:bg-white/5 transition-all"
        >
          Logout
        </button>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome Back, <span className="glow-text">
              {user?.username
                ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                : ""}
            </span>
          </h1>
          <p className="text-[#9CA3AF]">Your rooms are ready and waiting</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold mb-2">No rooms yet</h3>
            <p className="text-[#9CA3AF] mb-6">Create your first room or join an existing one</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary"
              >
                Join Room
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="glass-card p-6 cursor-pointer group hover:glow-border transition-all"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEnterRoom(room.roomId)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-[#9CA3AF]">
                      <span>👥 {room.members} members</span>
                      <span>•</span>
                      <span className={room.role === 'admin' ? 'text-primary' : 'text-secondary'}>
                        {room.role}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-[#9CA3AF]">
                    Room ID: <span className="font-mono text-primary">{room.roomId}</span>
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    ⏰ {formatExpiry(room.expiresAt)}
                  </p>
                </div>

                <button className="w-full btn-primary text-sm py-2">
                  Enter Room
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRoomModal 
            onClose={() => setShowCreateModal(false)}
            onRoomCreated={() => {
              fetchRooms();
              setShowCreateModal(false);
            }}
          />
        )}
        {showJoinModal && (
          <JoinRoomModal 
            onClose={() => setShowJoinModal(false)}
            onRoomJoined={() => {
              fetchRooms();
              setShowJoinModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;