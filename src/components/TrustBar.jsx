import { useSitePreferences } from "../context/SitePreferencesContext";

const trustItems = [
  { fa: ["گذرنامه دیجیتال", "معرفی سازوکار"], en: ["Digital Passport", "Service overview"], icon: "/icons/digital-passport.png" },
  { fa: ["اصالت و ردیابی", "بر پایه اطلاعات معتبر"], en: ["Authenticity", "Based on verified data"], icon: "/icons/authenticity.png" },
  { fa: ["مسیر گارانتی", "معرفی پوشش خدمات"], en: ["Warranty Path", "Coverage overview"], icon: "/icons/warranty.png" },
  { fa: ["بررسی بازخرید", "ورودی درخواست اولیه"], en: ["Buyback Review", "Initial request entry"], icon: "/icons/buyback.png" },
  { fa: ["خرید عمده", "ویژه همکاران"], en: ["Wholesale", "For our partners"], icon: "/icons/wholesale.png" },
];

function TrustBar() {
  const { language } = useSitePreferences();

  return (
    <section className="relative z-30 -mt-20 px-5 sm:px-8">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border border-[#DCC7A8] bg-[var(--surface-raised)] shadow-[0_24px_65px_rgba(4,30,66,0.16)]">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {trustItems.map((item, index) => (
            <article
              key={item.en[0]}
              className={`group flex min-h-[168px] flex-col items-center justify-center px-4 text-center transition duration-300 hover:bg-[#B08A57]/12 ${
                index !== trustItems.length - 1 ? "border-e border-[var(--line)]" : ""
              }`}
            >
              <div className="mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#D5B98F] bg-[#FFF8EE] shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#041E42]">
                <img
                  src={item.icon}
                  alt={item[language][0]}
                  className="h-7 w-7 object-contain transition group-hover:brightness-0 group-hover:invert"
                />
              </div>
              <h3 className="mb-1 text-lg font-medium text-[var(--ink)]">{item[language][0]}</h3>
              <p className="text-[13px] leading-6 text-[var(--ink-muted)]">{item[language][1]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBar;
