import { useSitePreferences } from "../context/SitePreferencesContext";

function DidarWorld() {
  const { language } = useSitePreferences();
  const text = language === "fa"
    ? ["جهان روایت‌های دیدار", "ترکیبی از زیبایی، اصالت و اعتماد. هر قطعه دیدار، روایتی از احساس، هنر و ماندگاری برای همیشه است.", "درباره دیدار"]
    : ["The World of Didar", "A union of beauty, authenticity, and trust. Every Didar creation tells a lasting story of emotion and craft.", "Discover Didar"];

  return (
    <section id="world" className="bg-[var(--surface)] px-5 py-20 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-[1450px] overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)]">
        <div className="grid lg:grid-cols-[36%_64%]">
          <div className="relative z-20 flex flex-col justify-center px-8 py-12 text-start lg:px-12">
            <h2 className="mb-4 text-4xl font-normal text-[var(--ink)]">{text[0]}</h2>
            <div className="mb-5 flex items-center gap-3 text-[var(--gold-text)]"><span className="h-px w-10 bg-[#B08A57]" />✦<span className="h-px w-10 bg-[#B08A57]" /></div>
            <p className="text-base leading-8 text-[var(--ink-muted)]">{text[1]}</p>
            <a href="#about" className="mt-6 inline-flex h-12 w-44 items-center justify-center rounded-xl bg-[#041E42] text-sm text-white transition hover:bg-[#B08A57]">{text[2]}</a>
          </div>
          <div className="relative min-h-[300px] overflow-hidden">
            <img src="/images/IMG_7949.JPG" alt={text[0]} loading="lazy" decoding="async" width={820} height={520} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default DidarWorld;
