import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Heart,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useSelection } from "../context/SelectionContext";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../hooks/useCatalog";

const fallbackProducts = [
  {
    id: "atrin-necklace",
    image: "/images/Product-01.png",
    category: "necklaces",
    collection: "signature",
    occasion: "gift",
    price: 248,
    weight: "7.8g",
    karat: "18K",
    uid: "DEMO-REF-2401",
    availability: "viewing",
    passport: true,
    warranty: true,
    buyback: true,
    fa: ["گردنبند آترین", "فرم قطره ای با درخشش آرام برای هدیه ای ماندگار"],
    en: ["Atrin Necklace", "A calm pear-cut necklace for an enduring gift"],
  },
  {
    id: "vira-bracelet",
    image: "/images/Product-02.png",
    category: "bracelets",
    collection: "signature",
    occasion: "daily",
    price: 196,
    weight: "6.4g",
    karat: "18K",
    uid: "DEMO-REF-2402",
    availability: "ready",
    passport: true,
    warranty: true,
    buyback: true,
    fa: ["دستبند ویرا", "دستبندی مینیمال برای همراهی روزمره و انتخاب مطمئن"],
    en: ["Vira Bracelet", "A minimal bracelet for a considered everyday choice"],
  },
  {
    id: "mahtab-ring",
    image: "/images/Product-03.png",
    category: "rings",
    collection: "heritage",
    occasion: "signature",
    price: 172,
    weight: "4.9g",
    karat: "18K",
    uid: "DEMO-REF-2403",
    availability: "ready",
    passport: true,
    warranty: true,
    buyback: false,
    fa: ["انگشتر مهتاب", "بازخوانی یک موتیف گل با جزئیات ظریف و درخشان"],
    en: ["Mahtab Ring", "A floral motif reinterpreted with refined detail"],
  },
  {
    id: "nadia-earrings",
    image: "/images/Product-04.png",
    category: "earrings",
    collection: "ceremony",
    occasion: "ceremony",
    price: 218,
    weight: "5.6g",
    karat: "18K",
    uid: "DEMO-REF-2404",
    availability: "viewing",
    passport: true,
    warranty: true,
    buyback: true,
    fa: ["گوشواره نادیا", "گوشواره ای کشیده برای لحظه های رسمی و به یادماندنی"],
    en: ["Nadia Earrings", "Elongated earrings for ceremonial moments"],
  },
  {
    id: "leila-ring",
    image: "/images/Product-05.png",
    category: "rings",
    collection: "signature",
    occasion: "daily",
    price: 165,
    weight: "4.2g",
    karat: "18K",
    uid: "DEMO-REF-2405",
    availability: "ready",
    passport: true,
    warranty: true,
    buyback: false,
    fa: ["انگشتر لیلا", "تک نگینی آرام با زبان طراحی امضای دیدار"],
    en: ["Leila Ring", "A quiet solitaire in Didar's signature language"],
  },
  {
    id: "raha-necklace",
    image: "/images/Product-06.png",
    category: "necklaces",
    collection: "ceremony",
    occasion: "gift",
    price: 232,
    weight: "7.1g",
    karat: "18K",
    uid: "DEMO-REF-2406",
    availability: "limited",
    passport: true,
    warranty: true,
    buyback: true,
    fa: ["گردنبند رها", "آویز قطره ای برای انتخابی شخصی، روشن و ماندگار"],
    en: ["Raha Necklace", "A pear pendant for a personal, luminous choice"],
  },
];

