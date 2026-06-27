import { Heart, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useSitePreferences } from "../context/SitePreferencesContext";

export default function AccountPage() {
  const { language, direction } = useSitePreferences();
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div dir={direction} className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <Header />
      <main className="mx-auto max-w-[1100px] px-5 pb-24 pt-40 sm:px-8 lg:pt-48">
        <section className="grid border border-[var(--line)] bg-[var(--surface-raised)] lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex min-h-[340px] flex-col items-center justify-center bg-[var(--contrast)] p-8 text-center text-[var(--contrast-ink)]">
            <ShieldCheck size={48} strokeWidth={1.1} className="text-[#D9B985]" />
            <p className="mt-6 text-xs tracking-[0.22em] text-[#D9B985]">PRIVATE DIDAR ACCESS</p>
            <h1 className="mt-4 text-4xl">{language === "fa" ? "فضای شخصی دیدار" : "Your private Didar space"}</h1>
          </div>
          <div className="flex flex-col justify-center p-8 text-start sm:p-12">
            <p className="text-sm text-[var(--ink-muted)]">{language === "fa" ? "هویت تأییدشده" : "Verified identity"}</p>
            <p className="mt-3 text-3xl">{user?.mobileMasked || (language === "fa" ? "کاربر دیدار" : "Didar member")}</p>
            {user?.demo && <span className="mt-4 w-fit border border-[#B08A57] px-3 py-1 text-xs text-[#B08A57]">{language === "fa" ? "نشست نمایشی" : "Demo session"}</span>}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {new Set(["admin", "editor", "support"]).has(user?.role) && <Link to="/admin" className="inline-flex h-12 items-center justify-center gap-3 bg-[#B08A57] px-7 text-sm text-white transition hover:bg-[#041E42]"><LayoutDashboard size={17} />{language === "fa" ? "ورود به پنل مدیریت" : "Open admin dashboard"}</Link>}
              <Link to="/wishlist" className="inline-flex h-12 items-center justify-center gap-3 bg-[#041E42] px-7 text-sm text-white hover:bg-[#B08A57]"><Heart size={17} />{language === "fa" ? "علاقه مندی ها" : "Wishlist"}</Link>
              <button type="button" onClick={handleLogout} className="inline-flex h-12 items-center justify-center gap-3 border border-[var(--line)] px-7 text-sm hover:border-[#B08A57] hover:text-[#B08A57]"><LogOut size={17} />{language === "fa" ? "خروج" : "Sign out"}</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
