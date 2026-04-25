'use client';

import { Shield, AlertTriangle, Building2, Phone, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

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
    icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
    iconBg: 'bg-destructive-muted',
    title: 'Emergency Response',
    description: 'Phone stolen? Follow our 5-step emergency checklist to lock your device, secure accounts, and report the theft.',
    href: '/emergency',
    linkColor: 'text-destructive',
    linkText: 'See Emergency Steps',
  },
  {
    icon: <Building2 className="h-8 w-8 text-primary" />,
    iconBg: 'bg-primary-muted',
    title: 'UK Bank Contacts',
    description: 'Emergency contact numbers for 25+ UK banks. Secure your accounts and prevent fraud immediately.',
    href: '/banks',
    linkColor: 'text-primary',
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
  const { ref: headingRef, isInView: headingInView } = useInView<HTMLHeadingElement>({ threshold: 0.2 });

  return (
    <section className="mb-8 sm:mb-12">
      <h2
        ref={headingRef}
        className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 animate-on-scroll ${headingInView ? 'is-visible' : ''}`}
      >
        Essential Resources
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {resources.map((resource, index) => (
          <ResourceCard key={resource.title} resource={resource} index={index} />
        ))}
      </div>
    </section>
  );
}

function ResourceCard({ resource, index }: { resource: Resource; index: number }) {
  const { ref, isInView } = useInView<HTMLAnchorElement>({ rootMargin: '-50px', threshold: 0.1 });

  return (
    <a
      ref={ref}
      href={resource.href}
      className={`group bg-card rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10 hover:-translate-y-1 hover:scale-[1.01] animate-on-scroll ${isInView ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
        <div
          className={`${resource.iconBg} rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <div className="[&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-8 sm:[&>svg]:w-8 lg:[&>svg]:h-10 lg:[&>svg]:w-10">
            {resource.icon}
          </div>
        </div>
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
    </a>
  );
}
