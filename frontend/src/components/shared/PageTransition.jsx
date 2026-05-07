import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function PageTransition({ children, className }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`relative ${className || ''}`}
    >
      {children}
    </motion.div>
  );
}
