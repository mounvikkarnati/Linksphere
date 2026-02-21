import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedEmail = localStorage.getItem("verifyEmail");

  const [formData, setFormData] = useState({
    email: location.state?.email || storedEmail || "",
    otp: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    // If no email found, redirect to register
    if (!formData.email) {
      navigate("/register");
    }
  }, [formData.email, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, otp: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5001/api/auth/verify-otp",
        {
          email: formData.email,
          otp: formData.otp,
        }
      );

      // Remove stored email after successful verification
      localStorage.removeItem("verifyEmail");

      navigate("/login", { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="glass-card p-8 w-96 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center glow-text">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-400 text-center">
          OTP sent to{" "}
          <span className="text-white font-medium">
            {formData.email}
          </span>
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          className="input-field"
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-primary w-full">
          Verify
        </button>
      </form>
    </div>
  );
}