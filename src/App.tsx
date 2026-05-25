import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { useAppDispatch, useAppSelector } from "./redux/hooks.ts";
import {
  authSuccess,
  logoutSuccess,
  setDatabaseMode,
} from "./redux/features/authSlice.ts";
import { isClientAuthenticated, setClientAuthStatus } from "./lib/auth.ts";
import { api } from "./lib/axios.ts";
import { Navbar } from "./components/layout/Navbar.tsx";
import { LandingView } from "./components/layout/LandingView.tsx";
import { LoginView } from "./components/auth/LoginView.tsx";
import { RegisterView } from "./components/auth/RegisterView.tsx";
import { DashboardView } from "./components/todos/DashboardView.tsx";
import { Loader } from "./components/ui/Loader.tsx";

function AppContent() {
  const { isAuthenticated, user, databaseMode } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<
    "home" | "login" | "register" | "dashboard"
  >("home");
  const [checkingSession, setCheckingSession] = useState(true);

  // Auto-authenticate check on page load (Simulating real Next.js SSR hydration context)
  useEffect(() => {
    const authenticateSession = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data.success && response.data.user) {
          const { user: fetchedUser, databaseMode: mode } = response.data;
          dispatch(authSuccess({ user: fetchedUser, databaseMode: mode }));
          setClientAuthStatus(true);
          setCurrentView("dashboard");
        } else {
          dispatch(logoutSuccess());
          setClientAuthStatus(false);
          setCurrentView("home");
        }
      } catch (error) {
        // Clear auth state quietly on load if cookie is unsigned/absent or token has expired
        localStorage.removeItem("token");
        dispatch(logoutSuccess());
        setClientAuthStatus(false);

        // If client had been authenticated before, default page to home, otherwise home is fine
        setCurrentView("home");
      } finally {
        setCheckingSession(false);
      }
    };

    authenticateSession();
  }, [dispatch]);

  // Synchronize view redirects with auth transitions
  const handleNavigate = (
    view: "home" | "login" | "register" | "dashboard",
  ) => {
    // Session Guard precheck before allowing dashboard entrance
    if (view === "dashboard" && !isAuthenticated && !isClientAuthenticated()) {
      setCurrentView("login");
      return;
    }
    // Prevent landing back to login/register if already logged in
    if (
      (view === "login" || view === "register") &&
      (isAuthenticated || isClientAuthenticated())
    ) {
      setCurrentView("dashboard");
      return;
    }
    setCurrentView(view);
  };

  if (checkingSession) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-white"
        id="session-check-root"
      >
        <Loader message="Verifying secure user session context..." />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50/20"
      id="app-root-content"
    >
      {/* Top Navbar Actions */}
      <Navbar onNavigate={handleNavigate} currentView={currentView} />

      {/* Main viewport router */}
      <main className="grow">
        {currentView === "home" && <LandingView onNavigate={handleNavigate} />}
        {currentView === "login" && <LoginView onNavigate={handleNavigate} />}
        {currentView === "register" && (
          <RegisterView onNavigate={handleNavigate} />
        )}
        {currentView === "dashboard" && (
          <DashboardView onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
