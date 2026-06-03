type ToastProps = {
  message: string;
  variant?: "success" | "error";
};

export function Toast({ message, variant = "success" }: ToastProps) {
  if (!message) return null;

  const isSuccess = variant === "success";

  return (
    <div className="fixed bottom-5 right-5 z-50 gov-toast">
      <div
        className={[
          "flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg text-sm font-medium max-w-sm",
          isSuccess
            ? "bg-gov-900 text-white border border-gov-700"
            : "bg-red-900 text-white border border-red-700",
        ].join(" ")}
      >
        <span
          className={[
            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
            isSuccess ? "bg-gov-accent/40" : "bg-red-600/40",
          ].join(" ")}
        >
          {isSuccess ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </span>
        {message}
      </div>
    </div>
  );
}
