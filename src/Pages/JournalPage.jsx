import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useJournal } from "../hooks/useJournal";

// Shared with the article route; the export is static editorial data.
// eslint-disable-next-line react-refresh/only-export-components
export const fallbackArticles = [
  {
    slug: "gold-in-cultural-memory",
    image: "/images/didar-ui/journal-01.jpg",
    category: "culture",
    pillar: "Culture & Inspiration",
    date: "۱۴۰۴/۰۳/۰۸",
    read: "۴ دقیقه",
    fa: [
      "طلا در حافظه فرهنگی ما",
      "نگاهی آرام به معنا، آیین و نشانه هایی که طلا را از زیور فراتر می برند.",
    ],
    en: [
      "Gold in cultural memory",
      "A quiet look at meaning, ritual, and symbols that take gold beyond ornament.",
    ],
  },
  {
    slug: "from-idea-to-form",
    image: "/images/IMG_7944.JPG",
    category: "craft",
    pillar: "Product Story",
    date: "۱۴۰۴/۰۳/۱۲",
    read: "۵ دقیقه",
    fa: [
      "از ایده تا فرم",
      "چگونه یک الهام اولیه به نسبت، سطح، جزئیات و در نهایت به یک قطعه دیدار تبدیل می شود.",
    ],
    en: [
      "From idea to form",
      "How an initial inspiration becomes proportion, surface, detail, and finally a Didar creation.",
    ],
  },
  {
    slug: "didar-design-language",
    image: "/images/didar-ui/collection-02.jpg",
    category: "design",
    pillar: "Brand World",
    date: "۱۴۰۴/۰۲/۲۶",
    read: "۳ دقیقه",
    fa: [
      "زبان طراحی دیدار",
      "فرم هایی که میان حافظه ایرانی و نگاه معاصر حرکت می کنند.",
    ],
    en: [
      "Didar's design language",
      "Forms that move between Iranian memory and a contemporary gaze.",
    ],
  },
  {
    slug: "choosing-for-an-occasion",
    image: "/images/didar-ui/product-03.jpg",
    category: "buying",
    pillar: "Experience",
    date: "۱۴۰۴/۰۲/۲۰",
    read: "۴ دقیقه",
    fa: [
      "انتخاب قطعه برای یک مناسبت",
      "چند معیار ساده برای انتخابی که شخصی، آرام و ماندگار باشد.",
    ],
    en: [
      "Choosing for an occasion",
      "Simple criteria for a choice that feels personal, calm, and enduring.",
    ],
  },
  {
    slug: "why-in-person-viewing-matters",
    image: "/images/didar-ui/gallery-accent.jpg",
    category: "experience",
    pillar: "Experience",
    date: "۱۴۰۴/۰۱/۲۹",
    read: "۳ دقیقه",
    fa: [
      "چرا مشاهده حضوری مهم است",
      "تجربه آرت گالری چگونه دیدن، لمس کردن و تصمیم گرفتن را دقیق تر می کند.",
    ],
    en: [
      "Why in-person viewing matters",
      "How the Art Gallery makes seeing, touching, and deciding more considered.",
    ],
  },
  {
    slug: "digital-product-passport",
    image: "/images/didar-ui/product-06.jpg",
    category: "trust",
    pillar: "Trust",
    date: "۱۴۰۴/۰۱/۱۸",
    read: "۴ دقیقه",
    fa: [
      "گذرنامه دیجیتال محصول چیست؟",
      "شناسه یکتا، اصالت، گارانتی و مسیر خدمات پس از خرید در زبان ساده.",
    ],
    en: [
      "What is a product passport?",
      "UID, authenticity, warranty, and lifecycle services explained simply.",
    ],
  },
];

