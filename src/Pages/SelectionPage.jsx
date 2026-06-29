import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSelection } from "../context/SelectionContext";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { creationCatalog } from "../data/creationCatalog";

const copy = {
  fa: {
    eyebrow: "PRIVATE REVIEW",
    title: "فهرست بررسی شما",
    description: "این فهرست برای مقایسه و آماده سازی یک مشاهده حضوری است؛ نه سبد خرید و نه مرحله پرداخت.",
    empty: "هنوز قطعه ای برای بررسی انتخاب نشده است.",
    explore: "انتخاب از محصولات",
    remove: "حذف از فهرست",
    clear: "پاک کردن فهرست",
    nextTitle: "ادامه مسیر",
    nextText: "در زمان رزرو، نام قطعات این فهرست را در پیام خود ذکر کنید تا مشاور دیدار برای مشاهده آن ها آماده باشد.",
    book: "رزرو بررسی حضوری",
    wishlist: "بازگشت به علاقه مندی ها",
    note: "هیچ پرداختی در وب سایت انجام نمی شود. موجودی، مشخصات و شرایط هر قطعه در گفت وگو با مشاور بررسی خواهد شد.",
  },
  en: {
    eyebrow: "PRIVATE REVIEW",
    title: "Your review list",
    description: "This list prepares a considered in-person viewing. It is neither a shopping cart nor a checkout step.",
    empty: "No creation has been selected for review yet.",
    explore: "Choose creations",
    remove: "Remove from list",
    clear: "Clear list",
    nextTitle: "Continue the journey",
    nextText: "When booking, mention the creations in this list so a Didar advisor can prepare them for your viewing.",
    book: "Book a private review",
    wishlist: "Back to wishlist",
    note: "No payment takes place on this website. Availability, specifications, and terms are reviewed with a Didar advisor.",
  },
};

export default function SelectionPage() {
  const { language, direction } = useSitePreferences();
  const { selection, removeSelection, clearSelection } = useSelection();
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const items = creationCatalog.filter((creation) => selection.includes(creation.id));

  return (
    <div dir={direction} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <Header />
      <main className="px-5 pb-24 pt-36 sm:px-8 lg:px-12 lg:pt-44">
        <section className="mx-auto max-w-[1450px] text-start">
          <p className="text-xs tracking-[0.28em] text-[var(--gold-text)]">{text.eyebrow}</p>
          <h1 className="mt-5 text-4xl font-normal leading-[1.5] sm:text-6xl">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-[var(--ink-muted)]">{text.description}</p>
        </section>

        <section className="mx-auto mt-12 grid max-w-[1450px] gap-8 lg:grid-cols-[1fr_390px] lg:items-start">
          {items.length ? (
            <div className="border-t border-[var(--line)]">
              {items.map((creation, index) => (
                <article key={creation.id} className="grid gap-5 border-b border-[var(--line)] py-6 text-start sm:grid-cols-[170px_1fr_auto] sm:items-center">
                  <Link to={`/products/${creation.id}`} className="block h-44 overflow-hidden bg-[var(--media-surface)] sm:h-36">
                    <img src={creation.image} alt={creation.name[language]} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  </Link>
                  <div>
                    <p className="text-xs text-[var(--gold-text)]">0{index + 1} / {creation.collection[language]}</p>
                    <h2 className="mt-3 text-3xl">{creation.name[language]}</h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-muted)]">{creation.note[language]}</p>
                  </div>
                  <button type="button" onClick={() => removeSelection(creation.id)} aria-label={text.remove} className="flex h-11 w-11 items-center justify-center border border-[var(--line)] transition hover:border-[#B08A57] hover:text-[var(--gold-text)]">
                    <X size={17} />
                  </button>
                </article>
              ))}
              <button type="button" onClick={clearSelection} className="mt-5 text-sm text-[var(--ink-muted)] transition hover:text-[var(--gold-text)]">{text.clear}</button>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center border border-[var(--line)] bg-[var(--surface-raised)] px-6 text-center">
              <ClipboardList size={40} strokeWidth={1.2} className="text-[var(--gold-text)]" />
              <p className="mt-6 text-xl text-[var(--ink-muted)]">{text.empty}</p>
              <Link to="/products" className="mt-7 inline-flex h-12 items-center gap-3 bg-[#041E42] px-7 text-sm text-white hover:bg-[#B08A57]">{text.explore}<Arrow size={16} /></Link>
            </div>
          )}

          <aside className="border border-[var(--line)] bg-[var(--contrast)] p-7 text-start text-[var(--contrast-ink)] lg:sticky lg:top-32">
            <CheckCircle2 size={28} strokeWidth={1.3} className="text-[#D9B985]" />
            <h2 className="mt-5 text-3xl">{text.nextTitle}</h2>
            <p className="mt-4 text-sm leading-8 text-white/68">{text.nextText}</p>
            <div className="mt-6 border-y border-white/10 py-5 text-sm text-[#D9B985]">{items.length} / {language === "fa" ? "قطعه منتخب" : "selected creations"}</div>
            <p className="mt-5 text-xs leading-7 text-white/52">{text.note}</p>
            <Link to="/contact#appointment" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 bg-[#B08A57] px-5 text-sm text-white transition hover:bg-[#D9B985] hover:text-[#041E42]">{text.book}<Arrow size={16} /></Link>
            <Link to="/wishlist" className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 border border-white/15 text-sm text-white/70 transition hover:border-[#B08A57] hover:text-white"><Heart size={15} />{text.wishlist}</Link>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
