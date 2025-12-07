import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

interface Props {
  images: string[];
  title: string;
}

export function ScenarioCarousel({ images, title }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="space-y-3">
      <div className="relative border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-hidden" ref={emblaRef} aria-label={`${title} slides`}>
          <div className="flex">
            {images.map((src) => (
              <div className="min-w-0 flex-[0_0_100%]" key={src}>
                <img src={src} alt={title} className="w-full h-auto object-contain bg-neutral-50" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button onClick={scrollPrev} aria-label="Previous" className="m-2 rounded-full bg-white/90 border border-neutral-200 shadow hover:bg-white px-2 py-1 text-sm">‹</button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button onClick={scrollNext} aria-label="Next" className="m-2 rounded-full bg-white/90 border border-neutral-200 shadow hover:bg-white px-2 py-1 text-sm">›</button>
        </div>
      </div>
      <div className="flex gap-1 justify-center" aria-hidden="true">
        {images.map((_, idx) => (
          <span key={idx} className="h-1.5 w-1.5 rounded-full bg-neutral-300 inline-block" />
        ))}
      </div>
    </div>
  );
}
