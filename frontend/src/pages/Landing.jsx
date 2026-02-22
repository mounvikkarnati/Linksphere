import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Landing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCount, setUserCount] = useState(0);
    useEffect(() => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      const fetchCount = async () => {
        try {
          const res = await fetch("http://localhost:5001/api/auth/count");
          const data = await res.json();
          setUserCount(data.totalUsers);
        } catch (error) {
          console.error("Failed to fetch user count");
        }
      };
    fetchCount();
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-60 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="glow-text">Link</span>
            <span className="text-white">Sphere</span>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
                <>
                  <Link to="/dashboard">
                    <button className="btn-primary">Dashboard</button>
                  </Link>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      localStorage.removeItem("token");
                      setIsLoggedIn(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
              <>
                <Link to="/login">
                  <button className="btn-secondary">Login</button>
                </Link>
                <Link to="/register">
                  <button className="btn-primary">Register</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <span className="glow-text">B</span>
            <span className="text-white">Chat</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-[#9CA3AF] mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Minimalistic AI-powered room-based communication platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to={isLoggedIn ? "/dashboard" : "/register"}>
              <button className="btn-primary text-lg px-8 py-4">
                Get Started
              </button>
            </Link>
          </motion.div>

          {/* Floating Card */}
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 glass-card p-6 w-80"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#9CA3AF]">Active Users</p>
                <p className="text-2xl font-bold text-teal-400">{userCount}+</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ================= Footer ================= */}
<footer className="relative z-10 border-t border-white/10 py-6 mt-20">
  <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
    <p>
      © {new Date().getFullYear()} LinkSphere. All rights reserved.
    </p>
    <p className="mt-2">
      Designed and developed by{" "}
      <span className="glow-text">Mounvik K</span> &{" "}
      <span className="glow-text">Rohith N</span>
    </p>
  </div>
</footer>
    </div>
  );
};

export default Landing;