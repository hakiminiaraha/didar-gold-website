import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useSitePreferences } from "../context/SitePreferencesContext";

export default function NotFoundPage() {
  const { language, direction } = useSitePreferences();
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;

  return (
    <main dir={direction} className="relative flex min-h-screen items-center overflow-hidden bg-[#020b17] px-5 text-white">
      <img src="/images/Collection-02.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020b17] via-[#020b17]/92 to-[#020b17]/55" />
      <div className="relative mx-auto w-full max-w-[1200px] text-start">
        <p className="text-sm tracking-[0.35em] text-[#D9B985]">404 / DIDAR</p>
        <h1 className="mt-7 text-5xl leading-[1.45] sm:text-7xl">{language === "fa" ? "این مسیر در جهان دیدار نیست" : "This path is not part of Didar"}</h1>
        <p className="mt-6 max-w-xl text-lg leading-9 text-white/62">{language === "fa" ? "ممکن است نشانی تغییر کرده باشد. از صفحه اصلی، کالکشن ها یا جستجو مسیر خود را دوباره پیدا کنید." : "The address may have changed. Return home or continue through the collections."}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex h-13 items-center gap-3 bg-[#B08A57] px-7 text-sm hover:bg-[#D9B985] hover:text-[#041E42]">{language === "fa" ? "بازگشت به خانه" : "Return home"}<Arrow size={16} /></Link>
          <Link to="/collections" className="inline-flex h-13 items-center border border-white/22 px-7 text-sm hover:border-[#B08A57] hover:text-[#D9B985]">{language === "fa" ? "مشاهده کالکشن ها" : "Explore collections"}</Link>
        </div>
      </div>
    </main>
  );
}
