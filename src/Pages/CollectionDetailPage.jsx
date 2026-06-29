import { ArrowLeft, ArrowRight, Gem, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useCatalog } from "../hooks/useCatalog";

const collectionData = {
  signature: {
    code: "SIGNATURE",
    hero: "/images/didar-ui/collection-01.jpg",
    storyImage: "/images/didar-ui/product-02.jpg",
    fa: {
      name: "امضای دیدار",
      positioning: "فرم هایی خالص برای حضوری آرام و ماندگار.",
      intro: "امضای دیدار، زبان طراحی خانه دیدار را در روشن ترین شکل خود بیان می کند؛ خطوط کنترل شده، جزئیات دقیق و قطعاتی که بدون اغراق شناخته می شوند.",
      storyTitle: "وقتی سادگی، امضا می شود",
      story: "این کالکشن از یک اصل ساده آغاز می شود: هر خط باید دلیلی داشته باشد. حجم ها کم شده اند تا تناسب، نور و کیفیت ساخت دیده شوند. نتیجه، قطعاتی است که به جای دنبال کردن روندهای کوتاه، با سبک شخصی صاحب خود همراه می شوند.",
      themes: ["فرم معاصر", "جزئیات ظریف", "همراهی روزمره"],
    },
    en: {
      name: "Didar Signature",
      positioning: "Pure forms for a quiet, enduring presence.",
      intro: "Didar Signature expresses the house design language in its clearest form: controlled lines, precise detail, and creations recognized without excess.",
      storyTitle: "When simplicity becomes a signature",
      story: "This collection begins with a simple principle: every line needs a reason. Volume is reduced so proportion, light, and craft can be seen, creating pieces that accompany personal style beyond short trends.",
      themes: ["Modern form", "Fine detail", "Everyday presence"],
    },
    products: ["atrin-necklace", "vira-bracelet", "leila-ring"],
  },
  heritage: {
    code: "HERITAGE",
    hero: "/images/didar-ui/collection-02.jpg",
    storyImage: "/images/didar-ui/collection-02.jpg",
    fa: {
      name: "میراث",
      positioning: "حافظه ایرانی، با بیانی برای امروز.",
      intro: "میراث، بازسازی گذشته نیست؛ گفت و گویی است میان نقش های آشنا، هندسه ایرانی و تناسباتی که برای زندگی امروز دوباره تنظیم شده اند.",
      storyTitle: "ریشه ها، بدون تکرار گذشته",
      story: "نشانه های فرهنگی در این کالکشن به عنوان تزئین استفاده نمی شوند. هر موتیف ابتدا به ساختار، ریتم و هندسه تبدیل می شود و سپس با اجرای دقیق، هویتی تازه پیدا می کند. اصالت اینجا در تقلید نیست؛ در فهمیدن و دوباره ساختن است.",
      themes: ["حافظه ایرانی", "هندسه ماندگار", "بیان معاصر"],
    },
    en: {
      name: "Heritage",
      positioning: "Iranian memory, expressed for today.",
      intro: "Heritage does not recreate the past. It creates a dialogue between familiar motifs, Iranian geometry, and proportions reset for contemporary life.",
      storyTitle: "Rooted without repeating the past",
      story: "Cultural symbols are not used as decoration. Each motif becomes structure, rhythm, and geometry before precise making gives it a renewed identity. Authenticity here lies in understanding and rebuilding.",
      themes: ["Iranian memory", "Enduring geometry", "Modern expression"],
    },
    products: ["mahtab-ring", "leila-ring", "vira-bracelet"],
  },
  ceremony: {
    code: "CEREMONY",
    hero: "/images/didar-ui/collection-03.jpg",
    storyImage: "/images/didar-ui/product-04.jpg",
    fa: {
      name: "مراسم",
      positioning: "برای لحظه هایی که در حافظه می مانند.",
      intro: "مراسم برای درخشش بلند طراحی نشده است؛ برای لحظه ای طراحی شده که معنا، حضور و خاطره در کنار هم قرار می گیرند.",
      storyTitle: "درخشش، وقتی شخصی می شود",
      story: "هر قطعه در این کالکشن برای یک موقعیت خاص ساخته شده، اما روایت آن از خود فرد آغاز می شود. خطوط شاعرانه، نور کنترل شده و جزئیات ظریف کمک می کنند قطعه بخشی از خاطره باشد، نه فقط بخشی از ظاهر.",
      themes: ["لحظه های خاص", "درخشش آرام", "هدیه ماندگار"],
    },
    en: {
      name: "Ceremony",
      positioning: "For moments that remain in memory.",
      intro: "Ceremony is not designed for loud brilliance. It is shaped for the moment meaning, presence, and memory meet.",
      storyTitle: "When brilliance becomes personal",
      story: "Each piece is made for a distinct occasion, but its narrative begins with the individual. Poetic lines, measured light, and refined details make the creation part of the memory, not only the look.",
      themes: ["Special moments", "Quiet brilliance", "Enduring gifts"],
    },
    products: ["nadia-earrings", "raha-necklace", "atrin-necklace"],
  },
};

