'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AnimatedHero() {
  return (
    <motion.section 
      className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full"
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl">
        <motion.h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Protect Your Mobile. Secure Your Digital Life.
        </motion.h1>
        
        <motion.p 
          className="text-base sm:text-lg md:text-xl mb-8 max-w-3xl text-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Over 80,000 phones stolen in London every year. Get the tools and guidance you need to stay safe.
        </motion.p>
        
        {/* Primary Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.a 
            href="/prevention" 
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white text-primary rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span>Protect Your Phone</span>
          </motion.a>
          <motion.a 
            href="/emergency" 
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span>Phone Stolen? Act Now</span>
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}