const copy = {
  fa: {
    eyebrow: "COMMERCE / PLATFORM LAYER",
    heroTitle: "بوتیک آنلاین دیدار",
    heroText:
      "شاپ دیدار فقط یک فروشگاه آنلاین نیست؛ ورودی آرام و شفاف به کاتالوگ، رزرو، مشاوره و خدمات اعتماد در چرخه عمر هر قطعه است.",
    primary: "ورود به کاتالوگ",
    secondary: "رزرو مشاوره خصوصی",
    introEyebrow: "SHOP LANDING",
    introTitle: "انتخاب، پیش از خرید معنا پیدا می کند",
    introText:
      "مطابق سند مادر تجربه دیجیتال، این بخش باید محصول را قابل مقایسه، قابل انتخاب و قابل پیگیری کند؛ بدون لحن تخفیفی، بدون ازدحام، و با اتصال روشن به اصالت، گارانتی و بازخرید.",
    categoriesTitle: "ورود سریع بر اساس دسته",
    collectionsTitle: "ورود بر اساس کالکشن",
    catalogTitle: "کاتالوگ قابل انتخاب",
    catalogText: "فیلترها برای نزدیک شدن به انتخاب درست طراحی شده اند، نه برای شلوغ کردن تجربه.",
    search: "جست و جوی نام، شناسه نمونه یا کالکشن...",
    sortFeatured: "گزیده دیدار",
    sortPriceAsc: "قیمت کمتر",
    sortPriceDesc: "قیمت بیشتر",
    all: "همه",
    category: "دسته",
    collection: "کالکشن",
    occasion: "مناسبت",
    availability: "وضعیت",
    clearFilters: "پاک کردن فیلترها",
    categories: {
      all: "همه آثار",
      rings: "انگشتر",
      necklaces: "گردنبند",
      bracelets: "دستبند",
      earrings: "گوشواره",
    },
    collections: {
      all: "همه کالکشن ها",
      signature: "امضای دیدار",
      heritage: "میراث",
      ceremony: "مراسم",
    },
    occasions: {
      all: "همه مناسبت ها",
      daily: "روزمره",
      gift: "هدیه",
      ceremony: "مراسم",
      signature: "شاخص",
    },
    availabilityOptions: {
      all: "همه وضعیت ها",
      ready: "آماده بررسی",
      viewing: "نیازمند مشاهده حضوری",
      limited: "محدود",
    },
    availabilityLabels: {
      ready: "آماده بررسی",
      viewing: "رزرو مشاهده",
      limited: "موجودی محدود",
    },
    toman: "میلیون تومان",
    productMeta: "نمونه مشخصات قابل پیگیری",
    metaNotice: "اطلاعات این بخش نمایشی است و پس از اتصال به سامانه رسمی اعتبار عملیاتی خواهد داشت.",
    sampleId: "شناسه نمونه",
    passport: "معرفی گذرنامه دیجیتال",
    warranty: "معرفی پوشش گارانتی",
    buyback: "ورودی بررسی بازخرید",
    viewStory: "خواندن داستان قطعه",
    add: "افزودن برای بررسی",
    added: "در لیست بررسی",
    empty: "محصولی با این فیلترها پیدا نشد.",
    bag: "لیست بررسی بوتیک",
    bagEmpty: "هنوز قطعه ای برای بررسی یا رزرو انتخاب نشده است.",
    subtotal: "جمع تقریبی",
    checkout: "درخواست بررسی و رزرو",
    clear: "پاک کردن",
    nextStepsTitle: "مسیر بعد از انتخاب",
    nextSteps: [
      ["01", "بررسی موجودی و قیمت"],
      ["02", "بررسی امکان صدور UID و گذرنامه"],
      ["03", "رزرو مشاهده یا سفارش"],
    ],
    trustTitle: "لایه اعتماد، کنار خرید دیده می شود",
    trustText:
      "در مدل دیدار، UID، گذرنامه محصول، گارانتی و بازخرید نباید فقط شعار باشند؛ کاربر باید آن ها را در همان لحظه انتخاب محصول ببیند و بفهمد.",
    trustItems: [
      ["UID / Passport", "شناسه یکتا و نمایش نمونه گذرنامه محصول"],
      ["Warranty", "وضعیت گارانتی و امکان فعال سازی پس از خرید"],
      ["Buyback", "مسیر ثبت درخواست بازخرید یا ارتقا برای قطعات واجد شرایط"],
    ],
    ctaTitle: "برای انتخاب نهایی، دیدار همراه شماست",
    ctaText:
      "اگر بین چند قطعه مردد هستید، مشاوران دیدار می توانند بر اساس مناسبت، بودجه، سلیقه و خدمات پس از خرید شما را راهنمایی کنند.",
    ctaButton: "رزرو مشاوره خصوصی",
  },
  en: {
    eyebrow: "COMMERCE / PLATFORM LAYER",
    heroTitle: "Didar Online Boutique",
    heroText:
      "Didar Shop is not a simple online store; it is a calm entry into catalog, reservation, advisory, and trust services across each creation's lifecycle.",
    primary: "Enter catalog",
    secondary: "Book private consultation",
    introEyebrow: "SHOP LANDING",
    introTitle: "Choice comes before purchase",
    introText:
      "Aligned with the digital experience master document, this layer makes products comparable, selectable, and traceable without discounts, clutter, or aggressive commerce.",
    categoriesTitle: "Enter by category",
    collectionsTitle: "Enter by collection",
    catalogTitle: "Selectable catalog",
    catalogText: "Filters are designed to guide selection, not crowd the experience.",
    search: "Search name, sample ID, or collection...",
    sortFeatured: "Didar selection",
    sortPriceAsc: "Lower price",
    sortPriceDesc: "Higher price",
    all: "All",
    category: "Category",
    collection: "Collection",
    occasion: "Occasion",
    availability: "Status",
    clearFilters: "Clear filters",
    categories: {
      all: "All creations",
      rings: "Rings",
      necklaces: "Necklaces",
      bracelets: "Bracelets",
      earrings: "Earrings",
    },
    collections: {
      all: "All collections",
      signature: "Signature",
      heritage: "Heritage",
      ceremony: "Ceremony",
    },
    occasions: {
      all: "All occasions",
      daily: "Everyday",
      gift: "Gift",
      ceremony: "Ceremony",
      signature: "Statement",
    },
    availabilityOptions: {
      all: "All statuses",
      ready: "Ready to review",
      viewing: "Viewing advised",
      limited: "Limited",
    },
    availabilityLabels: {
      ready: "Ready to review",
      viewing: "Book viewing",
      limited: "Limited availability",
    },
    toman: "million toman",
    productMeta: "Sample traceable details",
    metaNotice: "This information is illustrative and becomes operational only after connection to the official system.",
    sampleId: "Sample ID",
    passport: "Digital passport overview",
    warranty: "Warranty coverage overview",
    buyback: "Buyback review entry",
    viewStory: "Read creation story",
    add: "Add for review",
    added: "In review list",
    empty: "No creation matched these filters.",
    bag: "Boutique review list",
    bagEmpty: "No creation has been selected for review or reservation.",
    subtotal: "Estimated subtotal",
    checkout: "Request review",
    clear: "Clear",
    nextStepsTitle: "After selection",
    nextSteps: [
      ["01", "Check stock and price"],
      ["02", "Review UID and passport eligibility"],
      ["03", "Reserve viewing or order"],
    ],
    trustTitle: "Trust appears beside commerce",
    trustText:
      "In Didar's model, UID, product passport, warranty, and buyback cannot remain claims. They need to be visible and understandable while choosing.",
    trustItems: [
      ["UID / Passport", "Unique ID and product passport preview"],
      ["Warranty", "Warranty status and post-purchase activation"],
      ["Buyback", "Buyback or upgrade request path for eligible creations"],
    ],
    ctaTitle: "Didar accompanies the final choice",
    ctaText:
      "If you are comparing pieces, Didar advisors can guide you by occasion, budget, taste, and after-sales expectations.",
    ctaButton: "Book private consultation",
  },
};

