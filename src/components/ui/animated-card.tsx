'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  delay?: number;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
}

const hoverVariants = {
  lift: {
    rest: { y: 0, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    hover: { 
      y: -8, 
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      transition: { duration: 0.2 }
    },
  },
  glow: {
    rest: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    hover: { 
      boxShadow: '0 0 30px -5px rgb(59 130 246 / 0.4)',
      transition: { duration: 0.2 }
    },
  },
  scale: {
    rest: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  },
  none: {
    rest: {},
    hover: {},
  },
};

export function AnimatedCard({ 
  children, 
  className, 
  href,
  delay = 0,
  hoverEffect = 'lift' 
}: AnimatedCardProps) {
  const MotionComponent = href ? motion.a : motion.div;
  
  return (
    <MotionComponent
      href={href}
      className={cn(
        'block bg-white rounded-2xl overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
      variants={hoverVariants[hoverEffect]}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </MotionComponent>
  );
}

// Stat card with animated number
interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'red' | 'orange' | 'blue' | 'green' | 'purple';
  delay?: number;
}

const colorClasses = {
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
};

export function StatCard({ value, label, icon, trend, color = 'blue', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg',
        `bg-gradient-to-br ${colorClasses[color]}`
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        {icon && (
          <div className="mb-3 opacity-80">{icon}</div>
        )}
        <motion.div 
          className="text-4xl font-bold mb-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
        >
          {value}
        </motion.div>
        <div className="text-sm opacity-90">{label}</div>
        {trend && (
          <div className={cn(
            'mt-2 text-xs font-medium',
            trend.positive ? 'text-green-200' : 'text-red-200'
          )}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last year
          </div>
        )}
      </div>
    </motion.div>
  );
}

// News card
interface NewsCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  href: string;
  imageUrl?: string;
  delay?: number;
}

const categoryColors: Record<string, string> = {
  arrest: 'bg-red-100 text-red-700 border-red-200',
  seizure: 'bg-orange-100 text-orange-700 border-orange-200',
  law_change: 'bg-purple-100 text-purple-700 border-purple-200',
  statistics: 'bg-blue-100 text-blue-700 border-blue-200',
  prevention_tip: 'bg-green-100 text-green-700 border-green-200',
  other: 'bg-neutral-100 text-neutral-700 border-neutral-200',
};

export function NewsCard({ title, excerpt, date, category, href, imageUrl, delay = 0 }: NewsCardProps) {
  return (
    <motion.a
      href={href}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium border',
            categoryColors[category] || categoryColors.other
          )}>
            {category.replace('_', ' ')}
          </span>
          <span className="text-xs text-neutral-500">{date}</span>
        </div>
        <h3 className="font-bold text-lg text-neutral-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-neutral-600 text-sm line-clamp-2">{excerpt}</p>
      </div>
    </motion.a>
  );
}
