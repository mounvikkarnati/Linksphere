import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
  const [roomData, setRoomData] = useState({
    name: '',
    password: '',
    expiresIn: 7 // Default 7 days
  });
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem('token');

    const response = await axios.post(
      'http://localhost:5001/api/rooms/create',
      roomData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    toast.success('Room created successfully!');

    setCreatedRoom({
      roomId: response.data.roomId
    });

  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create room');
    setLoading(false);
  }
};

  const copyRoomId = () => {
    navigator.clipboard.writeText(createdRoom.roomId);
    toast.success('Room ID copied to clipboard!');
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
        {!createdRoom ? (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Create <span className="glow-text">Room</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-1">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g., Gaming Lounge"
                  value={roomData.name}
                  onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                  className="input-field"
                  required
                  minLength={3}
                  maxLength={50}
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
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm text-[#9CA3AF] mb-1">Expires In (Days)</label>
                <select
                  value={roomData.expiresIn}
                  onChange={(e) => setRoomData({ ...roomData, expiresIn: parseInt(e.target.value) })}
                  className="input-field"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={0}>Never expires</option>
                </select>
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
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Room Created Successfully!</h3>
            
            <div className="glass-card p-4 mb-4">
              <p className="text-sm text-[#9CA3AF] mb-1">Room ID</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="text-2xl font-mono text-primary">{createdRoom.roomId}</code>
                <button
                  onClick={copyRoomId}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  📋
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2">
                Share this ID with friends to let them join
              </p>
            </div>

            <p className="text-sm text-[#9CA3AF] mb-4">
              Redirecting to dashboard in 5 seconds...
            </p>

            <button
              onClick={onRoomCreated}
              className="btn-primary w-full"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreateRoomModal;