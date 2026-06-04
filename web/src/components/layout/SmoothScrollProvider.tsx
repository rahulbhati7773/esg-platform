import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      // Let overflow-auto regions (e.g. data-entry table) scroll natively.
      allowNestedScroll: true,
    });

    let frameId = 0;
    const onFrame = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(onFrame);
    };
    frameId = requestAnimationFrame(onFrame);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      root.classList.remove("lenis", "lenis-smooth");
    };
  }, []);

  return <>{children}</>;
}
