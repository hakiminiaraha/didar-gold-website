import React, { useState } from "react";

const galleryImages = [
  "/images/gallery-main.JPG",
  "/images/gallery-1.JPG",
  "/images/gallery-2.JPG",
  "/images/gallery-3.JPG",
  "/images/gallery-4.JPG",
];

function ArtGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  return (
    <section id="art-gallery" className="bg-[#F7F3EE] px-8 py-16">
      <div className="mx-auto max-w-[1450px]">
        <div className="grid grid-cols-[1fr_420px] gap-10 items-center">
          
          {/* Slider */}
          <div className="relative overflow-hidden rounded-[28px]">
            <img
              src={galleryImages[currentIndex]}
              alt="Didar Art Gallery"
              className="h-[520px] w-full object-cover transition-all duration-500"
            />

            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFCF7]/80 text-[#041E42] backdrop-blur-md transition hover:bg-[#B08A57] hover:text-white"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFCF7]/80 text-[#041E42] backdrop-blur-md transition hover:bg-[#B08A57] hover:text-white"
            >
              ›
            </button>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index
                      ? "w-8 bg-[#B08A57]"
                      : "w-2 bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="text-right">
            <h2 className="text-[56px] leading-tight text-[#041E42]">
              تجربه حضوری
              <br />
              دیدار
            </h2>

            <p className="mt-6 text-[18px] leading-9 text-[#111820]/70">
              هر قطعه پیش از انتخاب، باید دیده شود.
              <br />
              فضایی برای لمس جزئیات، گفتگو و انتخابی مطمئن.
            </p>

            <button className="mt-8 h-[56px] rounded-xl bg-[#041E42] px-10 text-white transition-all duration-300 hover:bg-[#B08A57]">
              رزرو تجربه حضوری
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ArtGallery;