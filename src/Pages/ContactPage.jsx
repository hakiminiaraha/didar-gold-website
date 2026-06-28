import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSitePreferences } from "../context/SitePreferencesContext";

const copy = {
  fa: {
    breadcrumb: ["خانه", "تماس و رزرو"],
    eyebrow: "CONTACT / APPOINTMENT ENTRY",
    title: "گفت و گو با دیدار",
    heroText: "برای انتخاب یک قطعه، مشاهده حضوری، خدمات مالکیت یا یک پرسش ساده، مسیر ارتباط را روشن و آرام آغاز کنید.",
    heroCta: "رزرو مشاوره",
    introEyebrow: "یک نقطه ورود، چند مسیر",
    introTitle: "موضوع دیدارتان را انتخاب کنید",
    introText: "درخواست شما با امنیت ثبت می‌شود و تیم دیدار برای هماهنگی مسیر مناسب با شما تماس می‌گیرد.",
    reasons: [
      ["private", "مشاهده خصوصی", "دیدن کالکشن ها و قطعات منتخب در فضایی آرام"],
      ["selection", "راهنمای انتخاب", "گفت و گو درباره سلیقه، مناسبت و محدوده انتخاب"],
      ["service", "خدمات مالکیت", "پرسش درباره اصالت، گارانتی، نگهداری یا بازخرید"],
      ["general", "پرسش عمومی", "دریافت راهنمایی برای پیدا کردن مسیر مناسب"],
    ],
    formEyebrow: "PRIVATE CONSULTATION",
    formTitle: "درخواست مشاوره و بازدید",
    formText: "اطلاعات اولیه را وارد کنید تا درخواست شما در مرکز پیگیری دیدار ثبت شود.",
    fields: {
      name: "نام و نام خانوادگی",
      contact: "شماره تماس یا ایمیل",
      channel: "شیوه ارتباط ترجیحی",
      date: "تاریخ پیشنهادی",
      message: "توضیح کوتاه",
    },
    channels: ["تماس تلفنی", "واتس اپ", "ایمیل"],
    placeholders: {
      name: "نام شما",
      contact: "مثال: 0912... یا name@email.com",
      message: "موضوع یا قطعه مورد نظر را کوتاه بنویسید",
    },
    submit: "ثبت درخواست",
    successTitle: "درخواست شما ثبت شد",
    successText: "تیم دیدار درخواست را بررسی می‌کند و از مسیر ارتباطی انتخاب‌شده با شما در تماس خواهد بود.",
    reference: "کد پیگیری",
    submitError: "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.",
    newRequest: "ثبت درخواست دیگر",
    contactEyebrow: "DIRECT CONTACT",
    contactTitle: "راه های ارتباط با دیدار",
    sampleNotice: "اطلاعات تماس زیر همان داده فعلی پروژه است و پیش از انتشار نهایی باید توسط دیدار تأیید شود.",
    contactItems: [
      ["تلفن", "۰۲۱-۹۱۰۰۲۰۲۰"],
      ["ایمیل", "info@didargold.com"],
      ["نشانی", "تهران، مجتمع دیدار"],
    ],
    experienceTitle: "پیش از انتخاب، قطعه را از نزدیک ببینید",
    experienceText: "مشاهده حضوری فرصتی است برای دیدن تناسب، نور و جزئیاتی که در تصویر کامل دیده نمی شوند.",
    gallery: "آشنایی با آرت گالری",
    stepsTitle: "پس از ثبت درخواست چه می شود؟",
    steps: [
      ["01", "بررسی اولیه", "موضوع درخواست و مسیر مناسب مشخص می شود."],
      ["02", "هماهنگی", "زمان و شیوه گفت و گو پس از تأیید تیم تعیین می شود."],
      ["03", "دیدار", "مشاهده یا مشاوره در مسیر انتخاب ادامه پیدا می کند."],
    ],
  },
  en: {
    breadcrumb: ["Home", "Contact & Appointment"],
    eyebrow: "CONTACT / APPOINTMENT ENTRY",
    title: "Speak with Didar",
    heroText: "Begin a clear, calm conversation about selecting a creation, private viewing, ownership services, or a simple question.",
    heroCta: "Book consultation",
    introEyebrow: "One entry, several paths",
    introTitle: "Choose the purpose of your visit",
    introText: "Your request is securely recorded and the Didar team will contact you to coordinate the right path.",
    reasons: [
      ["private", "Private viewing", "Explore collections and selected creations in a calm setting"],
      ["selection", "Selection guidance", "Discuss taste, occasion, and the right selection range"],
      ["service", "Ownership services", "Ask about authenticity, warranty, care, or buyback"],
      ["general", "General inquiry", "Get guidance toward the right Didar path"],
    ],
    formEyebrow: "PRIVATE CONSULTATION",
    formTitle: "Consultation and viewing request",
    formText: "Enter the initial details to register your request with the Didar follow-up team.",
    fields: {
      name: "Full name",
      contact: "Phone or email",
      channel: "Preferred channel",
      date: "Preferred date",
      message: "Short note",
    },
    channels: ["Phone call", "WhatsApp", "Email"],
    placeholders: {
      name: "Your name",
      contact: "Example: +98... or name@email.com",
      message: "Tell us briefly about the subject or creation",
    },
    submit: "Submit request",
    successTitle: "Your request is registered",
    successText: "The Didar team will review your request and contact you through your preferred channel.",
    reference: "Tracking code",
    submitError: "The request could not be submitted. Please try again.",
    newRequest: "Create another request",
    contactEyebrow: "DIRECT CONTACT",
    contactTitle: "Contact Didar",
    sampleNotice: "These are the contact details currently used in the prototype and must be verified by Didar before launch.",
    contactItems: [
      ["Phone", "+98 21 9100 2020"],
      ["Email", "info@didargold.com"],
      ["Address", "Didar Complex, Tehran"],
    ],
    experienceTitle: "See the creation before choosing",
    experienceText: "An in-person viewing reveals proportion, light, and details that cannot be fully experienced through an image.",
    gallery: "Discover the Art Gallery",
    stepsTitle: "What happens after the request?",
    steps: [
      ["01", "Initial review", "The subject and the right path are identified."],
      ["02", "Coordination", "Time and communication method are confirmed by the team."],
      ["03", "The meeting", "Viewing or consultation continues the selection journey."],
    ],
  },
};

