import Header from "./Header";
import { useSitePreferences } from "../context/SitePreferencesContext";

function Hero() {
  const { language } = useSitePreferences();
  const text = language === "fa"
    ? {
        eyebrow: "DIDAR GOLD · INTERNATIONAL GROUP",
        title: <>زیبایی،<br />وقتی با اعتماد<br />همراه می‌شود</>,
        description: "دیدار، روایتگر لحظه‌هایی است که ماندگار می‌شوند.",
        collections: "مشاهده مجموعه‌ها",
        appointment: "رزرو تجربه حضوری",
      }
    : {
        eyebrow: "DIDAR GOLD · INTERNATIONAL GROUP",
        title: <>Beauty,<br />when accompanied<br />by trust</>,
        description: "Didar tells the story of moments made to endure.",
        collections: "Explore Collections",
        appointment: "Book a Private Viewing",
      };

  return (
    <section id="home" className="relative flex min-h-[820px] items-center overflow-hidden lg:min-h-screen">
      <Header />

      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/world-hero.webp"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div
        className={`absolute inset-0 ${
          language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
        } from-[var(--surface)]/95 via-[var(--surface)]/62 to-transparent`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)]/35 via-transparent to-[var(--header)]/35" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1450px] px-5 pb-36 pt-40 sm:px-8 lg:px-12">
        <div className="w-full max-w-[650px] text-start">
          <div className="mb-5 flex items-center gap-4 text-[#B08A57]">
            <span className="h-px w-12 bg-[#B08A57]" />
            <span className="text-[11px] tracking-[0.24em] sm:text-xs">{text.eyebrow}</span>
          </div>

          <h1
            className={`text-[42px] font-normal leading-[1.42] tracking-[-0.03em] sm:text-[58px] lg:text-[68px] ${
              language === "en"
                ? "text-[#041E42] [-webkit-text-stroke:1px_rgba(247,243,238,0.72)] [paint-order:stroke_fill] [text-shadow:0_0_4px_rgba(247,243,238,0.95),0_0_12px_rgba(247,243,238,0.82),0_2px_24px_rgba(247,243,238,0.68)]"
                : "text-[var(--ink)]"
            }`}
          >
            {text.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-9 text-[var(--ink-muted)] sm:text-xl">
            {text.description}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/collections"
              className="flex h-[58px] w-[220px] items-center justify-center rounded-2xl bg-[#041E42] text-base font-medium text-white transition duration-300 hover:-translate-y-1 hover:bg-[#B08A57]"
            >
              {text.collections}
            </a>
            <a
              href="/contact#appointment"
              className="flex h-[58px] w-[220px] items-center justify-center rounded-2xl bg-[#B08A57] text-base font-medium text-white transition duration-300 hover:-translate-y-1 hover:bg-[#041E42]"
            >
              {text.appointment}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
