import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  Check,
  Gem,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useSelection } from "../context/SelectionContext";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../hooks/useCatalog";
import { trackEvent, trackLink } from "../utils/tracking";

const categories = [
  { id: "all", fa: "همه محصولات", en: "All creations" },
  { id: "rings", fa: "انگشتر", en: "Rings" },
  { id: "bracelets", fa: "دستبند", en: "Bracelets" },
  { id: "earrings", fa: "گوشواره", en: "Earrings" },
  { id: "necklaces", fa: "گردنبند", en: "Necklaces" },
  { id: "sets", fa: "ست‌ها", en: "Sets" },
  { id: "signature", fa: "قطعات امضادار", en: "Signature pieces" },
];

const fallbackProducts = [
  {
    id: "atrin-necklace",
    image: "/images/didar-ui/product-01.jpg",
    category: "necklaces",
    collection: "SIGNATURE",
    fa: { name: "گردنبند آترین", type: "گردنبند" },
    en: { name: "Atrin Necklace", type: "Necklace" },
  },
  {
    id: "vira-bracelet",
    image: "/images/didar-ui/product-02.jpg",
    category: "bracelets",
    collection: "SIGNATURE",
    fa: { name: "دستبند ویرا", type: "دستبند" },
    en: { name: "Vira Bracelet", type: "Bracelet" },
  },
  {
    id: "mahtab-ring",
    image: "/images/didar-ui/product-03.jpg",
    category: "rings",
    collection: "HERITAGE",
    fa: { name: "انگشتر مهتاب", type: "انگشتر" },
    en: { name: "Mahtab Ring", type: "Ring" },
  },
  {
    id: "nadia-earrings",
    image: "/images/didar-ui/product-04.jpg",
    category: "earrings",
    collection: "CEREMONY",
    fa: { name: "گوشواره نادیا", type: "گوشواره" },
    en: { name: "Nadia Earrings", type: "Earrings" },
  },
  {
    id: "leila-ring",
    image: "/images/didar-ui/product-05.jpg",
    category: "rings",
    collection: "SIGNATURE",
    fa: { name: "انگشتر لیلا", type: "انگشتر" },
    en: { name: "Leila Ring", type: "Ring" },
  },
  {
    id: "raha-necklace",
    image: "/images/didar-ui/product-06.jpg",
    category: "necklaces",
    collection: "CEREMONY",
    fa: { name: "گردنبند رها", type: "گردنبند" },
    en: { name: "Raha Necklace", type: "Necklace" },
  },
];

