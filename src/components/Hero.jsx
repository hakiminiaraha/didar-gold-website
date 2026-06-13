import React from "react";
import Header from "./Header";

function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <Header />

      <video
        className="absolute inset-0 h-full w-full object-cover object-left"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>


<div className="absolute inset-0 bg-gradient-to-l from-[#F7F3EE]/70 via-[#F7F3EE]/30 to-transparent" />

<div className="absolute right-[3%] top-1/2 w-[620px] -translate-y-1/2 text-right">
  <h1 className="text-[#041E42] text-[58px] font-normal leading-[1.55] tracking-[-0.03em]">
    زیبایی،
    <br />
    وقتی با اعتماد
    <br />
    همراه می‌شود
  </h1>

  <p className="mt-7 text-[21px] leading-10 text-[#111820]/65">
    دیدار، روایتگر لحظه‌هایی است که ماندگار می‌شوند.
  </p>

  <div className="mt-10 flex justify-start gap-[30px]">
    <a
      href="#collections"
     className="
flex
h-[60px]
w-[220px]
rounded-2xl
items-center
justify-center
bg-[#041E42]
text-white
text-[17px]
font-medium
transition-all
duration-300
hover:bg-[#B08A57]
hover:-translate-y-1
"
    >
      مشاهده مجموعه‌ها
    </a>

  <a
  href="#art-gallery"
  className="
flex
h-[60px]
w-[220px]
rounded-2xl
items-center
justify-center
bg-[#B08A57]
text-white
text-[17px]
font-medium
transition-all
duration-300
hover:bg-[#041E42]
hover:-translate-y-1
"
>
  رزرو تجربه حضوری
</a>
  </div>
      </div>
    </section>
  );
}

export default Hero;