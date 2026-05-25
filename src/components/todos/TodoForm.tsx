import React, { useState } from "react";
import { todoCreateSchema } from "../../validations/todo.validation.ts";
import { PlusCircle, Loader2 } from "lucide-react";

interface TodoFormProps {
  onAddTodo: (title: string) => Promise<void>;
  isLoading: boolean;
}

export function TodoForm({ onAddTodo, isLoading }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Zod Validation Client-Side
    const trimmedTitle = title.trim();
    const result = todoCreateSchema.safeParse({ title: trimmedTitle });
    
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid todo item title.";
      setValidationError(errorMsg);
      return;
    }

    try {
      await onAddTodo(trimmedTitle);
      setTitle(""); // Reset form on success
    } catch (err: any) {
      setValidationError(err || "Failed to submit new task.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2" id="todo-form">
      <div className="flex items-stretch space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            className={`w-full rounded-2xl border px-4.5 py-3 text-sm focus:outline-none transition shadow-inner font-sans bg-slate-50/50 focus:bg-white placeholder-slate-400 ${
              validationError
                ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
            }`}
            placeholder="Add a new task (e.g., Secure database migrations)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={isLoading}
            id="input-new-todo"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center space-x-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 text-sm font-bold transition active:scale-[0.98] shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          id="btn-add-todo"
        >
          {isLoading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <PlusCircle className="h-4.5 w-4.5" />
          )}
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {validationError && (
        <span className="block text-xs font-medium text-red-500 pl-1 font-sans animate-fade-in" id="todo-form-error">
          ⚠️ {validationError}
        </span>
      )}
    </form>
  );
}
export default TodoForm;
