'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface Stat {
  value: string;
  numericValue?: number;
  suffix?: string;
  label: string;
  sublabel: string;
  color: string;
}

const stats: Stat[] = [
  { 
    value: '80,588', 
    numericValue: 80588,
    label: 'Phones stolen', 
    sublabel: 'in London (2024)',
    color: 'text-red-600'
  },
  { 
    value: '182%', 
    numericValue: 182,
    suffix: '%',
    label: 'Increase', 
    sublabel: 'since 2020',
    color: 'text-orange-600'
  },
  { 
    value: '1%', 
    numericValue: 1,
    suffix: '%',
    label: 'Result in', 
    sublabel: 'charges',
    color: 'text-blue-600'
  },
  { 
    value: '1 in 6', 
    label: 'Minutes', 
    sublabel: '(theft rate)',
    color: 'text-teal-600'
  },
];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function AnimatedStats() {
  return (
    <section className="mb-8 sm:mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-6 lg:p-8 text-center hover:shadow-xl transition-all group"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <motion.div
              className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 lg:mb-3 ${stat.color}`}
              initial={{ scale: 0.5 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: index * 0.1 + 0.2 }}
            >
              {stat.numericValue ? (
                <AnimatedNumber value={stat.numericValue} suffix={stat.suffix} />
              ) : (
                stat.value
              )}
            </motion.div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-neutral-600 leading-tight">
              {stat.label}<br/>{stat.sublabel}
            </div>
            <div className="mt-1 sm:mt-2 lg:mt-3 text-[10px] sm:text-xs lg:text-sm text-neutral-400">Met Police data</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-4 sm:mt-6 lg:mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <motion.a
          href="/statistics"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm sm:text-base lg:text-lg"
          whileHover={{ scale: 1.05 }}
        >
          <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
          View Detailed Statistics
        </motion.a>
      </motion.div>
    </section>
  );
}
