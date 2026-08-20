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
import ThemeToggle from './ThemeToggle';

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

      <header className="bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b-[3px] border-foreground">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Wordmark */}
            <a href="/" className="flex items-baseline gap-2.5 group" aria-label="ProtectMyMobile - Go to homepage">
              <span className="font-serif text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                ProtectMyMobile
              </span>
              <span className="hidden 2xl:inline whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Track the theft. Protect your phone.
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {desktopNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-2 py-2 text-[13px] font-medium text-foreground hover:text-destructive transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </nav>

          {/* Search + Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <SiteSearch />
            <a
              href="/security-checkup"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 border-2 border-foreground text-foreground font-bold uppercase tracking-wide hover:bg-foreground hover:text-background transition-all text-xs whitespace-nowrap"
            >
              <Shield className="size-4 shrink-0" />
              Checkup
            </a>
            <a
              href="/emergency"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-destructive text-white font-bold uppercase tracking-wide hover:bg-destructive-hover transition-all text-xs whitespace-nowrap"
            >
              <AlertTriangle className="size-4" />
              Phone Stolen?
            </a>
          </div>

          {/* Mobile Search + Emergency + Menu */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <SiteSearch />
            <a
              href="/emergency"
              className="p-2 bg-destructive text-white rounded-xl hover:scale-105 active:scale-90 transition-transform duration-150"
              aria-label="Emergency - Phone stolen?"
            >
              <AlertTriangle className="size-5" />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors hover:scale-105 active:scale-90 transition-transform duration-150"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
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
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm z-50 shadow-2xl md:hidden overflow-hidden bg-card transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <span className="font-bold text-lg text-primary">Menu</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 hover:scale-105 active:scale-90 transition-all duration-150"
            aria-label="Close menu"
          >
            <X className="size-6 text-foreground" />
          </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="p-4 space-y-3 border-b border-border bg-neutral">
          <a
            href="/emergency"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-destructive text-white rounded-xl font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform duration-150"
            onClick={() => setIsOpen(false)}
          >
            <AlertTriangle className="size-5" />
            Phone Stolen? Act Now
          </a>
          <a
            href="/security-checkup"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform duration-150"
            onClick={() => setIsOpen(false)}
          >
            <Shield className="size-5" />
            Security Checkup
          </a>
        </div>

        {/* Navigation Links */}
        <nav
          className="p-4 bg-card overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-neutral-100 active:bg-neutral-200 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1">{link.label}</span>
                  <ChevronRight className="size-4 text-neutral-300 group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-neutral">
          <p className="text-xs text-muted-foreground text-center">
            Protecting UK residents from mobile theft
          </p>
        </div>
      </div>
    </header>
    </>
  );
}
