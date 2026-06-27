import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";

const services = [
  ["۰۱", "ID", "گذرنامه دیجیتال محصول", "هویت دیجیتال، مشخصات ساخت و سوابق خدمات هر قطعه در یک فضای شفاف و قابل دسترس."],
  ["۰۲", "✓", "اصالت و ردیابی", "تأیید اصالت متریال و امکان ردیابی اطلاعات کلیدی قطعه از زمان ثبت تا مالکیت."],
  ["۰۳", "W", "گارانتی و پوشش گارانتی", "پوشش روشن خدمات، شرایط نگهداری و تعهدات دیدار برای آرامش خاطر بلندمدت."],
  ["۰۴", "↺", "خرید مجدد", "بررسی تخصصی قطعه و ارائه مسیر شفاف برای بازخرید بر اساس شرایط و ارزش روز."],
  ["۰۵", "◇", "ارتقا و تعویض", "امکان بررسی گزینه‌های ارتقا یا تعویض برای همراهی قطعه با نیازهای تازه شما."],
  ["۰۶", "+", "مراقبت و خدمات پس از فروش", "راهنمای نگهداری، بازبینی، پاک‌سازی و خدمات تخصصی برای حفظ کیفیت و درخشش."],
  ["۰۷", "?", "سوالات متداول", "پاسخ‌های روشن درباره اصالت، گارانتی، خدمات، بازخرید و تجربه مالکیت دیدار."],
];

const journeySteps = [
  ["۰۱", "ثبت محصول", "قطعه شما با شناسه اختصاصی در اکوسیستم خدمات دیدار ثبت می‌شود."],
  ["۰۲", "تأیید اصالت", "مشخصات محصول و اصالت آن به‌صورت شفاف در گذرنامه دیجیتال تأیید می‌شود."],
  ["۰۳", "فعال‌سازی گارانتی", "پوشش خدمات و تاریخ اعتبار گارانتی برای مالک قطعه فعال خواهد شد."],
  ["۰۴", "مراقبت و خدمات", "توصیه‌های نگهداری و سوابق خدمات تخصصی در طول مالکیت ثبت می‌شوند."],
  ["۰۵", "بازخرید یا ارتقا", "در زمان مناسب، ارزش قطعه برای بازخرید، تعویض یا ارتقا بررسی می‌شود."],
];

const warrantyItems = [
  ["۰۱", "اصالت", "اطمینان از هویت قطعه", "مشخصات متریال و اطلاعات اصالت قطعه در گذرنامه دیجیتال قابل مشاهده است."],
  ["۰۲", "تعمیر", "بررسی تخصصی آسیب", "شرایط قطعه توسط کارشناسان ارزیابی و مسیر مناسب تعمیر به شما اعلام می‌شود."],
  ["۰۳", "نگهداری", "حفظ کیفیت و درخشش", "پاک‌سازی، بازبینی و توصیه‌های دوره‌ای، عمر زیبایی قطعه را افزایش می‌دهد."],
  ["۰۴", "تعویض / ارتقا", "انتخابی متناسب با امروز", "امکان تعویض یا ارتقا بر اساس وضعیت قطعه و شرایط جاری بررسی خواهد شد."],
];

const faqs = [
  ["گذرنامه دیجیتال چیست؟", "یک هویت دیجیتال اختصاصی برای قطعه است که اطلاعات محصول، وضعیت اصالت، مالکیت، گارانتی و سوابق خدمات را نمایش می‌دهد."],
  ["گارانتی شامل چه مواردی است؟", "دامنه پوشش بر اساس نوع قطعه و شرایط استفاده تعیین می‌شود و جزئیات دقیق آن در زمان خرید و داخل گذرنامه دیجیتال درج خواهد شد."],
  ["بازخرید چگونه انجام می‌شود؟", "پس از ثبت درخواست، اصالت، وزن، وضعیت فیزیکی و شرایط بازار بررسی می‌شود و نتیجه ارزیابی به‌صورت شفاف اعلام خواهد شد."],
  ["آیا امکان ارتقا یا تعویض وجود دارد؟", "بله، برای قطعات واجد شرایط امکان بررسی تعویض یا ارتقا وجود دارد. شرایط نهایی پس از ارزیابی تخصصی مشخص می‌شود."],
  ["خدمات پس از فروش شامل چیست؟", "راهنمای نگهداری، بازبینی قطعه، پاک‌سازی تخصصی، بررسی تعمیر و ثبت سوابق خدمات از بخش‌های اصلی این تجربه هستند."],
];

