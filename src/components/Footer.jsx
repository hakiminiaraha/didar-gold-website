import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#041E42] text-white mt-0">
      <div className="max-w-[1450px] mx-auto px-8 py-10">
        {/* Brand Header */}
        <div className="text-center">
          <img
            src="/images/logo-didar.png"
            alt="Didar"
            className="h-32 object-contain mx-auto brightness-0 invert"
          />

          <p className="mt-5 text-[20px] leading-[2] text-white/80">
            دیدار، جایی که زیبایی با اعتماد ماندگار می‌شود.
          </p>
        </div>

        <div className="h-px bg-[#B08A57]/25 my-9" />

        {/* Sitemap */}
        <div className="grid grid-cols-5 gap-8 text-right">
          <div>
            <h4 className="text-[#B08A57] mb-5 text-[18px]">درباره دیدار</h4>
            <ul className="space-y-3 text-white/65 text-[15px]">
              <li>داستان دیدار</li>
              <li>فلسفه برند</li>
              <li>مجله دیدار</li>
              <li>آرت گالری</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#B08A57] mb-5 text-[18px]">محصولات</h4>
            <ul className="space-y-3 text-white/65 text-[15px]">
              <li>کالکشن‌ها</li>
              <li>انگشتر</li>
              <li>گردنبند</li>
              <li>دستبند</li>
              <li>گوشواره</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#B08A57] mb-5 text-[18px]">خدمات</h4>
            <ul className="space-y-3 text-white/65 text-[15px]">
              <li>شناسنامه دیجیتال</li>
              <li>گارانتی اصالت</li>
              <li>بازخرید مطمئن</li>
              <li>راهنمای نگهداری</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#B08A57] mb-5 text-[18px]">خرید عمده</h4>
            <ul className="space-y-3 text-white/65 text-[15px]">
              <li>ویژه همکاران</li>
              <li>شرایط همکاری</li>
              <li>درخواست نمایندگی</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#B08A57] mb-5 text-[18px]">تماس و پشتیبانی</h4>
            <ul className="space-y-3 text-white/65 text-[15px]">
              <li>۰۲۱-۹۱۰۰۲۰۲۰</li>
              <li>info@didargold.com</li>
              <li>تهران، مجتمع دیدار</li>
              <li>سوالات متداول</li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-[#B08A57]/20 my-9" />

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-[14px]">
            © تمامی حقوق این وب‌سایت برای دیدار گلد محفوظ است.
          </p>

          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full border border-[#B08A57]/70 text-[#B08A57] flex items-center justify-center text-[13px] hover:bg-[#B08A57] hover:text-[#041E42] transition">
              IG
            </a>
            <a className="w-10 h-10 rounded-full border border-[#B08A57]/70 text-[#B08A57] flex items-center justify-center text-[13px] hover:bg-[#B08A57] hover:text-[#041E42] transition">
              TG
            </a>
            <a className="w-10 h-10 rounded-full border border-[#B08A57]/70 text-[#B08A57] flex items-center justify-center text-[13px] hover:bg-[#B08A57] hover:text-[#041E42] transition">
              WA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}