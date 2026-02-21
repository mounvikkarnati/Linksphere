import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
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
  await axios.post(
    "http://localhost:5001/api/auth/register",
    formData
  );

localStorage.setItem("verifyEmail", formData.email);


  navigate("/verify", { state: { email: formData.email } });

} catch (err) {
  const message = err.response?.data?.message;

  if (message === "Email already exists") {
    setError("User already exists. Please login.");
  } else {
    setError(message || "Registration failed");
  }
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="glass-card p-8 w-96 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center glow-text">
          Register
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="input-field"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input-field"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input-field"
          onChange={handleChange}
        />

        <button type="submit" className="btn-primary w-full">
          Create Account
        </button>
      </form>
    </div>
  );
}