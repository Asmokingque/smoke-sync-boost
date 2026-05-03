import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturedCarousel<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selected, setSelected] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-[48%] lg:basis-[32%]"
            >
              {renderItem(item, i)}
            </motion.div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous"
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur border border-border hover:border-primary hover:text-primary transition-colors z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next"
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur border border-border hover:border-primary hover:text-primary transition-colors z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="flex justify-center gap-1.5 mt-5">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === selected ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