const copy = {
  fa: {
    heroEyebrow: "JOURNAL LITE",
    heroTitle: "ژورنال دیدار",
    heroText:
      "ژورنال دیدار قرار نیست یک بلاگ شلوغ باشد؛ اینجا روایت های کوتاه و دقیق درباره فرهنگ، طراحی، محصول، اعتماد و تجربه انتخاب منتشر می شوند.",
    featuredLabel: "روایت منتخب",
    readArticle: "خواندن مقاله",
    filters: [
      ["all", "همه"],
      ["culture", "فرهنگ و الهام"],
      ["craft", "ساخت"],
      ["design", "طراحی"],
      ["buying", "راهنمای انتخاب"],
      ["experience", "تجربه"],
      ["trust", "اعتماد"],
    ],
    categoryNames: {
      culture: "فرهنگ و الهام",
      craft: "ساخت",
      design: "طراحی",
      buying: "راهنمای انتخاب",
      experience: "تجربه",
      trust: "اعتماد",
    },
    search: "جست و جو در ژورنال...",
    editorialEyebrow: "CONTENT PILLARS",
    editorialTitle: "ستون های محتوایی ژورنال",
    editorialText:
      "مطابق سند مادر، ژورنال باید به شکل سبک و گزیده از شش ستون تغذیه شود؛ نه برای تولید انبوه محتوا، بلکه برای ساختن زمینه فکری انتخاب.",
    pillars: [
      ["Brand World", "فلسفه، ارزش ها و جهان برند دیدار"],
      ["Product Story", "الهام، طراحی، craft و روایت قطعه"],
      ["Trust", "UID، گذرنامه، گارانتی، نگهداری و بازخرید"],
      ["Experience", "مشاوره، آرت گالری، هدیه و انتخاب هدایت شده"],
      ["Culture", "هنر، ایران، مناسبت ها و نشانه های اصیل"],
      ["Action", "ورود محترمانه به شاپ، رزرو و خدمات"],
    ],
    latestTitle: "آخرین روایت ها",
    noResults: "روایتی با این جست و جو پیدا نشد.",
    newsletterTitle: "دریافت روایت های دیدار",
    newsletterText: "گزیده ای کوتاه از مقاله ها، کالکشن ها و رویدادهای دیدار را دریافت کنید.",
    email: "ایمیل شما",
    subscribe: "عضویت",
    subscribed: "ثبت شد",
    ctaTitle: "ادامه روایت در آرت گالری",
    ctaText: "برای دیدن ارتباط میان الهام، طراحی و قطعه، وارد تجربه آرت گالری دیدار شوید.",
    ctaButton: "مشاهده آرت گالری",
  },
  en: {
    heroEyebrow: "JOURNAL LITE",
    heroTitle: "Didar Journal",
    heroText:
      "Didar Journal is not a crowded blog. It is a light editorial layer for culture, design, product stories, trust, and guided choice.",
    featuredLabel: "Featured story",
    readArticle: "Read article",
    filters: [
      ["all", "All"],
      ["culture", "Culture"],
      ["craft", "Craft"],
      ["design", "Design"],
      ["buying", "Choosing"],
      ["experience", "Experience"],
      ["trust", "Trust"],
    ],
    categoryNames: {
      culture: "Culture",
      craft: "Craft",
      design: "Design",
      buying: "Choosing",
      experience: "Experience",
      trust: "Trust",
    },
    search: "Search journal...",
    editorialEyebrow: "CONTENT PILLARS",
    editorialTitle: "Journal content pillars",
    editorialText:
      "Aligned with the master document, the journal stays light and curated, creating context for choice rather than producing content volume.",
    pillars: [
      ["Brand World", "Philosophy, values, and the world of Didar"],
      ["Product Story", "Inspiration, design, craft, and creation narrative"],
      ["Trust", "UID, passport, warranty, care, and buyback"],
      ["Experience", "Advisory, Art Gallery, gifting, and guided choice"],
      ["Culture", "Art, Iran, occasions, and authentic symbols"],
      ["Action", "Respectful entry into shop, reservation, and services"],
    ],
    latestTitle: "Latest stories",
    noResults: "No story matched this search.",
    newsletterTitle: "Receive Didar stories",
    newsletterText: "A quiet selection of articles, collections, and Didar events.",
    email: "Your email",
    subscribe: "Subscribe",
    subscribed: "Subscribed",
    ctaTitle: "Continue the story in the Art Gallery",
    ctaText: "See how inspiration, design, and creation meet inside the Didar Art Gallery experience.",
    ctaButton: "Explore Art Gallery",
  },
};