const copy = {
  fa: {
    eyebrow: "آفریده‌های دیدار",
    heroTitle: ["هر قطعه، روایتی", "برای همراهی با شما"],
    heroDescription:
      "مجموعه‌ای از طلا و جواهرات معاصر؛ طراحی‌شده با دقت، ساخته‌شده با اصالت و ماندگار برای لحظه‌های شخصی شما.",
    discover: "کشف محصولات",
    appointment: "رزرو مشاهده خصوصی",
    categoryEyebrow: "دسته‌بندی محصولات",
    categoryTitle: "زیبایی در فرم‌های گوناگون",
    categoryDescription:
      "از قطعات روزمره تا انتخاب‌های ویژه، هر آفریده دیدار با زبان طراحی یکپارچه و جزئیاتی سنجیده شکل می‌گیرد.",
    piecesEyebrow: "گزیده محصولات",
    piecesTitle: "قطعه‌ای متناسب با روایت شما",
    piecesDescription: "دسته موردنظر را انتخاب کنید و جزئیات هر آفریده را از نزدیک ببینید.",
    details: "مشاهده جزئیات",
    empty: "محصولی در این دسته ثبت نشده است.",
    featureEyebrow: "قطعه منتخب",
    featureTitle: "درخشش آرام، حضور ماندگار",
    featureDescription:
      "آترین با تناسبات ظریف و درخششی کنترل‌شده، برای همراهی با استایل شخصی و استفاده در لحظه‌های متفاوت طراحی شده است.",
    featurePoints: ["طلای ۱۸ عیار", "ساخت دقیق", "شناسنامه دیجیتال"],
    featureCta: "مشاهده قطعه",
    craftEyebrow: "استاندارد دیدار",
    craftTitle: "اعتماد، بخشی از طراحی است",
    craftDescription:
      "اصالت متریال، دقت ساخت و خدمات پس از خرید در کنار هم تجربه‌ای روشن و قابل اعتماد می‌سازند.",
    standards: [
      ["اصالت و ردیابی", "هویت و مشخصات روشن بر پایه اطلاعات معتبر"],
      ["کنترل کیفیت", "بازبینی دقیق جزئیات پیش از ارائه"],
      ["خدمات ماندگار", "پشتیبانی، مراقبت و خدمات چرخه عمر"],
    ],
    ctaEyebrow: "مشاوره خصوصی",
    ctaTitle: <>برای انتخابی شخصی،<br />از نزدیک ببینید</>,
    ctaDescription:
      "در یک جلسه خصوصی، محصولات را با آرامش مشاهده کنید و راهنمایی متناسب با سلیقه و مناسبت خود دریافت کنید.",
    ctaPrimary: "رزرو وقت ملاقات",
    ctaSecondary: "مشاهده کالکشن‌ها",
  },
  en: {
    eyebrow: "DIDAR CREATIONS",
    heroTitle: ["Every piece, a story", "made to accompany you"],
    heroDescription:
      "A collection of contemporary gold and jewelry, designed with precision, crafted with integrity, and made to endure your personal moments.",
    discover: "Discover products",
    appointment: "Book a private viewing",
    categoryEyebrow: "PRODUCT CATEGORIES",
    categoryTitle: "Beauty, expressed in many forms",
    categoryDescription:
      "From everyday creations to exceptional statements, every Didar piece shares a refined design language and considered detail.",
    piecesEyebrow: "SELECTED CREATIONS",
    piecesTitle: "A piece for your own story",
    piecesDescription: "Choose a category and explore each creation more closely.",
    details: "View details",
    empty: "No creations are currently listed in this category.",
    featureEyebrow: "FEATURED CREATION",
    featureTitle: "Quiet brilliance, enduring presence",
    featureDescription:
      "Atrin balances refined proportions with measured brilliance, designed to accompany a personal style across different moments.",
    featurePoints: ["18K gold", "Precise craft", "Digital passport"],
    featureCta: "Explore the piece",
    craftEyebrow: "THE DIDAR STANDARD",
    craftTitle: "Trust is part of the design",
    craftDescription:
      "Material authenticity, precise craftsmanship, and lasting care come together in a clear and dependable experience.",
    standards: [
      ["Authenticity & traceability", "Clear identity based on verified information"],
      ["Quality controlled", "Every detail reviewed before presentation"],
      ["Lasting care", "Support, maintenance, and lifecycle services"],
    ],
    ctaEyebrow: "PRIVATE CONSULTATION",
    ctaTitle: <>For a personal choice,<br />see it in person</>,
    ctaDescription:
      "Explore the creations at your own pace and receive guidance shaped around your style and occasion.",
    ctaPrimary: "Book an appointment",
    ctaSecondary: "Explore collections",
  },
};

function DirectionArrow({ language, size = 18 }) {
  const Icon = language === "fa" ? ArrowLeft : ArrowRight;
  return <Icon size={size} strokeWidth={1.5} />;
}

