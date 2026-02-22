import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'strong' | 'subtle';
  glow?: boolean;
  children: React.ReactNode;
}

export function GlassCard({ variant = 'default', glow = false, className, children, ...props }: GlassCardProps) {
  const variantClass = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        variantClass,
        'rounded-2xl p-6',
        glow && 'glass-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
