import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  ZoomIn,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useCatalog } from "../hooks/useCatalog";
import { useSelection } from "../context/SelectionContext";
import { useAuth } from "../context/AuthContext";

const fallbackCreations = [
  {
    id: "atrin-necklace",
    image: "/images/Product-01.png",
    gallery: ["/images/Product-01.png", "/images/Collection-01.png", "/images/gallery-1.JPG"],
    category: { fa: "گردنبند", en: "Necklace" },
    collection: { fa: "امضای دیدار", en: "Signature" },
    name: { fa: "گردنبند آترین", en: "Atrin Necklace" },
    positioning: {
      fa: "درخششی آرام برای لحظه هایی که قرار است در حافظه بمانند.",
      en: "Quiet brilliance for moments made to remain.",
    },
    story: {
      fa: "آترین از لحظه ای الهام می گیرد که نور روی سطح آب می شکند؛ تصویری کوتاه اما ماندگار. فرم قطره ای آن با خطوطی نرم شکل گرفته تا بدون اغراق، حضور خود را نشان دهد.",
      en: "Atrin begins with the moment light breaks across water: brief yet enduring. Its pear form is shaped with soft lines to hold presence without excess.",
    },
    design: {
      fa: "تناسب کشیده آویز، زنجیر ظریف و تمرکز نور در مرکز فرم، آترین را برای استفاده شخصی و هدیه ای معنادار مناسب می کند.",
      en: "An elongated pendant, refined chain, and concentrated central light make Atrin suited to personal wear and meaningful gifting.",
    },
    specs: { weight: "7.8 g", karat: "18K", finish: { fa: "پرداخت براق", en: "Polished" } },
  },
  {
    id: "vira-bracelet",
    image: "/images/Product-02.png",
    gallery: ["/images/Product-02.png", "/images/Collection-01.png", "/images/gallery-2.JPG"],
    category: { fa: "دستبند", en: "Bracelet" },
    collection: { fa: "امضای دیدار", en: "Signature" },
    name: { fa: "دستبند ویرا", en: "Vira Bracelet" },
    positioning: { fa: "خطی پیوسته برای همراهی هر روز.", en: "A continuous line for everyday presence." },
    story: {
      fa: "ویرا درباره استمرار است؛ فرمی که با حرکت دست تغییر می کند و در عین سادگی، ریتمی دقیق و آرام دارد.",
      en: "Vira is about continuity: a form that changes with the hand while keeping a precise, quiet rhythm.",
    },
    design: {
      fa: "ساختار باریک و اتصالات کنترل شده، دستبند را سبک و مناسب استفاده روزمره نگه می دارد.",
      en: "A slender structure and controlled links keep the bracelet light and suited to daily wear.",
    },
    specs: { weight: "6.4 g", karat: "18K", finish: { fa: "پرداخت آینه ای", en: "Mirror polish" } },
  },
  {
    id: "mahtab-ring",
    image: "/images/Product-03.png",
    gallery: ["/images/Product-03.png", "/images/Collection-02.png", "/images/world-craft.webp"],
    category: { fa: "انگشتر", en: "Ring" },
    collection: { fa: "میراث", en: "Heritage" },
    name: { fa: "انگشتر مهتاب", en: "Mahtab Ring" },
    positioning: { fa: "بازتابی معاصر از یک موتیف آشنا.", en: "A contemporary reflection of a familiar motif." },
    story: {
      fa: "مهتاب، نقش گل را نه به عنوان تزئین، بلکه به عنوان هندسه ای زنده بازخوانی می کند؛ فرمی ریشه دار که برای امروز ساده شده است.",
      en: "Mahtab reads the flower not as ornament, but as living geometry: a rooted form simplified for today.",
    },
    design: {
      fa: "تمرکز حجم در مرکز و حرکت تدریجی جزئیات به سمت رکاب، تعادل میان حضور و ظرافت را حفظ می کند.",
      en: "A concentrated center and gradual movement toward the band balance presence with refinement.",
    },
    specs: { weight: "4.9 g", karat: "18K", finish: { fa: "ترکیب مات و براق", en: "Satin and polish" } },
  },
  {
    id: "nadia-earrings",
    image: "/images/Product-04.png",
    gallery: ["/images/Product-04.png", "/images/Collection-03.png", "/images/gallery-3.JPG"],
    category: { fa: "گوشواره", en: "Earrings" },
    collection: { fa: "مراسم", en: "Ceremony" },
    name: { fa: "گوشواره نادیا", en: "Nadia Earrings" },
    positioning: { fa: "حرکت نور برای یک حضور رسمی.", en: "Light in motion for a ceremonial presence." },
    story: {
      fa: "نادیا با حرکت ساخته شده است؛ خطوط کشیده آن هنگام همراهی با چهره، نور را به ریتمی نرم تبدیل می کنند.",
      en: "Nadia is built around movement. Its elongated lines turn light into a soft rhythm beside the face.",
    },
    design: {
      fa: "وزن بصری کنترل شده و ساختار عمودی، برای استایل های رسمی و قاب های ساده طراحی شده است.",
      en: "Controlled visual weight and a vertical structure are designed for formal styling and clean silhouettes.",
    },
    specs: { weight: "5.6 g", karat: "18K", finish: { fa: "پرداخت براق", en: "Polished" } },
  },
  {
    id: "leila-ring",
    image: "/images/Product-05.png",
    gallery: ["/images/Product-05.png", "/images/Collection-01.png", "/images/gallery-4.JPG"],
    category: { fa: "انگشتر", en: "Ring" },
    collection: { fa: "امضای دیدار", en: "Signature" },
    name: { fa: "انگشتر لیلا", en: "Leila Ring" },
    positioning: { fa: "یک نقطه نور، در تعادلی روشن.", en: "A single point of light in clear balance." },
    story: {
      fa: "لیلا از سکوت یک فرم خالص می آید. تمام خطوط آن برای نگه داشتن تمرکز روی مرکز طراحی شده اند.",
      en: "Leila comes from the quiet of a pure form. Every line is designed to keep attention at its center.",
    },
    design: {
      fa: "رکاب ظریف و نشیمن کنترل شده، قطعه را برای همراهی طولانی و ترکیب با حلقه های دیگر مناسب می کند.",
      en: "A refined band and controlled setting make the piece suited to lasting wear and considered stacking.",
    },
    specs: { weight: "4.2 g", karat: "18K", finish: { fa: "پرداخت آینه ای", en: "Mirror polish" } },
  },
  {
    id: "raha-necklace",
    image: "/images/Product-06.png",
    gallery: ["/images/Product-06.png", "/images/Collection-03.png", "/images/gallery-main.JPG"],
    category: { fa: "گردنبند", en: "Necklace" },
    collection: { fa: "مراسم", en: "Ceremony" },
    name: { fa: "گردنبند رها", en: "Raha Necklace" },
    positioning: { fa: "فرمی روشن برای یک انتخاب شخصی.", en: "A luminous form for a personal choice." },
    story: {
      fa: "رها درباره سبک شدن است؛ قطره ای که از هندسه سخت فاصله می گیرد و با نور و حرکت، شخصیت خود را کامل می کند.",
      en: "Raha is about lightness: a drop that moves beyond rigid geometry and completes itself through light and motion.",
    },
    design: {
      fa: "ابعاد متعادل و اتصال پنهان آویز، تمرکز را روی فرم اصلی حفظ می کند و امکان استفاده در موقعیت های مختلف را می دهد.",
      en: "Balanced scale and a concealed bail keep focus on the central form across different occasions.",
    },
    specs: { weight: "7.1 g", karat: "18K", finish: { fa: "پرداخت براق", en: "Polished" } },
  },
];

