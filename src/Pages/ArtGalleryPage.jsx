import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";

const galleryItems = [
  { image: "/images/Collection-01.png", category: "necklace", span: "md:row-span-2", href: "/collections/signature" },
  { image: "/images/Collection-02.png", category: "ring", span: "", href: "/collections/heritage" },
  { image: "/images/Collection-03.png", category: "earring", span: "", href: "/collections/ceremony" },
  { image: "/images/Product-01.png", category: "necklace", span: "md:col-span-2", href: "/products/atrin-necklace" },
  { image: "/images/Product-02.png", category: "bracelet", span: "", href: "/products/vira-bracelet" },
  { image: "/images/Product-03.png", category: "ring", span: "", href: "/products/mahtab-ring" },
  { image: "/images/Product-04.png", category: "earring", span: "", href: "/products/nadia-earrings" },
  { image: "/images/Product-05.png", category: "necklace", span: "", href: "/products/leila-ring" },
  { image: "/images/Product-06.png", category: "bracelet", span: "", href: "/products/raha-necklace" },
];

const collectionCards = [
  { image: "/images/Collection-03.png", en: "Ceremony", fa: "مراسم" },
  { image: "/images/Collection-01.png", en: "Signature", fa: "امضای دیدار" },
  { image: "/images/collection-heritage.jpg", en: "Heritage", fa: "میراث" },
];

const processImages = [
  "/images/brand-story.png",
  "/images/IMG_7944.JPG",
  "/images/Collection-02.png",
  "/images/gallery-3.JPG",
  "/images/world-craft.webp",
];

const copy = {
  fa: {
    heroTitle: "آرت گالری دیدار",
    heroText: "روایتی از فرم، نور، جزئیات و هنر",
    filters: [
      ["all", "همه آثار"],
      ["necklace", "گردنبند"],
      ["ring", "انگشتر"],
      ["earring", "گوشواره"],
      ["bracelet", "دستبند"],
    ],
    filterLabel: "فیلتر",
    galleryCta: "مشاهده گالری کامل",
    storyEyebrow: "داستان این مجموعه",
    storyTitle: "ظرافت در جزئیات",
    storyText:
      "هر قطعه در دیدار با الهام از هنر، هندسه و لحظه‌های ماندگار شکل می‌گیرد. جزئیات طراحی، زبان روایت اثر هستند؛ روایتی که با نور آغاز می‌شود و با حضور شما کامل می‌شود.",
    readMore: "بیشتر بخوانید",
    collectionsTitle: "مجموعه‌های هنری دیدار",
    viewCollection: "مشاهده آثار",
    processTitle: "از طراحی تا خلق",
    processText: "هر اثر نتیجه ترکیب هنر، دقت، تجربه و عشق به جزئیات است.",
    process: ["طراحی", "مدل‌سازی", "ریخته‌گری", "پرداخت", "کنترل کیفیت"],
    processCta: "بیشتر درباره هنر ساخت",
    quote: "هر قطعه پیش از آنکه یک زیور باشد، یک روایت است.",
    ctaTitle: "کالکشن‌های دیدار را کشف کنید",
    ctaText: "طراحی‌هایی برای لحظه‌های ماندگار",
    ctaButton: "مشاهده کالکشن‌ها",
  },
  en: {
    heroTitle: "Didar Art Gallery",
    heroText: "A narrative of form, light, detail, and art",
    filters: [
      ["all", "All works"],
      ["necklace", "Necklaces"],
      ["ring", "Rings"],
      ["earring", "Earrings"],
      ["bracelet", "Bracelets"],
    ],
    filterLabel: "Filter",
    galleryCta: "View full gallery",
    storyEyebrow: "THE STORY OF THIS COLLECTION",
    storyTitle: "Refinement in every detail",
    storyText:
      "Every Didar creation takes shape through art, geometry, and enduring moments. Details become the language of the piece, a story that begins with light and is completed by you.",
    readMore: "Read more",
    collectionsTitle: "Didar artistic collections",
    viewCollection: "View collection",
    processTitle: "From design to creation",
    processText: "Every work is shaped by art, precision, experience, and devotion to detail.",
    process: ["Design", "Modeling", "Casting", "Finishing", "Quality control"],
    processCta: "Discover our savoir-faire",
    quote: "Before a piece becomes jewelry, it is a story.",
    ctaTitle: "Discover Didar collections",
    ctaText: "Creations for moments made to remain",
    ctaButton: "Explore collections",
  },
};

