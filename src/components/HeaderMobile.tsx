'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Menu, 
  X, 
  Home,
  Newspaper,
  BarChart3,
  Map,
  Building2,
  Phone,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { slideInRight, overlayVariants, staggerContainer, staggerItem } from './ui/motion';

// Desktop nav links (shown in header)
const desktopNavLinks = [
  { href: '/the-problem', label: 'The Problem', icon: AlertTriangle },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/timelapse', label: 'Theft Map', icon: Map },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/news', label: 'News', icon: Newspaper },
];

// Mobile menu links (full navigation)
const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/the-problem', label: 'The Problem', icon: AlertTriangle },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/timelapse', label: 'Theft Map', icon: Map },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/banks', label: 'Banks', icon: Building2 },
  { href: '/mobile-providers', label: 'Mobile Providers', icon: Phone },
  { href: '/prevention', label: 'Prevention Guide', icon: BookOpen },
  { href: '/products', label: 'Product Recommendations', icon: ShoppingBag },
  { href: '/resources', label: 'Resources', icon: HelpCircle },
];

export default function HeaderMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-neutral-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <motion.div 
              className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="h-7 w-7 text-primary" />
            </motion.div>
            <span className="text-xl font-bold text-primary tracking-tight">
              ProtectMyMobile
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {desktopNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="/security-checkup"
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="h-4 w-4" />
              Security Checkup
            </motion.a>
            <motion.a
              href="/emergency"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm shadow-lg shadow-red-600/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertTriangle className="h-4 w-4" />
              Phone Stolen?
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Menu */}
            <motion.div
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm z-50 shadow-2xl md:hidden overflow-hidden"
              style={{ backgroundColor: '#ffffff' }}
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
                <span className="font-bold text-lg text-primary">Menu</span>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-neutral-700" />
                </motion.button>
              </div>

              {/* CTA Buttons */}
              <div className="p-4 space-y-3 border-b bg-neutral-50">
                <motion.a
                  href="/emergency"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                >
                  <AlertTriangle className="h-5 w-5" />
                  Phone Stolen? Act Now
                </motion.a>
                <motion.a
                  href="/security-checkup"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-primary text-primary rounded-xl font-semibold"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  Security Checkup
                </motion.a>
              </div>

              {/* Navigation Links */}
              <motion.nav
                className="p-4 bg-white overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <motion.li key={link.href} variants={staggerItem}>
                      <a
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors group"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="h-5 w-5 text-neutral-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium flex-1">{link.label}</span>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary transition-colors" />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-neutral-50">
                <p className="text-xs text-neutral-500 text-center">
                  Protecting UK residents from mobile theft
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
