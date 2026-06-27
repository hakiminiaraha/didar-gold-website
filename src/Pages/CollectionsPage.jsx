import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ChevronLeft,
  ChevronRight,
  Gem,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useCatalog } from "../hooks/useCatalog";

const fallbackCollections = [
  {
    id: "signature",
    englishName: "SIGNATURE",
    image: "/images/Collection-01.png",
    fa: {
      name: "امضای دیدار",
      description: "فرم‌هایی ماندگار که زبان طراحی دیدار را روایت می‌کنند.",
      story:
        "کالکشن امضای دیدار با خطوط خالص و جزئیاتی سنجیده شکل گرفته است؛ قطعه‌هایی برای هر روز که حضورشان آرام، اما فراموش‌نشدنی است.",
      themes: ["فرم معاصر", "جزئیات ظریف", "استایل روزانه"],
    },
    en: {
      name: "Didar Signature",
      description: "Enduring forms that express Didar's distinctive design language.",
      story:
        "The Didar Signature collection is shaped by pure lines and considered details, creating pieces for every day with a quiet yet unforgettable presence.",
      themes: ["Modern form", "Fine details", "Everyday style"],
    },
  },
  {
    id: "heritage",
    englishName: "HERITAGE",
    image: "/images/Collection-02.png",
    fa: {
      name: "میراث",
      description: "بازخوانی ظریف نقش‌ها و خاطره‌های آشنا در بیانی معاصر.",
      story:
        "میراث، گفت‌وگویی میان حافظه ایرانی و نگاه امروز است؛ نقش‌هایی آشنا که با تناسبات تازه و اجرای دقیق، زندگی دیگری پیدا می‌کنند.",
      themes: ["میراث ایرانی", "نقش‌های ماندگار", "بیان نو"],
    },
    en: {
      name: "Heritage",
      description: "A refined reinterpretation of familiar motifs and memories.",
      story:
        "Heritage is a dialogue between Iranian memory and a contemporary gaze, where familiar motifs find new life through fresh proportions and precise craftsmanship.",
      themes: ["Iranian heritage", "Timeless motifs", "New expression"],
    },
  },
  {
    id: "ceremony",
    englishName: "CEREMONY",
    image: "/images/Collection-03.png",
    fa: {
      name: "مراسم",
      description: "آفریده‌هایی برای لحظه‌هایی که در حافظه می‌مانند.",
      story:
        "مراسم برای لحظه‌های مهم طراحی شده است؛ ترکیبی از درخشش کنترل‌شده، فرم‌های شاعرانه و جزئیاتی که یک خاطره شخصی را ماندگار می‌کنند.",
      themes: ["لحظه‌های خاص", "درخشش آرام", "هدیه ماندگار"],
    },
    en: {
      name: "Ceremony",
      description: "Creations for moments that remain in memory.",
      story:
        "Ceremony is designed for meaningful moments, balancing measured brilliance, poetic forms, and details that turn a personal memory into something enduring.",
      themes: ["Special moments", "Quiet brilliance", "Enduring gifts"],
    },
  },
];

const featuredPieces = [
  {
    image: "/images/Product-01.png",
    fa: { name: "گردنبند آترین", type: "گردنبند" },
    en: { name: "Atrin Necklace", type: "Necklace" },
  },
  {
    image: "/images/Product-02.png",
    fa: { name: "دستبند ویرا", type: "دستبند" },
    en: { name: "Vira Bracelet", type: "Bracelet" },
  },
  {
    image: "/images/Product-03.png",
    fa: { name: "انگشتر مهتاب", type: "انگشتر" },
    en: { name: "Mahtab Ring", type: "Ring" },
  },
  {
    image: "/images/Product-04.png",
    fa: { name: "گوشواره نادیا", type: "گوشواره" },
    en: { name: "Nadia Earrings", type: "Earrings" },
  },
  {
    image: "/images/Product-05.png",
    fa: { name: "انگشتر لیلا", type: "انگشتر" },
    en: { name: "Leila Ring", type: "Ring" },
  },
  {
    image: "/images/Product-06.png",
    fa: { name: "گردنبند رها", type: "گردنبند" },
    en: { name: "Raha Necklace", type: "Necklace" },
  },
];

