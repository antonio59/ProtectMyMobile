'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Building2, Phone, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface Resource {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
  linkColor: string;
  linkText: string;
}

const resources: Resource[] = [
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    iconBg: 'bg-primary/10',
    title: 'Prevention Guides',
    description: 'Secure your device with PIN locks, SIM protection, and app security. Learn how to prevent theft before it happens.',
    href: '/prevention',
    linkColor: 'text-primary',
    linkText: 'Learn How to Protect Your Phone',
  },
  {
    icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
    iconBg: 'bg-red-100',
    title: 'Emergency Response',
    description: 'Phone stolen? Follow our 5-step emergency checklist to lock your device, secure accounts, and report the theft.',
    href: '/emergency',
    linkColor: 'text-red-600',
    linkText: 'See Emergency Steps',
  },
  {
    icon: <Building2 className="h-8 w-8 text-blue-600" />,
    iconBg: 'bg-blue-100',
    title: 'UK Bank Contacts',
    description: 'Emergency contact numbers for 25+ UK banks. Secure your accounts and prevent fraud immediately.',
    href: '/banks',
    linkColor: 'text-blue-600',
    linkText: 'Find Your Bank',
  },
  {
    icon: <Phone className="h-8 w-8 text-green-600" />,
    iconBg: 'bg-green-100',
    title: 'Mobile Networks',
    description: 'Contact details for 50+ UK mobile providers. Block your SIM and prevent unauthorized usage.',
    href: '/mobile-providers',
    linkColor: 'text-green-600',
    linkText: 'Find Your Provider',
  },
];

export default function AnimatedResources() {
  return (
    <section className="mb-12">
      <motion.h2 
        className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Essential Resources
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource, index) => (
          <motion.a
            key={resource.title}
            href={resource.href}
            className="group bg-white rounded-2xl shadow-md p-6 md:p-8 hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <div className="flex items-start gap-4">
              <motion.div 
                className={`${resource.iconBg} rounded-xl p-3 flex-shrink-0`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {resource.icon}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-neutral-600 mb-4 text-sm md:text-base">
                  {resource.description}
                </p>
                <span className={`${resource.linkColor} font-medium flex items-center gap-1 text-sm md:text-base`}>
                  {resource.linkText} 
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
