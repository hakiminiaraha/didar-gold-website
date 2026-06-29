import { catalogSeed } from "./catalog.seed.js";

const productAssets = Array.from({ length: 12 }, (_, index) => `/images/didar-products/product-${String(index + 7).padStart(2, "0")}.jpg`);

const extraProducts = [
  ["sara-ring", 70, 0, "rings", "heritage", "ready", "4.8g", 184, "DIDAR-18K-2407", "انگشتر سارا", "Sara Ring", "انگشتر", "Ring", "فرمی الهام گرفته از گل، با مرکزیتی آرام و ظریف.", "A floral-inspired ring with a quiet, refined center."],
  ["nava-necklace", 80, 1, "necklaces", "signature", "viewing", "6.9g", 226, "DIDAR-18K-2408", "گردنبند نوا", "Nava Necklace", "گردنبند", "Necklace", "آویزی سبک برای همراهی روزمره با امضای دیدار.", "A light pendant for everyday presence in Didar's language."],
  ["mina-bracelet", 90, 2, "bracelets", "signature", "limited", "10.7g", 312, "DIDAR-18K-2409", "دستبند مینا", "Mina Bracelet", "دستبند", "Bracelet", "ریتمی منظم از طلا برای حضوری ماندگار.", "A measured rhythm of gold for an enduring presence."],
  ["darya-earrings", 100, 3, "earrings", "ceremony", "viewing", "5.2g", 198, "DIDAR-18K-2410", "گوشواره دریا", "Darya Earrings", "گوشواره", "Earrings", "حرکت نور کنار چهره برای لحظه های رسمی.", "Light in motion beside the face for formal moments."],
  ["shayan-ring", 110, 4, "rings", "signature", "ready", "5.1g", 205, "DIDAR-18K-2411", "انگشتر شایان", "Shayan Ring", "انگشتر", "Ring", "تعادل میان حجم، خطوط نرم و درخشش کنترل شده.", "A balance of volume, soft lines, and controlled brilliance."],
  ["ava-set", 120, 5, "necklaces", "ceremony", "limited", "12.4g", 418, "DIDAR-18K-2412", "نیم ست آوا", "Ava Set", "نیم ست", "Set", "برای هدیه ای شخصی که روایت آن کامل می ماند.", "A personal gift with a complete lasting story."],
  ["noor-necklace", 130, 6, "necklaces", "heritage", "ready", "7.4g", 244, "DIDAR-18K-2413", "گردنبند نور", "Noor Necklace", "گردنبند", "Necklace", "بازخوانی ظریف نقش ایرانی در ساختاری معاصر.", "A refined Iranian motif reimagined in a contemporary structure."],
  ["tala-bracelet", 140, 7, "bracelets", "heritage", "viewing", "9.8g", 286, "DIDAR-18K-2414", "دستبند طلا", "Tala Bracelet", "دستبند", "Bracelet", "پیوندهای هندسی برای لمس آرام و حضور روزانه.", "Geometric links for a calm touch and daily presence."],
  ["parsa-ring", 150, 8, "rings", "ceremony", "ready", "4.5g", 176, "DIDAR-18K-2415", "انگشتر پارسا", "Parsa Ring", "انگشتر", "Ring", "قطعه ای متعادل برای انتخابی رسمی و شخصی.", "A balanced creation for a formal, personal choice."],
  ["bahar-earrings", 160, 9, "earrings", "heritage", "limited", "5.9g", 238, "DIDAR-18K-2416", "گوشواره بهار", "Bahar Earrings", "گوشواره", "Earrings", "جزئیاتی برگرفته از طبیعت، پرداخت شده برای امروز.", "Nature-led details refined for today."],
  ["roshan-necklace", 170, 10, "necklaces", "signature", "viewing", "8.1g", 268, "DIDAR-18K-2417", "گردنبند روشن", "Roshan Necklace", "گردنبند", "Necklace", "یک نقطه نورانی با زنجیری آرام و متناسب.", "A luminous point held by a quiet, balanced chain."],
  ["ariana-set", 180, 11, "earrings", "ceremony", "viewing", "13.6g", 446, "DIDAR-18K-2418", "ست آریانا", "Ariana Set", "ست", "Set", "ساخته شده برای حضورهای ویژه و خاطره های ماندگار.", "Designed for special appearances and lasting memories."],
].map(([slug, sortOrder, assetIndex, category, collection, availability, weight, price, uid, faName, enName, faType, enType, faPositioning, enPositioning]) => ({
  type: "product",
  slug,
  sortOrder,
  data: {
    image: productAssets[assetIndex],
    gallery: [productAssets[assetIndex], productAssets[(assetIndex + 1) % productAssets.length], productAssets[(assetIndex + 2) % productAssets.length]],
    category,
    collection,
    occasion: collection === "ceremony" ? "ceremony" : collection === "heritage" ? "signature" : "daily",
    availability,
    price,
    uid,
    passport: true,
    warranty: true,
    buyback: availability !== "ready",
    name: { fa: faName, en: enName },
    typeLabel: { fa: faType, en: enType },
    positioning: { fa: faPositioning, en: enPositioning },
    story: {
      fa: `${faName} با تمرکز بر تناسب، اصالت و تجربه مالکیت ماندگار طراحی شده است.`,
      en: `${enName} is designed around proportion, authenticity, and an enduring ownership experience.`,
    },
    design: {
      fa: "فرم، وزن بصری و پرداخت نهایی با زبان آرام و لوکس دیدار هماهنگ شده است.",
      en: "Form, visual weight, and finishing are aligned with Didar's quiet luxury language.",
    },
    specs: {
      weight,
      karat: "18K",
      finish: { fa: "پرداخت ترکیبی مات و براق", en: "Satin and polished finish" },
    },
  },
}));

