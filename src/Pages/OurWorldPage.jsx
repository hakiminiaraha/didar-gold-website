import { useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";

const content = {
  fa: {
    breadcrumb: ["خانه", "جهان دیدار"],
    heroEyebrow: "MAISON / BRAND LAYER",
    heroTitle: "جهان دیدار",
    heroText:
      "دیدار فقط فروشنده طلا نیست؛ جهانی است که در آن زیبایی، روایت محصول، اصالت و اعتماد در یک تجربه واحد معنا پیدا می کنند.",
    heroCta: "دیدن کالکشن ها",
    manifestoEyebrow: "DIGITAL EXPERIENCE MASTER DOCUMENT",
    manifestoTitle: "طلا، وقتی به تجربه تبدیل می شود",
    manifestoText:
      "در سند مادر تجربه دیجیتال، جهان دیدار نقطه آغاز رابطه است؛ جایی برای ساختن شأن برند، آرامش، وضوح و اعتماد. کاربر پیش از ورود به خرید، باید بفهمد چرا یک قطعه دیدار فقط یک شیء نیست، بلکه حامل معنا، خاطره و پشتوانه خدماتی است.",
    maison: [
      ["01", "زیبایی با وقار", "ظاهر لوکس اما آرام؛ بدون ازدحام، بدون اغراق و با تمرکز بر تصویر بزرگ محصول."],
      ["02", "روایت محصول", "هر قطعه با الهام، فرم، جزئیات و داستان خود معرفی می شود، نه فقط با قیمت و مشخصات."],
      ["03", "اعتماد قابل مشاهده", "اصالت، UID، گذرنامه محصول، گارانتی و بازخرید باید در تجربه فهمیده شوند، نه در شعار."],
      ["04", "تجربه یکپارچه", "وب سایت، بوتیک، آرت گالری، شاپ و خدمات پس از خرید باید یک جهان واحد بسازند."],
    ],
    philosophyEyebrow: "فلسفه طراحی",
    philosophyTitle: "فرم هایی برای امروز، معناهایی برای ماندن",
    philosophyText:
      "زبان طراحی دیدار میان حافظه فرهنگی و نگاه معاصر حرکت می کند. هدف، بازسازی گذشته نیست؛ تبدیل نشانه ها، نسبت ها و ظرافت ها به قطعاتی است که امروز هم آرام، دقیق و شخصی باشند.",
    philosophyPoints: [
      ["معنا", "هر فرم باید دلیل داشته باشد؛ از موتیف تا تناسب و از جزئیات تا شیوه قرارگیری روی بدن."],
      ["تعادل", "زیبایی دیدار در صدای بلند نیست؛ در نسبت دقیق، سطح تمیز و فاصله درست میان جزئیات است."],
      ["ماندگاری", "قطعه باید از روندهای کوتاه مدت عبور کند و در حافظه شخصی صاحب خود بماند."],
    ],
    craftEyebrow: "میراث و هنر ساخت",
    craftTitle: "از ایده تا قطعه، با کنترل و حوصله",
    craftText:
      "فرایند ساخت در دیدار یک مسیر نمایشی نیست؛ بخشی از اعتماد است. ایده، طراحی، انتخاب متریال، ساخت، کنترل کیفیت و ارائه نهایی باید در تجربه دیجیتال قابل لمس شوند.",
    process: [
      ["01", "الهام", "از هنر، طبیعت، معماری و خاطره فرهنگی"],
      ["02", "طراحی", "ترجمه ایده به فرم، نسبت و جزئیات"],
      ["03", "ساخت", "اجرای دقیق با کنترل متریال و پرداخت"],
      ["04", "بازبینی", "بررسی سطح، اتصال، وزن و کیفیت نهایی"],
      ["05", "همراهی", "ارائه با هویت، مراقبت و خدمات چرخه عمر"],
    ],
    standardEyebrow: "استاندارد دیدار",
    standardTitle: "اعتماد، بخشی از زیبایی است",
    standardText:
      "طبق سند مادر، Trust & Lifecycle یک لایه مستقل اما جدا از تجربه نیست. کاربر باید از همان ابتدا بداند انتخاب او می تواند با شناسه یکتا، گذرنامه دیجیتال، گارانتی، خدمات نگهداری و مسیر بازخرید همراه باشد.",
    standards: [
      ["UID", "شناسه یکتا برای پیگیری هویت قطعه"],
      ["Passport", "گذرنامه دیجیتال برای نمایش اطلاعات و اصالت"],
      ["Warranty", "وضعیت گارانتی و خدمات پس از خرید"],
      ["Buyback", "امکان بررسی بازخرید یا ارتقا برای قطعات واجد شرایط"],
    ],
    galleryEyebrow: "PHYGITAL EXPERIENCE",
    galleryTitle: "آرت گالری، پل میان دیدن و انتخاب",
    galleryText:
      "در منطق دیدار، آرت گالری صفحه تزئینی نیست؛ هاب تجربه، تعامل بازار، اعتماد و مشاوره خصوصی است. اینجا محصول در فضای واقعی تر دیده می شود و انتخاب، قبل از خرید، آرام تر و مطمئن تر شکل می گیرد.",
    galleryCta: "تجربه آرت گالری",
    valuesEyebrow: "داستان و ارزش ها",
    valuesTitle: "جهانی واحد، با چند لایه تجربه",
    valuesText:
      "دیدار باید برای کاربر یک برند، یک زبان بصری و یک مسیر روشن باشد؛ اما در پشت صحنه، لایه های برند، گالری محصول، تجارت و اعتماد باید هماهنگ کار کنند.",
    quote: "هر قطعه پیش از آنکه یک زیور باشد، یک روایت است.",
    ctaEyebrow: "NEXT",
    ctaTitle: "اکنون، کالکشن ها را از دل جهان دیدار ببینید",
    ctaText:
      "کالکشن ها ادامه همین جهان اند؛ جایی که روایت، فرم و اعتماد به قطعات قابل انتخاب تبدیل می شوند.",
    ctaButton: "مشاهده کالکشن ها",
  },
  en: {
    breadcrumb: ["Home", "Our World"],
    heroEyebrow: "MAISON / BRAND LAYER",
    heroTitle: "The World of Didar",
    heroText:
      "Didar is not simply a gold retailer; it is a world where beauty, product narrative, authenticity, and trust become one experience.",
    heroCta: "Explore collections",
    manifestoEyebrow: "DIGITAL EXPERIENCE MASTER DOCUMENT",
    manifestoTitle: "Gold, transformed into experience",
    manifestoText:
      "In the digital experience master document, the world of Didar is the beginning of the relationship: a place for dignity, calm, clarity, and trust before commerce begins.",
    maison: [
      ["01", "Quiet luxury", "A refined presence without clutter or exaggeration, anchored by large product imagery."],
      ["02", "Product narrative", "Each creation is introduced through inspiration, form, detail, and story, not only price."],
      ["03", "Visible trust", "Authenticity, UID, product passport, warranty, and buyback need to be understood in the experience."],
      ["04", "Unified ecosystem", "Website, boutique, art gallery, shop, and lifecycle services should feel like one world."],
    ],
    philosophyEyebrow: "Design Philosophy",
    philosophyTitle: "Forms for today, meanings made to remain",
    philosophyText:
      "Didar's design language moves between cultural memory and a contemporary gaze. The goal is not to recreate the past, but to transform symbols, proportions, and refinement into pieces that feel personal today.",
    philosophyPoints: [
      ["Meaning", "Every form should have a reason, from motif to proportion and from detail to wearability."],
      ["Balance", "Didar's beauty is not loud. It lives in exact proportion, clean surfaces, and measured detail."],
      ["Endurance", "A creation should move beyond short trends and remain in personal memory."],
    ],
    craftEyebrow: "Heritage & Craft",
    craftTitle: "From idea to creation, with care",
    craftText:
      "The making process is not decoration. It is part of trust. Idea, design, material, making, quality control, and final presentation should be felt digitally.",
    process: [
      ["01", "Inspiration", "Drawn from art, nature, architecture, and cultural memory"],
      ["02", "Design", "Turning the idea into form, proportion, and detail"],
      ["03", "Making", "Precise execution through material control and finish"],
      ["04", "Review", "Checking surface, connection, weight, and quality"],
      ["05", "Care", "Presented with identity, care, and lifecycle services"],
    ],
    standardEyebrow: "Didar Standard",
    standardTitle: "Trust is part of beauty",
    standardText:
      "According to the master document, Trust & Lifecycle is independent, but not separate from the experience. The user should see UID, passport, warranty, care, and buyback possibilities early.",
    standards: [
      ["UID", "A unique identifier for tracking creation identity"],
      ["Passport", "A digital passport for information and authenticity"],
      ["Warranty", "Warranty status and after-sales service"],
      ["Buyback", "Buyback or upgrade review for eligible creations"],
    ],
    galleryEyebrow: "PHYGITAL EXPERIENCE",
    galleryTitle: "Art Gallery, the bridge between seeing and choosing",
    galleryText:
      "In Didar's logic, the Art Gallery is not decorative. It is a hub for experience, market interaction, trust, and private consultation.",
    galleryCta: "Experience Art Gallery",
    valuesEyebrow: "Story & Values",
    valuesTitle: "One world, several layers",
    valuesText:
      "For the user, Didar should feel like one brand, one visual language, and one clear path. Behind the scenes, brand, product gallery, commerce, and trust layers work together.",
    quote: "Every creation is a story before it is a jewel.",
    ctaEyebrow: "NEXT",
    ctaTitle: "Now, see the collections through Didar's world",
    ctaText:
      "Collections continue this world, turning narrative, form, and trust into selectable creations.",
    ctaButton: "Explore collections",
  },
};

const processImages = [
  "/images/didar-ui/collection-01.jpg",
  "/images/didar-ui/collection-02.jpg",
  "/images/world-craft.webp",
  "/images/didar-ui/product-05.jpg",
  "/images/brand-story.png",
];

function OurWorldPage() {
  const { language, direction } = useSitePreferences();
  const [activeStep, setActiveStep] = useState(0);
  const text = content[language];
  const arrow = language === "fa" ? "←" : "→";

  return (
    <div
      dir={direction}
      className="w-full max-w-full overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500"
    >
      <section className="relative min-h-[760px] overflow-hidden bg-[#041E42] lg:min-h-screen">
        <Header />
        <img
          src="/images/world-hero.webp"
          alt={text.heroTitle}
          className="absolute inset-0 h-full w-full object-cover object-[48%_center] sm:object-[55%_center] lg:object-center"
        />
        <div
          className={`absolute inset-0 ${
            language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } from-[#041E42]/98 via-[#041E42]/88 to-[#041E42]/30`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/76 via-[#041E42]/12 to-[#041E42]/34" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-[1450px] items-center px-5 pb-14 pt-36 sm:px-8 lg:min-h-screen lg:px-12">
          <div className="box-border w-full max-w-[760px] rounded-[32px] border border-white/10 bg-[#041E42]/42 p-6 text-start text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-[2px] sm:p-8 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
            <div className="flex items-center gap-3 text-xs text-white/76 sm:text-sm">
              <Link to="/" className="transition hover:text-[#D9B985]">
                {text.breadcrumb[0]}
              </Link>
              <span className="text-[#B08A57]">/</span>
              <span>{text.breadcrumb[1]}</span>
            </div>
            <div className="mt-12 flex items-center gap-4 text-[#D9B985]">
              <span className="h-px w-12 bg-[#B08A57]" />
              <p className="text-[11px] tracking-[0.24em] sm:text-sm">{text.heroEyebrow}</p>
            </div>
            <h1 className="mt-5 text-4xl font-normal leading-[1.5] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-[76px]">
              {text.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-9 text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-xl sm:leading-10">
              {text.heroText}
            </p>
            <Link
              to="/collections"
              className="mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm text-white transition duration-300 hover:-translate-y-1 hover:bg-[#FFFCF7] hover:text-[#041E42] sm:w-auto"
            >
              {text.heroCta}
              <span aria-hidden="true">{arrow}</span>
            </Link>
          </div>
        </div>
      </section>

      <main>
        <section className="relative z-20 -mt-10 px-5 pb-20 sm:px-8 lg:-mt-16 lg:px-12 lg:pb-28">
          <div className="mx-auto max-w-[1450px] overflow-hidden rounded-[34px] border border-[var(--line)] bg-[var(--surface-raised)] shadow-[0_25px_75px_rgba(4,30,66,0.15)]">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
                <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.manifestoEyebrow}</p>
                <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">
                  {text.manifestoTitle}
                </h2>
                <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85 sm:text-xl">
                  {text.manifestoText}
                </p>
              </div>
              <div className="border-t border-[var(--line)] lg:border-s lg:border-t-0">
                {text.maison.map(([number, title, description], index) => (
                  <article
                    key={title}
                    className={`grid gap-5 p-6 text-start sm:grid-cols-[74px_1fr] sm:p-8 ${
                      index < text.maison.length - 1 ? "border-b border-[var(--line)]" : ""
                    }`}
                  >
                    <span className="text-xs tracking-[0.18em] text-[#B08A57]">{number}</span>
                    <div>
                      <h3 className="text-2xl font-normal">{title}</h3>
                      <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--ink)] opacity-80">
                        {description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto grid max-w-[1450px] items-stretch gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div className="flex flex-col justify-center text-start">
              <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.philosophyEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">
                {text.philosophyTitle}
              </h2>
              <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85 sm:text-xl">
                {text.philosophyText}
              </p>
              <div className="mt-10 overflow-hidden rounded-[30px]">
                <img
                  src="/images/didar-ui/collection-02.jpg"
                  alt={text.philosophyTitle}
                  className="aspect-[16/10] h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center border-y border-[var(--line)]">
              {text.philosophyPoints.map(([title, description], index) => (
                <article
                  key={title}
                  className={`group grid gap-5 py-8 text-start sm:grid-cols-[86px_1fr] sm:items-start sm:py-11 ${
                    index < text.philosophyPoints.length - 1 ? "border-b border-[var(--line)]" : ""
                  }`}
                >
                  <span className="text-xs tracking-[0.2em] text-[#B08A57]">0{index + 1}</span>
                  <div>
                    <h3 className="text-2xl transition group-hover:text-[#B08A57] sm:text-3xl">{title}</h3>
                    <p className="mt-3 max-w-xl text-base leading-8 text-[var(--ink)] opacity-80">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface-soft)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1450px]">
            <div className="grid overflow-hidden rounded-[34px] bg-[var(--contrast)] text-[var(--contrast-ink)] shadow-[0_25px_80px_rgba(4,30,66,0.16)] lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[430px] overflow-hidden lg:min-h-[650px]">
                <img
                  src="/images/world-craft.webp"
                  alt={text.craftTitle}
                  className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/86 via-[#041E42]/20 to-transparent" />
                <div className="absolute bottom-0 start-0 max-w-2xl p-7 text-start text-white sm:p-10">
                  <p className="text-xs tracking-[0.24em] text-[#D9B985]">{text.craftEyebrow}</p>
                  <h2 className="mt-3 max-w-xl text-3xl font-normal leading-[1.45] drop-shadow-[0_3px_16px_rgba(0,0,0,0.48)] sm:text-5xl">
                    {text.craftTitle}
                  </h2>
                </div>
              </div>
              <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-14">
                <p className="text-[17px] leading-10 text-white/86 sm:text-xl">
                  {text.craftText}
                </p>
                <div className="mt-9 border-y border-white/10">
                  {text.process.map(([number, title, description], index) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`grid w-full grid-cols-[52px_1fr] gap-4 py-5 text-start transition ${
                        index < text.process.length - 1 ? "border-b border-white/10" : ""
                      } ${activeStep === index ? "text-[#D9B985]" : "text-white/72 hover:text-[#D9B985]"}`}
                    >
                      <span className="text-xs tracking-[0.18em]">{number}</span>
                      <span>
                        <strong className="block font-normal">{title}</strong>
                        <span className="mt-2 block text-sm leading-7 text-white/76">{description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-5">
              {processImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`group relative min-h-[160px] overflow-hidden rounded-[22px] border transition ${
                    activeStep === index ? "border-[#B08A57]" : "border-[var(--line)]"
                  }`}
                >
                  <img
                    src={image}
                    alt={text.process[index][1]}
                    className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
                      activeStep === index ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                    }`}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#041E42]/88 via-[#041E42]/12 to-transparent" />
                  <span className="absolute bottom-4 start-4 text-sm text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{text.process[index][1]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div className="text-start">
              <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.standardEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">
                {text.standardTitle}
              </h2>
              <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85 sm:text-xl">
                {text.standardText}
              </p>
            </div>
            <div className="border-y border-[var(--line)]">
              {text.standards.map(([title, description], index) => (
                <article
                  key={title}
                  className={`grid gap-5 py-7 text-start sm:grid-cols-[160px_1fr] sm:items-center ${
                    index < text.standards.length - 1 ? "border-b border-[var(--line)]" : ""
                  }`}
                >
                  <h3 className="text-2xl text-[#B08A57]">{title}</h3>
                  <p className="text-base leading-8 text-[var(--ink)] opacity-80">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto grid max-w-[1450px] overflow-hidden rounded-[34px] border border-[var(--line)] bg-[var(--surface-raised)] lg:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[380px] lg:min-h-[560px]">
              <img src="/images/gallery-main.JPG" alt={text.galleryTitle} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-[#041E42]/24" />
            </div>
            <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
              <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.galleryEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">
                {text.galleryTitle}
              </h2>
              <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85 sm:text-xl">
                {text.galleryText}
              </p>
              <Link
                to="/art-gallery"
                className="mt-8 inline-flex h-12 w-fit items-center gap-3 border border-[#B08A57] px-7 text-sm text-[#B08A57] transition hover:bg-[#B08A57] hover:text-white"
              >
                {text.galleryCta}
                <span>{arrow}</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto max-w-[1450px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs tracking-[0.24em] text-[#B08A57]">{text.valuesEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.valuesTitle}</h2>
              <p className="mt-5 text-[17px] leading-10 text-[var(--ink)] opacity-85 sm:text-xl">{text.valuesText}</p>
            </div>

            <div className="mt-14 overflow-hidden rounded-[34px] border border-[var(--line)] bg-[var(--surface-soft)]">
              <blockquote className="px-7 py-14 text-center text-2xl font-normal leading-[1.9] text-[var(--ink)] sm:px-12 sm:text-4xl">
                <span className="text-[#B08A57]">“</span>
                {text.quote}
                <span className="text-[#B08A57]">”</span>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="relative mx-auto min-h-[520px] max-w-[1450px] overflow-hidden rounded-[34px] bg-[#041E42] text-white shadow-[0_25px_80px_rgba(4,30,66,0.18)]">
            <img src="/images/brand-story.png" alt={text.ctaTitle} className="absolute inset-0 h-full w-full object-cover object-center opacity-70" />
            <div
              className={`absolute inset-0 ${
                language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-[#041E42]/96 via-[#041E42]/82 to-[#041E42]/18`}
            />
            <div className="relative flex min-h-[520px] max-w-2xl flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
              <p className="text-xs tracking-[0.24em] text-[#D9B985]">{text.ctaEyebrow}</p>
              <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.ctaTitle}</h2>
              <p className="mt-4 text-base leading-9 text-white/88 sm:text-lg">{text.ctaText}</p>
              <Link
                to="/collections"
                className="mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#FFFCF7] hover:text-[#041E42] sm:w-fit"
              >
                {text.ctaButton}
                <span>{arrow}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default OurWorldPage;
