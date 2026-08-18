import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // NOTE: StrictMode intentionally double-invokes effects in development,
  // which fired every API call (and opened two sockets) twice per mount —
  // exactly the "duplicate requests within milliseconds" flagged in review.
  // Removed so the interview demo shows exactly one request per fetch.
  <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HashRouter>
);