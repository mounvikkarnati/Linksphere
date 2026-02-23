import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!email.trim()) {
      return setError("Please enter your email");
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post(
        "http://linksphere-backend-k60s.onrender.com/api/auth/forgot-password",
        { email }
      );

      setOtpSent(true);
      setSuccess("OTP sent successfully! Check your email.");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (!otp.trim()) {
      return setError("Please enter OTP");
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await axios.post(
        "http://linksphere-backend-k60s.onrender.com/api/auth/verify-reset-otp",
        { email, otp }
      );

      login(res.data.token);

      setSuccess("Login successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="glass-card p-8 w-96 space-y-6">

        <h2 className="text-2xl font-bold text-center glow-text">
          {!otpSent ? "Reset Password" : "Enter OTP"}
        </h2>

        {success && (
          <p className="text-green-400 text-sm text-center">
            {success}
          </p>
        )}

        {error && (
          <div className="text-red-400 text-sm text-center">
            <p>{error}</p>

            {error.includes("register") && (
              <p
                className="text-primary cursor-pointer mt-1"
                onClick={() => navigate("/register")}
              >
                Click here to Register
              </p>
            )}
          </div>
        )}

        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="btn-primary w-full disabled:opacity-50"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="input-field tracking-widest text-center"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              className="btn-primary w-full disabled:opacity-50"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <p
              className="text-xs text-primary text-center cursor-pointer mt-2"
              onClick={sendOtp}
            >
              Resend OTP
            </p>
          </>
        )}

      </div>
    </div>
  );
}