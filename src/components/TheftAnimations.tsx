import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Bike, Hand, Users, Coffee, MapPin, Clock, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

const BikeTheftAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div ref={ref} className="relative h-48 bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-2xl overflow-hidden">
      {/* Street background */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-neutral-300" />
      
      {/* Victim walking */}
      <motion.div
        className="absolute bottom-8 left-1/2"
        initial={{ x: -20 }}
        animate={isInView ? { x: 0 } : { x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-8 h-16 bg-blue-500 rounded-t-full relative">
          <div className="absolute -right-3 top-4 w-6 h-3 bg-white rounded-sm shadow-md" /> {/* Phone */}
        </div>
      </motion.div>
      
      {/* Bike thief */}
      <motion.div
        className="absolute bottom-8"
        initial={{ left: "-20%" }}
        animate={isInView ? { left: "60%" } : { left: "-20%" }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
      >
        <Bike className="h-12 w-12 text-red-500" />
      </motion.div>
      
      {/* Stolen phone flying */}
      <motion.div
        className="absolute w-6 h-3 bg-white rounded-sm shadow-lg"
        initial={{ opacity: 0, left: "52%", bottom: "4rem" }}
        animate={isInView ? { 
          opacity: [0, 1, 1, 0],
          left: ["52%", "52%", "70%", "80%"],
          bottom: ["4rem", "4rem", "5rem", "4rem"]
        } : {}}
        transition={{ duration: 1.5, delay: 1, times: [0, 0.1, 0.5, 1] }}
      />
      
      {/* Label */}
      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
        Bike Ride-By
      </div>
    </div>
  );
};

const SnatchAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div ref={ref} className="relative h-48 bg-gradient-to-r from-amber-50 to-orange-100 rounded-2xl overflow-hidden">
      {/* Coffee shop background */}
      <div className="absolute top-4 right-4 w-16 h-20 bg-amber-200 rounded-lg" />
      
      {/* Table */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-amber-700 rounded" />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-amber-800" />
      
      {/* Phone on table */}
      <motion.div
        className="absolute w-8 h-4 bg-white rounded-sm shadow-lg border border-neutral-200"
        style={{ left: "calc(50% - 1rem)", bottom: "3.5rem" }}
        animate={isInView ? {
          x: [0, 0, 100, 150],
          opacity: [1, 1, 1, 0]
        } : {}}
        transition={{ duration: 2, delay: 1, times: [0, 0.3, 0.6, 1] }}
      />
      
      {/* Thief hand */}
      <motion.div
        className="absolute"
        style={{ bottom: "3rem" }}
        initial={{ right: "-20%", opacity: 0 }}
        animate={isInView ? {
          right: ["100%", "45%", "45%", "-20%"],
          opacity: [0, 1, 1, 0]
        } : {}}
        transition={{ duration: 2, delay: 0.5, times: [0, 0.4, 0.6, 1] }}
      >
        <Hand className="h-8 w-8 text-neutral-700" />
      </motion.div>
      
      {/* Label */}
      <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
        Table Snatch
      </div>
    </div>
  );
};

const DistractionAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div ref={ref} className="relative h-48 bg-gradient-to-r from-purple-50 to-pink-100 rounded-2xl overflow-hidden">
      {/* Victim */}
      <div className="absolute bottom-8 left-1/3 w-8 h-14 bg-blue-400 rounded-t-full">
        <motion.div 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-300 rounded-full"
          animate={isInView ? { rotateZ: [0, -20, 0, 20, 0] } : {}}
          transition={{ duration: 2, delay: 0.5, repeat: 1 }}
        />
      </div>
      
      {/* Distractor */}
      <motion.div
        className="absolute bottom-8 w-8 h-14 bg-yellow-400 rounded-t-full"
        initial={{ left: "10%" }}
        animate={isInView ? { left: "25%" } : {}}
        transition={{ duration: 1 }}
      >
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-300 rounded-full" />
        {/* Speech bubble */}
        <motion.div
          className="absolute -top-8 -right-4 bg-white px-2 py-1 rounded-lg text-xs shadow-md"
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Hey!
        </motion.div>
      </motion.div>
      
      {/* Accomplice stealing */}
      <motion.div
        className="absolute bottom-8 w-8 h-14 bg-red-400 rounded-t-full"
        initial={{ right: "10%", opacity: 0 }}
        animate={isInView ? { right: "35%", opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.8 }}
      >
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-300 rounded-full" />
      </motion.div>
      
      {/* Phone being taken */}
      <motion.div
        className="absolute w-5 h-3 bg-white rounded-sm shadow-lg"
        style={{ bottom: "3rem", left: "38%" }}
        animate={isInView ? {
          x: [0, 0, 50, 80],
          opacity: [1, 1, 1, 0]
        } : {}}
        transition={{ duration: 2, delay: 1.5, times: [0, 0.3, 0.7, 1] }}
      />
      
      {/* Label */}
      <div className="absolute top-4 left-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
        Distraction Theft
      </div>
    </div>
  );
};

const MopedAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div ref={ref} className="relative h-48 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl overflow-hidden">
      {/* Road markings */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-8 h-1 bg-white" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-400" />
      
      {/* Pedestrian with phone */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-12 bg-green-500 rounded-t-full relative">
          <motion.div 
            className="absolute top-2 -left-4 w-5 h-8 bg-white rounded-sm shadow-md border"
            animate={isInView ? {
              x: [0, 0, -30],
              y: [0, 0, -20],
              opacity: [1, 1, 0]
            } : {}}
            transition={{ duration: 1.5, delay: 1.2, times: [0, 0.5, 1] }}
          />
        </div>
      </div>
      
      {/* Moped */}
      <motion.div
        className="absolute bottom-4"
        initial={{ left: "-15%" }}
        animate={isInView ? { left: "75%" } : {}}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <div className="relative">
          <div className="w-16 h-8 bg-neutral-800 rounded-lg" />
          <div className="absolute -bottom-2 left-1 w-4 h-4 bg-neutral-900 rounded-full" />
          <div className="absolute -bottom-2 right-1 w-4 h-4 bg-neutral-900 rounded-full" />
          <div className="absolute -top-4 left-2 w-4 h-6 bg-red-600 rounded-t-lg" /> {/* Rider */}
        </div>
      </motion.div>
      
      {/* Label */}
      <div className="absolute top-4 left-4 bg-slate-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
        Moped Snatch
      </div>
    </div>
  );
};

const AnimatedCounter = ({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);
  
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export const TheftMethodsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        <BikeTheftAnimation />
        <p className="mt-3 text-sm text-neutral-600">
          Thieves on bikes target people using phones while walking, snatching devices at speed.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <SnatchAnimation />
        <p className="mt-3 text-sm text-neutral-600">
          Phones left on cafe or restaurant tables are grabbed by thieves passing by.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <DistractionAnimation />
        <p className="mt-3 text-sm text-neutral-600">
          One person distracts you while an accomplice steals your phone from pocket or bag.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <MopedAnimation />
        <p className="mt-3 text-sm text-neutral-600">
          Moped riders mount pavements to snatch phones from pedestrians' hands.
        </p>
      </motion.div>
    </div>
  );
};

export const StatsSection = () => {
  const stats = [
    { value: 78000, suffix: '+', label: 'Phones stolen in London alone (2023)', icon: MapPin },
    { value: 200000, suffix: '+', label: 'UK mobile thefts per year', icon: AlertTriangle },
    { value: 44, suffix: '%', label: 'Increase since 2022', icon: TrendingUp },
    { value: 6, suffix: '%', label: 'Recovery rate', icon: Shield },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="bg-white rounded-2xl p-4 shadow-md border border-neutral-100 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <stat.icon className="h-6 w-6 mx-auto mb-2 text-red-500" />
          <div className="text-2xl md:text-3xl font-bold text-neutral-900">
            <AnimatedCounter end={stat.value} suffix={stat.suffix} />
          </div>
          <p className="text-xs text-neutral-600 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export const HotspotsSection = () => {
  const hotspots = [
    { area: 'Westminster', thefts: '12,000+', risk: 'Extreme' },
    { area: 'Camden', thefts: '8,500+', risk: 'Very High' },
    { area: 'Tower Hamlets', thefts: '6,200+', risk: 'High' },
    { area: 'Hackney', thefts: '5,800+', risk: 'High' },
    { area: 'Lambeth', thefts: '5,100+', risk: 'High' },
    { area: 'Southwark', thefts: '4,900+', risk: 'High' },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {hotspots.map((spot, i) => (
        <motion.div
          key={spot.area}
          className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="font-semibold text-sm">{spot.area}</span>
          </div>
          <p className="text-lg font-bold text-red-600">{spot.thefts}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            spot.risk === 'Extreme' ? 'bg-red-100 text-red-700' :
            spot.risk === 'Very High' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {spot.risk} Risk
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export const TimelineSection = () => {
  const events = [
    { year: '2019', event: 'Pre-pandemic baseline: ~150,000 thefts/year' },
    { year: '2020', event: 'Lockdowns temporarily reduce street theft' },
    { year: '2021', event: 'Thefts begin rising as restrictions ease' },
    { year: '2022', event: 'Organised gangs increasingly target phones' },
    { year: '2023', event: '78,000 stolen in London alone - 44% increase' },
    { year: '2024', event: 'Government announces new theft crackdown' },
  ];
  
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-red-500" />
      <div className="space-y-4">
        {events.map((item, i) => (
          <motion.div
            key={item.year}
            className="flex items-start gap-4 pl-8 relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
            <div>
              <span className="font-bold text-primary">{item.year}</span>
              <p className="text-sm text-neutral-700">{item.event}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
