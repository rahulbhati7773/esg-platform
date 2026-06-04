import { AnimatePresence, motion } from "framer-motion";

type AnimatedFieldErrorProps = {
  message?: string;
};

export function AnimatedFieldError({ message }: AnimatedFieldErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mt-1.5 text-sm text-rose-600"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
