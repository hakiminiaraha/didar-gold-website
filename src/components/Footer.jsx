import { Link } from "react-router-dom";

import { useSitePreferences } from "../context/SitePreferencesContext";
import { footerContent, isNativeLink } from "../data/siteContent";

function FooterLink({ href, children }) {
  const className = "transition hover:text-white";
  if (isNativeLink(href)) {
    return <a href={href} className={className}>{children}</a>;
  }
  return <Link to={href} className={className}>{children}</Link>;
}

export default function Footer() {
  const { language } = useSitePreferences();
  const copy = footerContent[language];

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