const healthQuestions = [
  ["usage", "میزان استفاده", ["روزانه", "هفتگی", "مناسبتی"]],
  ["storage", "نحوه نگهداری", ["جعبه اختصاصی", "کنار سایر زیورها", "فضای باز"]],
  ["chemicals", "تماس با عطر و مواد شیمیایی", ["هرگز", "گاهی", "مکرر"]],
];

const qrCells = [0, 1, 2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 18, 19, 20, 22, 24, 25, 27, 29, 31, 32, 34, 36, 37, 38, 40, 42, 44, 45, 46, 48];

function SectionHeading({ eyebrow, title, description, align = "center", contrast = false }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-start"}>
      <p className="text-xs tracking-[0.25em] text-[#B08A57] sm:text-sm">{eyebrow}</p>
      <h2 className={`mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl ${contrast ? "text-[var(--contrast-ink)]" : "text-[var(--ink)]"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-base leading-8 sm:text-lg sm:leading-9 ${contrast ? "text-[var(--contrast-muted)]" : "text-[var(--ink-muted)]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

function ServicesPage() {
  const [activeJourney, setActiveJourney] = useState(0);
  const [productType, setProductType] = useState("انگشتر");
  const [weight, setWeight] = useState("۸ تا ۱۲ گرم");
  const [ownership, setOwnership] = useState("کمتر از ۲ سال");
  const [healthAnswers, setHealthAnswers] = useState({ usage: "هفتگی", storage: "جعبه اختصاصی", chemicals: "هرگز" });
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const filteredFaqs = useMemo(
    () => faqs.filter(([question, answer]) => question.includes(faqSearch.trim()) || answer.includes(faqSearch.trim())),
    [faqSearch],
  );

  return (
    <div dir="rtl" className="w-full max-w-full overflow-x-clip bg-[var(--surface)] text-[var(--ink)] transition-colors duration-500">
      <section className="relative min-h-[720px] overflow-hidden lg:min-h-screen">
        <Header />
        <img src="/images/Product-03.png" alt="انگشتر دیدار" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[#041E42]/78" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#041E42] via-[#041E42]/88 to-[#041E42]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/80 via-transparent to-[#041E42]/40" />
        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1450px] items-center px-5 pb-16 pt-36 sm:px-8 lg:min-h-screen lg:px-12">
          <div className="box-border w-[calc(100vw-2.5rem)] max-w-3xl overflow-hidden text-start text-white sm:w-full">
            <div className="flex max-w-full items-center gap-3 text-xs text-white/60 sm:text-sm">
              <Link to="/" className="transition hover:text-[#D9B985]">خانه</Link>
              <span className="text-[#B08A57]">/</span><span>خدمات</span>
            </div>
            <p className="mt-12 text-[10px] tracking-[0.2em] text-[#D9B985] sm:mt-14 sm:text-sm sm:tracking-[0.28em]">SERVICES & TRUST</p>
            <h1 className="mt-5 max-w-full text-[34px] font-normal leading-[1.55] sm:text-6xl lg:text-[76px]">خدمات و اعتماد دیدار</h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/76 sm:mt-6 sm:text-xl sm:leading-10">
              در دیدار، هر قطعه تنها یک زیور نیست؛ تجربه‌ای از اصالت، شفافیت و پشتیبانی ماندگار است.
            </p>
            <a href="#services" className="mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm text-white transition duration-300 hover:-translate-y-1 hover:bg-[#FFFCF7] hover:text-[#041E42] sm:mt-9 sm:w-auto">
              کشف خدمات دیدار <span>←</span>
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1450px]">
          <SectionHeading eyebrow="خدمات مالکیت" title="پشتیبانی در تمام مسیر همراهی" description="از لحظه ثبت و تأیید اصالت تا نگهداری، گارانتی و تصمیم‌های آینده، خدمات دیدار برای تجربه‌ای روشن و ماندگار طراحی شده‌اند." />
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(([number, symbol, title, description], index) => (
              <article key={title} className={`group relative min-h-[210px] overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface-raised)] p-5 text-start transition duration-300 hover:-translate-y-1 hover:border-[#B08A57] hover:shadow-[0_18px_45px_rgba(4,30,66,0.12)] ${index === 6 ? "lg:col-span-2" : ""}`}>
                <span className="absolute end-5 top-4 text-[10px] text-[var(--ink-muted)] opacity-50">{number}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B08A57]/45 bg-[#B08A57]/10 text-xs font-medium text-[#B08A57] transition duration-300 group-hover:bg-[#B08A57] group-hover:text-white">{symbol}</div>
                <h3 className="mt-5 text-xl font-normal leading-[1.45]">{title}</h3>
                <p className="mt-3 max-w-lg text-xs leading-6 text-[var(--ink-muted)]">{description}</p>
                <a href="#trust-journey" className="mt-4 inline-flex items-center gap-2 text-xs text-[#B08A57] transition group-hover:gap-4">بیشتر بدانید <span>←</span></a>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-right scale-x-0 bg-[#B08A57] transition duration-500 group-hover:scale-x-100" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trust-journey" className="bg-[var(--contrast)] px-5 py-20 text-[var(--contrast-ink)] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <SectionHeading contrast eyebrow="مسیر اعتماد" title="تجربه مالکیت، قدم‌به‌قدم" description="هر مرحله یک لایه تازه از شفافیت و پشتیبانی را فعال می‌کند؛ مسیری آرام و دقیق از ثبت محصول تا تصمیم‌های آینده." />
          <div className="relative mt-16">
            <div className="absolute end-[8%] start-[8%] top-7 hidden h-px bg-white/15 lg:block" />
            <div className="absolute end-[8%] top-7 hidden h-px bg-[#B08A57] transition-all duration-700 lg:block" style={{ width: `${activeJourney * 21}%` }} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {journeySteps.map(([number, title], index) => {
                const active = index === activeJourney;
                const completed = index < activeJourney;
                return (
                  <button key={title} type="button" onClick={() => setActiveJourney(index)} className={`group relative rounded-[22px] border p-5 text-start transition duration-300 lg:border-transparent lg:bg-transparent lg:text-center ${active ? "border-[#B08A57] bg-[#B08A57]/12" : "border-white/10 bg-white/[0.03] hover:border-[#B08A57]/50"}`}>
                    <span className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border text-sm transition lg:mx-auto ${active || completed ? "border-[#B08A57] bg-[#B08A57] text-white" : "border-white/25 bg-[var(--contrast)] text-white/55 group-hover:border-[#B08A57]"}`}>{number}</span>
                    <h3 className={`mt-5 text-lg ${active ? "text-[#D9B985]" : ""}`}>{title}</h3>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 text-start sm:p-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs tracking-[0.22em] text-[#B08A57]">مرحله {journeySteps[activeJourney][0]}</p>
                  <h3 className="mt-3 text-3xl">{journeySteps[activeJourney][1]}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--contrast-muted)]">{journeySteps[activeJourney][2]}</p>
                </div>
                <div className="flex gap-2">
                  {journeySteps.map(([number], index) => (
                    <button key={number} type="button" aria-label={`مرحله ${number}`} onClick={() => setActiveJourney(index)} className={`h-1.5 rounded-full transition-all ${index === activeJourney ? "w-10 bg-[#B08A57]" : "w-4 bg-white/20"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="passport" className="scroll-mt-28 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1450px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="text-start">
            <SectionHeading align="start" eyebrow="معرفی گذرنامه دیجیتال محصول" title="نمونه ای از هویت روشن هر قطعه" description="این بخش نمونه نمایشی منطق گذرنامه دیجیتال است. نمایش معتبر اطلاعات اصالت، مالکیت و سوابق خدمات منوط به صدور UID و اتصال به سامانه رسمی دیدار خواهد بود." />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["شناسه اختصاصی محصول", "وضعیت اصالت", "مالکیت ثبت‌شده", "سوابق خدمات"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-4 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B08A57] text-xs text-white">✓</span>{item}</div>
              ))}
            </div>
            <Link to="/journal/digital-product-passport" className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#041E42] px-8 text-sm text-white transition hover:bg-[#B08A57]">مشاهده نمونه گذرنامه <span>←</span></Link>
          </div>
          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="absolute -inset-5 rounded-[38px] border border-[#B08A57]/20" />
            <div className="relative overflow-hidden rounded-[32px] bg-[#041E42] p-6 text-white shadow-[0_28px_80px_rgba(4,30,66,0.24)] sm:p-9">
              <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-7">
                <div><p className="text-[10px] tracking-[0.28em] text-[#D9B985]">DIDAR GOLD</p><h3 className="mt-3 text-2xl">گذرنامه دیجیتال</h3></div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B08A57]/50 text-[#D9B985]">◇</span>
              </div>
              <div className="grid gap-7 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="space-y-5">
                  <div><p className="text-xs text-white/45">شناسه نمونه</p><p className="mt-2 font-mono text-sm tracking-[0.12em] text-white/90">DEMO-18K-0001</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[10px] text-white/45">اصالت</p><p className="mt-2 text-sm text-[#D9B985]">نمونه نمایشی</p></div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[10px] text-white/45">مالکیت</p><p className="mt-2 text-sm text-[#D9B985]">نیازمند ثبت رسمی</p></div>
                  </div>
                </div>
                <div className="grid h-32 w-32 grid-cols-7 gap-1 rounded-2xl bg-[#FFFCF7] p-3">
                  {Array.from({ length: 49 }, (_, index) => <span key={index} className={qrCells.includes(index) ? "bg-[#041E42]" : "bg-transparent"} />)}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/45"><span>طلای ۱۸ عیار</span><span>ثبت‌شده در ۱۴۰۵</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-soft)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <SectionHeading eyebrow="پوشش گارانتی" title="اطمینان، فراتر از لحظه خرید" description="روی هر کارت مکث کنید تا جزئیات هر بخش از تجربه گارانتی و خدمات دیدار را ببینید." />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {warrantyItems.map(([number, title, summary, details]) => (
              <article key={title} className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface-raised)] p-7 text-start">
                <span className="text-xs text-[#B08A57]">{number}</span>
                <div className="absolute end-7 top-7 flex h-12 w-12 items-center justify-center rounded-full border border-[#B08A57]/35 text-[#B08A57] transition duration-500 group-hover:rotate-45 group-hover:bg-[#B08A57] group-hover:text-white">+</div>
                <div className="absolute inset-x-7 bottom-7 transition duration-500 group-hover:-translate-y-28"><h3 className="text-3xl">{title}</h3><p className="mt-3 text-sm text-[var(--ink-muted)]">{summary}</p></div>
                <div className="absolute inset-x-7 bottom-7 translate-y-24 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"><p className="text-sm leading-8 text-[var(--ink-muted)]">{details}</p></div>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-right scale-x-0 bg-[#B08A57] transition duration-500 group-hover:scale-x-100" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ownership" className="scroll-mt-28 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1450px] gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] border border-[var(--line)] bg-[var(--surface-raised)] p-6 sm:p-9">
            <p className="text-xs tracking-[0.25em] text-[#B08A57]">ورودی اولیه بازخرید و ارتقا</p>
            <h2 className="mt-4 text-3xl leading-[1.5] sm:text-4xl">یک ارزیابی اولیه و شفاف</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--ink-muted)]">اطلاعات تقریبی قطعه را وارد کنید تا درخواست بررسی اولیه آماده شود. نتیجه نهایی فقط پس از ارزیابی تخصصی اعلام می شود.</p>
            <div className="mt-8 grid gap-4">
              <label className="text-sm text-[var(--ink-muted)]">نوع محصول
                <select value={productType} onChange={(event) => setProductType(event.target.value)} className="mt-2 h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-[var(--ink)] outline-none focus:border-[#B08A57]">
                  {["انگشتر", "گردنبند", "دستبند", "گوشواره", "ست"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-[var(--ink-muted)]">وزن تقریبی
                  <select value={weight} onChange={(event) => setWeight(event.target.value)} className="mt-2 h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-[var(--ink)] outline-none focus:border-[#B08A57]">
                    {["کمتر از ۸ گرم", "۸ تا ۱۲ گرم", "۱۲ تا ۲۰ گرم", "بیشتر از ۲۰ گرم"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-sm text-[var(--ink-muted)]">مدت زمان مالکیت
                  <select value={ownership} onChange={(event) => setOwnership(event.target.value)} className="mt-2 h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 text-[var(--ink)] outline-none focus:border-[#B08A57]">
                    {["کمتر از ۲ سال", "۲ تا ۵ سال", "بیشتر از ۵ سال"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 rounded-[24px] bg-[#041E42] p-6 text-white">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs text-white/50">وضعیت درخواست</p><p className="mt-2 text-2xl text-[#D9B985]">نیازمند ارزیابی تخصصی</p></div>
                <div className="text-xs leading-7 text-white/50"><p>{productType}</p><p>{weight} · {ownership}</p></div>
              </div>
            </div>
            <Link to="/contact#appointment" className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#041E42]">درخواست بررسی</Link>
          </div>

          <div className="rounded-[32px] bg-[#041E42] p-6 text-white sm:p-9">
            <p className="text-xs tracking-[0.25em] text-[#D9B985]">بررسی سلامت زیور</p>
            <div className="mt-4 flex items-end justify-between gap-5">
              <h2 className="text-3xl leading-[1.5] sm:text-4xl">قطعه شما چگونه نگهداری می‌شود؟</h2>
              <div className="hidden shrink-0 text-center sm:block"><span className="text-4xl text-[#D9B985]">۹۲</span><span className="text-sm text-white/45"> / ۱۰۰</span></div>
            </div>
            <div className="mt-8 space-y-7">
              {healthQuestions.map(([id, title, options]) => (
                <div key={id}><p className="text-sm text-white/65">{title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {options.map((option) => (
                      <button key={option} type="button" onClick={() => setHealthAnswers((current) => ({ ...current, [id]: option }))} className={`rounded-full border px-4 py-2.5 text-xs transition ${healthAnswers[id] === option ? "border-[#B08A57] bg-[#B08A57] text-white" : "border-white/15 text-white/60 hover:border-[#B08A57]"}`}>{option}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center justify-between sm:hidden"><span className="text-sm text-white/55">امتیاز سلامت قطعه</span><span className="text-2xl text-[#D9B985]">۹۲ از ۱۰۰</span></div>
              <p className="text-sm leading-8 text-white/65">وضعیت نگهداری مناسب است. پیشنهاد می‌شود هر شش ماه یک‌بار قطعه برای بازبینی تخصصی ارائه شود.</p>
            </div>
            <Link to="/contact" className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full border border-[#B08A57] text-sm text-[#D9B985] transition hover:bg-[#B08A57] hover:text-white">درخواست راهنمای نگهداری</Link>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 bg-[var(--surface-soft)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="از دیدار بپرسید" title="پاسخ‌های روشن برای تصمیمی مطمئن" description="موضوع موردنظر را جست‌وجو کنید یا سوال‌ها را برای مشاهده پاسخ باز کنید." />
          <div className="relative mx-auto mt-10 max-w-2xl">
            <input type="search" value={faqSearch} onChange={(event) => setFaqSearch(event.target.value)} placeholder="جست‌وجو در سوالات..." className="h-16 w-full rounded-full border border-[var(--line)] bg-[var(--surface-raised)] px-6 pe-16 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] focus:border-[#B08A57]" />
            <span className="absolute end-6 top-1/2 -translate-y-1/2 text-[#B08A57]">⌕</span>
          </div>
          <div className="mt-8 space-y-3">
            {filteredFaqs.map(([question, answer], index) => {
              const open = openFaq === index;
              return (
                <article key={question} className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface-raised)]">
                  <button type="button" onClick={() => setOpenFaq(open ? -1 : index)} className="flex w-full items-center justify-between gap-5 p-5 text-start sm:p-6">
                    <span className="text-base sm:text-lg">{question}</span>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[#B08A57] transition duration-300 ${open ? "rotate-45 border-[#B08A57] bg-[#B08A57] text-white" : ""}`}>+</span>
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><p className="border-t border-[var(--line)] px-5 py-5 text-sm leading-8 text-[var(--ink-muted)] sm:px-6">{answer}</p></div></div>
                </article>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[24px] border border-dashed border-[#B08A57]/45 p-6 text-center sm:flex-row sm:text-start">
            <div><h3 className="text-xl">پاسخ خود را پیدا نکردید؟</h3><p className="mt-2 text-sm text-[var(--ink-muted)]">سوال خود را مستقیماً با تیم خدمات دیدار در میان بگذارید.</p></div>
            <Link to="/contact" className="shrink-0 rounded-full bg-[#041E42] px-7 py-3.5 text-sm text-white transition hover:bg-[#B08A57]">پرسش مستقیم</Link>
          </div>
        </div>
      </section>

      <section id="consultation" className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1450px] overflow-hidden rounded-[34px] bg-[#041E42] text-white shadow-[0_26px_80px_rgba(4,30,66,0.2)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[380px] lg:min-h-[560px]"><img src="/images/gallery-main.JPG" alt="مشاوره اختصاصی دیدار" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/55 to-transparent" /></div>
          <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
            <p className="text-xs tracking-[0.25em] text-[#D9B985]">PRIVATE CONSULTATION</p>
            <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">مشاوره اختصاصی دیدار</h2>
            <p className="mt-5 max-w-xl text-base leading-9 text-white/68 sm:text-lg">برای بررسی اصالت، گارانتی، نگهداری یا بازخرید قطعه خود، با مشاوران دیدار گفت‌وگو کنید.</p>
            <Link to="/contact#appointment" className="mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#FFFCF7] hover:text-[#041E42] sm:w-fit">رزرو مشاوره <span>←</span></Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default ServicesPage;
