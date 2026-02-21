import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/verify-otp",
        formData
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="glass-card p-8 w-96 space-y-6">
        <h2 className="text-3xl font-bold text-center glow-text">
          Verify OTP
        </h2>

        {message && (
          <p className="text-green-400 text-sm text-center">{message}</p>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="input-field"
          onChange={handleChange}
        />

        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          className="input-field"
          onChange={handleChange}
        />

        <button type="submit" className="btn-primary w-full">
          Verify
        </button>
      </form>
    </div>
  );
}