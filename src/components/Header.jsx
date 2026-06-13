import React, { useEffect, useState } from "react";

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50
        transition-all duration-300
        ${
          scrolled
            ? "bg-[#F7F3EE]/92 backdrop-blur-md border-b border-[#E7DCCB] shadow-sm"
            : "bg-transparent"
        }
      `}
    >
      <div className="relative max-w-7xl mx-auto px-8 h-28 grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center gap-6 text-[#041E42] text-xl justify-start">
          <button aria-label="search">⌕</button>
          <button aria-label="wishlist">♡</button>
          <button aria-label="menu">☰</button>
        </div>

        <nav className="hidden md:flex items-center justify-center w-fit w-[600px] mx-auto gap-7 text-[14px] font-medium text-[#041E42] whitespace-nowrap rounded-full bg-[#F7F3EE]/65 px-16 py-3 backdrop-blur-md shadow-sm">
          <a href="#home">خانه</a>
          <a href="#collections">کالکشن‌ها</a>
          <a href="#products">محصولات</a>
          <a href="#services">خدمات</a>
          <a href="#world">جهان دیدار</a>
          <a href="#art-gallery">آرت گالری</a>
          <a href="#journal">مجله دیدار</a>
          <a href="#shop">شاپ</a>
          
        </nav>

        <div className="flex justify-end">
          <img
            src="/images/logo-didar.png"
            alt="Didar Gold"
            className="h-16 object-contain"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;