const categoryImages = {
  rings: "/images/Product-03.png",
  necklaces: "/images/Product-01.png",
  bracelets: "/images/Product-02.png",
  earrings: "/images/Product-04.png",
};

const collectionImages = {
  signature: "/images/Collection-01.png",
  heritage: "/images/Collection-02.png",
  ceremony: "/images/Collection-03.png",
};

function ShopPage() {
  const { language, direction } = useSitePreferences();
  const { isAuthenticated } = useAuth();
  const { wishlist, selection, toggleWishlist, addSelection, removeSelection, clearSelection } = useSelection();
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [collection, setCollection] = useState("all");
  const [occasion, setOccasion] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const { items: catalogItems, available: catalogAvailable, loaded: catalogLoaded } = useCatalog("product");
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const products = catalogLoaded && catalogAvailable ? catalogItems.map((item) => {
    const base = fallbackProducts.find((product) => product.id === item.slug) || {};
    return {
      ...base,
      id: item.slug,
      image: item.data.image,
      category: item.data.category || base.category || "rings",
      collection: item.data.collection || base.collection || "signature",
      occasion: item.data.occasion || base.occasion || "daily",
      availability: item.data.availability || base.availability || "viewing",
      price: Number(item.data.price ?? base.price ?? 0),
      weight: item.data.specs?.weight || base.weight || "",
      karat: item.data.specs?.karat || base.karat || "18K",
      uid: item.data.uid || base.uid || `DIDAR-${item.slug.toUpperCase()}`,
      passport: item.data.passport ?? base.passport ?? true,
      warranty: item.data.warranty ?? base.warranty ?? true,
      buyback: item.data.buyback ?? base.buyback ?? false,
      fa: [item.data.name?.fa || item.slug, item.data.positioning?.fa || ""],
      en: [item.data.name?.en || item.slug, item.data.positioning?.en || ""],
    };
  }) : fallbackProducts;

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesCollection = collection === "all" || product.collection === collection;
      const matchesOccasion = occasion === "all" || product.occasion === occasion;
      const matchesAvailability = availability === "all" || product.availability === availability;
      const searchable = `${product.uid} ${product.fa.join(" ")} ${product.en.join(" ")} ${product.collection}`.toLocaleLowerCase();

      return (
        matchesCategory &&
        matchesCollection &&
        matchesOccasion &&
        matchesAvailability &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });

    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [availability, category, collection, occasion, products, query, sort]);

  const selectedProducts = selection
    .map((id) => products.find((entry) => entry.id === id) || null)
    .filter(Boolean);

  const addToBag = (id) => {
    addSelection(id);
  };

  const toggleFavorite = (id) => {
    if (isAuthenticated) toggleWishlist(id);
    else navigate(`/login?returnTo=${encodeURIComponent(`/wishlist?add=${id}`)}`);
  };

  const clearFilters = () => {
    setCategory("all");
    setCollection("all");
    setOccasion("all");
    setAvailability("all");
    setQuery("");
    setSort("featured");
  };

  return (
    <div
      dir={direction}
      className="min-h-screen w-full overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500"
    >
      <section className="relative min-h-[700px] overflow-hidden bg-[#020b17] lg:min-h-[820px]">
        <Header />
        <img src="/images/shop-section.JPG" alt={text.heroTitle} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#020b17]/35" />
        <div
          className={`absolute inset-0 ${
            language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } from-[#020b17]/96 via-[#020b17]/72 to-[#020b17]/12`}
        />
        <div className="relative z-10 mx-auto flex min-h-[700px] max-w-[1450px] items-center px-5 pb-14 pt-32 sm:px-8 lg:min-h-[820px] lg:px-12">
          <div className="max-w-[760px] text-start text-white">
            <p className="text-xs tracking-[0.32em] text-[#D9B985]">{text.eyebrow}</p>
            <h1 className="mt-7 text-5xl font-normal leading-[1.45] sm:text-7xl lg:text-[86px]">{text.heroTitle}</h1>
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-20 bg-[#B08A57]" />
              <span className="h-3 w-3 rotate-45 border border-[#B08A57]" />
              <span className="h-px w-20 bg-[#B08A57]" />
            </div>
            <p className="mt-7 max-w-2xl text-lg leading-10 text-white/76 sm:text-xl">{text.heroText}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#shop-catalog"
                className="inline-flex h-14 items-center justify-center gap-3 bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#F7F3EE] hover:text-[#041E42]"
              >
                {text.primary}
                <Arrow size={17} strokeWidth={1.5} />
              </a>
              <a
                href="#shop-consultation"
                className="inline-flex h-14 items-center justify-center border border-white/45 px-8 text-sm text-white transition hover:border-[#B08A57] hover:bg-[#B08A57]/15"
              >
                {text.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-20 -mt-10 px-4 pb-20 sm:px-8 lg:-mt-16 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-[1450px] border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-[0_28px_80px_rgba(2,11,23,0.16)] sm:p-8 lg:p-10">
          <section className="grid gap-8 border-b border-[var(--line)] pb-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div className="text-start">
              <p className="text-xs tracking-[0.28em] text-[#B08A57]">{text.introEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.introTitle}</h2>
            </div>
            <p className="text-start text-base leading-9 text-[var(--ink-muted)]">{text.introText}</p>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-start text-2xl font-normal">{text.categoriesTitle}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {Object.entries(categoryImages).map(([key, image]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`group relative min-h-[170px] overflow-hidden border text-start transition ${
                      category === key ? "border-[#B08A57]" : "border-[var(--line)] hover:border-[#B08A57]/70"
                    }`}
                  >
                    <img src={image} alt={text.categories[key]} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#020b17]/90 via-[#020b17]/35 to-transparent" />
                    <span className="absolute bottom-4 start-4 text-sm text-white">{text.categories[key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-start text-2xl font-normal">{text.collectionsTitle}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {Object.entries(collectionImages).map(([key, image]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCollection(key)}
                    className={`group relative min-h-[170px] overflow-hidden border text-start transition ${
                      collection === key ? "border-[#B08A57]" : "border-[var(--line)] hover:border-[#B08A57]/70"
                    }`}
                  >
                    <img src={image} alt={text.collections[key]} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#020b17]/92 via-[#020b17]/35 to-transparent" />
                    <span className="absolute bottom-4 start-4 text-sm text-white">{text.collections[key]}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section id="shop-catalog" className="mt-14 grid gap-8 lg:grid-cols-[1fr_350px]">
            <div>
              <div className="flex flex-col gap-6 border-b border-[var(--line)] pb-7 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl text-start">
                  <h2 className="text-3xl font-normal leading-[1.5] sm:text-5xl">{text.catalogTitle}</h2>
                  <p className="mt-3 text-base leading-8 text-[var(--ink-muted)]">{text.catalogText}</p>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-11 w-fit items-center gap-2 border border-[var(--line)] px-5 text-sm text-[var(--ink-muted)] transition hover:border-[#B08A57] hover:text-[#B08A57]"
                >
                  <X size={15} strokeWidth={1.5} />
                  {text.clearFilters}
                </button>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="flex h-12 items-center gap-3 border border-[var(--line)] bg-[var(--surface)] px-4 xl:col-span-2">
                  <Search size={17} className="text-[#B08A57]" strokeWidth={1.5} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={text.search}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink-muted)]"
                  />
                </label>

                <FilterSelect icon={<SlidersHorizontal size={17} />} value={sort} onChange={setSort}>
                  <option value="featured">{text.sortFeatured}</option>
                  <option value="price-asc">{text.sortPriceAsc}</option>
                  <option value="price-desc">{text.sortPriceDesc}</option>
                </FilterSelect>
                <FilterSelect value={category} onChange={setCategory} label={text.category}>
                  {Object.entries(text.categories).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </FilterSelect>
                <FilterSelect value={collection} onChange={setCollection} label={text.collection}>
                  {Object.entries(text.collections).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </FilterSelect>
                <FilterSelect value={occasion} onChange={setOccasion} label={text.occasion}>
                  {Object.entries(text.occasions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </FilterSelect>
                <FilterSelect value={availability} onChange={setAvailability} label={text.availability}>
                  {Object.entries(text.availabilityOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </FilterSelect>
              </div>

              {visibleProducts.length ? (
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => {
                    const isFavorite = wishlist.includes(product.id);
                    const isAdded = selection.includes(product.id);
                    return (
                      <article
                        key={product.id}
                        className="group overflow-hidden border border-[var(--line)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative h-[315px] overflow-hidden bg-[var(--media-surface)]">
                          <img src={product.image} alt={product[language][0]} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          <button
                            type="button"
                            onClick={() => toggleFavorite(product.id)}
                            className={`absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
                              isFavorite
                                ? "border-[#B08A57] bg-[#B08A57] text-white"
                                : "border-white/55 bg-white/60 text-[#041E42] hover:bg-[#B08A57] hover:text-white"
                            }`}
                            aria-label="Favorite"
                          >
                            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                          </button>
                          <span className="absolute bottom-4 start-4 bg-[#020b17]/80 px-4 py-2 text-[10px] tracking-[0.2em] text-white">
                            {text.availabilityLabels[product.availability]}
                          </span>
                        </div>
                        <div className="p-6 text-start">
                          <p className="text-xs text-[#B08A57]">
                            {text.collections[product.collection]} / {text.categories[product.category]}
                          </p>
                          <h3 className="mt-3 text-2xl font-normal leading-[1.5]">{product[language][0]}</h3>
                          <p className="mt-2 min-h-[56px] text-sm leading-7 text-[var(--ink-muted)]">{product[language][1]}</p>

                          <div className="mt-5 border border-[var(--line)] bg-[var(--surface-raised)] p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#B08A57]">{text.productMeta}</p>
                            <p className="mt-2 text-[10px] leading-5 text-[var(--ink-muted)]">{text.metaNotice}</p>
                            <dl className="mt-3 grid grid-cols-3 gap-3 text-xs text-[var(--ink-muted)]">
                              <div>
                                <dt>{text.sampleId}</dt>
                                <dd className="mt-1 text-[var(--ink)]">{product.uid}</dd>
                              </div>
                              <div>
                                <dt>{language === "fa" ? "عیار" : "Karat"}</dt>
                                <dd className="mt-1 text-[var(--ink)]">{product.karat}</dd>
                              </div>
                              <div>
                                <dt>{language === "fa" ? "وزن" : "Weight"}</dt>
                                <dd className="mt-1 text-[var(--ink)]">{product.weight}</dd>
                              </div>
                            </dl>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <TrustBadge icon={<QrCode size={13} />} label={text.passport} />
                              <TrustBadge icon={<ShieldCheck size={13} />} label={text.warranty} />
                              {product.buyback && <TrustBadge icon={<Award size={13} />} label={text.buyback} />}
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-5">
                            <span className="text-sm text-[var(--ink)]">
                              {product.price} {text.toman}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToBag(product.id)}
                              className={`inline-flex h-11 items-center gap-2 px-4 text-sm transition ${
                                isAdded
                                  ? "bg-[#B08A57] text-white"
                                  : "border border-[var(--line)] hover:border-[#B08A57] hover:text-[#B08A57]"
                              }`}
                            >
                              <ShoppingBag size={16} strokeWidth={1.5} />
                              {isAdded ? text.added : text.add}
                            </button>
                          </div>
                          <Link to={`/products/${product.id}`} className="mt-4 inline-flex items-center gap-2 text-xs text-[#B08A57] transition hover:gap-3">
                            {text.viewStory}
                            <Arrow size={14} strokeWidth={1.5} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 flex min-h-[320px] items-center justify-center border border-[var(--line)] text-[var(--ink-muted)]">
                  {text.empty}
                </div>
              )}
            </div>

            <aside className="h-fit border border-[var(--line)] bg-[var(--contrast)] p-6 text-start text-[var(--contrast-ink)] lg:sticky lg:top-32">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">{text.bag}</h2>
                <ShoppingBag size={22} className="text-[#D9B985]" strokeWidth={1.5} />
              </div>
              <span className="mt-4 block h-px w-12 bg-[#B08A57]" />

              {selectedProducts.length ? (
                <div className="mt-6 space-y-5">
                  {selectedProducts.map((product) => (
                    <article key={product.id} className="grid grid-cols-[72px_1fr] gap-4 border-b border-white/10 pb-5">
                      <img src={product.image} alt={product[language][0]} className="h-20 w-full object-cover" />
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm leading-6">{product[language][0]}</h3>
                          <button
                            type="button"
                            onClick={() => removeSelection(product.id)}
                            className="text-white/45 transition hover:text-white"
                            aria-label="Remove"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-white/50">{product.uid}</p>
                      </div>
                    </article>
                  ))}
                  <Link to="/selection" className="mt-2 flex h-12 w-full items-center justify-center bg-[#B08A57] text-sm text-white transition hover:bg-[#D9B985] hover:text-[#041E42]">
                    {text.checkout}
                  </Link>
                  <button type="button" onClick={clearSelection} className="h-10 w-full text-xs text-white/50 transition hover:text-white">
                    {text.clear}
                  </button>
                </div>
              ) : (
                <p className="mt-7 border border-white/10 p-5 text-sm leading-8 text-white/55">{text.bagEmpty}</p>
              )}

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-sm text-[#D9B985]">{text.nextStepsTitle}</h3>
                <div className="mt-4 space-y-3">
                  {text.nextSteps.map(([number, label]) => (
                    <div key={number} className="flex items-center gap-3 text-sm text-white/68">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B08A57]/60 text-[11px] text-[#D9B985]">{number}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-14 grid overflow-hidden border border-[var(--line)] bg-[var(--surface)] lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[320px]">
              <img src="/images/gallery-main.JPG" alt={text.trustTitle} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-[#020b17]/35" />
            </div>
            <div className="p-7 text-start sm:p-10 lg:p-12">
              <p className="text-xs tracking-[0.28em] text-[#B08A57]">TRUST & LIFECYCLE</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.5] sm:text-5xl">{text.trustTitle}</h2>
              <p className="mt-4 text-base leading-9 text-[var(--ink-muted)]">{text.trustText}</p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {text.trustItems.map(([title, description]) => (
                  <article key={title} className="border border-[var(--line)] bg-[var(--surface-raised)] p-5">
                    <CheckCircle2 size={20} className="text-[#B08A57]" strokeWidth={1.5} />
                    <h3 className="mt-4 text-lg">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="shop-consultation" className="relative mt-12 min-h-[330px] overflow-hidden bg-[#020b17] text-white">
            <img src="/images/world-craft.webp" alt={text.ctaTitle} className="absolute inset-0 h-full w-full object-cover opacity-75" />
            <div
              className={`absolute inset-0 ${
                language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-[#020b17]/96 via-[#020b17]/78 to-[#020b17]/18`}
            />
            <div className="relative flex min-h-[330px] max-w-2xl flex-col justify-center p-8 text-start sm:p-12">
              <Sparkles size={26} className="text-[#D9B985]" strokeWidth={1.4} />
              <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.ctaTitle}</h2>
              <p className="mt-4 text-base leading-8 text-white/68">{text.ctaText}</p>
              <Link to="/contact#appointment" className="mt-7 inline-flex h-12 w-fit items-center gap-3 bg-[#B08A57] px-7 text-sm transition hover:bg-[#F7F3EE] hover:text-[#041E42]">
                <Arrow size={17} strokeWidth={1.5} />
                {text.ctaButton}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FilterSelect({ value, onChange, children, label, icon }) {
  return (
    <label className="flex h-12 items-center gap-3 border border-[var(--line)] bg-[var(--surface)] px-4">
      <span className="text-[#B08A57]">{icon || <SlidersHorizontal size={17} strokeWidth={1.5} />}</span>
      {label && <span className="text-xs text-[var(--ink-muted)]">{label}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm outline-none">
        {children}
      </select>
    </label>
  );
}

function TrustBadge({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B08A57]/35 px-3 py-1 text-[11px] text-[var(--ink-muted)]">
      <span className="text-[#B08A57]">{icon}</span>
      {label}
    </span>
  );
}

export default ShopPage;
