import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../lib/cn.js";

type ToastProps = {
  message: string;
  variant: "success" | "error";
};

export function Toast({ message, variant }: ToastProps) {
  const isSuccess = variant === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg sm:left-auto sm:right-6 sm:bottom-6",
        isSuccess
          ? "border-green-200 bg-green-50 text-green-900"
          : "border-red-200 bg-red-50 text-red-900",
      )}
      role="status"
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <p className="min-w-0 flex-1 break-words text-sm font-medium">{message}</p>
    </motion.div>
  );
}
