import React from "react";

function ShopSection() {
  return (
    <section id="shop" className="bg-[#F7F3EE] px-8 py-16">
      <div className="mx-auto grid max-w-[1450px] grid-cols-[42%_58%] items-center gap-10 rounded-[32px] bg-[#FFFCF7] p-10">
        <div className="text-right">
          <div className="mb-8 flex items-center justify-start gap-4">
            <span className="h-px w-16 bg-[#B08A57]" />
            <span className="text-[#B08A57]">✦</span>
            <span className="h-px w-16 bg-[#B08A57]" />
          </div>

          <h2 className="text-[58px] font-normal leading-tight text-[#041E42]">
            ویترین دیدار
          </h2>

          <p className="mt-7 max-w-[520px] text-[20px] leading-10 text-[#111820]/70">
            هر مجموعه، روایت متفاوتی از زیبایی است.
            <br />
            از امضای دیدار تا میراث جاودانه، مجموعه‌ای برای هر سلیقه و هر لحظه.
          </p>

          <div className="mt-10 flex gap-5">
            <a
              href="#collections"
              className="flex h-[58px] w-[220px] items-center justify-center rounded-xl bg-[#041E42] text-white transition-all duration-300 hover:bg-[#B08A57]"
            >
              مشاهده کالکشن‌ها
            </a>

            <a
              href="#art-gallery"
              className="flex h-[58px] w-[220px] items-center justify-center rounded-xl border border-[#B08A57] text-[#B08A57] transition-all duration-300 hover:bg-[#B08A57] hover:text-white"
            >
              رزرو تجربه حضوری
            </a>
          </div>
        </div>

        <img
          src="/images/shop-section.JPG"
          alt="ویترین دیدار"
          className="h-[520px] w-full rounded-[28px] object-cover"
        />
      </div>
    </section>
  );
}

export default ShopSection;