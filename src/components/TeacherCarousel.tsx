"use client";

import { useRef, useEffect, useState } from "react";
import TeacherCard from "./TeacherCard";
import type { Teacher } from "app/lib/types";

export default function TeacherCarousel({ teachers }: { teachers: Teacher[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const step = 320; // Scroll-Schritt (ungefähr Kartenbreite)
  const scrollBy = (px: number) => ref.current?.scrollBy({ left: px, behavior: "smooth" });

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* Fade-Edges (nur Desktop) */}
      <div className="pointer-events-none hidden md:block absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none hidden md:block absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

      {/* Arrows (Desktop) */}
      <button
        onClick={() => scrollBy(-step)}
        aria-label="Nach links"
        className={`hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20
                    h-11 w-11 items-center justify-center rounded-full
                    bg-white shadow border transition
                    ${canLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        ◀
      </button>
      <button
        onClick={() => scrollBy(step)}
        aria-label="Nach rechts"
        className={`hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20
                    h-11 w-11 items-center justify-center rounded-full
                    bg-white shadow border transition
                    ${canRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        ▶
      </button>

      {/* Scroller */}
      <div
        ref={ref}
        className="no-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 md:px-6"
      >
        {/* Wrapper sorgt dafür, dass die Karten mittig stehen, wenn Inhalt < Viewport */}
        <div className="min-w-full flex justify-center">
          {/* Track wird nur so breit wie sein Inhalt */}
          <div className="w-max flex gap-4 md:gap-6 py-3 md:py-4 items-stretch">
            {teachers.map((t) => (
              <TeacherCard key={t.id} teacher={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
