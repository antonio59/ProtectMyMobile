'use client';

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Menu,
  X,
  Newspaper,
  BarChart3,
  Building2,
  Phone,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ShoppingBag,
  MapPin
} from 'lucide-react';
import SiteSearch from './SiteSearch';

// Desktop nav links (shown in header) - expanded to show more key pages
const desktopNavLinks = [
  { href: '/the-problem', label: 'The Problem', icon: AlertTriangle },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/banks', label: 'Banks', icon: Building2 },
  { href: '/prevention', label: 'Prevention', icon: BookOpen },
  { href: '/scenarios', label: 'Scenarios', icon: AlertTriangle },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/news', label: 'News', icon: Newspaper },
];

// Mobile menu links (full navigation)
const navLinks = [
  { href: '/the-problem', label: 'The Problem', icon: AlertTriangle },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/banks', label: 'Banks', icon: Building2 },
  { href: '/mobile-providers', label: 'Mobile Providers', icon: Phone },
  { href: '/prevention', label: 'Prevention Guide', icon: BookOpen },
  { href: '/london-visitor-safety', label: 'Visitor Safety', icon: MapPin },
  { href: '/scenarios', label: 'Scenarios', icon: AlertTriangle },
  { href: '/products', label: 'Product Recommendations', icon: ShoppingBag },
  { href: '/resources', label: 'Resources', icon: HelpCircle },
];

export default function HeaderMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-neutral-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group" aria-label="ProtectMyMobile - Go to homepage">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors hover:scale-105 active:scale-95 transition-transform duration-200">
                <img src="/logo-icon.svg" alt="" className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">
                ProtectMyMobile
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
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

          {/* Search + Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <SiteSearch />
            <a
              href="/security-checkup"
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Shield className="h-4 w-4" />
              Security Checkup
            </a>
            <a
              href="/emergency"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-destructive text-white rounded-xl font-bold hover:bg-destructive-hover transition-all text-sm shadow-lg shadow-destructive/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertTriangle className="h-4 w-4" />
              Phone Stolen?
            </a>
          </div>

          {/* Mobile Search + Emergency + Menu */}
          <div className="md:hidden flex items-center gap-2">
            <SiteSearch />
            <a
              href="/emergency"
              className="p-2 bg-destructive text-white rounded-xl hover:scale-105 active:scale-90 transition-transform duration-150"
              aria-label="Emergency - Phone stolen?"
            >
              <AlertTriangle className="h-5 w-5" />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors hover:scale-105 active:scale-90 transition-transform duration-150"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm z-50 shadow-2xl md:hidden overflow-hidden bg-white transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
          <span className="font-bold text-lg text-primary">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 hover:scale-105 active:scale-90 transition-all duration-150"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-neutral-700" />
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="p-4 space-y-3 border-b bg-neutral-50">
          <a
            href="/emergency"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-destructive text-white rounded-xl font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform duration-150"
            onClick={() => setIsOpen(false)}
          >
            <AlertTriangle className="h-5 w-5" />
            Phone Stolen? Act Now
          </a>
          <a
            href="/security-checkup"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform duration-150"
            onClick={() => setIsOpen(false)}
          >
            <Shield className="h-5 w-5" />
            Security Checkup
          </a>
        </div>

        {/* Navigation Links */}
        <nav
          className="p-4 bg-white overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="h-5 w-5 text-neutral-400 group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-neutral-50">
          <p className="text-xs text-neutral-500 text-center">
            Protecting UK residents from mobile theft
          </p>
        </div>
      </div>
    </header>
    </>
  );
}
