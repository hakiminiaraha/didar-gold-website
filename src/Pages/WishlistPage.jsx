import { ArrowLeft, ArrowRight, Heart, ListPlus, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSelection } from "../context/SelectionContext";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { creationCatalog } from "../data/creationCatalog";

const copy = {
  fa: {
    eyebrow: "YOUR DIDAR EDIT",
    title: "علاقه مندی های شما",
    description: "قطعاتی که برای بازگشت، مقایسه و انتخاب آرام تر کنار گذاشته اید.",
    empty: "هنوز قطعه ای به علاقه مندی ها اضافه نشده است.",
    explore: "مشاهده محصولات",
    add: "افزودن به فهرست بررسی",
    added: "در فهرست بررسی",
    view: "مشاهده روایت قطعه",
    selection: "مشاهده فهرست بررسی",
    remove: "حذف از علاقه مندی ها",
  },
  en: {
    eyebrow: "YOUR DIDAR EDIT",
    title: "Your wishlist",
    description: "Creations kept for a considered return, comparison, and a calmer choice.",
    empty: "No creation has been added to your wishlist yet.",
    explore: "Explore creations",
    add: "Add to review list",
    added: "In review list",
    view: "View creation story",
    selection: "View review list",
    remove: "Remove from wishlist",
  },
};

export default function WishlistPage() {
  const { language, direction } = useSitePreferences();
  const { wishlist, selection, toggleWishlist, addSelection, isSelected } = useSelection();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const text = copy[language];
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const items = creationCatalog.filter((creation) => wishlist.includes(creation.id));

  useEffect(() => {
    const pendingId = searchParams.get("add");
    if (!pendingId || !creationCatalog.some((creation) => creation.id === pendingId)) return;
    if (!wishlist.includes(pendingId)) toggleWishlist(pendingId);
    navigate("/wishlist", { replace: true });
  }, [navigate, searchParams, toggleWishlist, wishlist]);

  return (
    <div dir={direction} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <Header />
      <main className="px-5 pb-24 pt-36 sm:px-8 lg:px-12 lg:pt-44">
        <section className="mx-auto max-w-[1450px] border-b border-[var(--line)] pb-10 text-start">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.28em] text-[var(--gold-text)]">{text.eyebrow}</p>
              <h1 className="mt-5 text-4xl font-normal leading-[1.5] sm:text-6xl">{text.title}</h1>
              <p className="mt-5 text-lg leading-9 text-[var(--ink-muted)]">{text.description}</p>
            </div>
            <Link to="/selection" className="inline-flex h-13 w-fit items-center gap-3 border border-[#B08A57] px-6 text-sm text-[var(--gold-text)] transition hover:bg-[#B08A57] hover:text-white">
              <ListPlus size={18} strokeWidth={1.5} />{text.selection}<span>{selection.length}</span>
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-[1450px]">
          {items.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((creation) => {
                const selected = isSelected(creation.id);
                return (
                  <article key={creation.id} className="group border border-[var(--line)] bg-[var(--surface-raised)] text-start">
                    <div className="relative aspect-square overflow-hidden bg-[var(--media-surface)]">
                      <img src={creation.image} alt={creation.name[language]} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <button type="button" onClick={() => toggleWishlist(creation.id)} aria-label={text.remove} className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#041E42]/80 text-white backdrop-blur">
                        <X size={17} />
                      </button>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-[var(--gold-text)]">{creation.collection[language]} / {creation.category[language]}</p>
                      <h2 className="mt-3 text-3xl">{creation.name[language]}</h2>
                      <p className="mt-3 min-h-14 text-sm leading-7 text-[var(--ink-muted)]">{creation.note[language]}</p>
                      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row">
                        <button type="button" onClick={() => addSelection(creation.id)} className={`inline-flex h-11 flex-1 items-center justify-center gap-2 text-sm transition ${selected ? "bg-[#B08A57] text-white" : "bg-[#041E42] text-white hover:bg-[#B08A57]"}`}>
                          <ListPlus size={16} />{selected ? text.added : text.add}
                        </button>
                        <Link to={`/products/${creation.id}`} className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] px-4 text-sm hover:border-[#B08A57] hover:text-[var(--gold-text)]">
                          {text.view}<Arrow size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[430px] flex-col items-center justify-center border border-[var(--line)] bg-[var(--surface-raised)] px-6 text-center">
              <Heart size={38} strokeWidth={1.2} className="text-[var(--gold-text)]" />
              <p className="mt-6 text-xl text-[var(--ink-muted)]">{text.empty}</p>
              <Link to="/products" className="mt-7 inline-flex h-12 items-center gap-3 bg-[#041E42] px-7 text-sm text-white hover:bg-[#B08A57]">{text.explore}<Arrow size={16} /></Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
