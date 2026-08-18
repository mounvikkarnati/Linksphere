import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// ⚡ LATENCY: code-split every route so the browser only downloads the
// JS for the page the user actually opened (splits the 473KB bundle).
const Landing = lazy(() => import("./pages/Landing"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Room = lazy(() => import("./pages/Room"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;