const copy = {
  fa: {
    heroTitle: <>هر کالکشن،<br />جهانی برای کشف</>,
    heroDescription:
      "آفریده‌هایی از طلا که میان فرم، خاطره و نگاه معاصر پیوند می‌سازند؛ برای لحظه‌هایی که ارزش ماندن دارند.",
    explore: "کشف کالکشن‌ها",
    consultation: "رزرو مشاوره خصوصی",
    categoriesTitle: "روایت‌های متفاوت از زیبایی",
    categoriesDescription:
      "هر کالکشن دیدار، شخصیت و جهان خود را دارد؛ اما همه در یک نقطه به هم می‌رسند: دقت در ساخت، اصالت در معنا و زیبایی آرام.",
    openCollection: "مشاهده کالکشن",
    detailLabel: "داستان کالکشن",
    detailCta: "مشاهده قطعات منتخب",
    close: "بستن",
    featuredTitle: "گزیده‌ای از امضای دیدار",
    featuredDescription:
      "قطعه‌هایی منتخب برای کشف زبان طراحی دیدار؛ ظریف، معاصر و ساخته‌شده برای همراهی با روایت شخصی شما.",
    viewAll: "مشاهده همه در بوتیک",
    featuredEyebrow: "آفریده‌های منتخب",
    storyTitle: "فرم‌هایی ریشه‌دار، برای امروز",
    storyDescription:
      "طراحی در دیدار از یک تصویر آغاز نمی‌شود؛ از یک حس، یک خاطره یا یک نسبت ظریف میان گذشته و اکنون شکل می‌گیرد. هر قطعه پیش از آن‌که زیور باشد، روایتی است که با دقت ساخته شده.",
    storyNote: "هر جزئیات، نتیجه گفت‌وگوی هنر ساخت با نگاه امروز است.",
    storyTraits: ["میراث ایرانی", "ساخت دقیق", "بیان معاصر"],
    privateViewing: "رزرو مشاهده خصوصی",
    storyEyebrow: "روایت طراحی",
    consultationEyebrow: "مشاوره خصوصی",
    ctaTitle: <>انتخابی شخصی،<br />در فضایی برای دیدن</>,
    ctaDescription:
      "برای مشاهده خصوصی کالکشن‌ها و دریافت راهنمایی متناسب با سلیقه و مناسبت شما، زمان دیدارتان را رزرو کنید.",
    enterBoutique: "ورود به بوتیک",
    trust: [
      ["شناسنامه دیجیتال", "هویت روشن برای قطعات منتخب"],
      ["اصالت و ردیابی", "اعتماد بر پایه اطلاعات معتبر"],
      ["خدمات چرخه عمر", "معرفی مسیر گارانتی و بازخرید"],
    ],
  },
  en: {
    heroTitle: <>Every collection,<br />a world to discover</>,
    heroDescription:
      "Gold creations connecting form, memory, and a contemporary gaze, made for moments worth keeping.",
    explore: "Explore Collections",
    consultation: "Book a Private Consultation",
    categoriesTitle: "Distinct stories of beauty",
    categoriesDescription:
      "Each Didar collection has its own character and world, united by precise craft, authentic meaning, and quiet beauty.",
    openCollection: "Explore collection",
    detailLabel: "Collection story",
    detailCta: "View selected creations",
    close: "Close",
    featuredTitle: "A selection of Didar signatures",
    featuredDescription:
      "Selected pieces that reveal Didar's design language: refined, contemporary, and created to accompany your personal story.",
    viewAll: "View all in the Boutique",
    featuredEyebrow: "FEATURED CREATIONS",
    storyTitle: "Rooted forms, made for today",
    storyDescription:
      "Design at Didar does not begin with an image. It begins with a feeling, a memory, or a subtle relationship between past and present. Before it becomes jewelry, each piece is a story made with care.",
    storyNote: "Every detail is a conversation between the art of making and a contemporary vision.",
    storyTraits: ["Iranian heritage", "Precise craft", "Modern expression"],
    privateViewing: "Book a private viewing",
    storyEyebrow: "THE STORY",
    consultationEyebrow: "PRIVATE CONSULTATION",
    ctaTitle: <>A personal choice,<br />in a space made for seeing</>,
    ctaDescription:
      "Book a private appointment to explore the collections and receive guidance shaped around your style and occasion.",
    enterBoutique: "Enter the Boutique",
    trust: [
      ["Digital passport", "A clear identity for selected pieces"],
      ["Authenticity & traceability", "Trust based on verified information"],
      ["Lifecycle services", "Warranty and buyback overview"],
    ],
  },
};

