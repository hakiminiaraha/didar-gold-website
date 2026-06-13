import React from "react";

function DidarWorld() {
  return (
    <section id="world" className="bg-[#F7F3EE] px-20 py-20">
      <div className="mx-auto max-w-[3400px] overflow-hidden rounded-[24px] border border-[#E6D8C6] bg-[#FFFCF7]">
        <div className="grid grid-cols-[36%_64%] h-[300px]">
          
          {/* Text */}
          <div className="relative z-20 flex flex-col justify-center px-12 text-right">
            <h2 className="mb-4 text-[36px] font-normal text-[#041E42]">
              جهان روایت‌های دیدار
            </h2>

            <div className="mb-5 flex items-center justify-start gap-3">
              <span className="h-px w-10 bg-[#B08A57]" />
              <span className="text-[#B08A57]">✦</span>
              <span className="h-px w-10 bg-[#B08A57]" />
            </div>

            <p className="text-[16px] leading-8 text-[#111820]/70">
              ترکیبی از زیبایی، اصالت و اعتماد. هر قطعه دیدار، روایتی است از
              احساس، هنر و ماندگاری برای همیشه.
            </p>

            <a
              href="#about"
              className="mt-6 inline-flex h-[48px] w-[170px] items-center justify-center rounded-xl bg-[#041E42] text-[15px] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#B08A57]"
            >
              درباره دیدار ←
            </a>
          </div>

          {/* Image */}
          <div className="relative h-full overflow-hidden">
            <img
              src="/images/brand-story.png"
              alt="جهان روایت‌های دیدار"
              className="h-full w-full object-cover object-center"
            />

            <div className="absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l from-[#FFFCF7] to-transparent" />
          </div>

        </div>
      </div>
    </section>
  );
}

export default DidarWorld;