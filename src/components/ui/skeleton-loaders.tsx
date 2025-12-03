'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Base skeleton with shimmer animation
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// News card skeleton
export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-neutral-200">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-4 w-28 mt-4" />
      </div>
    </div>
  );
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 text-center">
      <Skeleton className="h-10 w-24 mx-auto mb-2" />
      <Skeleton className="h-4 w-20 mx-auto mb-1" />
      <Skeleton className="h-4 w-16 mx-auto" />
      <Skeleton className="h-3 w-24 mx-auto mt-2" />
    </div>
  );
}

// Resource card skeleton
export function ResourceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-neutral-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero skeleton */}
      <Skeleton className="h-64 md:h-80 w-full rounded-3xl" />
      
      {/* Section title */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </motion.div>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Data loading wrapper with skeleton fallback
interface DataLoaderProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function DataLoader({ isLoading, skeleton, children }: DataLoaderProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
