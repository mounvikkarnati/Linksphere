import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const JoinRoomModal = ({ onClose, onRoomJoined }) => {
  const [roomData, setRoomData] = useState({
    roomId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem('token');

    await axios.post(
      'https://linksphere-backend-k60s.onrender.com/api/rooms/join',
      roomData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    toast.success('Joined room successfully!');
    onRoomJoined();

  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to join room');
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          Join <span className="glow-text">Room</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9CA3AF] mb-1">Room ID</label>
            <input
              type="text"
              placeholder="Enter 8-character room ID"
              value={roomData.roomId}
              onChange={(e) => setRoomData({ ...roomData, roomId: e.target.value.toUpperCase() })}
              className="input-field font-mono"
              required
              maxLength={8}
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm text-[#9CA3AF] mb-1">Room Password</label>
            <input
              type="password"
              placeholder="Enter room password"
              value={roomData.password}
              onChange={(e) => setRoomData({ ...roomData, password: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>

        <p className="text-xs text-[#9CA3AF] text-center mt-4">
          Room ID is case-sensitive and exactly 8 characters
        </p>
      </motion.div>
    </motion.div>
  );
};

export default JoinRoomModal;