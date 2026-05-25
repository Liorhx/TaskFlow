import { ClipboardCheck, Sparkles } from "lucide-react";

export function TodoEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 mt-2 space-y-4" id="todo-list-empty">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/10">
        <ClipboardCheck className="h-7 w-7 stroke-[1.5]" />
      </div>

      <div className="max-w-[320px] space-y-1.5">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Your agenda is fully clear!</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          Perfect! There are no pending items on your board. Try adding a new task using the input form.
        </p>
      </div>

      <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 font-mono tracking-wide">
        <Sparkles className="h-3 w-3 text-indigo-500" />
        <span>Boost productivity!</span>
      </div>
    </div>
  );
}
export default TodoEmpty;