const fallbackCollectionProducts = {
  "atrin-necklace": { image: "/images/didar-ui/product-01.jpg", fa: ["گردنبند آترین", "گردنبند"], en: ["Atrin Necklace", "Necklace"] },
  "vira-bracelet": { image: "/images/didar-ui/product-02.jpg", fa: ["دستبند ویرا", "دستبند"], en: ["Vira Bracelet", "Bracelet"] },
  "mahtab-ring": { image: "/images/didar-ui/product-03.jpg", fa: ["انگشتر مهتاب", "انگشتر"], en: ["Mahtab Ring", "Ring"] },
  "nadia-earrings": { image: "/images/didar-ui/product-04.jpg", fa: ["گوشواره نادیا", "گوشواره"], en: ["Nadia Earrings", "Earrings"] },
  "leila-ring": { image: "/images/didar-ui/product-05.jpg", fa: ["انگشتر لیلا", "انگشتر"], en: ["Leila Ring", "Ring"] },
  "raha-necklace": { image: "/images/didar-ui/product-06.jpg", fa: ["گردنبند رها", "گردنبند"], en: ["Raha Necklace", "Necklace"] },
};

const copy = {
  fa: {
    breadcrumb: ["خانه", "کالکشن ها"],
    explore: "کشف قطعات منتخب",
    consultation: "رزرو مشاهده خصوصی",
    introEyebrow: "COLLECTION POSITIONING",
    storyEyebrow: "STORY & INSPIRATION",
    selectedEyebrow: "FEATURED CREATIONS",
    selectedTitle: "قطعات منتخب این کالکشن",
    productStory: "خواندن داستان قطعه",
    trustTitle: "اعتماد، در امتداد انتخاب",
    trustText: "قطعات منتخب می توانند با خدمات اعتماد دیدار همراه شوند؛ وضعیت هر خدمت فقط پس از ثبت اطلاعات معتبر و صدور UID رسمی قابل تأیید است.",
    trust: [
      ["گذرنامه دیجیتال", "معرفی ساختار هویت محصول"],
      ["اصالت و ردیابی", "بر پایه اطلاعات معتبر قطعه"],
      ["خدمات چرخه عمر", "معرفی مسیر گارانتی و بازخرید"],
    ],
    boutiqueEyebrow: "BOUTIQUE ENTRY",
    boutiqueTitle: "کالکشن را در بوتیک ادامه دهید",
    boutiqueText: "برای مشاهده گزینه های بیشتر، مقایسه قطعات یا رزرو تجربه حضوری، وارد بوتیک آنلاین دیدار شوید.",
    boutique: "مشاهده در بوتیک",
    private: "مشاوره خصوصی",
  },
  en: {
    breadcrumb: ["Home", "Collections"],
    explore: "Discover selected creations",
    consultation: "Book private viewing",
    introEyebrow: "COLLECTION POSITIONING",
    storyEyebrow: "STORY & INSPIRATION",
    selectedEyebrow: "FEATURED CREATIONS",
    selectedTitle: "Selected creations",
    productStory: "Read creation story",
    trustTitle: "Trust, extending the choice",
    trustText: "Selected creations may connect to Didar trust services. Service status can only be confirmed after verified data and an official UID are available.",
    trust: [
      ["Digital passport", "Product identity structure overview"],
      ["Authenticity & traceability", "Based on verified creation data"],
      ["Lifecycle services", "Warranty and buyback path overview"],
    ],
    boutiqueEyebrow: "BOUTIQUE ENTRY",
    boutiqueTitle: "Continue the collection in the Boutique",
    boutiqueText: "Enter the Didar online boutique to see more options, compare creations, or reserve an in-person viewing.",
    boutique: "View in Boutique",
    private: "Private consultation",
  },
};

