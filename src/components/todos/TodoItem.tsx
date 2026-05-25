import React, { useState } from "react";
import { TodoItem as TodoType } from "../../redux/features/todoSlice.ts";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Edit2, Check, X, Calendar, CheckSquare } from "lucide-react";

interface TodoItemProps {
  key?: string;
  todo: TodoType;
  onToggleTodo: (id: string, completed: boolean) => Promise<void>;
  onUpdateTodo: (id: string, updates: { title?: string; completed?: boolean }) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onToggleTodo, onUpdateTodo, onDeleteTodo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      await onToggleTodo(todo._id, !todo.completed);
    } catch (err) {
      console.error("Failed to toggle task completion state", err);
    }
  };

  const handleUpdateTextSubmit = async () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle.length < 3) {
      setEditError("Task title must be at least 3 characters.");
      return;
    }
    if (trimmedTitle.length > 120) {
      setEditError("Task title cannot exceed 120 characters.");
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      await onUpdateTodo(todo._id, { title: trimmedTitle });
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err || "Unable to save task changes");
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = new Date(todo.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4.5 rounded-3xl border bg-white transition shadow-[0_2px_12px_rgba(15,23,42,0.02)] hover:shadow-md ${
        todo.completed
          ? "border-slate-200 bg-slate-50/80 opacity-70"
          : "border-slate-200/90 hover:border-indigo-200 bg-white"
      }`}
      id={`todo-item-${todo._id}`}
    >
      {/* Complete checkbox / Form title editor */}
      <div className="flex flex-grow items-center space-x-4 pr-2">
        <button
          onClick={handleToggle}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition cursor-pointer ${
            todo.completed
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-slate-300 hover:border-indigo-400 focus:outline-none"
          }`}
          id={`btn-toggle-todo-${todo._id}`}
        >
          {todo.completed && <Check className="h-3.5 w-3.5 stroke-[3.5]" />}
        </button>

        {isEditing ? (
          <div className="flex-grow flex flex-col space-y-1.5 py-1">
            <div className="flex items-center space-x-2 w-full">
              <input
                type="text"
                className="flex-grow rounded-xl border border-indigo-200 bg-indigo-50/20 px-3.5 py-2 text-sm font-sans focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editError) setEditError(null);
                }}
                autoFocus
                disabled={isSaving}
                id={`input-edit-todo-${todo._id}`}
              />
              <button
                onClick={handleUpdateTextSubmit}
                disabled={isSaving}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-slate-800 transition cursor-pointer shadow-sm"
                id={`btn-save-edit-${todo._id}`}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(todo.title);
                  setEditError(null);
                }}
                disabled={isSaving}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                id={`btn-cancel-edit-${todo._id}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {editError && (
              <span className="text-[11px] font-bold text-red-500 font-sans pl-1">
                ⚠️ {editError}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-grow select-none">
            <span
              className={`text-sm font-sans font-bold leading-relaxed tracking-tight ${
                todo.completed
                  ? "text-slate-400 line-through decoration-indigo-500/40"
                  : "text-slate-800"
              }`}
              id={`todo-text-${todo._id}`}
            >
              {todo.title}
            </span>
            <span className="inline-flex items-center text-[10px] text-slate-400 font-semibold font-mono mt-0.5 uppercase tracking-wider">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        )}
      </div>

      {/* Item actions */}
      {!isEditing && (
        <div className="flex items-center justify-end space-x-1.5 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-dashed border-slate-100 sm:border-0 grow-0 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition shadow-sm cursor-pointer"
            title="Edit Task"
            id={`btn-edit-todo-${todo._id}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={() => onDeleteTodo(todo._id)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition shadow-sm cursor-pointer"
            title="Delete Task"
            id={`btn-delete-todo-${todo._id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
export default TodoItem;