const copy = {
  fa: {
    breadcrumb: ["خانه", "محصولات"],
    story: "داستان قطعه",
    design: "یادداشت طراحی",
    craft: "متریال و هنر ساخت",
    craftText: "مشخصات این نمونه برای نمایش ساختار PDP ارائه شده اند. اطلاعات نهایی هر قطعه باید از داده معتبر محصول و کنترل کیفیت دیدار دریافت شود.",
    specs: ["وزن تقریبی", "عیار", "پرداخت"],
    trustEyebrow: "TRUST VISIBILITY",
    trustTitle: "اعتماد، کنار روایت محصول",
    trustText: "این بخش سازوکار خدمات اعتماد را معرفی می کند. فعال بودن هر خدمت برای یک قطعه فقط پس از صدور UID معتبر و اتصال به سامانه رسمی قابل تأیید است.",
    trustItems: [
      ["گذرنامه دیجیتال", "معرفی ساختار اطلاعات و اصالت قطعه", "نمونه معرفی"],
      ["مسیر گارانتی", "آشنایی با پوشش و فرایند فعال سازی", "نیازمند ثبت رسمی"],
      ["بررسی بازخرید", "ورودی درخواست اولیه برای قطعات واجد شرایط", "نیازمند ارزیابی"],
    ],
    purchase: "افزودن به فهرست بررسی",
    selected: "در فهرست بررسی",
    consultation: "رزرو مشاوره خصوصی",
    relatedEyebrow: "RELATED CREATIONS",
    relatedTitle: "آفریده های مرتبط",
    view: "مشاهده داستان قطعه",
    processTitle: "چطور شکل می گیرد؟",
    process: [
      ["01", "ایده", "تعریف معنا و جهت اولیه فرم"],
      ["02", "طراحی", "تنظیم نسبت ها، جزئیات و نحوه استفاده"],
      ["03", "ساخت", "اجرای کنترل شده متریال و پرداخت"],
      ["04", "بازبینی", "کنترل کیفیت پیش از ارائه"],
    ],
  },
  en: {
    breadcrumb: ["Home", "Creations"],
    story: "Creation story",
    design: "Design notes",
    craft: "Material & craftsmanship",
    craftText: "These sample specifications demonstrate the PDP structure. Final creation data must come from verified product and quality-control records.",
    specs: ["Approx. weight", "Karat", "Finish"],
    trustEyebrow: "TRUST VISIBILITY",
    trustTitle: "Trust beside the product story",
    trustText: "This section introduces Didar's trust services. Service status can only be confirmed after a valid UID is issued and connected to the official system.",
    trustItems: [
      ["Digital passport", "An overview of creation data and authenticity", "Illustrative"],
      ["Warranty path", "Coverage and activation process overview", "Registration required"],
      ["Buyback review", "Initial request entry for eligible creations", "Assessment required"],
    ],
    purchase: "Add to review list",
    selected: "In review list",
    consultation: "Book private consultation",
    relatedEyebrow: "RELATED CREATIONS",
    relatedTitle: "Related creations",
    view: "View creation story",
    processTitle: "How it takes form",
    process: [
      ["01", "Concept", "Defining meaning and the first direction"],
      ["02", "Design", "Refining proportion, detail, and wearability"],
      ["03", "Making", "Controlled material execution and finish"],
      ["04", "Review", "Quality control before presentation"],
    ],
  },
};