function ProductsPage() {
  const { language, direction } = useSitePreferences();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useSelection();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const { items: catalogItems, available: catalogAvailable, loaded: catalogLoaded } = useCatalog("product");
  const text = copy[language];
  const products = catalogLoaded && catalogAvailable ? catalogItems.map((item) => ({
    id: item.slug,
    image: item.data.image,
    category: item.data.category,
    collection: (item.data.collection || "").toUpperCase(),
    fa: { name: item.data.name?.fa || item.slug, type: item.data.typeLabel?.fa || "" },
    en: { name: item.data.name?.en || item.slug, type: item.data.typeLabel?.en || "" },
  })) : fallbackProducts;

  const visibleProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );

  return (
    <div
      dir={direction}
      className="w-full max-w-full overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500"
    >
      <section className="relative min-h-[700px] overflow-hidden sm:min-h-[760px] lg:min-h-screen">
        <Header />
        <img
          src="/images/products-hero.webp"
          alt="Didar Gold products"
          className="absolute inset-0 h-full w-full object-cover object-[46%_center] sm:object-center"
        />
        <div
          className={`absolute inset-0 ${
            language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } from-[#041E42]/95 via-[#041E42]/66 to-[#041E42]/12`}
        />
        <div className="absolute inset-0 bg-[#041E42]/18 sm:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/55 via-transparent to-[#041E42]/20" />

        <div className="relative z-10 mx-auto flex min-h-[700px] max-w-[1450px] items-center px-5 pb-10 pt-32 sm:min-h-[760px] sm:px-8 sm:pb-16 sm:pt-36 lg:min-h-screen lg:px-12 lg:pb-0">
          <div className="box-border min-w-0 w-[calc(100vw-2.5rem)] max-w-[720px] overflow-hidden text-start text-white sm:w-full">
            <div className="mb-6 flex items-center gap-4 text-[#D9B985]">
              <span className="h-px w-10 shrink-0 bg-[#B08A57] sm:w-14" />
              <span className="text-[11px] tracking-[0.18em] sm:text-sm sm:tracking-[0.28em]">{text.eyebrow}</span>
            </div>
            <h1 className="w-full max-w-full text-[30px] font-normal leading-[1.55] sm:text-6xl lg:text-[68px]">
              {text.heroTitle.map((line) => (
                <span key={line} className="block w-full">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/82 sm:mt-6 sm:text-xl sm:leading-10">
              {text.heroDescription}
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row">
              <a
                href="#product-grid"
                onClick={trackLink("click_hero_cta", { cta: "product_grid", source: "products_hero" })}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm font-medium text-white transition duration-300 hover:-translate-y-1 hover:bg-[#F7F3EE] hover:text-[#041E42] sm:w-auto"
              >
                {text.discover}
                <DirectionArrow language={language} />
              </a>
              <a
                href="#product-consultation"
                onClick={trackLink("click_reserve_appointment", { source: "products_hero" })}
                className="inline-flex h-14 w-full items-center justify-center rounded-full border border-white/55 bg-[#041E42]/15 px-8 text-sm text-white backdrop-blur-sm transition hover:border-[#B08A57] hover:bg-[#B08A57]/15 sm:w-auto"
              >
                {text.appointment}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-[0.28em] text-[#B08A57] sm:text-sm">
              {text.categoryEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-normal leading-[1.5] sm:text-5xl">
              {text.categoryTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--ink-muted)] sm:text-lg sm:leading-9">
              {text.categoryDescription}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(1).map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`group relative min-h-40 overflow-hidden rounded-[24px] border px-4 py-6 text-center transition duration-300 ${
                  activeCategory === category.id
                    ? "border-[#B08A57] bg-[#B08A57] text-white shadow-[0_16px_38px_rgba(176,138,87,0.25)]"
                    : "border-[var(--line)] bg-[var(--surface-raised)] hover:-translate-y-1 hover:border-[#B08A57]"
                }`}
              >
                <span className="absolute end-4 top-3 text-[10px] opacity-45">0{index + 1}</span>
                <Gem
                  size={27}
                  strokeWidth={1.15}
                  className={`mx-auto mt-4 ${
                    activeCategory === category.id ? "text-white" : "text-[#B08A57]"
                  }`}
                />
                <span className="mt-5 block text-sm sm:text-base">{category[language]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="product-grid" className="bg-[var(--surface-raised)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl text-start">
              <p className="text-xs tracking-[0.28em] text-[#B08A57] sm:text-sm">
                {text.piecesEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.5] sm:text-5xl">
                {text.piecesTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--ink-muted)] sm:text-lg">
                {text.piecesDescription}
              </p>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-xs transition ${
                    activeCategory === category.id
                      ? "border-[#B08A57] bg-[#B08A57] text-white"
                      : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[#B08A57] hover:text-[#B08A57]"
                  }`}
                >
                  {category[language]}
                </button>
              ))}
            </div>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => {
                const productName = product[language].name;
                const favorite = isWishlisted(product.id);
                return (
                  <article key={product.en.name} className="group text-start">
                    <div className="relative overflow-hidden rounded-[28px] bg-[var(--media-surface)]">
                      <img
                        src={product.image}
                        alt={productName}
                        className="aspect-square h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          trackEvent("click_wishlist", { product_slug: product.id, source: "products_grid", authenticated: isAuthenticated });
                          isAuthenticated ? toggleWishlist(product.id) : navigate(`/login?returnTo=${encodeURIComponent(`/wishlist?add=${product.id}`)}`);
                        }}
                        aria-label={`Favorite ${product.en.name}`}
                        className={`absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
                          favorite
                            ? "border-[#B08A57] bg-[#B08A57] text-white"
                            : "border-white/60 bg-white/60 text-[#041E42] hover:bg-[#B08A57] hover:text-white"
                        }`}
                      >
                        <Heart size={18} fill={favorite ? "currentColor" : "none"} />
                      </button>
                      <span className="absolute bottom-4 start-4 rounded-full bg-[#041E42]/80 px-4 py-2 text-[10px] tracking-[0.2em] text-white backdrop-blur-md">
                        {product.collection}
                      </span>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#B08A57]">{product[language].type}</p>
                        <h3 className="mt-1 text-2xl font-normal">{productName}</h3>
                      </div>
                      <Link
                        to={`/products/${product.id}`}
                        onClick={trackLink("click_product_card", { product_slug: product.id, source: "products_grid" })}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] transition hover:border-[#B08A57] hover:bg-[#B08A57] hover:text-white"
                        aria-label={text.details}
                      >
                        <ArrowUpLeft size={18} strokeWidth={1.5} />
                      </Link>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
                      <Link to={`/products/${product.id}`} onClick={trackLink("click_product_card", { product_slug: product.id, source: "products_grid_text" })} className="text-xs text-[var(--ink-muted)] transition hover:text-[#B08A57]">{text.details}</Link>
                      <span className="text-xs text-[var(--ink-muted)]">0{index + 1}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-[28px] border border-dashed border-[var(--line)] py-20 text-center text-[var(--ink-muted)]">
              {text.empty}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[var(--contrast)] px-5 py-20 text-[var(--contrast-ink)] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1450px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative overflow-hidden rounded-[30px]">
            <img
              src="/images/didar-ui/product-01.jpg"
              alt="Atrin Necklace"
              loading="lazy"
              className="aspect-[4/4.5] h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/55 via-transparent to-transparent" />
            <span className="absolute bottom-6 start-6 text-xs tracking-[0.28em] text-[#D9B985]">
              SIGNATURE · 01
            </span>
          </div>
          <div className="text-start">
            <p className="text-xs tracking-[0.28em] text-[#B08A57] sm:text-sm">
              {text.featureEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-normal leading-[1.5] sm:text-5xl">
              {text.featureTitle}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--contrast-muted)] sm:text-lg sm:leading-9">
              {text.featureDescription}
            </p>
            <div className="mt-8 space-y-4">
              {text.featurePoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#B08A57]/60 text-[#B08A57]">
                    <Check size={14} />
                  </span>
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
            <Link
              to="/products/atrin-necklace"
              onClick={trackLink("click_product_card", { product_slug: "atrin-necklace", source: "products_featured" })}
              className="mt-9 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#F7F3EE] hover:text-[#041E42]"
            >
              {text.featureCta}
              <DirectionArrow language={language} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px] rounded-[36px] border border-[var(--line)] bg-[var(--surface-raised)] p-6 shadow-[0_24px_70px_rgba(4,30,66,0.12)] sm:p-9 lg:p-12">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="text-start">
            <p className="text-xs tracking-[0.28em] text-[#B08A57] sm:text-sm">
              {text.craftEyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-normal leading-[1.5] sm:text-6xl">
              {text.craftTitle}
            </h2>
            <p className="mt-6 text-[17px] leading-10 text-[var(--ink)] opacity-80 sm:text-xl">
              {text.craftDescription}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[ShieldCheck, Sparkles, Gem].map((Icon, index) => (
              <div
                key={text.standards[index][0]}
                className="min-h-[260px] rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-8 text-start transition duration-300 hover:-translate-y-1 hover:border-[#B08A57] hover:shadow-xl"
              >
                <Icon size={38} strokeWidth={1.15} className="text-[#B08A57]" />
                <h3 className="mt-8 text-2xl leading-[1.5]">{text.standards[index][0]}</h3>
                <p className="mt-4 text-base leading-8 text-[var(--ink)] opacity-76">
                  {text.standards[index][1]}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section id="product-consultation" className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative mx-auto min-h-[520px] max-w-[1450px] overflow-hidden rounded-[32px]">
          <img
            src="/images/didar-ui/gallery-accent.jpg"
            alt="Didar private consultation"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className={`absolute inset-0 ${
              language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
            } from-[#041E42]/95 via-[#041E42]/72 to-[#041E42]/12`}
          />
          <div className="relative flex min-h-[520px] max-w-2xl flex-col justify-center p-7 text-start text-white sm:p-12 lg:p-16">
            <p className="text-xs tracking-[0.28em] text-[#D9B985]">{text.ctaEyebrow}</p>
            <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.ctaTitle}</h2>
            <p className="mt-5 text-base leading-8 text-white/72 sm:text-lg sm:leading-9">
              {text.ctaDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/contact#appointment"
                onClick={trackLink("click_reserve_appointment", { source: "products_cta" })}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm transition hover:bg-[#F7F3EE] hover:text-[#041E42]"
              >
                {text.ctaPrimary}
                <DirectionArrow language={language} />
              </a>
              <a
                href="/collections"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/40 px-8 text-sm transition hover:border-[#B08A57] hover:bg-[#B08A57]/15"
              >
                {text.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProductsPage;
