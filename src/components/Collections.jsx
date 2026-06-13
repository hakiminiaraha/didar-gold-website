import React from "react";

const collections = [
  
  { 
    title: "CEREMONY",
    subtitle: "مراسم خاص",
    image: "/images/Collection-03.png",
  }, 
  { 
    title: "SIGNATURE",
    subtitle: "امضای دیدار",
    image: "/images/Collection-01.png",
  },
 { 
    title: "HERITAGE",
    subtitle: "میراث جاودانه",
    image: "/images/collection-heritage.jpg",
  },
];

function Collections() {
  return (
    <section id="collections" className="bg-[#F7F3EE] px-8 pt-6 pb-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {collections.map((item) => (
            <article
              key={item.title}
              className="group relative h-[290px] cursor-pointer overflow-hidden rounded-[24px]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-6 right-6 text-white">
                <h3 className="text-[34px] font-normal tracking-[0.08em]">
                  {item.title}
                </h3>

                <p className="mt-1 text-[16px] text-white/85">
                  {item.subtitle}
                </p>

                <button className="mt-4 border border-[#CFA76A] px-5 py-2 text-[14px] text-white transition hover:bg-[#CFA76A]">
                  مشاهده
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Collections;