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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

    // Handle window resize to close sidebar on larger screens
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('https://linksphere-backend-k60s.onrender.com/api/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('https://linksphere-backend-k60s.onrender.com/api/rooms/my-rooms');
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
    setSidebarOpen(false);
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return 'Never expires';
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} days left` : 'Expired';
  };

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
          
          <div className="text-xl font-bold">
            <span className="glow-text">B</span>
            <span className="text-white">Chat</span>
          </div>

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
            {user?.username ? user.username.charAt(0).toUpperCase() : ''}
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
        className="fixed left-0 top-0 h-screen w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-50 md:hidden"
      >
        {/* Mobile Close */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold">
            <span className="glow-text">B</span>
            <span className="text-white">Chat</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white text-xl p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* User Info for Mobile */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-[#9CA3AF]">Logged in as</p>
          <p className="font-semibold text-white truncate">{user?.username}</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => {
              setShowCreateModal(true);
              setSidebarOpen(false);
            }}
            className="w-full btn-primary text-left px-4 py-3 rounded-xl flex items-center space-x-3"
          >
            <span className="text-xl">➕</span>
            <span>Create Room</span>
          </button>
          
          <button 
            onClick={() => {
              setShowJoinModal(true);
              setSidebarOpen(false);
            }}
            className="w-full btn-secondary text-left px-4 py-3 rounded-xl flex items-center space-x-3"
          >
            <span className="text-xl">🔗</span>
            <span>Join Room</span>
          </button>

          <div className="pt-4 mt-4 border-t border-white/10">
            <h3 className="text-sm text-[#9CA3AF] mb-3 px-2">Your Rooms</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleEnterRoom(room.roomId)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="font-medium text-white truncate">{room.name}</div>
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF] mt-1">
                    <span>👥 {room.members} members</span>
                    <span className={room.role === 'admin' ? 'text-primary' : 'text-secondary'}>
                      {room.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              navigate('/settings');
              setSidebarOpen(false);
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-primary hover:bg-white/5 transition-all flex items-center space-x-3"
          >
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-secondary hover:bg-white/5 transition-all flex items-center space-x-3"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:block fixed left-0 top-0 h-screen w-64 glass-card m-4 p-6"
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

        <div className="mt-auto space-y-2">
          <button
            onClick={() => navigate('/settings')}
            className="text-left px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-primary hover:bg-white/5 transition-all w-full"
          >
            ⚙ Settings
          </button>

          <button
            onClick={handleLogout}
            className="text-left px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-secondary hover:bg-white/5 transition-all w-full"
          >
            🚪 Logout
          </button>
        </div>
      </motion.aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="md:ml-72 p-4 md:p-8 pt-20 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome Back, <span className="glow-text">
              {user?.username
                ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                : ""}
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">Your rooms are ready and waiting</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-4 md:p-6 animate-pulse">
                <div className="h-5 md:h-6 bg-white/10 rounded w-3/4 mb-3 md:mb-4"></div>
                <div className="h-3 md:h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                <div className="h-3 md:h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-20 px-4"
          >
            <div className="text-5xl md:text-6xl mb-4">💬</div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">No rooms yet</h3>
            <p className="text-sm md:text-base text-[#9CA3AF] mb-6">Create your first room or join an existing one</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-6 py-3"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary px-6 py-3"
              >
                Join Room
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
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
                className="glass-card p-4 md:p-6 cursor-pointer group hover:glow-border transition-all"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEnterRoom(room.roomId)}
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors truncate">
                      {room.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 text-xs md:text-sm text-[#9CA3AF]">
                      <span>👥 {room.members} members</span>
                      <span className="hidden xs:inline">•</span>
                      <span className={room.role === 'admin' ? 'text-primary' : 'text-secondary'}>
                        {room.role}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 ml-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="mb-3 md:mb-4">
                  <p className="text-xs text-[#9CA3AF]">
                    Room ID: <span className="font-mono text-primary break-all">{room.roomId}</span>
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    ⏰ {formatExpiry(room.expiresAt)}
                  </p>
                </div>

                <button 
                  className="w-full btn-primary text-xs md:text-sm py-2 md:py-2.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnterRoom(room.roomId);
                  }}
                >
                  Enter Room
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* ================= MODALS ================= */}
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