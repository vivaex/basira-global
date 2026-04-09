'use client';
import { motion } from 'framer-motion';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  stagger?: number;
  variant?: 'sleek' | 'playful';
  className?: string;
}

export default function AnimatedWrapper({
  children,
  stagger = 0.1,
  variant = 'sleek',
  className = '',
}: AnimatedWrapperProps) {

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
      },
    },
  };

  const item: any = {
    hidden: { 
      opacity: 0, 
      y: variant === 'playful' ? 50 : 20, 
      scale: variant === 'playful' ? 0.8 : 1 
    },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: variant === 'playful' 
        ? { type: 'spring' as const, stiffness: 260, damping: 20 }
        : { ease: 'easeInOut', duration: 0.5 }
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={item}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={item}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
