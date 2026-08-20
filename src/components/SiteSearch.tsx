'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Command, Phone, Shield, AlertTriangle, Building2, BarChart3, BookOpen, Newspaper, MapPin, HelpCircle, ShoppingBag, ChevronRight } from 'lucide-react';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ElementType;
}

const searchData: SearchResult[] = [
  // Emergency
  { title: 'Emergency Steps', description: 'What to do immediately if your phone is stolen', href: '/emergency', category: 'Emergency', icon: AlertTriangle },
  { title: 'Security Checkup', description: 'Check if your phone is properly secured', href: '/security-checkup', category: 'Emergency', icon: Shield },

  // Prevention
  { title: 'Prevention Guide', description: 'How to prevent phone theft and secure your device', href: '/prevention', category: 'Prevention', icon: Shield },
  { title: 'Scenarios Gallery', description: 'Visual guides showing how theft happens', href: '/scenarios', category: 'Prevention', icon: BookOpen },
  { title: 'Products', description: 'Protective gear and accessories', href: '/products', category: 'Prevention', icon: ShoppingBag },

  // Information
  { title: 'Statistics', description: 'UK phone theft data and trends', href: '/statistics', category: 'Data', icon: BarChart3 },
  { title: 'The Problem', description: 'Understanding the phone theft epidemic', href: '/the-problem', category: 'Information', icon: AlertTriangle },
  { title: 'News', description: 'Latest phone theft news and updates', href: '/news', category: 'Information', icon: Newspaper },

  // Directories
  { title: 'Bank Directory', description: 'Emergency contact numbers for all UK banks', href: '/banks', category: 'Directory', icon: Building2 },
  { title: 'Mobile Providers', description: 'Contact numbers for network providers', href: '/mobile-providers', category: 'Directory', icon: Phone },

  // Locations
  { title: 'London Guide', description: 'Theft hotspots and safety tips for London', href: '/london', category: 'Locations', icon: MapPin },
  { title: 'Westminster', description: 'Theft hotspots in Westminster', href: '/westminster', category: 'Locations', icon: MapPin },
  { title: 'Camden', description: 'Theft hotspots in Camden', href: '/camden', category: 'Locations', icon: MapPin },
  { title: 'Tower Hamlets', description: 'Shoreditch, Brick Lane safety guide', href: '/tower-hamlets', category: 'Locations', icon: MapPin },
  { title: 'Hackney', description: 'Dalston and London Fields safety', href: '/hackney', category: 'Locations', icon: MapPin },
  { title: 'Manchester', description: 'Theft hotspots and safety tips', href: '/manchester', category: 'Locations', icon: MapPin },
  { title: 'Birmingham', description: 'City centre safety guide', href: '/birmingham', category: 'Locations', icon: MapPin },
  { title: 'Liverpool', description: 'City centre and nightlife safety', href: '/liverpool', category: 'Locations', icon: MapPin },
  { title: 'Leeds', description: 'Student area and nightlife safety', href: '/leeds', category: 'Locations', icon: MapPin },
  { title: 'Edinburgh', description: 'Royal Mile and Festival safety', href: '/edinburgh', category: 'Locations', icon: MapPin },
  { title: 'Glasgow', description: 'City centre safety guide', href: '/glasgow', category: 'Locations', icon: MapPin },
  { title: 'Bristol', description: 'Harbourside and shopping safety', href: '/bristol', category: 'Locations', icon: MapPin },
  { title: 'Brighton', description: 'Seafront and Lanes safety', href: '/brighton', category: 'Locations', icon: MapPin },

  // Help
  { title: 'FAQ', description: 'Frequently asked questions', href: '/faq', category: 'Help', icon: HelpCircle },
  { title: 'Visitor Safety', description: 'Safety tips for tourists in London', href: '/london-visitor-safety', category: 'Help', icon: MapPin },
  { title: 'Community Experiences', description: 'Stories and experiences from others', href: '/community-experiences', category: 'Help', icon: BookOpen },
  { title: 'All Resources', description: 'Complete resource library', href: '/resources', category: 'Help', icon: BookOpen },

  // Contact
  { title: 'About Us', description: 'Learn about ProtectMyMobile', href: '/about-us', category: 'About', icon: HelpCircle },
  { title: 'Contact Us', description: 'Get in touch', href: '/contact-us', category: 'About', icon: HelpCircle },
  { title: 'Privacy Policy', description: 'How we handle your data', href: '/privacy', category: 'About', icon: HelpCircle },
  { title: 'Terms of Service', description: 'Terms and conditions', href: '/terms', category: 'About', icon: HelpCircle },
];

const categoryColors: Record<string, string> = {
  'Emergency': 'bg-destructive-muted text-destructive-hover',
  'Prevention': 'bg-neutral-100 text-foreground',
  'Data': 'bg-primary text-primary',
  'Information': 'bg-primary-muted text-primary-hover',
  'Directory': 'bg-neutral-100 text-foreground',
  'Locations': 'bg-neutral-100 text-foreground',
  'Help': 'bg-neutral-100 text-foreground',
  'About': 'bg-neutral-100 text-neutral-700',
};

export default function SiteSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens; restore focus on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      triggerButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const filtered = searchData.filter(item =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery)
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].href;
        }
        break;
    }
  }, [results, selectedIndex]);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      {/* Desktop Search Trigger */}
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-muted-foreground transition-colors text-sm"
        aria-label="Open search (Cmd+K)"
      >
        <Search className="size-4" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 bg-card rounded text-xs font-medium border border-border">
          <Command className="size-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Mobile Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-muted-foreground transition-colors"
        aria-label="Open search"
      >
        <Search className="size-5" />
      </button>

      {isOpen && (
        <>
          {/* Modal Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-150 opacity-100"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Search Modal */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-card rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] transition-all duration-150 opacity-100 scale-100 translate-y-0"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <Search className="size-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, guides, locations..."
                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded hover:bg-neutral-100 text-muted-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hidden md:block px-2 py-1 text-xs text-muted-foreground border border-border rounded"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1 p-2">
              {query.trim() === '' ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">Start typing to search...</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Try: "emergency", "banks", "London", "prevention"
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center size-12 bg-neutral-100 rounded-full mb-3">
                    <Search className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try different keywords or check spelling
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedResults).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {items.map((result) => {
                          const globalIndex = results.indexOf(result);
                          const Icon = result.icon;
                          return (
                            <a
                              key={result.href}
                              href={result.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                globalIndex === selectedIndex
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-neutral-100'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${categoryColors[category] || 'bg-neutral-100'}`}>
                                <Icon className="size-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${globalIndex === selectedIndex ? 'text-primary' : 'text-foreground'}`}>
                                  {result.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.description}
                                </p>
                              </div>
                              <ChevronRight className={`size-4 flex-shrink-0 ${globalIndex === selectedIndex ? 'text-primary' : 'text-neutral-300'}`} />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-neutral text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-card rounded border border-border font-sans">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-card rounded border border-border font-sans">↓</kbd>
                  <span className="ml-1">to navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-card rounded border border-border font-sans">↵</kbd>
                  <span className="ml-1">to select</span>
                </span>
              </div>
              <span>{results.length} results</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
