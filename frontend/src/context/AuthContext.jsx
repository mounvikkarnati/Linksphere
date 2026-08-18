import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // No token → nothing to load (loading=false ⇒ immediate redirect for guests).
  // Token present → stay "loading" until the first /me resolves, so protected
  // routes never flash before identity is known.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  // ── Single source of truth for the authenticated user ─────────────
  // `/me` is fetched exactly ONCE when the app boots (if a token exists).
  // Every page (Dashboard, Room, Settings) reads the SAME user object from
  // this context, so identity is never re-fetched per page mount — this
  // eliminates the duplicate `/me` requests seen during review.
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await axios.get(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
    return res.data;
  }, []);

  // Fires the ONE-TIME identity fetch on boot. State updates below run in
  // promise callbacks (async, not synchronously in the effect body) — this is
  // the data-fetching-in-effect pattern the React docs recommend, so we
  // silence the more aggressive sync-setState heuristic for this effect only.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return; // nothing to load; loading already false

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    let cancelled = false;

    refreshUser()
      .catch(() => {
        if (!cancelled) {
          // Invalid / expired token — clear it so ProtectedRoute redirects.
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(
    (token, userData) => {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (userData && (userData._id || userData.id)) {
        setUser(userData);
      } else {
        // Some flows (e.g. forgot-password) only return a token — fetch the
        // full user in the background so pages still have complete identity.
        setUser({ token });
        refreshUser();
      }
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  // Memoized so consumers only re-render when user/loading actually change
  // (avoids re-render storms that cause spurious re-fetches).
  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
