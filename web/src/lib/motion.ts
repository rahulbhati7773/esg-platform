export const springSnappy = {
  type: "spring" as const,
  stiffness: 400,
  damping: 34,
  mass: 0.8,
};

export const drawerEase = [0.32, 0.72, 0, 1] as const;

export const drawerTransition = {
  type: "tween" as const,
  duration: 0.26,
  ease: drawerEase,
};

export const backdropTransition = {
  type: "tween" as const,
  duration: 0.2,
  ease: drawerEase,
};

export const fadeIn = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};