function JournalPage() {
  const { language, direction } = useSitePreferences();
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { articles: journalArticles, available: journalAvailable, loaded: journalLoaded } = useJournal();
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const articles = journalLoaded && journalAvailable ? journalArticles.map((article) => ({
    slug: article.slug,
    image: article.image,
    category: article.category,
    pillar: article.pillar,
    date: article.dateLabel,
    read: article.readLabel?.[language] || "",
    fa: [article.content.fa.title, article.content.fa.excerpt],
    en: [article.content.en.title, article.content.en.excerpt],
  })) : fallbackArticles;
  const featured = articles[0];

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return articles.filter((article) => {
      const matchesCategory = activeCategory === "all" || article.category === activeCategory;
      const searchable = `${article.pillar} ${article.fa.join(" ")} ${article.en.join(" ")}`.toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeCategory, articles, query]);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div
      dir={direction}
      className="min-h-screen w-full overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500"
    >
      <section className="relative min-h-[680px] overflow-hidden bg-[#020b17] lg:min-h-[790px]">
        <Header />
        <img
          src="/images/didar-ui/journal-01.jpg"
          alt={text.heroTitle}
          className="absolute inset-0 h-full w-full object-cover object-[48%_center]"
        />
        <div className="absolute inset-0 bg-[#020b17]/42" />
        <div
          className={`absolute inset-0 ${
            language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } from-[#020b17]/98 via-[#020b17]/80 to-[#020b17]/28`}
        />
        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1450px] items-center px-5 pb-16 pt-32 sm:px-8 lg:min-h-[790px] lg:px-12">
          <div className="max-w-[720px] text-start text-white">
            <p className="text-xs tracking-[0.3em] text-[#D9B985]">{text.heroEyebrow}</p>
            <h1 className="mt-7 text-5xl font-normal leading-[1.5] drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-[86px]">
              {text.heroTitle}
            </h1>
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-20 bg-[#B08A57]" />
              <span className="h-3 w-3 rotate-45 border border-[#B08A57]" />
              <span className="h-px w-20 bg-[#B08A57]" />
            </div>
            <p className="mt-7 max-w-2xl text-lg leading-10 text-white/88 sm:text-xl">{text.heroText}</p>
          </div>
        </div>
      </section>

      <main className="relative z-20 -mt-10 px-4 pb-20 sm:px-8 lg:-mt-16 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-[1450px] border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-[0_28px_80px_rgba(2,11,23,0.18)] sm:p-8 lg:p-10">
          <section className="grid overflow-hidden border border-[var(--line)] bg-[var(--surface)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[420px]">
              <img src={featured.image} alt={featured[language][0]} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#020b17]/72 via-[#020b17]/10 to-transparent" />
              <span className="absolute bottom-6 start-6 bg-[#020b17]/74 px-4 py-2 text-xs tracking-[0.22em] text-[#D9B985]">
                {text.featuredLabel}
              </span>
            </div>
            <div className="flex flex-col justify-center p-7 text-start sm:p-10 lg:p-14">
              <p className="text-xs tracking-[0.24em] text-[#B08A57]">{featured.pillar}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">{featured[language][0]}</h2>
              <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85">{featured[language][1]}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-[var(--ink-muted)]">
                <span>{text.categoryNames[featured.category]}</span>
                <span className="h-1 w-1 rounded-full bg-[#B08A57]" />
                <span>{featured.date}</span>
                <span className="h-1 w-1 rounded-full bg-[#B08A57]" />
                <span>{featured.read}</span>
              </div>
              <Link to={`/journal/${featured.slug}`} className="mt-8 inline-flex h-12 w-fit items-center gap-3 border border-[#B08A57] px-7 text-sm text-[#B08A57] transition hover:bg-[#B08A57] hover:text-white">
                {text.readArticle}
                <Arrow size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </section>

          <section className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="text-start">
              <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.editorialEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.editorialTitle}</h2>
              <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85">{text.editorialText}</p>
            </div>
            <div className="grid border-y border-[var(--line)] sm:grid-cols-2">
              {text.pillars.map(([title, description], index) => (
                <article
                  key={title}
                  className={`p-6 text-start ${
                    index < text.pillars.length - 2 ? "border-b border-[var(--line)]" : ""
                  } ${index % 2 === 0 ? "sm:border-e sm:border-[var(--line)]" : ""}`}
                >
                  <span className="text-xs tracking-[0.18em] text-[#B08A57]">0{index + 1}</span>
                  <h3 className="mt-4 text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-8 text-[var(--ink)] opacity-76">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="text-start">
                <h2 className="text-3xl font-normal sm:text-5xl">{text.latestTitle}</h2>
              </div>
              <label className="flex h-12 w-full items-center gap-3 border border-[var(--line)] bg-[var(--surface)] px-4 lg:max-w-[360px]">
                <Search size={18} className="text-[#B08A57]" strokeWidth={1.5} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={text.search}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink-muted)]"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {text.filters.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveCategory(value)}
                  className={`shrink-0 border-b px-4 py-3 text-sm transition ${
                    activeCategory === value
                      ? "border-[#B08A57] text-[#B08A57]"
                      : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredArticles.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.slug}
                    to={`/journal/${article.slug}`}
                    className="group overflow-hidden border border-[var(--line)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-[265px] overflow-hidden bg-[var(--media-surface)]">
                      <img
                        src={article.image}
                        alt={article[language][0]}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 text-start">
                      <p className="text-xs text-[#B08A57]">{text.categoryNames[article.category]}</p>
                      <h3 className="mt-4 text-2xl font-normal leading-[1.6]">{article[language][0]}</h3>
                      <p className="mt-3 min-h-[72px] text-sm leading-8 text-[var(--ink)] opacity-76">
                        {article[language][1]}
                      </p>
                      <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-5">
                        <span className="text-xs text-[var(--ink-muted)]">
                          {article.date} / {article.read}
                        </span>
                        <Arrow size={17} className="text-[#B08A57]" strokeWidth={1.5} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 flex min-h-[260px] items-center justify-center border border-[var(--line)] text-[var(--ink-muted)]">
                {text.noResults}
              </div>
            )}
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <form
              onSubmit={handleSubscribe}
              className="border border-[var(--line)] bg-[var(--contrast)] p-7 text-start text-[var(--contrast-ink)] sm:p-9"
            >
              <h2 className="text-3xl font-normal">{text.newsletterTitle}</h2>
              <p className="mt-3 text-sm leading-8 text-white/76">{text.newsletterText}</p>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={text.email}
                className="mt-6 h-12 w-full border border-white/15 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#B08A57]"
              />
              <button
                type="submit"
                className="mt-3 h-12 w-full bg-[#B08A57] px-5 text-sm text-white transition hover:bg-[#D9B985] hover:text-[#041E42]"
              >
                {subscribed ? text.subscribed : text.subscribe}
              </button>
            </form>

            <div className="relative min-h-[320px] overflow-hidden border border-[var(--line)] bg-[#020b17] text-white">
              <img src="/images/didar-ui/service-accent.jpg" alt={text.ctaTitle} className="absolute inset-0 h-full w-full object-cover opacity-78" />
              <div
                className={`absolute inset-0 ${
                  language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
                } from-[#020b17]/96 via-[#020b17]/78 to-[#020b17]/22`}
              />
              <div className="relative flex min-h-[320px] max-w-2xl flex-col justify-center p-8 text-start sm:p-12">
                <h2 className="text-3xl font-normal leading-[1.55] sm:text-5xl">{text.ctaTitle}</h2>
                <p className="mt-4 text-base leading-9 text-white/84">{text.ctaText}</p>
                <Link
                  to="/art-gallery"
                  className="mt-7 inline-flex h-12 w-fit items-center gap-3 bg-[#B08A57] px-7 text-sm transition hover:bg-[#F7F3EE] hover:text-[#041E42]"
                >
                  <Arrow size={17} strokeWidth={1.5} />
                  {text.ctaButton}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default JournalPage;