function DirectionArrow({ language, size = 18 }) {
  const Icon = language === "fa" ? ArrowLeft : ArrowRight;
  return <Icon size={size} strokeWidth={1.5} />;
}

function SectionTitle({ eyebrow, title, description, align = "center", tone = "dark" }) {
  const centered = align === "center";
  const isContrast = tone === "contrast";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-xl text-start"}>
      <p className="text-xs font-medium tracking-[0.28em] text-[#B08A57] sm:text-sm">{eyebrow}</p>
      <h2 className={`mt-4 text-3xl font-normal leading-[1.5] sm:text-4xl lg:text-5xl ${isContrast ? "text-[var(--contrast-ink)]" : "text-[var(--ink)]"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-base leading-8 sm:text-lg sm:leading-9 ${isContrast ? "text-[var(--contrast-muted)]" : "text-[var(--ink-muted)]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

function CollectionsPage() {
  const { language, direction } = useSitePreferences();
  const { items: catalogItems, available: catalogAvailable, loaded: catalogLoaded } = useCatalog("collection");
  const collections = catalogLoaded && catalogAvailable ? catalogItems.map((item) => ({
    id: item.slug,
    englishName: item.data.code || item.slug.toUpperCase(),
    image: item.data.hero,
    fa: {
      name: item.data.name?.fa || item.slug,
      description: item.data.positioning?.fa || "",
      story: item.data.story?.fa || item.data.intro?.fa || "",
      themes: item.data.themes?.fa || [],
    },
    en: {
      name: item.data.name?.en || item.slug,
      description: item.data.positioning?.en || "",
      story: item.data.story?.en || item.data.intro?.en || "",
      themes: item.data.themes?.en || [],
    },
  })) : fallbackCollections;
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredPaused, setFeaturedPaused] = useState(false);
  const detailsRef = useRef(null);
  const featuredViewportRef = useRef(null);
  const featuredCardRefs = useRef([]);
  const text = copy[language];

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedCollection(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const viewport = featuredViewportRef.current;
    const card = featuredCardRefs.current[featuredIndex];
    if (!viewport || !card) return;

    viewport.scrollTo({
      left: card.offsetLeft,
      behavior: "smooth",
    });
  }, [featuredIndex]);

  useEffect(() => {
    if (featuredPaused) return undefined;
    const timer = window.setInterval(() => {
      setFeaturedIndex((index) => (index + 1) % featuredPieces.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [featuredPaused]);

  const selectCollection = (collection) => {
    setSelectedCollection(collection);
    window.setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };

  return (
    <div dir={direction} className="w-screen max-w-[100vw] overflow-x-hidden bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500">
      <section className="relative min-h-[760px] overflow-hidden lg:min-h-screen">
        <Header />
        <img src="/images/collection-heritage.jpg" alt="Didar Gold Collections" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#041E42]/95 via-[#041E42]/58 to-[#041E42]/10`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/45 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-[1450px] items-end px-5 pb-16 pt-36 sm:px-8 lg:min-h-screen lg:items-center lg:px-12 lg:pb-0">
          <div className="max-w-[690px] text-start text-white">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-14 bg-[#B08A57]" />
              <span className="text-xs tracking-[0.3em] text-[#F5EEE1]/85 sm:text-sm">DIDAR GOLD COLLECTIONS</span>
            </div>
            <h1 className="text-4xl font-normal leading-[1.5] sm:text-6xl lg:text-[76px]">{text.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-xl sm:leading-10">{text.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#collection-categories" className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm font-medium text-white transition duration-300 hover:-translate-y-1 hover:bg-[#F5EEE1] hover:text-[#041E42]">
                {text.explore}
                <DirectionArrow language={language} />
              </a>
              <a href="#private-consultation" className="inline-flex h-14 items-center justify-center rounded-full border border-white/40 px-8 text-sm text-white backdrop-blur-sm transition hover:border-[#B08A57] hover:bg-[#B08A57]/15">
                {text.consultation}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="collection-categories" className="px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1450px]">
          <SectionTitle eyebrow="COLLECTIONS" title={text.categoriesTitle} description={text.categoriesDescription} />

          <div className="mt-14 grid gap-5 md:grid-cols-3 lg:mt-20 lg:gap-7">
            {collections.map((collection, index) => {
              const item = collection[language];
              const active = selectedCollection?.id === collection.id;
              return (
                <button
                  key={collection.id}
                  type="button"
                  aria-expanded={active}
                  onClick={() => selectCollection(collection)}
                  className={`group relative overflow-hidden rounded-[28px] bg-[#EDE5DA] text-start outline-none transition duration-500 focus-visible:ring-2 focus-visible:ring-[#B08A57] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface)] ${
                    index === 1 ? "md:-translate-y-8" : ""
                  } ${active ? "ring-2 ring-[#B08A57] ring-offset-4 ring-offset-[var(--surface)]" : "hover:-translate-y-2"}`}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={collection.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/95 via-[#041E42]/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <p className="text-xs tracking-[0.25em] text-[#D9B985]">{collection.englishName}</p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-normal">{item.name}</h3>
                        <p className="mt-3 max-w-xs text-sm leading-7 text-white/70">{item.description}</p>
                        <span className="mt-3 inline-block text-xs text-[#D9B985]/90">{text.openCollection}</span>
                      </div>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition duration-300 ${active ? "rotate-90 border-[#B08A57] bg-[#B08A57]" : "border-white/35 group-hover:border-[#B08A57] group-hover:bg-[#B08A57]"}`}>
                        <ArrowUpLeft size={18} strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCollection && (
            <div ref={detailsRef} className="mt-10 overflow-hidden rounded-[30px] border border-[var(--line)] bg-[var(--surface-raised)] shadow-[0_22px_70px_rgba(4,30,66,0.12)] md:mt-4">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[340px]">
                  <img src={selectedCollection.image} alt={selectedCollection[language].name} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/45 to-transparent" />
                </div>
                <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <button type="button" onClick={() => setSelectedCollection(null)} aria-label={text.close} className="absolute end-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition hover:border-[#B08A57] hover:text-[#B08A57]">
                    <X size={18} />
                  </button>
                  <p className="text-xs tracking-[0.25em] text-[#B08A57]">{text.detailLabel} · {selectedCollection.englishName}</p>
                  <h3 className="mt-4 text-4xl font-normal sm:text-5xl">{selectedCollection[language].name}</h3>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--ink-muted)] sm:text-lg sm:leading-9">{selectedCollection[language].story}</p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {selectedCollection[language].themes.map((theme) => (
                      <span key={theme} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink-muted)]">{theme}</span>
                    ))}
                  </div>
                  <Link to={`/collections/${selectedCollection.id}`} className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-[#B08A57] transition hover:text-[var(--ink)]">
                    {text.detailCta}
                    <DirectionArrow language={language} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="featured-creations" className="bg-[var(--contrast)] px-5 py-20 text-[var(--contrast-ink)] transition-colors duration-500 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <SectionTitle
              align="start"
              tone="contrast"
              eyebrow={text.featuredEyebrow}
              title={text.featuredTitle}
              description={text.featuredDescription}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFeaturedIndex((index) => (index - 1 + featuredPieces.length) % featuredPieces.length)}
                aria-label="Previous creation"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--contrast-muted)] transition hover:border-[#B08A57] hover:bg-[#B08A57] hover:text-white"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => setFeaturedIndex((index) => (index + 1) % featuredPieces.length)}
                aria-label="Next creation"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--contrast-muted)] transition hover:border-[#B08A57] hover:bg-[#B08A57] hover:text-white"
              >
                <ChevronRight size={19} />
              </button>
              <a href="#boutique" className="ms-2 hidden items-center gap-3 text-sm text-[#B08A57] transition hover:text-[var(--contrast-ink)] sm:inline-flex">
                {text.viewAll}
                <DirectionArrow language={language} />
              </a>
            </div>
          </div>

          <div
            ref={featuredViewportRef}
            dir="ltr"
            onMouseEnter={() => setFeaturedPaused(true)}
            onMouseLeave={() => setFeaturedPaused(false)}
            className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-hidden lg:mt-16"
          >
            {featuredPieces.map((piece, index) => (
              <article
                key={piece.en.name}
                ref={(element) => {
                  featuredCardRefs.current[index] = element;
                }}
                dir={direction}
                className={`group min-w-[82%] cursor-pointer snap-start transition duration-500 sm:min-w-[47%] lg:min-w-[31%] xl:min-w-[23%] ${
                  featuredIndex === index ? "opacity-100" : "opacity-75 hover:opacity-100"
                }`}
              >
                <div className="relative overflow-hidden rounded-[26px] bg-[var(--media-surface)]">
                  <img
                    src={piece.image}
                    alt={piece[language].name}
                    loading="lazy"
                    className="aspect-[4/4.6] h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <span className="absolute bottom-4 end-4 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-[#B08A57] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpLeft size={18} />
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] tracking-[0.18em] text-[#B08A57]">{piece[language].type}</p>
                    <h3 className="mt-1 text-xl font-normal text-[var(--contrast-ink)]">{piece[language].name}</h3>
                  </div>
                  <span className="text-xs text-[var(--contrast-muted)]">0{index + 1}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-9 flex items-center justify-between">
            <div className="flex gap-2">
              {featuredPieces.map((piece, index) => (
                <button
                  key={piece.en.name}
                  type="button"
                  onClick={() => setFeaturedIndex(index)}
                  aria-label={`Creation ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    featuredIndex === index ? "w-10 bg-[#B08A57]" : "w-4 bg-[var(--contrast-muted)] hover:bg-[#B08A57]"
                  }`}
                />
              ))}
            </div>
            <a href="#boutique" className="inline-flex items-center gap-3 text-sm text-[#B08A57] transition hover:text-[var(--contrast-ink)] sm:hidden">
              {text.viewAll}
              <DirectionArrow language={language} />
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1450px] items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[30px]">
              <img src="/images/shop-section.JPG" alt="Didar collection design world" loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -start-3 hidden w-52 rounded-[22px] border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-[0_18px_45px_rgba(4,30,66,0.12)] sm:block lg:-start-8">
              <Sparkles className="text-[#B08A57]" size={24} strokeWidth={1.3} />
              <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">{text.storyNote}</p>
            </div>
          </div>
          <div>
            <SectionTitle align="start" eyebrow={text.storyEyebrow} title={text.storyTitle} description={text.storyDescription} />
            <div className="mt-8 grid grid-cols-3 gap-3 border-y border-[var(--line)] py-6">
              {text.storyTraits.map((item, index) => (
                <div key={item} className={index < 2 ? "border-e border-[var(--line)] px-2 text-center" : "px-2 text-center"}>
                  <span className="text-xs text-[var(--ink-muted)] sm:text-sm">{item}</span>
                </div>
              ))}
            </div>
            <a href="#private-consultation" className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-[var(--ink)] transition hover:text-[#B08A57]">
              {text.privateViewing}
              <DirectionArrow language={language} />
            </a>
          </div>
        </div>
      </section>

      <section id="private-consultation" className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px] overflow-hidden rounded-[32px] bg-[var(--contrast)] text-[var(--contrast-ink)] shadow-[0_24px_80px_rgba(4,30,66,0.18)] transition-colors duration-500">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
              <p className="text-xs tracking-[0.25em] text-[#B08A57]">{text.consultationEyebrow}</p>
              <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.ctaTitle}</h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-[var(--contrast-muted)] sm:text-lg sm:leading-9">{text.ctaDescription}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact#appointment" className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#F5EEE1] hover:text-[#041E42]">
                  {text.consultation}
                  <DirectionArrow language={language} />
                </Link>
                <a id="boutique" href="#shop" className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--contrast-muted)] px-8 text-sm transition hover:border-[#B08A57]">
                  {text.enterBoutique}
                </a>
              </div>
            </div>
            <div className="relative min-h-[390px] lg:min-h-[570px]">
              <img src="/images/gallery-main.JPG" alt="Didar private gallery" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-transparent via-transparent to-[#041E42]/80`} />
            </div>
          </div>
          <div className="grid border-t border-[var(--line)] sm:grid-cols-3">
            {[Gem, ShieldCheck, Sparkles].map((Icon, index) => (
              <div key={text.trust[index][0]} className={`flex items-center gap-4 px-6 py-6 sm:px-8 ${index < 2 ? "border-b border-[var(--line)] sm:border-b-0 sm:border-e" : ""}`}>
                <Icon size={25} strokeWidth={1.25} className="shrink-0 text-[#B08A57]" />
                <div>
                  <h3 className="text-sm font-medium">{text.trust[index][0]}</h3>
                  <p className="mt-1 text-xs text-[var(--contrast-muted)]">{text.trust[index][1]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default CollectionsPage;
