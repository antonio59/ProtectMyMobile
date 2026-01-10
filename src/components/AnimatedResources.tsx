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
    <section className="mb-8 sm:mb-12">
      <motion.h2
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 sm:mb-6 lg:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Essential Resources
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {resources.map((resource, index) => (
          <motion.a
            key={resource.title}
            href={resource.href}
            className="group bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 lg:p-10 hover:shadow-xl transition-all border border-transparent hover:border-primary/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
              <motion.div
                className={`${resource.iconBg} rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 flex-shrink-0`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="[&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-8 sm:[&>svg]:w-8 lg:[&>svg]:h-10 lg:[&>svg]:w-10">
                  {resource.icon}
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2 lg:mb-3 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-neutral-600 mb-2 sm:mb-4 text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 sm:line-clamp-none">
                  {resource.description}
                </p>
                <span className={`${resource.linkColor} font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base lg:text-lg`}>
                  {resource.linkText}
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