function ContactPage() {
  const { language, direction } = useSitePreferences();
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const [reason, setReason] = useState("private");
  const [form, setForm] = useState({ name: "", contact: "", channel: text.channels[0], date: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, reason, locale: language }),
      });
      if (!response.ok) throw new Error("INQUIRY_FAILED");
      const result = await response.json();
      setReferenceCode(result.referenceCode);
      setSubmitted(true);
    } catch {
      setSubmitError(text.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", contact: "", channel: text.channels[0], date: "", message: "" });
    setSubmitted(false);
    setReferenceCode("");
    setSubmitError("");
  };

  return (
    <div dir={direction} className="min-h-screen overflow-x-clip bg-[var(--surface)] text-[var(--ink)]">
      <section className="relative min-h-[700px] overflow-hidden bg-[#041E42] lg:min-h-[820px]">
        <Header />
        <img src="/images/didar-ui/service-accent.jpg" alt={text.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#020b17]/38" />
        <div className={`absolute inset-0 ${language === "fa" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#041E42]/98 via-[#041E42]/78 to-[#041E42]/18`} />
        <div className="relative z-10 mx-auto flex min-h-[700px] max-w-[1450px] items-center px-5 pb-14 pt-36 sm:px-8 lg:min-h-[820px] lg:px-12">
          <div className="max-w-[740px] text-start text-white">
            <div className="flex items-center gap-3 text-xs text-white/72 sm:text-sm">
              <Link to="/" className="transition hover:text-[#D9B985]">{text.breadcrumb[0]}</Link>
              <span className="text-[#B08A57]">/</span>
              <span>{text.breadcrumb[1]}</span>
            </div>
            <p className="mt-12 text-xs tracking-[0.28em] text-[#D9B985]">{text.eyebrow}</p>
            <h1 className="mt-5 text-5xl font-normal leading-[1.45] drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-[82px]">{text.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-10 text-white/88 sm:text-xl">{text.heroText}</p>
            <a href="#appointment" className="mt-9 inline-flex h-14 items-center justify-center gap-3 bg-[#B08A57] px-8 text-sm text-white transition hover:bg-[#F7F3EE] hover:text-[#041E42]">
              {text.heroCta}<Arrow size={17} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1450px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs tracking-[0.25em] text-[#B08A57]">{text.introEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.introTitle}</h2>
              <p className="mt-5 text-base leading-9 text-[var(--ink-muted)] sm:text-lg">{text.introText}</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {text.reasons.map(([id, title, description], index) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setReason(id)}
                  className={`min-h-[210px] border p-6 text-start transition duration-300 ${
                    reason === id
                      ? "border-[#B08A57] bg-[#041E42] text-white shadow-xl"
                      : "border-[var(--line)] bg-[var(--surface-raised)] hover:-translate-y-1 hover:border-[#B08A57]"
                  }`}
                >
                  <span className={`text-xs ${reason === id ? "text-[#D9B985]" : "text-[#B08A57]"}`}>0{index + 1}</span>
                  <h3 className="mt-6 text-2xl">{title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${reason === id ? "text-white/68" : "text-[var(--ink-muted)]"}`}>{description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="appointment" className="bg-[var(--surface-soft)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1450px] overflow-hidden rounded-[34px] border border-[var(--line)] bg-[var(--surface-raised)] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[420px] overflow-hidden lg:min-h-[720px]">
              <img src="/images/IMG_7949.JPG" alt={text.formTitle} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041E42]/86 via-[#041E42]/12 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-start text-white sm:p-10">
                <p className="text-xs tracking-[0.24em] text-[#D9B985]">{text.formEyebrow}</p>
                <h2 className="mt-4 text-3xl font-normal leading-[1.5] sm:text-5xl">{text.formTitle}</h2>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 text-start sm:p-10 lg:p-14">
              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <p className="text-sm leading-8 text-[var(--ink-muted)]">{text.formText}</p>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <Field label={text.fields.name}>
                      <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder={text.placeholders.name} className="form-control" />
                    </Field>
                    <Field label={text.fields.contact}>
                      <input required value={form.contact} onChange={(event) => updateField("contact", event.target.value)} placeholder={text.placeholders.contact} className="form-control" />
                    </Field>
                    <Field label={text.fields.channel}>
                      <select value={form.channel} onChange={(event) => updateField("channel", event.target.value)} className="form-control">
                        {text.channels.map((channel) => <option key={channel}>{channel}</option>)}
                      </select>
                    </Field>
                    <Field label={text.fields.date}>
                      <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} className="form-control" />
                    </Field>
                  </div>
                  <Field label={text.fields.message} className="mt-5">
                    <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} placeholder={text.placeholders.message} rows={4} className="form-control min-h-28 py-4" />
                  </Field>
                  {submitError && <p role="alert" className="mt-5 border-s-2 border-red-500 ps-3 text-sm text-red-600">{submitError}</p>}
                  <button type="submit" disabled={submitting} className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 bg-[#041E42] px-8 text-sm text-white transition hover:bg-[#B08A57] disabled:opacity-55 sm:w-fit">
                    {submitting ? (language === "fa" ? "در حال ثبت..." : "Submitting...") : text.submit}<Arrow size={17} />
                  </button>
                </form>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B08A57] text-white"><Check size={28} /></span>
                  <h3 className="mt-6 text-3xl">{text.successTitle}</h3>
                  <p className="mt-4 max-w-md text-sm leading-8 text-[var(--ink-muted)]">{text.successText}</p>
                  <p className="mt-4 border border-[#B08A57]/35 bg-[#B08A57]/5 px-5 py-3 text-sm text-[#B08A57]" dir="ltr">{text.reference}: {referenceCode}</p>
                  <button type="button" onClick={resetForm} className="mt-7 border border-[#B08A57] px-7 py-3 text-sm text-[#B08A57] transition hover:bg-[#B08A57] hover:text-white">{text.newRequest}</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div className="text-start">
              <p className="text-xs tracking-[0.25em] text-[#B08A57]">{text.contactEyebrow}</p>
              <h2 className="mt-4 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.contactTitle}</h2>
              <p className="mt-5 text-sm leading-8 text-[var(--ink-muted)]">{text.sampleNotice}</p>
            </div>
            <div className="grid border-y border-[var(--line)] sm:grid-cols-3">
              {text.contactItems.map(([title, value], index) => {
                const Icon = [Phone, Mail, MapPin][index];
                return (
                  <article key={title} className={`p-6 text-start sm:p-8 ${index < 2 ? "border-b border-[var(--line)] sm:border-b-0 sm:border-e" : ""}`}>
                    <Icon size={25} className="text-[#B08A57]" strokeWidth={1.3} />
                    <h3 className="mt-5 text-lg">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]" dir="ltr">{value}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[var(--contrast)] px-5 py-20 text-[var(--contrast-ink)] sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1450px]">
            <h2 className="text-center text-3xl font-normal sm:text-5xl">{text.stepsTitle}</h2>
            <div className="mt-12 grid border-y border-white/10 md:grid-cols-3">
              {text.steps.map(([number, title, description], index) => (
                <article key={title} className={`p-7 text-start sm:p-9 ${index < 2 ? "border-b border-white/10 md:border-b-0 md:border-e" : ""}`}>
                  <span className="text-xs text-[#D9B985]">{number}</span>
                  <h3 className="mt-5 text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-8 text-white/62">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1450px] overflow-hidden rounded-[34px] border border-[var(--line)] bg-[var(--surface-raised)] lg:grid-cols-2">
            <div className="relative min-h-[380px] lg:min-h-[520px]">
              <img src="/images/gallery-2.JPG" alt={text.experienceTitle} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center p-7 text-start sm:p-12 lg:p-16">
              <Sparkles size={27} className="text-[#B08A57]" strokeWidth={1.3} />
              <h2 className="mt-5 text-3xl font-normal leading-[1.55] sm:text-5xl">{text.experienceTitle}</h2>
              <p className="mt-5 text-base leading-9 text-[var(--ink-muted)]">{text.experienceText}</p>
              <Link to="/art-gallery" className="mt-8 inline-flex w-fit items-center gap-3 text-sm text-[#B08A57] transition hover:gap-5">{text.gallery}<Arrow size={16} /></Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block text-sm text-[var(--ink-muted)] ${className}`}>
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

export default ContactPage;
