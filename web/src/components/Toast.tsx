import { Card, Text } from "@tremor/react";

type ToastProps = {
  message: string;
  variant?: "success" | "error";
};

export function Toast({ message, variant = "success" }: ToastProps) {
  if (!message) {
    return null;
  }

  const styles =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className={styles}>
        <Text>{message}</Text>
      </Card>
    </div>
  );
}