const collectionProducts = {
  signature: ["atrin-necklace", "vira-bracelet", "leila-ring", "nava-necklace", "mina-bracelet", "shayan-ring", "roshan-necklace"],
  heritage: ["mahtab-ring", "sara-ring", "noor-necklace", "tala-bracelet", "bahar-earrings"],
  ceremony: ["nadia-earrings", "raha-necklace", "darya-earrings", "ava-set", "parsa-ring", "ariana-set"],
};

export const productionCatalogSeed = [
  ...catalogSeed.map((item) => item.type === "collection"
    ? { ...item, data: { ...item.data, products: collectionProducts[item.slug] || item.data.products } }
    : item),
  ...extraProducts,
];

const pages = [
  ["/", "خانه دیدار", "زیبایی، وقتی با معنا و اعتماد همراه می شود.", "/videos/hero.mp4", "/images/products-hero.webp"],
  ["/collections", "کالکشن های دیدار", "روایت هایی از فرم، ظرافت و خاطره.", "/images/didar-ui/collection-01.jpg", "/images/didar-ui/collection-02.jpg"],
  ["/products", "محصولات دیدار", "گزیده ای از قطعات منتخب با هویت دیجیتال و خدمات مالکیت.", "/images/products-hero.webp", "/images/didar-ui/product-01.jpg"],
  ["/shop", "بوتیک آنلاین دیدار", "انتخاب، مشاوره و درخواست بررسی در یک تجربه آرام.", "/images/didar-ui/product-02.jpg", "/images/didar-ui/gallery-accent.jpg"],
  ["/services", "خدمات و اعتماد دیدار", "اصالت، گارانتی، مراقبت و همراهی پس از انتخاب.", "/images/didar-ui/service-accent.jpg", "/images/didar-ui/product-05.jpg"],
  ["/our-world", "جهان دیدار", "فلسفه طراحی، هویت برند و روایت ماندگار هر قطعه.", "/images/world-hero.webp", "/images/world-craft.webp"],
  ["/art-gallery", "آرت گالری دیدار", "روایتی از فرم، نور، جزئیات و هنر.", "/images/didar-ui/gallery-accent.jpg", "/images/didar-ui/collection-03.jpg"],
  ["/journal", "ژورنال دیدار", "یادداشت هایی درباره فرهنگ، طراحی و نگهداری جواهر.", "/images/didar-ui/journal-01.jpg", "/images/didar-ui/journal-02.jpg"],
  ["/contact", "تماس با دیدار", "رزرو مشاوره، ثبت درخواست و گفت وگوی اختصاصی.", "/images/didar-ui/service-accent.jpg", "/images/didar-ui/product-06.jpg"],
];

export const cmsContentSeed = pages.flatMap(([routePath, faTitle, faDescription, heroAsset, secondaryAsset]) => [
  { routePath, locale: "fa", contentKey: "seo.title", contentType: "text", value: `${faTitle} | دیدار گلد` },
  { routePath, locale: "fa", contentKey: "seo.description", contentType: "text", value: faDescription },
  { routePath, locale: "fa", contentKey: "hero.title", contentType: "text", value: faTitle },
  { routePath, locale: "fa", contentKey: "hero.description", contentType: "text", value: faDescription },
  { routePath, locale: "fa", contentKey: "hero.media", contentType: heroAsset.endsWith(".mp4") ? "video" : "image", value: heroAsset },
  { routePath, locale: "fa", contentKey: "hero.poster", contentType: "poster", value: secondaryAsset },
  { routePath, locale: "fa", contentKey: "hero.primaryCta", contentType: "text", value: "مشاهده کالکشن ها" },
  { routePath, locale: "fa", contentKey: "hero.secondaryCta", contentType: "text", value: "رزرو مشاوره" },
  { routePath, locale: "en", contentKey: "seo.title", contentType: "text", value: `${faTitle} | Didar Gold` },
  { routePath, locale: "en", contentKey: "seo.description", contentType: "text", value: faDescription },
]);
