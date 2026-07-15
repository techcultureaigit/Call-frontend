import type { Variants } from "framer-motion";

export const sidebarTransition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.8,
} as const;

export const overlayTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export const headerItemVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.03,
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};
