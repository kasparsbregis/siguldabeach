"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { type ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const defaultTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "none";
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={direction === "up" ? fadeUp : fadeIn}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerListProps {
  children: ReactNode;
  className?: string;
}

export function StaggerList({ children, className }: StaggerListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={fadeUp}
      transition={defaultTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScaleOnHoverProps {
  children: ReactNode;
  className?: string;
}

export function ScaleOnHover({ children, className }: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
