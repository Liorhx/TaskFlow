import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  className?: string;
}

export function Loader({ message = "Loading...", className = "" }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`} id="app-loader">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      <p className="text-sm font-medium text-gray-500 font-sans tracking-wide">{message}</p>
    </div>
  );
}
export default Loader;
