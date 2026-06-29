import { Link } from "react-router-dom";

import { useSitePreferences } from "../context/SitePreferencesContext";

function ShopSection() {
  const { language } = useSitePreferences();
  const text = language === "fa"
    ? ["ویترین دیدار", "هر مجموعه، روایت متفاوتی از زیبایی است. از امضای دیدار تا میراث جاودانه، مجموعه‌ای برای هر سلیقه و هر لحظه.", "مشاهده کالکشن‌ها", "رزرو تجربه حضوری"]
    : ["The Didar Showcase", "Every collection tells a different story of beauty. From Didar signatures to enduring heritage, discover a creation for every style and moment.", "Explore Collections", "Book a Private Viewing"];

  return (
    <section id="shop" className="bg-[var(--surface)] px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-[1450px] items-center gap-10 rounded-[32px] border border-[var(--line)] bg-[var(--surface-raised)] p-6 lg:grid-cols-[42%_58%] lg:p-10">
        <div className="text-start">
          <div className="mb-8 flex items-center gap-4 text-[var(--gold-text)]"><span className="h-px w-16 bg-[#B08A57]" />✦<span className="h-px w-16 bg-[#B08A57]" /></div>
          <h2 className="text-5xl font-normal text-[var(--ink)]">{text[0]}</h2>
          <p className="mt-7 max-w-[520px] text-lg leading-10 text-[var(--ink-muted)]">{text[1]}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/collections" className="flex h-[58px] w-[220px] items-center justify-center rounded-xl bg-[#041E42] text-white transition hover:bg-[#B08A57]">{text[2]}</Link>
            <Link to="/contact#appointment" className="flex h-[58px] w-[220px] items-center justify-center rounded-xl border border-[#B08A57] text-[var(--gold-text)] transition hover:bg-[#B08A57] hover:text-white">{text[3]}</Link>
          </div>
        </div>
        <img src="/images/gallery-2.JPG" alt={text[0]} loading="lazy" decoding="async" width={760} height={520} className="h-[420px] w-full rounded-[28px] object-cover lg:h-[520px]" />
      </div>
    </section>
  );
}

export default ShopSection;
