import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/hooks.ts";
import {
  todoActionStart,
  fetchTodosSuccess,
  todoActionFailure,
  addTodoSuccess,
  updateTodoSuccess,
  deleteTodoSuccess,
  clearTodoError,
} from "../../redux/features/todoSlice.ts";
import { api } from "../../lib/axios.ts";
import { TodoForm } from "./TodoForm.tsx";
import { TodoItem } from "./TodoItem.tsx";
import { TodoEmpty } from "./TodoEmpty.tsx";
import { Loader } from "../ui/Loader.tsx";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  ClipboardList,
  Database,
  Sparkles,
  Filter,
  ShieldCheck,
  Search,
  Info,
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (view: "home" | "login" | "register" | "dashboard") => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { todos, loading, error } = useAppSelector((state) => state.todos);
  const { user, databaseMode } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Secure Server Hydration Check (SSR Simulation on page mount)
  useEffect(() => {
    const fetchTodosData = async () => {
      dispatch(todoActionStart());
      try {
        const response = await api.get("/todos");
        dispatch(fetchTodosSuccess(response.data.todos));
      } catch (err: any) {
        const message =
          err.customMessage ||
          "Unable to security authenticate or fetch server todos.";
        dispatch(todoActionFailure(message));
        setSessionError(message);
      }
    };

    fetchTodosData();
  }, [dispatch]);

  // Create Todo
  const handleAddTodo = async (title: string) => {
    setActionLoading(true);
    try {
      const response = await api.post("/todos", { title });
      dispatch(addTodoSuccess(response.data.todo));
    } catch (err: any) {
      const msg = err.customMessage || "Could not successfully save task.";
      dispatch(todoActionFailure(msg));
      throw msg;
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle/Update Todo
  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed });
      dispatch(updateTodoSuccess(response.data.todo));
    } catch (err: any) {
      const msg = err.customMessage || "Failed to toggle task state.";
      dispatch(todoActionFailure(msg));
    }
  };

  const handleUpdateTodoDetails = async (
    id: string,
    updates: { title?: string; completed?: boolean },
  ) => {
    try {
      const response = await api.put(`/todos/${id}`, updates);
      dispatch(updateTodoSuccess(response.data.todo));
    } catch (err: any) {
      const msg = err.customMessage || "Failed to persist task changes.";
      dispatch(todoActionFailure(msg));
      throw msg;
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (id: string) => {
    try {
      await api.delete(`/todos/${id}`);
      dispatch(deleteTodoSuccess(id));
    } catch (err: any) {
      const msg = err.customMessage || "Failed to remove task from your list.";
      dispatch(todoActionFailure(msg));
    }
  };

  // Calculations
  const completedTodosCount = todos.filter((t) => t.completed).length;
  const activeTodosCount = todos.length - completedTodosCount;
  const progressPercent =
    todos.length > 0
      ? Math.round((completedTodosCount / todos.length) * 100)
      : 0;

  // Filter & Search
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "active") return !todo.completed;
    if (activeTab === "completed") return todo.completed;
    return true;
  });

  if (sessionError) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-16 text-center space-y-6"
        id="dashboard-session-error"
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-sm">
          <Info className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">
            Session Expired or Unauthorized
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your authorization cookie is missing, expired, or invalid. Please
            sign back in securely.
          </p>
        </div>
        <button
          onClick={() => onNavigate("login")}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition"
        >
          Secure Log In
        </button>
      </div>
    );
  }

  // Dynamic Calendar generation for current date (May 2026/Current local date)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthName = currentDate.toLocaleString("default", {
    month: "long",
  });
  const currentDayNum = currentDate.getDate();

  const weekDaysShort = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  // Calendar numbers generation helper (up to 14 slots like block)
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon is 0
  };

  const daysCount = getDaysInMonth(currentYear, currentDate.getMonth());
  const dayOffset = getFirstDayOffset(currentYear, currentDate.getMonth());

  const daysMatrix: (number | null)[] = [];
  for (let i = 0; i < dayOffset; i++) {
    daysMatrix.push(null);
  }
  for (let d = 1; d <= daysCount; d++) {
    daysMatrix.push(d);
  }

  // Constrain visual calendar to 21 elements to fit Bento block perfectly
  const calendarVisualItems = daysMatrix.slice(0, 21);

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 space-y-6 sm:py-12 animate-fade-in"
      id="dashboard-container"
    >
      {/* Upper Mode Reminder Warn Panel for Sandbox mode */}
      {databaseMode !== "MongoDB" && (
        <div
          className="rounded-4xl bg-amber-50/70 py-4 px-6 border border-amber-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 shadow-sm"
          id="dashboard-sandbox-banner"
        >
          <div className="flex items-center space-x-3 text-xs font-sans">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="font-semibold leading-relaxed">
              💡{" "}
              <strong className="font-extrabold text-amber-900">
                Sandbox Session Active
              </strong>{" "}
              — databaseMode is set to Mock-Memory. All user accounts, JWT
              states, and CRUD updates work perfectly but reset on container
              update. Configure{" "}
              <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">
                MONGODB_URI
              </code>{" "}
              in settings for production MongoDB.
            </span>
          </div>
        </div>
      )}

      {/* Responsive Bento Grid Parent */}
      <main
        className="grid grid-cols-1 lg:grid-cols-6 gap-6"
        id="dashboard-bento-grid"
      >
        {/* Header Stat Card 1: Efficiency Rate */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-4xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between min-h-35.5 transition hover:shadow-md">
          <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
            Efficiency Rate
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-extrabold text-slate-800 font-sans tracking-tight">
              {progressPercent}%
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono">
              +{progressPercent > 0 ? "12%" : "0%"} Complete
            </span>
          </div>
        </div>

        {/* Header Stat Card 2: Active Sprints */}
        <div className="col-span-1 md:col-span-2 bg-indigo-600 rounded-4xl p-6 shadow-lg shadow-indigo-100 flex flex-col justify-between text-white min-h-35.5">
          <p className="text-indigo-200 font-extrabold text-[10px] uppercase tracking-widest">
            Active Workspace
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-extrabold tracking-tight">
              {todos.length.toString().padStart(2, "0")}
            </h2>
            <div className="flex -space-x-1.5">
              <div className="w-7 h-7 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[9px] font-black font-sans">
                AD
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-indigo-600 bg-purple-400 flex items-center justify-center text-[9px] font-black font-sans">
                ME
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-indigo-600 bg-indigo-500/95 flex items-center justify-center text-[9px] font-black font-mono">
                +1
              </div>
            </div>
          </div>
        </div>

        {/* Header Stat Card 3: Remaining Tasks */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-4xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between min-h-35.5 transition hover:shadow-md">
          <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
            Remaining Tasks
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-extrabold text-slate-800 font-sans tracking-tight">
              {activeTodosCount.toString().padStart(2, "0")}
            </h2>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{
                  width: `${todos.length > 0 ? (activeTodosCount / todos.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Column Span 4: Main Task Management Block (Large Bento Card) */}
        <div className="col-span-1 lg:col-span-6 bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                My Daily Workspace
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Add, complete, and customize active agenda tasks.
              </p>
            </div>

            {/* Tab selection within bento cell */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl shrink-0 self-stretch sm:self-auto justify-center">
              {(["all", "active", "completed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Quick inline search component */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search or filter agenda titles..."
              className="w-full pl-11 pr-4 py-3 text-xs font-sans rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50/30 transition shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Inline Todo Input Form */}
          <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100">
            <TodoForm onAddTodo={handleAddTodo} isLoading={actionLoading} />
          </div>

          {/* Active List of tasks */}
          <div className="space-y-3 min-h-75" id="dashboard-todo-list">
            {loading && todos.length === 0 ? (
              <Loader
                message="Synchronizing with database securely..."
                className="py-16"
              />
            ) : filteredTodos.length === 0 ? (
              <TodoEmpty />
            ) : (
              <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo._id}
                      todo={todo}
                      onToggleTodo={handleToggleTodo}
                      onUpdateTodo={handleUpdateTodoDetails}
                      onDeleteTodo={handleDeleteTodo}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Empty state placeholder visual footer */}
          <div className="pt-5 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[11px] font-mono font-bold uppercase tracking-wider">
            <p>
              Showing {filteredTodos.length} of {todos.length} Tasks
            </p>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-300"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default DashboardView;
