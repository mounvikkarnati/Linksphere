import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [emailOtp, setEmailOtp] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5001/api/auth/me",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setUser(res.data);
      setUsername(res.data.username);
      setEmail(res.data.email);
    } catch {
      toast.error("Failed to load user");
    }
  };

  // ================= USERNAME UPDATE =================
  const handleUsernameUpdate = async () => {
    try {
      await axios.put(
        "http://localhost:5001/api/auth/update",
        { username },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      toast.success("Username updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // ================= EMAIL CHANGE =================
  const requestEmailOtp = async () => {
    try {
      await axios.put(
        "http://localhost:5001/api/auth/request-email-change",
        { newEmail: email },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      toast.success("OTP sent to new email");
      setEmailOtpSent(true);
    }  catch (error) {
  console.error("Email Change Error:", error);
  res.status(500).json({ message: "Failed to send OTP" });
}
  };

  const verifyEmailOtp = async () => {
    try {
      await axios.put(
        "http://localhost:5001/api/auth/verify-email-change",
        { otp: emailOtp },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      toast.success("Email updated successfully");
      setEmailOtpSent(false);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  // ================= DELETE ACCOUNT =================
  const requestDeleteOtp = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/auth/request-delete-account-otp",
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      toast.success("Delete OTP sent");
      setDeleteOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyDeleteOtp = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/auth/verify-delete-account-otp",
        { otp: deleteOtp },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      toast.success("Account deleted");

      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  if (!user) return null;

  return (
    
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <div className="glass-card p-6 w-96 space-y-6">
        <button
  onClick={() => navigate('/dashboard')}
  className="text-[#9CA3AF] hover:text-white transition-colors duration-200 mb-4"
>
  ← Back to Dashboard
</button>
        <h2 className="text-xl font-bold">⚙️ Settings</h2>

        {/* USERNAME */}
        <div>
          <label className="text-sm text-gray-400">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field w-full mt-1"
          />
          <button
            onClick={handleUsernameUpdate}
            className="btn-primary w-full mt-2"
          >
            Update Username
          </button>
        </div>

        {/* EMAIL CHANGE */}
        <div>
          <label className="text-sm text-gray-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full mt-1"
          />

          {!emailOtpSent ? (
            <button
              onClick={requestEmailOtp}
              className="btn-primary w-full mt-2"
            >
              Send Email OTP
            </button>
          ) : (
            <>
              <input
                placeholder="Enter OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                className="input-field w-full mt-2"
              />
              <button
                onClick={verifyEmailOtp}
                className="btn-primary w-full mt-2"
              >
                Verify Email OTP
              </button>
            </>
          )}
        </div>

        {/* DELETE ACCOUNT */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-red-400 font-semibold">Danger Zone</h3>

          {!deleteOtpSent ? (
            <button
              onClick={requestDeleteOtp}
              className="bg-red-600 hover:bg-red-700 text-white w-full py-2 rounded mt-2"
            >
              Delete Account
            </button>
          ) : (
            <>
              <input
                placeholder="Enter Delete OTP"
                value={deleteOtp}
                onChange={(e) => setDeleteOtp(e.target.value)}
                className="input-field w-full mt-2"
              />
              <button
                onClick={verifyDeleteOtp}
                className="bg-red-600 hover:bg-red-700 text-white w-full py-2 rounded mt-2"
              >
                Confirm Delete Account
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;