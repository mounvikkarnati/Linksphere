import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ INSIDE component

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );

      login(res.data.token); // store token via context
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="glass-card p-8 w-96 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center glow-text">
          Login
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input-field"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input-field"
          onChange={handleChange}
          required
        />
        <p
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-primary cursor-pointer text-center"
        >
          Forgot Password?
        </p>
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>
    </div>
  );
}