function ArtGalleryPage() {
  const { language, direction } = useSitePreferences();
  const [activeFilter, setActiveFilter] = useState("all");
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;

  const visibleItems = useMemo(
    () =>
      activeFilter === "all"
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeFilter),
    [activeFilter],
  );

  return (
    <div
      dir={direction}
      className="w-full overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500"
    >
      <section className="relative min-h-[660px] overflow-hidden lg:min-h-[780px]">
        <Header />
        <img
          src="/images/brand-story.png"
          alt={text.heroTitle}
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-[#020b17]/35" />
        <div
          className={`absolute inset-0 ${
            language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } from-[#020b17]/96 via-[#020b17]/70 to-transparent`}
        />

        <div className="relative z-10 mx-auto flex min-h-[660px] max-w-[1450px] items-center px-5 pb-16 pt-32 sm:px-8 lg:min-h-[780px] lg:px-12">
          <div className="max-w-[670px] text-start text-white">
            <p className="text-xs tracking-[0.3em] text-[#D9B985]">DIDAR · ART GALLERY</p>
            <h1 className="mt-7 text-5xl font-normal leading-[1.5] sm:text-7xl lg:text-[86px]">
              {text.heroTitle}
            </h1>
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-20 bg-[#B08A57]" />
              <span className="h-3 w-3 rotate-45 border border-[#B08A57]" />
              <span className="h-px w-20 bg-[#B08A57]" />
            </div>
            <p className="mt-7 text-lg leading-9 text-white/72 sm:text-2xl">{text.heroText}</p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-[1450px]">
            <div className="flex flex-col items-center justify-between gap-7 border-b border-[var(--line)] pb-7 lg:flex-row">
              <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 lg:w-auto lg:pb-0">
                {text.filters.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveFilter(value)}
                    className={`shrink-0 border-b px-4 py-3 text-sm transition ${
                      activeFilter === value
                        ? "border-[#B08A57] text-[#B08A57]"
                        : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
                <SlidersHorizontal size={17} strokeWidth={1.5} />
                {text.filterLabel}
              </div>
            </div>

            <div className="mt-8 grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[270px] md:grid-cols-4 lg:gap-4">
              {visibleItems.map((item, index) => (
                <Link
                  key={`${item.image}-${index}`}
                  to={item.href}
                  className={`group relative overflow-hidden bg-[var(--media-surface)] text-start ${
                    activeFilter === "all" ? item.span : ""
                  }`}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#020b17]/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  <span className="absolute bottom-5 start-5 translate-y-3 text-xs tracking-[0.18em] text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    DIDAR ART
                  </span>
                </Link>
              ))}
            </div>

            <Link
              to="/products"
              className="mx-auto mt-9 flex items-center gap-3 text-sm text-[#B08A57] transition hover:gap-5"
            >
              <Arrow size={17} strokeWidth={1.5} />
              {text.galleryCta}
            </Link>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto grid max-w-[1450px] overflow-hidden border border-[var(--line)] bg-[var(--surface-raised)] lg:grid-cols-[1.08fr_0.92fr]">
            <div className="min-h-[430px] overflow-hidden lg:min-h-[620px]">
              <img
                src="/images/Collection-02.png"
                alt={text.storyTitle}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
              <p className="text-xs tracking-[0.22em] text-[#B08A57]">{text.storyEyebrow}</p>
              <h2 className="mt-5 text-4xl font-normal leading-[1.5] sm:text-6xl">{text.storyTitle}</h2>
              <p className="mt-6 text-base leading-9 text-[var(--ink-muted)] sm:text-lg">
                {text.storyText}
              </p>
              <a href="#collections" className="mt-8 inline-flex items-center gap-3 text-sm text-[#B08A57]">
                <Arrow size={17} strokeWidth={1.5} />
                {text.readMore}
              </a>
            </div>
          </div>
        </section>

        <section id="collections" className="px-4 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto max-w-[1450px]">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-normal sm:text-5xl">{text.collectionsTitle}</h2>
              <span className="mx-auto mt-5 block h-3 w-3 rotate-45 border border-[#B08A57]" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {collectionCards.map((collection) => (
                <Link
                  key={collection.en}
                  to="/collections"
                  className="group relative min-h-[360px] overflow-hidden lg:min-h-[430px]"
                >
                  <img
                    src={collection.image}
                    alt={language === "fa" ? collection.fa : collection.en}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#020b17]/88 via-[#020b17]/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-7 text-start text-white">
                    <strong className="block text-3xl font-normal">{collection.en}</strong>
                    <span className="mt-2 block text-base text-white/75">
                      {language === "fa" ? `مجموعه ${collection.fa}` : `${collection.en} collection`}
                    </span>
                    <span className="mt-5 flex items-center gap-3 text-sm text-[#D9B985]">
                      <Arrow size={16} strokeWidth={1.5} />
                      {text.viewCollection}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface-soft)] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1450px]">
            <div className="grid items-end gap-10 lg:grid-cols-[0.34fr_1fr]">
              <div className="text-start">
                <h2 className="text-4xl font-normal leading-[1.55] sm:text-5xl">{text.processTitle}</h2>
                <p className="mt-5 text-base leading-8 text-[var(--ink-muted)]">{text.processText}</p>
                <Link to="/our-world" className="mt-8 inline-flex items-center gap-3 text-sm text-[#B08A57]">
                  <Arrow size={17} strokeWidth={1.5} />
                  {text.processCta}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {processImages.map((image, index) => (
                  <article key={image}>
                    <div className="aspect-[4/5] overflow-hidden bg-[#020b17]">
                      <img
                        src={image}
                        alt={text.process[index]}
                        className="h-full w-full object-cover grayscale transition duration-500 hover:grayscale-0"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm">{text.process[index]}</h3>
                      <span className="text-[10px] text-[#B08A57]">0{index + 1}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="relative mx-auto min-h-[300px] max-w-[1450px] overflow-hidden border border-[var(--line)]">
            <img
              src="/images/Collection-03.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-[var(--surface-raised)]/75" />
            <blockquote className="relative mx-auto flex min-h-[300px] max-w-4xl items-center justify-center px-8 text-center text-3xl leading-[1.8] sm:text-5xl">
              <span className="absolute top-8 text-7xl text-[#B08A57]/60">“</span>
              {text.quote}
            </blockquote>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="relative mx-auto min-h-[430px] max-w-[1450px] overflow-hidden bg-[#020b17] text-white">
            <img
              src="/images/brand-story.png"
              alt={text.ctaTitle}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
            />
            <div
              className={`absolute inset-0 ${
                language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-[#020b17]/96 via-[#020b17]/68 to-transparent`}
            />
            <div className="relative flex min-h-[430px] max-w-2xl flex-col justify-center p-8 text-start sm:p-14">
              <p className="text-xs tracking-[0.24em] text-[#D9B985]">DIDAR COLLECTIONS</p>
              <h2 className="mt-5 text-4xl font-normal leading-[1.5] sm:text-6xl">{text.ctaTitle}</h2>
              <p className="mt-4 text-lg text-white/70">{text.ctaText}</p>
              <Link
                to="/collections"
                className="mt-8 inline-flex h-14 w-fit items-center gap-3 bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#F7F3EE] hover:text-[#041E42]"
              >
                <Arrow size={17} strokeWidth={1.5} />
                {text.ctaButton}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ArtGalleryPage;
