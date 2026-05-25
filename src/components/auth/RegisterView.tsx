import React, { useState } from "react";
import { registerSchema } from "../../validations/auth.validation.ts";
import { useAppDispatch } from "../../redux/hooks.ts";
import { authStart, authSuccess, authFailure } from "../../redux/features/authSlice.ts";
import { api } from "../../lib/axios.ts";
import { setClientAuthStatus } from "../../lib/auth.ts";
import { Mail, Lock, UserPlus, ArrowRight, Loader2, User, Eye, EyeOff } from "lucide-react";

interface RegisterViewProps {
  onNavigate: (view: "home" | "login" | "register" | "dashboard") => void;
}

export function RegisterView({ onNavigate }: RegisterViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Validate using Zod Core Schema client-side
    const validationResult = registerSchema.safeParse({ name, email, password });
    if (!validationResult.success) {
      const messages = validationResult.error.issues.map(err => err.message);
      setFormErrors(messages);
      return;
    }

    setSubmitLoading(true);
    dispatch(authStart());

    try {
      const response = await api.post("/auth/register", { name, email, password });
      
      const { user, databaseMode, token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
      }
      dispatch(authSuccess({ user, databaseMode }));
      setClientAuthStatus(true);
      
      onNavigate("dashboard");
    } catch (err: any) {
      const message = err.customMessage || "An error occurred during sign up. That email address may already be in use.";
      setFormErrors([message]);
      dispatch(authFailure(message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F1F5F9]" id="register-container">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/30">
        
        {/* Banner/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 font-sans">
            Create account
          </h2>
          <p className="text-xs text-slate-400 font-bold font-mono uppercase tracking-wider">
            Join TaskFlow to synchronize your workspaces
          </p>
        </div>

        {/* Validation Errors */}
        {formErrors.length > 0 && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-105 animate-fade-in" id="register-error-block">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-sm">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-bold text-red-800 font-sans">Validation Issues:</h3>
                <ul className="mt-1 list-disc list-inside text-xs text-red-700 font-sans space-y-0.5">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                id="input-register-name"
                className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/15 bg-slate-50/50 focus:bg-white transition shadow-inner font-sans placeholder-slate-400 text-slate-800 font-semibold"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                id="input-register-email"
                className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/15 bg-slate-50/50 focus:bg-white transition shadow-inner font-sans placeholder-slate-400 text-slate-800 font-semibold"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="input-register-password"
                className="w-full rounded-2xl border border-slate-200 pl-11 pr-11 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/15 bg-slate-50/50 focus:bg-white transition shadow-inner font-sans placeholder-slate-400 text-slate-800 font-semibold"
                placeholder="•••••••• (Min 8 characters, complex)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-450 hover:text-indigo-600 focus:outline-none cursor-pointer transition duration-150"
                id="btn-register-toggle-password"
                disabled={submitLoading}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="group relative flex w-full justify-center items-center space-x-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
            id="btn-register-submit"
          >
            {submitLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <span>Create Secure Account</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition duration-150" />
              </>
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-sans font-medium">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="font-extrabold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              id="btn-auth-goto-login"
            >
              Sign in here
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
export default RegisterView;
