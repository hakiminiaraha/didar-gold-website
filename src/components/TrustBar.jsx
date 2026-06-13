import React from "react";

const trustItems = [
  {
    title: "شناسنامه دیجیتال",
    desc: "برای هر قطعه",
    icon: "/icons/digital-passport.png",
  },
  {
    title: "تضمین اصالت",
    desc: "طلای ۱۸ عیار",
    icon: "/icons/authenticity.png",
  },
  {
    title: "گارانتی خدمات",
    desc: "و کیفیت مادام‌العمر",
    icon: "/icons/warranty.png",
  },
  {
    title: "بازخرید مطمئن",
    desc: "با بهترین ارزش",
    icon: "/icons/buyback.png",
  },
  {
    title: "خرید عمده",
    desc: "ویژه همکاران",
    icon: "/icons/wholesale.png",
  },
];

function TrustBar() {
  return (
    <section className="relative z-30 bg-transparent px-6 -mt-20">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border border-[#E3D3BD] bg-[#FFFCF7]/95 shadow-[0_18px_50px_rgba(4,30,66,0.08)]">
        <div className="grid grid-cols-5">
          {trustItems.map((item, index) => (
            <article
              key={item.title}
              className={`
                group
                h-[155px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-5
                transition-all
                duration-300
                hover:bg-[#F2E6D6]
                ${index !== trustItems.length - 1 ? "border-l border-[#E3D3BD]" : ""}
              `}
            >
              <div className="mb-3 flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#D5B98F] bg-[#F8EFE4] transition-all duration-300 group-hover:bg-[#041E42]">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="h-7 w-7 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                />
              </div>

              <h3 className="mb-1 text-[18px] font-medium text-[#041E42]">
                {item.title}
              </h3>

              <p className="text-[13px] leading-6 text-[#111820]/58">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBar;