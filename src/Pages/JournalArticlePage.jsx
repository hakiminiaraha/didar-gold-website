import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, Link2, Share2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useJournal } from "../hooks/useJournal";
import { fallbackArticles } from "./JournalPage";

const articleBodies = {
  "gold-in-cultural-memory": {
    fa: {
      kicker: "فرهنگ و الهام",
      lead: "طلا در فرهنگ ما فقط ماده ای ارزشمند نیست؛ حامل خاطره، آیین و نشانه ای از پیوند میان نسل هاست.",
      quote: "ارزش یک قطعه، گاهی پیش از وزن آن، در خاطره ای است که با خود حمل می کند.",
      sections: [
        ["فراتر از زیور", "در روایت های ایرانی، طلا بارها در کنار جشن، پیمان و هدیه ظاهر شده است. ماندگاری این فلز، آن را به زبانی برای بیان تداوم تبدیل کرده؛ زبانی که می تواند یک لحظه شخصی را به بخشی از حافظه خانوادگی پیوند دهد."],
        ["نشانه ها و معنا", "فرم گل، هندسه، تکرار و تقارن تنها انتخاب های تزئینی نیستند. هرکدام می توانند لایه ای از فرهنگ بصری را به قطعه اضافه کنند، به شرط آنکه طراحی با احترام و شناخت انجام شود."],
        ["روایت امروز", "طراحی معاصر قرار نیست گذشته را تکرار کند. می تواند از حافظه الهام بگیرد و آن را با تناسب، سادگی و نیازهای زندگی امروز بازخوانی کند؛ همان نقطه ای که زیور به یک روایت شخصی تبدیل می شود."],
      ],
    },
    en: {
      kicker: "Culture & Inspiration",
      lead: "In our culture, gold is more than a precious material; it carries memory, ritual, and continuity between generations.",
      quote: "The value of a creation may begin with the memory it carries, long before its weight is considered.",
      sections: [
        ["Beyond ornament", "Across Iranian narratives, gold appears beside celebration, promise, and gifting. Its endurance makes it a language of continuity, connecting a personal moment to family memory."],
        ["Symbols and meaning", "Floral forms, geometry, repetition, and symmetry are not merely decorative choices. With care and understanding, each can add a layer of cultural meaning to a creation."],
        ["A contemporary reading", "Contemporary design need not repeat the past. It can draw from memory and reinterpret it through proportion, restraint, and the rhythms of life today."],
      ],
    },
  },
  "from-idea-to-form": {
    fa: {
      kicker: "هنر ساخت",
      lead: "هر قطعه از یک پرسش آغاز می شود: چگونه می توان یک حس یا خاطره را به فرم، سطح و تناسب تبدیل کرد؟",
      quote: "ساخت خوب زمانی دیده می شود که ایده و جزئیات، بدون هیاهو در یک مسیر قرار بگیرند.",
      sections: [
        ["جرقه نخست", "ایده ممکن است از یک نقش، یک حرکت یا کیفیت نور آغاز شود. در این مرحله هدف یافتن فرم نهایی نیست؛ بلکه کشف هسته ای است که باید در تمام تصمیم های بعدی زنده بماند."],
        ["طراحی و آزمون", "اسکیس ها به مدل تبدیل می شوند و مدل ها تناسب واقعی قطعه را آشکار می کنند. وزن، راحتی، نحوه نشستن روی بدن و امکان ساخت، هم زمان با زیبایی بررسی می شوند."],
        ["پرداخت نهایی", "سطح، اتصال و جای گذاری سنگ ها کیفیت لمس و دوام قطعه را شکل می دهند. کنترل نهایی، فاصله میان یک فرم زیبا و یک همراه ماندگار را مشخص می کند."],
      ],
    },
    en: {
      kicker: "The Art of Making",
      lead: "Every creation begins with a question: how can a feeling or memory become form, surface, and proportion?",
      quote: "Good craft becomes visible when idea and detail move quietly in the same direction.",
      sections: [
        ["The first spark", "An idea may begin with a motif, a gesture, or the quality of light. The goal is to find the essential thought that should remain alive through every later decision."],
        ["Design and testing", "Sketches become models, revealing the true proportions of a piece. Weight, comfort, wearability, and construction are considered alongside beauty."],
        ["The final finish", "Surface, setting, and connections shape both touch and longevity. Final inspection marks the difference between an attractive form and an enduring companion."],
      ],
    },
  },
  "didar-design-language": {
    fa: {
      kicker: "زبان طراحی",
      lead: "زبان طراحی دیدار در گفت وگوی میان حافظه ایرانی، هندسه آرام و نگاه معاصر شکل می گیرد.",
      quote: "هویت طراحی زمانی ماندگار است که قابل تشخیص باشد، نه قابل تکرار.",
      sections: [
        ["تعادل در فرم", "فرم های دیدار بر تعادل میان حضور و ظرافت استوارند. قطعه باید شخصیت داشته باشد، اما اجازه دهد فرد و لحظه پوشیدن همچنان در مرکز باقی بمانند."],
        ["جزئیات معنادار", "جزئیات زمانی ارزشمندند که بخشی از ساختار باشند. تکرار یک خط، ریتم یک نقش یا نحوه بازتاب نور باید به فهم کلی قطعه کمک کند."],
        ["امضای معاصر", "نتیجه نه بازسازی یک نقش تاریخی است و نه فاصله گرفتن از ریشه ها؛ بلکه روایتی تازه است که با زندگی امروز هماهنگ می ماند."],
      ],
    },
    en: {
      kicker: "Design Language",
      lead: "Didar's design language emerges from a conversation between Iranian memory, quiet geometry, and a contemporary gaze.",
      quote: "A lasting design identity is recognizable, never repetitive.",
      sections: [
        ["Balance in form", "Didar forms balance presence with refinement. A creation should have character while leaving the wearer and the moment at the center."],
        ["Meaningful detail", "Detail matters when it belongs to the structure. A repeated line, a visual rhythm, or the way light moves should support the whole."],
        ["A contemporary signature", "The result neither reconstructs history nor turns away from it. It offers a new reading that remains at ease with life today."],
      ],
    },
  },
  "choosing-for-an-occasion": {
    fa: {
      kicker: "راهنمای انتخاب",
      lead: "انتخاب برای یک مناسبت، پیش از هر چیز به شناخت فرد، لحظه و معنایی که قرار است باقی بماند نیاز دارد.",
      quote: "بهترین هدیه پرصداترین انتخاب نیست؛ دقیق ترین توجه است.",
      sections: [
        ["از فرد آغاز کنید", "به سبک روزمره، عادت های پوشیدن و قطعاتی که فرد از قبل دوست دارد توجه کنید. یک انتخاب خوب باید با زندگی او هماهنگ باشد، نه فقط با تصویر یک مناسبت."],
        ["مقیاس و کاربرد", "اندازه، وزن و نوع قطعه روی دفعات استفاده اثر می گذارند. برای همراهی روزمره، راحتی و انعطاف اهمیت بیشتری دارد؛ برای یک لحظه ویژه، حضور بصری می تواند پررنگ تر باشد."],
        ["فرصت مشاهده", "دیدن قطعه در نور و مقیاس واقعی بخشی از تصمیم است. مشاوره حضوری کمک می کند انتخاب از حدس فاصله بگیرد و به تجربه ای مطمئن تبدیل شود."],
      ],
    },
    en: {
      kicker: "A Guide to Choosing",
      lead: "Choosing for an occasion begins with understanding the person, the moment, and the meaning intended to remain.",
      quote: "The best gift is not the loudest choice; it is the most attentive one.",
      sections: [
        ["Begin with the person", "Consider everyday style, wearing habits, and the creations they already enjoy. A good choice belongs in their life, not only in the image of an occasion."],
        ["Scale and use", "Size, weight, and type influence how often a creation will be worn. Daily companions favor comfort, while a singular moment may welcome greater visual presence."],
        ["Make room to see", "Viewing a creation in real light and scale is part of the decision. A private consultation replaces guesswork with a more assured experience."],
      ],
    },
  },
  "why-in-person-viewing-matters": {
    fa: {
      kicker: "تجربه دیدار",
      lead: "بعضی کیفیت ها را نمی توان فقط در تصویر شناخت؛ وزن، حرکت نور و نسبت قطعه با بدن باید تجربه شوند.",
      quote: "مشاهده حضوری، انتخاب را آهسته تر نمی کند؛ آن را دقیق تر می کند.",
      sections: [
        ["دیدن در مقیاس واقعی", "تصویر برای آشنایی ضروری است، اما مقیاس و عمق را کامل منتقل نمی کند. مشاهده حضوری اجازه می دهد فرم و جزئیات در فاصله طبیعی دیده شوند."],
        ["لمس و حرکت", "نحوه قرار گرفتن قطعه، وزن و حرکت آن بخشی از طراحی است. این ویژگی ها تنها هنگام پوشیدن و مقایسه مستقیم قابل درک اند."],
        ["گفت وگوی بدون شتاب", "مشاوره خوب قرار نیست تصمیم را تحمیل کند. هدف آن روشن کردن تفاوت ها و ساختن فضایی است که انتخاب با اطمینان و آرامش انجام شود."],
      ],
    },
    en: {
      kicker: "The Didar Experience",
      lead: "Some qualities cannot be understood through an image alone; weight, moving light, and proportion on the body must be experienced.",
      quote: "In-person viewing does not slow a decision down; it makes the decision more precise.",
      sections: [
        ["See true scale", "Images are essential for discovery, but they cannot fully convey depth and scale. Viewing in person reveals form and detail at a natural distance."],
        ["Feel movement", "How a creation sits, weighs, and moves is part of its design. These qualities become clear only through wearing and direct comparison."],
        ["A conversation without pressure", "Good consultation does not impose a decision. It clarifies differences and creates room for a calm, confident choice."],
      ],
    },
  },
  "digital-product-passport": {
    fa: {
      kicker: "اعتماد و مالکیت",
      lead: "گذرنامه دیجیتال، اطلاعات اصالت و خدمات یک قطعه را در یک مسیر روشن و قابل دسترس کنار هم قرار می دهد.",
      quote: "شفافیت، بخشی از تجربه مالکیت است؛ نه توضیحی که بعداً به آن اضافه شود.",
      sections: [
        ["یک شناسه برای هر قطعه", "شناسه یکتا امکان می دهد اطلاعات اصلی قطعه از سوابق خدمات جدا نشود. نمایش دقیق فیلدها و سطح دسترسی، در نسخه عملیاتی باید بر اساس زیرساخت نهایی تأیید شود."],
        ["اصالت و خدمات", "گذرنامه می تواند نقطه ورود به اطلاعات اصالت، وضعیت گارانتی و درخواست خدمات باشد. تجربه خوب، این داده ها را ساده و بدون اصطلاحات پیچیده ارائه می کند."],
        ["مسیر آینده", "آنچه اکنون در سایت دیده می شود نمونه تجربه است. فعال سازی رسمی گذرنامه، انتقال مالکیت و سوابق خدمات به تأیید فرایندهای عملیاتی دیدار وابسته خواهد بود."],
      ],
    },
    en: {
      kicker: "Trust & Ownership",
      lead: "A digital passport brings a creation's authenticity and service information into one clear, accessible journey.",
      quote: "Transparency belongs inside the ownership experience, not as an explanation added later.",
      sections: [
        ["One identity per creation", "A unique identifier can keep core information connected to service history. Exact fields and access levels must be confirmed against the final operational system."],
        ["Authenticity and service", "The passport can become an entry point for authenticity, warranty status, and service requests, presented without unnecessary complexity."],
        ["The path ahead", "The current website presents an experience sample. Official activation, ownership transfer, and service history remain subject to Didar's confirmed operational processes."],
      ],
    },
  },
};