function ProductStoryPage() {
  const { productId } = useParams();
  const { language, direction } = useSitePreferences();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist, isSelected, addSelection } = useSelection();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [openDetail, setOpenDetail] = useState("story");
  const [zoomed, setZoomed] = useState(false);
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const { items: catalogItems, available: catalogAvailable, loaded: catalogLoaded } = useCatalog("product");
  const collectionNames = {
    signature: { fa: "امضای دیدار", en: "Signature" },
    heritage: { fa: "میراث", en: "Heritage" },
    ceremony: { fa: "مراسم", en: "Ceremony" },
  };
  const creations = catalogLoaded && catalogAvailable ? catalogItems.map((item) => {
    const base = fallbackCreations.find((creation) => creation.id === item.slug) || {};
    const data = item.data;
    return {
      ...base,
      ...data,
      id: item.slug,
      image: data.image || base.image,
      gallery: data.gallery?.length ? data.gallery : [data.image || base.image].filter(Boolean),
      name: { ...(base.name || {}), ...(data.name || {}) },
      category: { ...(base.category || {}), ...(data.typeLabel || {}) },
      collection: collectionNames[data.collection] || base.collection || { fa: data.collection || "", en: data.collection || "" },
      positioning: { ...(base.positioning || {}), ...(data.positioning || {}) },
      story: { ...(base.story || {}), ...(data.story || {}) },
      design: { ...(base.design || {}), ...(data.design || {}) },
      specs: { ...(base.specs || {}), ...(data.specs || {}), finish: { ...(base.specs?.finish || {}), ...(data.specs?.finish || {}) } },
    };
  }) : fallbackCreations;
  const product = creations.find((item) => item.id === productId) || (!catalogLoaded || !catalogAvailable ? creations[0] : null);
  const favorite = product ? isWishlisted(product.id) : false;
  const selected = product ? isSelected(product.id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  const related = useMemo(
    () => product ? creations.filter((item) => item.id !== product.id).slice(0, 3) : [],
    [creations, product],
  );

  const detailSections = product ? [
    ["story", text.story, product.story[language]],
    ["design", text.design, product.design[language]],
  ] : [];

  if (!product) {
    return <div dir={direction} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]"><Header /><main className="grid min-h-[75vh] place-items-center px-5 pt-32 text-center"><div><p className="text-xs tracking-[0.2em] text-[#B08A57]">DIDAR CATALOG</p><h1 className="mt-4 text-4xl">{language === "fa" ? "این محصول در دسترس نیست" : "This creation is not available"}</h1><Link to="/products" className="mt-7 inline-flex border border-[#B08A57] px-6 py-3 text-sm text-[#B08A57]">{language === "fa" ? "بازگشت به محصولات" : "Back to creations"}</Link></div></main><Footer /></div>;
  }

  return (
    <div dir={direction} className="min-h-screen overflow-x-clip bg-[var(--surface)] text-[var(--ink)]">
      <Header />

      <main className="mx-auto max-w-[1450px] px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)] sm:text-sm">
          <Link to="/" className="transition hover:text-[#B08A57]">{text.breadcrumb[0]}</Link>
          <span className="text-[#B08A57]">/</span>
          <Link to="/products" className="transition hover:text-[#B08A57]">{text.breadcrumb[1]}</Link>
          <span className="text-[#B08A57]">/</span>
          <span>{product.name[language]}</span>
        </div>

        <section className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="grid gap-4 sm:grid-cols-[92px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
              {product.gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-24 w-24 shrink-0 overflow-hidden rounded-[18px] border transition sm:h-28 sm:w-full ${
                    selectedImage === index ? "border-[#B08A57]" : "border-[var(--line)]"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="group relative order-1 min-h-[480px] overflow-hidden rounded-[32px] bg-[var(--media-surface)] sm:order-2 lg:min-h-[720px]">
              <img
                src={product.gallery[selectedImage]}
                alt={product.name[language]}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#041E42]/28 via-transparent to-transparent" />
              <button
                type="button"
                aria-label="Zoom image"
                onClick={() => setZoomed(true)}
                className="absolute bottom-5 end-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/55 bg-white/65 text-[#041E42] backdrop-blur-md"
              >
                <ZoomIn size={19} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center text-start">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs tracking-[0.22em] text-[#B08A57]">
                {product.collection[language]} / {product.category[language]}
              </p>
              <button
                type="button"
                onClick={() => isAuthenticated ? toggleWishlist(product.id) : navigate(`/login?returnTo=${encodeURIComponent(`/wishlist?add=${product.id}`)}`)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  favorite ? "border-[#B08A57] bg-[#B08A57] text-white" : "border-[var(--line)] hover:border-[#B08A57]"
                }`}
              >
                <Heart size={19} fill={favorite ? "currentColor" : "none"} />
              </button>
            </div>
            <h1 className="mt-5 text-4xl font-normal leading-[1.45] sm:text-6xl lg:text-[70px]">
              {product.name[language]}
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-10 text-[var(--ink-muted)] sm:text-2xl">
              {product.positioning[language]}
            </p>

            <div className="mt-9 border-y border-[var(--line)]">
              {detailSections.map(([id, title, body]) => {
                const open = openDetail === id;
                return (
                  <div key={id} className="border-b border-[var(--line)] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenDetail(open ? "" : id)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-start"
                    >
                      <span className="text-xl">{title}</span>
                      <ChevronDown size={18} className={`transition ${open ? "rotate-180 text-[#B08A57]" : ""}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <p className="max-w-xl text-base leading-9 text-[var(--ink-muted)]">{body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                [text.specs[0], product.specs.weight],
                [text.specs[1], product.specs.karat],
                [text.specs[2], product.specs.finish[language]],
              ].map(([label, value]) => (
                <div key={label} className="border border-[var(--line)] bg-[var(--surface-raised)] p-4 text-start">
                  <p className="text-[10px] text-[var(--ink-muted)]">{label}</p>
                  <p className="mt-2 text-sm text-[var(--ink)]">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--ink-muted)]">{text.craftText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => addSelection(product.id)} className={`inline-flex h-14 items-center justify-center gap-3 px-8 text-sm text-white transition ${selected ? "bg-[#B08A57]" : "bg-[#041E42] hover:bg-[#B08A57]"}`}>
                {selected ? text.selected : text.purchase}<Arrow size={17} strokeWidth={1.5} />
              </button>
              <Link to="/contact#appointment" className="inline-flex h-14 items-center justify-center border border-[#B08A57] px-8 text-sm text-[#B08A57] transition hover:bg-[#B08A57] hover:text-white">
                {text.consultation}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-24 grid overflow-hidden rounded-[34px] bg-[var(--contrast)] text-[var(--contrast-ink)] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-14">
            <p className="text-xs tracking-[0.24em] text-[#D9B985]">{text.trustEyebrow}</p>
            <h2 className="mt-4 text-3xl font-normal leading-[1.5] sm:text-5xl">{text.trustTitle}</h2>
            <p className="mt-5 text-base leading-9 text-white/76">{text.trustText}</p>
          </div>
          <div className="border-t border-white/10 lg:border-s lg:border-t-0">
            {text.trustItems.map(([title, description, status], index) => {
              const Icon = [QrCode, ShieldCheck, Wrench][index];
              return (
                <article key={title} className="grid gap-5 border-b border-white/10 p-6 text-start last:border-b-0 sm:grid-cols-[54px_1fr_auto] sm:items-center sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B08A57]/50 text-[#D9B985]">
                    <Icon size={20} strokeWidth={1.4} />
                  </span>
                  <div>
                    <h3 className="text-xl">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/62">{description}</p>
                  </div>
                  <span className="w-fit border border-[#B08A57]/45 px-3 py-2 text-[10px] text-[#D9B985]">{status}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-24">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div className="text-start">
              <Sparkles size={28} className="text-[#B08A57]" strokeWidth={1.3} />
              <h2 className="mt-5 text-3xl font-normal sm:text-5xl">{text.processTitle}</h2>
            </div>
            <div className="grid border-y border-[var(--line)] sm:grid-cols-4">
              {text.process.map(([number, title, description], index) => (
                <article key={title} className={`p-5 text-start sm:p-6 ${index < text.process.length - 1 ? "border-b border-[var(--line)] sm:border-b-0 sm:border-e" : ""}`}>
                  <span className="text-xs text-[#B08A57]">{number}</span>
                  <h3 className="mt-4 text-xl">{title}</h3>
                  <p className="mt-3 text-xs leading-6 text-[var(--ink-muted)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24">
          <div className="text-center">
            <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.relatedEyebrow}</p>
            <h2 className="mt-4 text-3xl font-normal sm:text-5xl">{text.relatedTitle}</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} to={`/products/${item.id}`} className="group text-start">
                <div className="aspect-square overflow-hidden rounded-[28px] bg-[var(--media-surface)]">
                  <img src={item.image} alt={item.name[language]} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-5 text-xs text-[#B08A57]">{item.collection[language]}</p>
                <h3 className="mt-2 text-2xl">{item.name[language]}</h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] group-hover:text-[#B08A57]">
                  {text.view}<Arrow size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {zoomed && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020b17]/92 p-5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close image"
            className="absolute end-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-[#B08A57] hover:text-[#D9B985]"
          >
            <X size={22} />
          </button>
          <img
            src={product.gallery[selectedImage]}
            alt={product.name[language]}
            className="max-h-[88vh] max-w-[92vw] object-contain"
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ProductStoryPage;
