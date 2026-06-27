import { Link } from "react-router-dom";

import { useSitePreferences } from "../context/SitePreferencesContext";

const content = {
  fa: {
    statement: "دیدار، جایی که زیبایی با اعتماد ماندگار می شود.",
    columns: [
      { title: "درباره دیدار", links: [["داستان دیدار", "/our-world"], ["فلسفه برند", "/our-world"], ["مجله دیدار", "/journal"], ["آرت گالری", "/art-gallery"]] },
      { title: "محصولات", links: [["کالکشن ها", "/collections"], ["انگشتر", "/products"], ["گردنبند", "/products"], ["دستبند", "/products"], ["گوشواره", "/products"]] },
      { title: "خدمات", links: [["گذرنامه دیجیتال", "/services#passport"], ["اصالت و ردیابی", "/services"], ["راهنمای بازخرید", "/services#ownership"], ["راهنمای نگهداری", "/services#ownership"]] },
      { title: "همکاری", links: [["ویژه همکاران", "/contact"], ["شرایط همکاری", "/contact"], ["درخواست نمایندگی", "/contact"]] },
      { title: "تماس و پشتیبانی", links: [["۰۲۱-۹۱۰۰۲۰۲۰", "tel:+982191002020"], ["info@didargold.com", "mailto:info@didargold.com"], ["تهران، مجتمع دیدار", "/contact"], ["سوالات متداول", "/services#faq"]] },
    ],
    copyright: "© تمامی حقوق این وب سایت برای دیدار گلد محفوظ است.",
    utility: [["تماس با ما", "/contact"], ["رزرو مشاوره", "/contact#appointment"], ["حساب کاربری", "/account"]],
  },
  en: {
    statement: "Didar, where beauty becomes enduring trust.",
    columns: [
      { title: "About Didar", links: [["Our Story", "/our-world"], ["Brand Philosophy", "/our-world"], ["Journal", "/journal"], ["Art Gallery", "/art-gallery"]] },
      { title: "Creations", links: [["Collections", "/collections"], ["Rings", "/products"], ["Necklaces", "/products"], ["Bracelets", "/products"], ["Earrings", "/products"]] },
      { title: "Services", links: [["Digital Passport", "/services#passport"], ["Authenticity", "/services"], ["Buyback Guide", "/services#ownership"], ["Care Guide", "/services#ownership"]] },
      { title: "Partnerships", links: [["For Retailers", "/contact"], ["Partnership Terms", "/contact"], ["Representation Request", "/contact"]] },
      { title: "Contact & Support", links: [["+98 21 9100 2020", "tel:+982191002020"], ["info@didargold.com", "mailto:info@didargold.com"], ["Didar Complex, Tehran", "/contact"], ["FAQ", "/services#faq"]] },
    ],
    copyright: "© All rights reserved by Didar Gold.",
    utility: [["Contact", "/contact"], ["Private Viewing", "/contact#appointment"], ["Account", "/account"]],
  },
};

function FooterLink({ href, children }) {
  const className = "transition hover:text-white";
  if (href.startsWith("tel:") || href.startsWith("mailto:") || href.includes("#")) {
    return <a href={href} className={className}>{children}</a>;
  }
  return <Link to={href} className={className}>{children}</Link>;
}

export default function Footer() {
  const { language } = useSitePreferences();
  const copy = content[language];

  return (
    <footer className="bg-[var(--footer)] text-white transition-colors duration-500">
      <div className="mx-auto max-w-[1450px] px-5 py-12 sm:px-8">
        <div className="text-center">
          <img src="/images/logo-didar.png" alt="Didar Gold" className="mx-auto h-28 object-contain brightness-0 invert" />
          <p className="mt-4 text-lg leading-9 text-white/75">{copy.statement}</p>
        </div>

        <div className="my-9 h-px bg-[#B08A57]/25" />
        <div className="grid grid-cols-1 gap-9 text-start sm:grid-cols-2 lg:grid-cols-5">
          {copy.columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-5 text-lg text-[#D9B985]">{column.title}</h4>
              <ul className="space-y-3 text-sm text-white/60">
                {column.links.map(([label, href]) => <li key={label}><FooterLink href={href}>{label}</FooterLink></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-9 h-px bg-[#B08A57]/20" />
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-white/40">{copy.copyright}</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-white/55">
            {copy.utility.map(([label, href]) => <FooterLink key={label} href={href}>{label}</FooterLink>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}
