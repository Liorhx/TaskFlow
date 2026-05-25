import { useAppSelector, useAppDispatch } from "../../redux/hooks.ts";
import { logoutSuccess } from "../../redux/features/authSlice.ts";
import { api } from "../../lib/axios.ts";
import { setClientAuthStatus } from "../../lib/auth.ts";
import { LogOut, CheckSquare, Database, Sparkles, User } from "lucide-react";

interface NavbarProps {
  onNavigate: (view: "home" | "login" | "register" | "dashboard") => void;
  currentView: string;
}

export function Navbar({ onNavigate, currentView }: NavbarProps) {
  const { user, isAuthenticated, databaseMode } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request error", err);
    } finally {
      localStorage.removeItem("token");
      dispatch(logoutSuccess());
      setClientAuthStatus(false);
      onNavigate("home");
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md"
      id="app-navbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Title */}
          <div
            className="flex cursor-pointer items-center space-x-3 animate-fade-in"
            onClick={() => onNavigate(isAuthenticated ? "dashboard" : "home")}
            id="nav-logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <CheckSquare className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-sans text-xl font-extrabold tracking-tight text-slate-800">
                TaskFlow
              </span>
            </div>
          </div>

          {/* Action Menus */}
          <div className="flex items-center space-x-3" id="nav-actions">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* User Card */}
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm font-bold text-slate-800 tracking-tight">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono font-medium">
                    {user.email}
                  </span>
                </div>

                {/* User Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner sm:mr-1">
                  <User className="h-4.5 w-4.5" />
                </div>

                {/* Dashboard Shortcut link if on another view */}
                {currentView !== "dashboard" && (
                  <button
                    onClick={() => onNavigate("dashboard")}
                    className="hidden sm:inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3.5 py-2 rounded-xl transition"
                  >
                    Dashboard
                  </button>
                )}

                {/* Logout Action */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition shadow-sm cursor-pointer"
                  title="Sign Out"
                  id="btn-logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("login")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    currentView === "login"
                      ? "text-indigo-700 bg-indigo-50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                  id="btn-nav-login"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-indigo-100 transition cursor-pointer active:scale-95"
                  id="btn-nav-register"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
