import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://didargold.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/world-hero.webp`;

const routeMeta = [
  {
    match: /^\/$/,
    title: "دیدار گلد | زیبایی، اصالت و اعتماد",
    description: "کالکشن‌های طلا، روایت طراحی، خدمات اعتماد و تجربه خصوصی انتخاب جواهر در دیدار گلد.",
  },
  {
    match: /^\/collections(\/.*)?$/,
    title: "کالکشن‌های دیدار گلد | امضا، میراث و مراسم",
    description: "کالکشن‌های طلا و جواهر دیدار با زبان طراحی لوکس، معاصر و ریشه‌دار.",
    image: `${SITE_URL}/images/didar-ui/collection-01.jpg`,
  },
  {
    match: /^\/products(\/.*)?$/,
    title: "محصولات دیدار گلد | جواهرات لوکس و ماندگار",
    description: "مشاهده محصولات دیدار گلد با اطلاعات وزن، عیار، داستان طراحی و خدمات اعتماد.",
    image: `${SITE_URL}/images/didar-ui/product-01.jpg`,
  },
  {
    match: /^\/services$/,
    title: "خدمات و اعتماد دیدار گلد",
    description: "گذرنامه دیجیتال، اصالت، گارانتی، مراقبت، بازخرید و خدمات مالکیت دیدار گلد.",
  },
  {
    match: /^\/our-world$/,
    title: "جهان دیدار | فلسفه طراحی و روایت برند",
    description: "آشنایی با جهان برند دیدار، فلسفه طراحی، هنر ساخت و ارزش‌های خانه دیدار.",
  },
  {
    match: /^\/art-gallery$/,
    title: "آرت گالری دیدار | روایت فرم، نور و جزئیات",
    description: "گالری هنری دیدار؛ نگاهی تصویری به جواهرات، فرم‌ها، جزئیات و فرآیند خلق.",
  },
  {
    match: /^\/journal(\/.*)?$/,
    title: "ژورنال دیدار | فرهنگ، طراحی و راهنمای انتخاب طلا",
    description: "مقاله‌ها و روایت‌های دیدار درباره طراحی، فرهنگ، نگهداری و انتخاب جواهر.",
  },
  {
    match: /^\/shop$/,
    title: "بوتیک آنلاین دیدار گلد",
    description: "ورود به بوتیک آنلاین دیدار برای کشف محصولات، انتخاب قطعه و رزرو مشاوره.",
  },
  {
    match: /^\/contact$/,
    title: "تماس و رزرو مشاوره دیدار گلد",
    description: "رزرو مشاوره خصوصی، ارسال درخواست و ارتباط با مشاوران دیدار گلد.",
  },
  {
    match: /^\/login$/,
    title: "Didar Gold | Private Access",
    description: "Secure one-time-password access to the private Didar Gold account area.",
  },
];

function setMeta(selector, identity, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(identity[0], identity[1]);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = routeMeta.find((item) => item.match.test(pathname)) || routeMeta[0];
    const canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
    const image = meta.image || DEFAULT_IMAGE;

    document.title = meta.title;
    setCanonical(canonical);
    setMeta('meta[name="description"]', ["name", "description"], meta.description);
    setMeta('meta[property="og:title"]', ["property", "og:title"], meta.title);
    setMeta('meta[property="og:description"]', ["property", "og:description"], meta.description);
    setMeta('meta[property="og:url"]', ["property", "og:url"], canonical);
    setMeta('meta[property="og:image"]', ["property", "og:image"], image);
    setMeta('meta[name="twitter:title"]', ["name", "twitter:title"], meta.title);
    setMeta('meta[name="twitter:description"]', ["name", "twitter:description"], meta.description);
    setMeta('meta[name="twitter:image"]', ["name", "twitter:image"], image);
  }, [pathname]);

  return null;
}