const ui = {
  fa: {
    journal: "ژورنال دیدار",
    back: "بازگشت به ژورنال",
    share: "اشتراک گذاری",
    copied: "لینک کپی شد",
    contents: "در این روایت",
    related: "روایت های مرتبط",
    readNext: "خواندن مقاله",
    consultation: "این روایت را از نزدیک تجربه کنید",
    consultationText: "برای دیدن جزئیات قطعات و گفت وگو درباره انتخاب، یک تجربه حضوری رزرو کنید.",
    consultationButton: "رزرو تجربه حضوری",
    notFound: "این روایت پیدا نشد.",
  },
  en: {
    journal: "Didar Journal",
    back: "Back to Journal",
    share: "Share story",
    copied: "Link copied",
    contents: "In this story",
    related: "Related stories",
    readNext: "Read article",
    consultation: "Experience the story in person",
    consultationText: "See the details of each creation and speak with a Didar advisor through a private viewing.",
    consultationButton: "Book a Private Viewing",
    notFound: "This story could not be found.",
  },
};

function JournalArticlePage() {
  const { articleId } = useParams();
  const { language, direction } = useSitePreferences();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const { articles: journalArticles, available: journalAvailable, loaded: journalLoaded } = useJournal();
  const articles = journalLoaded && journalAvailable ? journalArticles.map((item) => ({
    slug: item.slug,
    image: item.image,
    category: item.category,
    pillar: item.pillar,
    date: item.dateLabel,
    read: item.readLabel?.[language] || "",
    fa: [item.content.fa.title, item.content.fa.excerpt],
    en: [item.content.en.title, item.content.en.excerpt],
  })) : fallbackArticles;
  const article = articles.find((item) => item.slug === articleId);
  const apiArticle = journalArticles.find((item) => item.slug === articleId);
  const body = apiArticle?.content?.[language] || articleBodies[articleId]?.[language];
  const text = ui[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;

  const related = useMemo(
    () => articles.filter((item) => item.slug !== articleId).slice(0, 3),
    [articleId, articles],
  );

  useEffect(() => {
    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(documentHeight > 0 ? Math.min(100, (window.scrollY / documentHeight) * 100) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const shareArticle = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: article?.[language][0], url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Closing the native share sheet is an intentional no-op.
    }
  };

  if (!article || !body) {
    return (
      <div dir={direction} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
        <Header />
        <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
          <p className="text-4xl">{text.notFound}</p>
          <Link to="/journal" className="mt-8 border-b border-[#B08A57] pb-2 text-[#B08A57]">{text.back}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div dir={direction} className="min-h-screen overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500">
      <div className="fixed inset-x-0 top-0 z-[80] h-1 bg-black/10">
        <div className="h-full bg-[#B08A57] transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <section className="relative min-h-[720px] overflow-hidden bg-[#020b17] text-white">
        <Header />
        <img src={article.image} alt={article[language][0]} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#020b17]/48" />
        <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#020b17]/98 via-[#020b17]/78 to-[#020b17]/24`} />

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1450px] items-end px-5 pb-16 pt-40 sm:px-8 lg:px-12 lg:pb-24">
          <div className="max-w-[900px] text-start">
            <Link to="/journal" className="inline-flex items-center gap-3 text-sm text-white/75 transition hover:text-[#D9B985]">
              <Arrow size={17} strokeWidth={1.5} />
              {text.back}
            </Link>
            <p className="mt-10 text-xs tracking-[0.28em] text-[#D9B985]">{body.kicker}</p>
            <h1 className="mt-5 text-5xl font-normal leading-[1.45] drop-shadow-[0_4px_22px_rgba(0,0,0,0.5)] sm:text-7xl lg:text-[82px]">
              {article[language][0]}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-10 text-white/86 sm:text-xl">{body.lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/65">
              <span>{article.date}</span>
              <span className="h-1 w-1 rounded-full bg-[#D9B985]" />
              <span className="inline-flex items-center gap-2"><Clock size={16} strokeWidth={1.5} />{article.read}</span>
              <button type="button" onClick={shareArticle} className="inline-flex items-center gap-2 transition hover:text-[#D9B985]">
                {copied ? <Check size={16} /> : <Share2 size={16} strokeWidth={1.5} />}
                {copied ? text.copied : text.share}
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1250px] gap-12 lg:grid-cols-[260px_minmax(0,780px)] lg:justify-center">
          <aside className="h-fit border-y border-[var(--line)] py-7 text-start lg:sticky lg:top-28">
            <p className="text-xs tracking-[0.2em] text-[#B08A57]">{text.contents}</p>
            <ol className="mt-5 space-y-4">
              {body.sections.map(([title], index) => (
                <li key={title}>
                  <a href={`#section-${index + 1}`} className="flex items-center gap-3 text-sm text-[var(--ink-muted)] transition hover:text-[#B08A57]">
                    <span className="text-xs text-[#B08A57]">0{index + 1}</span>{title}
                  </a>
                </li>
              ))}
            </ol>
            <button type="button" onClick={shareArticle} className="mt-8 inline-flex items-center gap-2 text-sm text-[#B08A57]">
              <Link2 size={16} strokeWidth={1.5} />{copied ? text.copied : text.share}
            </button>
          </aside>

          <article className="text-start">
            <p className="text-xl leading-[2.15] text-[var(--ink)] opacity-88 sm:text-2xl">{article[language][1]}</p>
            <div className="my-12 border-s-2 border-[#B08A57] bg-[var(--surface-raised)] px-7 py-9 sm:px-10">
              <blockquote className="text-2xl leading-[1.9] text-[var(--ink)] sm:text-3xl">{body.quote}</blockquote>
            </div>
            {body.sections.map(([title, paragraph], index) => (
              <section key={title} id={`section-${index + 1}`} className="scroll-mt-28 border-t border-[var(--line)] py-10 first:border-t-0">
                <div className="flex items-center gap-4">
                  <span className="text-xs tracking-[0.16em] text-[#B08A57]">0{index + 1}</span>
                  <span className="h-px w-12 bg-[#B08A57]" />
                </div>
                <h2 className="mt-5 text-3xl font-normal leading-[1.6] sm:text-4xl">{title}</h2>
                <p className="mt-5 text-lg leading-[2.15] text-[var(--ink)] opacity-82">{paragraph}</p>
              </section>
            ))}
          </article>
        </div>

        <section className="mx-auto mt-16 max-w-[1250px] border-t border-[var(--line)] pt-12 lg:mt-24">
          <div className="flex items-end justify-between gap-6 text-start">
            <h2 className="text-3xl font-normal sm:text-5xl">{text.related}</h2>
            <Link to="/journal" className="hidden items-center gap-2 text-sm text-[#B08A57] sm:inline-flex">{text.journal}<Arrow size={16} /></Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} to={`/journal/${item.slug}`} className="group border border-[var(--line)] bg-[var(--surface-raised)]">
                <div className="h-60 overflow-hidden"><img src={item.image} alt={item[language][0]} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
                <div className="p-6 text-start">
                  <p className="text-xs text-[#B08A57]">{item.pillar}</p>
                  <h3 className="mt-3 text-2xl leading-[1.6]">{item[language][0]}</h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] group-hover:text-[#B08A57]">{text.readNext}<Arrow size={15} /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative mx-auto mt-16 min-h-[360px] max-w-[1250px] overflow-hidden bg-[#020b17] text-white lg:mt-24">
          <img src="/images/gallery-main.JPG" alt={text.consultation} className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#020b17]/98 via-[#020b17]/80 to-transparent`} />
          <div className="relative flex min-h-[360px] max-w-2xl flex-col justify-center p-8 text-start sm:p-12">
            <h2 className="text-3xl leading-[1.6] sm:text-5xl">{text.consultation}</h2>
            <p className="mt-4 text-base leading-9 text-white/78">{text.consultationText}</p>
            <Link to="/contact#appointment" className="mt-7 inline-flex h-12 w-fit items-center gap-3 bg-[#B08A57] px-7 text-sm transition hover:bg-[#F7F3EE] hover:text-[#041E42]">
              {text.consultationButton}<Arrow size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default JournalArticlePage;
