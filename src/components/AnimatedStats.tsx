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
    value: '117,211',
    numericValue: 117211,
    label: 'Phones stolen',
    sublabel: 'in London (2024)',
    color: 'text-destructive'
  },
  {
    value: '12.3%',
    numericValue: 12.3,
    suffix: '%',
    decimals: 1,
    label: 'Fall in thefts',
    sublabel: '2025 vs 2024',
    color: 'text-destructive'
  },
  {
    value: '248',
    numericValue: 248,
    label: 'Arrests in one',
    sublabel: '4-week blitz (2026)',
    color: 'text-foreground'
  },
  {
    value: 'Every 5 min',
    label: 'One stolen',
    sublabel: '(2024 rate)',
    color: 'text-foreground'
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
          <TrendingUp className="size-4 lg:size-5" />
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
      className={`bg-card rounded-xl sm:rounded-2xl  p-3 sm:p-6 lg:p-8 text-center hover: hover:-translate-y-1 transition-all duration-300 animate-on-scroll-scale ${isInView ? 'is-visible' : ''}`}
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
      <div className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground leading-tight">
        {stat.label}<br/>{stat.sublabel}
      </div>
      <div className="mt-1 sm:mt-2 lg:mt-3 text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Met Police data</div>
    </div>
  );
}
