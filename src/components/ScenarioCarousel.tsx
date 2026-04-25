import { useRef, useState } from "react";
import { Share2, Check, Copy, X, MessageCircle } from "lucide-react";

interface Props {
  images: string[];
  title: string;
  summary?: string;
  scenarioId?: string;
}

export function ScenarioCarousel({ images, title, summary, scenarioId }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const width = el.getBoundingClientRect().width;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  const getShareUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://protectmymobile.xyz';
    const anchor = scenarioId ? `#${scenarioId}` : '';
    return `${baseUrl}/scenarios${anchor}`;
  };

  const getShareText = () => {
    return `${title} - Phone theft prevention guide from ProtectMyMobile`;
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: title,
      text: summary || getShareText(),
      url: getShareUrl(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShowShareMenu(false);
      }
    } catch (err) {
      // User cancelled or error - ignore
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch {
      // Fallback: show alert if clipboard API unavailable
      alert(`Copy this link: ${getShareUrl()}`);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title}\n\n${summary || 'Learn how to protect your phone from theft.'}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
    setShowShareMenu(false);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${title}\n\n${summary || 'Learn how to protect your phone from theft.'}\n\n${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-card">
        <div
          className="overflow-x-auto no-scrollbar"
          ref={trackRef}
          aria-label={`${title} slides`}
        >
          <div className="flex snap-x snap-mandatory">
            {images.map((src) => (
              <div className="min-w-0 flex-[0_0_100%] snap-center" key={src}>
                <img src={src} alt={title} className="w-full h-auto object-contain bg-neutral-50" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button onClick={() => scrollBy(-1)} aria-label="Previous" className="m-2 rounded-full bg-white/90 border border-neutral-200 shadow hover:bg-white px-2 py-1 text-sm">‹</button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button onClick={() => scrollBy(1)} aria-label="Next" className="m-2 rounded-full bg-white/90 border border-neutral-200 shadow hover:bg-white px-2 py-1 text-sm">›</button>
        </div>

        {/* Share button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="rounded-full bg-white/90 border border-neutral-200 shadow hover:bg-white p-2 text-neutral-600 hover:text-primary transition-colors"
            aria-label="Share this scenario"
          >
            <Share2 className="size-4" />
          </button>

          {/* Share dropdown menu */}
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-lg border border-neutral-200 py-2 z-50 animate-scale-in">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Share</p>
              </div>
              
              {/* Native share (mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Share2 className="size-4" />
                  Share...
                </button>
              )}

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <X className="size-4" />
                Post on X
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Slide indicators */}
      <div className="flex gap-1 justify-center" aria-hidden="true">
        {images.map((_, idx) => (
          <span key={idx} className="h-1.5 w-1.5 rounded-full bg-neutral-300 inline-block" />
        ))}
      </div>
    </div>
  );
}
