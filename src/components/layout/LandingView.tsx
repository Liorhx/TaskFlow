import { useAppSelector } from "../../redux/hooks.ts";
import {
  CheckSquare,
  ShieldCheck,
  Database,
  Layout,
  Sparkles,
  Code,
  ArrowRight,
} from "lucide-react";

interface LandingViewProps {
  onNavigate: (view: "home" | "login" | "register" | "dashboard") => void;
}

export function LandingView({ onNavigate }: LandingViewProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-[#F8FAFC]" id="landing-container">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Subtle blur decorative effects */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-xl -translate-x-1/2 rotate-30 bg-linear-to-tr from-indigo-500 to-indigo-300 opacity-20 sm:left-[calc(50%-30rem)] sm:w-6xl" />
        </div>

        <div className="mx-auto max-w-4xl py-12 sm:py-20 lg:py-24 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="font-sans text-4xl font-black tracking-tight text-slate-800 sm:text-5xl md:text-6xl leading-tight">
              Secure workflow tracking, <br />
              <span className="text-indigo-600 bg-linear-to-r from-indigo-600 to-indigo-400 bg-clip-text">
                engineered for precision.
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-sans font-semibold">
              A high-fidelity full-stack todo application designed with strong
              JWT verification, Redux storage pipelines, Zod constraints, and
              flexible persistence backends.
            </p>
          </div>

          {/* Core Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate("dashboard")}
                className="inline-flex items-center justify-center space-x-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 cursor-pointer"
                id="btn-hero-dashboard"
              >
                <span>Go to Dashboard</span>
                <CheckSquare className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 cursor-pointer"
                  id="btn-hero-login"
                >
                  <span>Access Dashboard</span>
                  <ArrowRight className="h-4 active:scale-95 transition" />
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 cursor-pointer"
                  id="btn-hero-register"
                >
                  Create Secure Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default LandingView;