function CollectionDetailPage() {
  const { collectionId } = useParams();
  const { language, direction } = useSitePreferences();
  const { items: catalogCollections, available: collectionsAvailable, loaded: collectionsLoaded } = useCatalog("collection");
  const { items: catalogProducts, available: productsAvailable, loaded: productsLoaded } = useCatalog("product");
  const baseCollection = collectionData[collectionId] || collectionData.signature;
  const catalogCollection = collectionsLoaded && collectionsAvailable ? catalogCollections.find((item) => item.slug === collectionId) : null;
  if (collectionsLoaded && collectionsAvailable && !catalogCollection) {
    return <div dir={direction} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]"><Header /><main className="grid min-h-[75vh] place-items-center px-5 pt-32 text-center"><div><p className="text-xs tracking-[0.2em] text-[var(--gold-text)]">DIDAR COLLECTIONS</p><h1 className="mt-4 text-4xl">{language === "fa" ? "این کالکشن در دسترس نیست" : "This collection is not available"}</h1><Link to="/collections" className="mt-7 inline-flex border border-[#B08A57] px-6 py-3 text-sm text-[var(--gold-text)]">{language === "fa" ? "بازگشت به کالکشن‌ها" : "Back to collections"}</Link></div></main><Footer /></div>;
  }
  const collection = catalogCollection ? {
    ...baseCollection,
    code: catalogCollection.data.code || baseCollection.code,
    hero: catalogCollection.data.hero || baseCollection.hero,
    storyImage: catalogCollection.data.storyImage || baseCollection.storyImage,
    products: catalogCollection.data.products || baseCollection.products,
    fa: {
      ...baseCollection.fa,
      name: catalogCollection.data.name?.fa || baseCollection.fa.name,
      positioning: catalogCollection.data.positioning?.fa || baseCollection.fa.positioning,
      intro: catalogCollection.data.intro?.fa || baseCollection.fa.intro,
      storyTitle: catalogCollection.data.storyTitle?.fa || baseCollection.fa.storyTitle,
      story: catalogCollection.data.story?.fa || baseCollection.fa.story,
      themes: catalogCollection.data.themes?.fa || baseCollection.fa.themes,
    },
    en: {
      ...baseCollection.en,
      name: catalogCollection.data.name?.en || baseCollection.en.name,
      positioning: catalogCollection.data.positioning?.en || baseCollection.en.positioning,
      intro: catalogCollection.data.intro?.en || baseCollection.en.intro,
      storyTitle: catalogCollection.data.storyTitle?.en || baseCollection.en.storyTitle,
      story: catalogCollection.data.story?.en || baseCollection.en.story,
      themes: catalogCollection.data.themes?.en || baseCollection.en.themes,
    },
  } : baseCollection;
  const products = productsLoaded && productsAvailable ? Object.fromEntries(catalogProducts.map((item) => [item.slug, {
    image: item.data.image,
    fa: [item.data.name?.fa || item.slug, item.data.typeLabel?.fa || ""],
    en: [item.data.name?.en || item.slug, item.data.typeLabel?.en || ""],
  }])) : fallbackCollectionProducts;
  const content = collection[language];
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;

  return (
    <div dir={direction} className="min-h-screen overflow-x-clip bg-[var(--surface)] text-[var(--ink)]">
      <section className="relative min-h-[760px] overflow-hidden bg-[#041E42] lg:min-h-screen">
        <Header />
        <img src={collection.hero} alt={content.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#020b17]/32" />
        <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#041E42]/98 via-[#041E42]/76 to-[#041E42]/18`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/72 via-transparent to-[#041E42]/24" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-[1450px] items-center px-5 pb-16 pt-36 sm:px-8 lg:min-h-screen lg:px-12">
          <div className="max-w-[760px] text-start text-white">
            <div className="flex items-center gap-3 text-xs text-white/70 sm:text-sm">
              <Link to="/" className="transition hover:text-[#D9B985]">{text.breadcrumb[0]}</Link>
              <span className="text-[var(--gold-text)]">/</span>
              <Link to="/collections" className="transition hover:text-[#D9B985]">{text.breadcrumb[1]}</Link>
              <span className="text-[var(--gold-text)]">/</span>
              <span>{content.name}</span>
            </div>
            <p className="mt-12 text-xs tracking-[0.3em] text-[#D9B985]">DIDAR · {collection.code}</p>
            <h1 className="mt-5 text-5xl font-normal leading-[1.45] drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-[86px]">{content.name}</h1>
            <p className="mt-5 max-w-2xl text-xl leading-10 text-white/90 sm:text-2xl">{content.positioning}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#selected-creations" className="inline-flex h-14 items-center justify-center gap-3 bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#F7F3EE] hover:text-[#041E42]">
                {text.explore}<Arrow size={17} strokeWidth={1.5} />
              </a>
              <Link to="/contact#appointment" className="inline-flex h-14 items-center justify-center border border-white/45 px-8 text-sm text-white transition hover:border-[#B08A57] hover:bg-[#B08A57]/15">
                {text.consultation}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20">
            <div className="text-start">
              <p className="text-xs tracking-[0.25em] text-[var(--gold-text)]">{text.introEyebrow}</p>
              <h2 className="mt-4 text-4xl font-normal leading-[1.55] sm:text-6xl">{content.positioning}</h2>
            </div>
            <div className="border-s border-[var(--line)] ps-7 sm:ps-10">
              <p className="text-[18px] leading-10 text-[var(--ink)] opacity-84 sm:text-xl">{content.intro}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {content.themes.map((theme) => (
                  <span key={theme} className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink-muted)]">{theme}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--contrast)] text-[var(--contrast-ink)]">
          <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
            <div className="relative min-h-[500px] overflow-hidden lg:min-h-[720px]">
              <img src={collection.storyImage} alt={content.storyTitle} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#041E42]/58 via-transparent to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-20">
              <p className="text-xs tracking-[0.25em] text-[#D9B985]">{text.storyEyebrow}</p>
              <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{content.storyTitle}</h2>
              <p className="mt-6 max-w-2xl text-[17px] leading-10 text-white/76 sm:text-xl">{content.story}</p>
              <div className="mt-10 flex items-center gap-4 text-[#D9B985]">
                <span className="h-px w-20 bg-[#B08A57]" />
                <Sparkles size={20} strokeWidth={1.3} />
                <span className="h-px w-20 bg-[#B08A57]" />
              </div>
            </div>
          </div>
        </section>

        <section id="selected-creations" className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1450px]">
            <div className="text-center">
              <p className="text-xs tracking-[0.25em] text-[var(--gold-text)]">{text.selectedEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal sm:text-5xl">{text.selectedTitle}</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {collection.products.filter((productId) => products[productId]).map((productId) => {
                const product = products[productId];
                return (
                  <Link key={productId} to={`/products/${productId}`} className="group text-start">
                    <div className="aspect-square overflow-hidden rounded-[30px] bg-[var(--media-surface)]">
                      <img src={product.image} alt={product[language][0]} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <p className="mt-5 text-xs text-[var(--gold-text)]">{product[language][1]}</p>
                    <h3 className="mt-2 text-2xl">{product[language][0]}</h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] transition group-hover:text-[var(--gold-text)]">
                      {text.productStory}<Arrow size={15} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto max-w-[1450px] border-y border-[var(--line)] py-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div className="text-start">
                <h2 className="text-3xl font-normal sm:text-4xl">{text.trustTitle}</h2>
                <p className="mt-4 max-w-xl text-sm leading-8 text-[var(--ink-muted)]">{text.trustText}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {text.trust.map(([title, description], index) => {
                  const Icon = [QrCode, ShieldCheck, Gem][index];
                  return (
                    <article key={title} className="border-s border-[var(--line)] ps-5 text-start">
                      <Icon size={23} className="text-[var(--gold-text)]" strokeWidth={1.3} />
                      <h3 className="mt-4 text-lg">{title}</h3>
                      <p className="mt-2 text-xs leading-6 text-[var(--ink-muted)]">{description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="relative mx-auto min-h-[440px] max-w-[1450px] overflow-hidden rounded-[34px] bg-[#041E42] text-white">
            <img src="/images/gallery-4.JPG" alt={text.boutiqueTitle} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#041E42]/98 via-[#041E42]/82 to-[#041E42]/18`} />
            <div className="relative flex min-h-[440px] max-w-2xl flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
              <p className="text-xs tracking-[0.25em] text-[#D9B985]">{text.boutiqueEyebrow}</p>
              <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.boutiqueTitle}</h2>
              <p className="mt-5 text-base leading-9 text-white/80">{text.boutiqueText}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/shop" className="inline-flex h-14 items-center justify-center gap-3 bg-[#B08A57] px-8 text-sm transition hover:bg-[#F7F3EE] hover:text-[#041E42]">
                  {text.boutique}<Arrow size={17} />
                </Link>
                <Link to="/contact#appointment" className="inline-flex h-14 items-center justify-center border border-white/40 px-8 text-sm transition hover:border-[#B08A57]">
                  {text.private}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CollectionDetailPage;
