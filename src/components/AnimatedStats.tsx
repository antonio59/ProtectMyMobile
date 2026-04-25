'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useInView } from '../hooks/useInView';

interface Stat {
  value: string;
  numericValue?: number;
  suffix?: string;
  decimals?: number;
  label: string;
  sublabel: string;
  color: string;
}

const stats: Stat[] = [
  {
    value: '116,000+',
    numericValue: 116000,
    label: 'Phones stolen',
    sublabel: 'in London (2024)',
    color: 'text-destructive'
  },
  {
    value: '150%',
    numericValue: 150,
    suffix: '%',
    label: 'Increase',
    sublabel: 'since 2023',
    color: 'text-orange-600'
  },
  {
    value: '0.8%',
    numericValue: 0.8,
    suffix: '%',
    decimals: 1,
    label: 'Result in',
    sublabel: 'charges',
    color: 'text-primary'
  },
  {
    value: 'Every 5 min',
    label: 'One stolen',
    sublabel: '(theft rate)',
    color: 'text-teal-600'
  },
];

function AnimatedNumber({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, isInView } = useInView<HTMLSpanElement>({ threshold: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Number(current.toFixed(decimals)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{displayValue.toLocaleString()}{suffix}</span>;
}

export default function AnimatedStats() {
  return (
    <section className="mb-8 sm:mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      <div className="text-center mt-4 sm:mt-6 lg:mt-8">
        <a
          href="/statistics"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm sm:text-base lg:text-lg hover:scale-105 transition-transform duration-200"
        >
          <TrendingUp className="size-4 lg:h-5 lg:w-5" />
          View Detailed Statistics
        </a>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { ref, isInView } = useInView<HTMLDivElement>({ rootMargin: '-50px', threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`bg-card rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-on-scroll-scale ${isInView ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 lg:mb-3 ${stat.color} animate-pop-in ${isInView ? 'is-visible' : ''}`}
        style={{ animationDelay: `${index * 100 + 200}ms` }}
      >
        {stat.numericValue !== undefined ? (
          <AnimatedNumber value={stat.numericValue} suffix={stat.suffix} decimals={stat.decimals} />
        ) : (
          stat.value
        )}
      </div>
      <div className="text-xs sm:text-sm md:text-base lg:text-lg text-neutral-600 leading-tight">
        {stat.label}<br/>{stat.sublabel}
      </div>
      <div className="mt-1 sm:mt-2 lg:mt-3 text-[10px] sm:text-xs lg:text-sm text-neutral-400">Met Police data</div>
    </div>
  );
}
