import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Heart,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useSelection } from "../context/SelectionContext";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { creationCatalog } from "../data/creationCatalog";
import { siteNavigation } from "../data/siteContent";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { language, theme, setLanguage, setTheme } = useSitePreferences();
  const { wishlist, selection } = useSelection();
  const location = useLocation();
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const overlayOpen = menuOpen || searchOpen;
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen, searchOpen]);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    const pageResults = siteNavigation[language]
      .filter(([label]) => label.toLocaleLowerCase().includes(normalized))
      .map(([label, href]) => ({ id: href, label, meta: language === "fa" ? "صفحه" : "Page", href }));
    const creationResults = creationCatalog
      .filter((creation) => `${creation.name.fa} ${creation.name.en} ${creation.category.fa} ${creation.category.en}`.toLocaleLowerCase().includes(normalized))
      .map((creation) => ({
        id: creation.id,
        label: creation.name[language],
        meta: creation.category[language],
        href: `/products/${creation.id}`,
        image: creation.image,
      }));
    return [...creationResults, ...pageResults].slice(0, 8);
  }, [language, query]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${scrolled ? "border-[var(--line)] bg-[var(--header)] shadow-sm backdrop-blur-xl" : "border-transparent bg-gradient-to-b from-[var(--header)] to-transparent"}`}>
      <div className="relative mx-auto grid h-24 max-w-[1450px] grid-cols-[1fr_auto] items-center overflow-hidden px-4 sm:px-5 md:h-28 md:grid-cols-[1fr_auto_1fr] md:overflow-visible md:px-8">
        <div className="absolute right-4 flex items-center gap-2 text-[var(--ink)] sm:right-5 md:static">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label={language === "fa" ? "باز کردن منو" : "Open menu"} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]/75 shadow-sm backdrop-blur-md transition hover:border-[#B08A57] hover:bg-[#B08A57]/15 md:border-transparent md:bg-transparent md:shadow-none">
            <Menu size={21} strokeWidth={1.5} />
          </button>
          <Link to="/wishlist" aria-label={language === "fa" ? "علاقه مندی ها" : "Wishlist"} className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[#B08A57]/15 sm:flex">
            <Heart size={19} strokeWidth={1.5} />
            {wishlist.length > 0 && <span className="absolute end-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B08A57] px-1 text-[9px] text-white">{wishlist.length}</span>}
          </Link>
          <Link to="/selection" aria-label={language === "fa" ? "فهرست بررسی" : "Review list"} className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[#B08A57]/15 sm:flex">
            <ClipboardList size={18} strokeWidth={1.5} />
            {selection.length > 0 && <span className="absolute end-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#041E42] px-1 text-[9px] text-white">{selection.length}</span>}
          </Link>
          <Link to="/account" aria-label={language === "fa" ? "حساب کاربری" : "Account"} className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[#B08A57]/15 lg:flex">
            <UserRound size={18} strokeWidth={1.5} />
          </Link>
          <button type="button" onClick={() => setSearchOpen(true)} aria-label={language === "fa" ? "جستجو" : "Search"} className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[#B08A57]/15 sm:flex">
            <Search size={18} strokeWidth={1.5} />
          </button>

          <div className="mx-1 hidden h-6 w-px bg-[var(--line)] lg:block" />
          <PreferenceControls language={language} theme={theme} setLanguage={setLanguage} setTheme={setTheme} />
        </div>

        <nav className="hidden items-center justify-center gap-5 whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--surface)]/78 px-8 py-3 text-[13px] font-medium text-[var(--ink)] shadow-sm backdrop-blur-xl md:flex xl:gap-7 xl:px-11 xl:text-sm">
          {siteNavigation[language].map(([label, href]) => (
            <Link key={label} to={href} aria-current={href === location.pathname ? "page" : undefined} className={`transition hover:text-[#B08A57] ${href === location.pathname ? "text-[#B08A57]" : ""}`}>{label}</Link>
          ))}
        </nav>

        <Link to="/" className="absolute left-4 flex justify-end sm:left-5 md:static" aria-label="Didar Gold">
          <img src="/images/logo-didar.png" alt="Didar Gold" className={`h-12 max-w-[94px] object-contain transition duration-500 sm:h-14 sm:max-w-none md:h-16 ${theme === "dark" ? "brightness-0 invert" : ""}`} />
        </Link>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#020b17]/70 backdrop-blur-sm" onMouseDown={() => setMenuOpen(false)}>
          <aside className="absolute inset-y-0 end-0 flex w-full max-w-[440px] flex-col bg-[var(--surface)] p-6 text-[var(--ink)] shadow-2xl sm:p-9" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <img src="/images/logo-didar.png" alt="Didar Gold" className={`h-16 object-contain ${theme === "dark" ? "brightness-0 invert" : ""}`} />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label={language === "fa" ? "بستن منو" : "Close menu"} className="flex h-11 w-11 items-center justify-center border border-[var(--line)]"><X size={19} /></button>
            </div>
            <button type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }} className="mt-7 flex h-12 w-full items-center gap-3 border border-[var(--line)] px-4 text-sm text-[var(--ink-muted)] transition hover:border-[#B08A57] hover:text-[#B08A57]">
              <Search size={17} />{language === "fa" ? "جستجو در دیدار" : "Search Didar"}
            </button>
            <nav className="mt-10 flex-1 overflow-y-auto border-t border-[var(--line)]">
              {siteNavigation[language].map(([label, href], index) => (
                <Link key={href} to={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-[var(--line)] py-5 text-xl transition hover:text-[#B08A57]">
                  <span>{label}</span><span className="text-xs text-[#B08A57]">0{index + 1}</span>
                </Link>
              ))}
            </nav>
            <div className="grid grid-cols-3 gap-2 pt-6 text-xs">
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-2 border border-[var(--line)] p-3"><Heart size={18} />{language === "fa" ? "علاقه مندی" : "Wishlist"}</Link>
              <Link to="/selection" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-2 border border-[var(--line)] p-3"><ClipboardList size={18} />{language === "fa" ? "بررسی" : "Review"}</Link>
              <Link to="/account" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-2 border border-[var(--line)] p-3"><UserRound size={18} />{language === "fa" ? "حساب" : "Account"}</Link>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-5">
              <button type="button" onClick={() => setLanguage(language === "fa" ? "en" : "fa")} className="text-sm text-[#B08A57]">{language === "fa" ? "English" : "فارسی"}</button>
              <button type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="flex items-center gap-2 text-sm">{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}{theme === "light" ? "Dark" : "Light"}</button>
            </div>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[65] bg-[#020b17]/88 p-4 text-white backdrop-blur-xl sm:p-8">
          <div className="mx-auto flex h-full max-w-4xl flex-col pt-10 sm:pt-20">
            <div className="flex items-center justify-between gap-5">
              <p className="text-xs tracking-[0.25em] text-[#D9B985]">DIDAR SEARCH</p>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label={language === "fa" ? "بستن جستجو" : "Close search"} className="flex h-11 w-11 items-center justify-center border border-white/20"><X size={19} /></button>
            </div>
            <label className="mt-10 flex items-center gap-4 border-b border-[#B08A57] py-5">
              <Search size={25} className="text-[#D9B985]" strokeWidth={1.3} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "fa" ? "نام قطعه یا بخش موردنظر..." : "Search creations or pages..."} className="w-full bg-transparent text-2xl outline-none placeholder:text-white/25 sm:text-4xl" />
            </label>
            <div className="mt-8 overflow-y-auto">
              {!query.trim() && <p className="text-sm text-white/42">{language === "fa" ? "برای شروع جستجو تایپ کنید." : "Start typing to search."}</p>}
              {query.trim() && !searchResults.length && <p className="text-sm text-white/42">{language === "fa" ? "نتیجه ای پیدا نشد." : "No results found."}</p>}
              {searchResults.map((result) => (
                <Link key={result.id} to={result.href} onClick={() => { setSearchOpen(false); setQuery(""); }} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-white/10 py-4 transition hover:border-[#B08A57]">
                  {result.image ? <img src={result.image} alt="" className="h-16 w-16 object-cover" /> : <span className="flex h-16 w-16 items-center justify-center border border-white/12 text-[#D9B985]"><Search size={18} /></span>}
                  <span className="text-start"><span className="block text-lg">{result.label}</span><span className="mt-1 block text-xs text-white/45">{result.meta}</span></span>
                  <Arrow size={18} className="text-[#D9B985]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function PreferenceControls({ language, theme, setLanguage, setTheme }) {
  return (
    <>
      <div className="hidden rounded-full border border-[var(--line)] bg-[var(--surface)]/80 p-1 sm:flex">
        {["fa", "en"].map((option) => <button key={option} type="button" onClick={() => setLanguage(option)} className={`min-w-9 rounded-full px-2 py-1.5 text-[11px] transition ${language === option ? "bg-[#B08A57] text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"}`}>{option === "fa" ? "فا" : "EN"}</button>)}
      </div>
      <div className="hidden rounded-full border border-[var(--line)] bg-[var(--surface)]/80 p-1 sm:flex">
        <button type="button" onClick={() => setTheme("light")} aria-label="Light theme" className={`flex h-8 w-8 items-center justify-center rounded-full transition ${theme === "light" ? "bg-[#B08A57] text-white" : "text-[var(--ink-muted)]"}`}><Sun size={15} /></button>
        <button type="button" onClick={() => setTheme("dark")} aria-label="Dark theme" className={`flex h-8 w-8 items-center justify-center rounded-full transition ${theme === "dark" ? "bg-[#B08A57] text-white" : "text-[var(--ink-muted)]"}`}><Moon size={15} /></button>
      </div>
    </>
  );
}

export default Header;
