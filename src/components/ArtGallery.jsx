import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSitePreferences } from "../context/SitePreferencesContext";

const galleryImages = [
  "/images/gallery-main.JPG",
  "/images/gallery-1.JPG",
  "/images/gallery-2.JPG",
  "/images/gallery-3.JPG",
  "/images/gallery-4.JPG",
];

function ArtGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { language } = useSitePreferences();
  const text = language === "fa"
    ? [
        "تجربه حضوری دیدار",
        "هر قطعه پیش از انتخاب، باید دیده شود. فضایی برای لمس جزئیات، گفت‌وگو و انتخابی مطمئن.",
        "رزرو تجربه حضوری",
      ]
    : [
        "Experience Didar in Person",
        "Every creation deserves to be seen before it is chosen. A space for detail, conversation, and a confident decision.",
        "Book a Private Viewing",
      ];

  const goTo = (index) => setCurrentIndex((index + galleryImages.length) % galleryImages.length);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setCurrentIndex((value) => (value + 1) % galleryImages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section id="art-gallery" className="bg-[var(--surface)] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1450px] items-center gap-10 lg:grid-cols-[1fr_430px]">
        <div
          className="relative overflow-hidden rounded-[30px] bg-[#041E42]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-[420px] sm:h-[560px]">
            {galleryImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Didar Art Gallery ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                  currentIndex === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
                }`}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#041E42]/65 to-transparent" />
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            aria-label="Previous"
            className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--surface-raised)]/88 text-[var(--ink)] backdrop-blur transition hover:bg-[#B08A57] hover:text-white"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            aria-label="Next"
            className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--surface-raised)]/88 text-[var(--ink)] backdrop-blur transition hover:bg-[#B08A57] hover:text-white"
          >
            <ChevronRight />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentIndex === index ? "w-10 bg-[#D9B985]" : "w-4 bg-white/55 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-start">
          <p className="text-xs tracking-[0.25em] text-[#B08A57]">DIDAR ART GALLERY</p>
          <h2 className="mt-4 text-4xl leading-tight text-[var(--ink)] sm:text-5xl">{text[0]}</h2>
          <p className="mt-6 text-lg leading-9 text-[var(--ink-muted)]">{text[1]}</p>
          <Link to="/contact#appointment" className="mt-8 inline-flex h-14 items-center rounded-xl bg-[#041E42] px-10 text-white transition hover:-translate-y-1 hover:bg-[#B08A57]">
            {text[2]}
          </Link>
          <div className="mt-8 flex items-center gap-3 text-xs text-[var(--ink-muted)]">
            <span className="text-[#B08A57]">0{currentIndex + 1}</span>
            <span className="h-px w-14 bg-[var(--line)]" />
            <span>0{galleryImages.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArtGallery;
