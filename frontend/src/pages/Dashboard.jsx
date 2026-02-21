import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        setUserData(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (user?.token) {
      fetchUser();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold mb-8">BChat</h2>

        <ul className="space-y-4">
          <li className="hover:text-primary cursor-pointer">
            Dashboard
          </li>
          <li className="hover:text-primary cursor-pointer">
            Rooms
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome {userData?.username}
          </h1>

          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

       <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-2">
            Name: {userData?.username}
          </h2>
          <p className="text-gray-400">email: {userData?.email}</p>
        </div>
      </div>
    </div>
  );
}