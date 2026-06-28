export const siteNavigation = {
  fa: [
    ["خانه", "/"],
    ["کالکشن ها", "/collections"],
    ["محصولات", "/products"],
    ["خدمات", "/services"],
    ["جهان دیدار", "/our-world"],
    ["آرت گالری", "/art-gallery"],
    ["مجله دیدار", "/journal"],
    ["شاپ", "/shop"],
  ],
  en: [
    ["Home", "/"],
    ["Collections", "/collections"],
    ["Products", "/products"],
    ["Services", "/services"],
    ["Our World", "/our-world"],
    ["Art Gallery", "/art-gallery"],
    ["Journal", "/journal"],
    ["Shop", "/shop"],
  ],
};

export const footerContent = {
  fa: {
    statement: "دیدار، جایی که زیبایی با اعتماد ماندگار می شود.",
    columns: [
      {
        title: "درباره دیدار",
        links: [
          ["داستان دیدار", "/our-world"],
          ["فلسفه برند", "/our-world"],
          ["مجله دیدار", "/journal"],
          ["آرت گالری", "/art-gallery"],
        ],
      },
      {
        title: "محصولات",
        links: [
          ["کالکشن ها", "/collections"],
          ["انگشتر", "/products"],
          ["گردنبند", "/products"],
          ["دستبند", "/products"],
          ["گوشواره", "/products"],
        ],
      },
      {
        title: "خدمات",
        links: [
          ["گذرنامه دیجیتال", "/services#passport"],
          ["اصالت و ردیابی", "/services"],
          ["راهنمای بازخرید", "/services#ownership"],
          ["راهنمای نگهداری", "/services#ownership"],
        ],
      },
      {
        title: "همکاری",
        links: [
          ["ویژه همکاران", "/contact"],
          ["شرایط همکاری", "/contact"],
          ["درخواست نمایندگی", "/contact"],
        ],
      },
      {
        title: "تماس و پشتیبانی",
        links: [
          ["۰۲۱-۹۱۰۰۲۰۲۰", "tel:+982191002020"],
          ["info@didargold.com", "mailto:info@didargold.com"],
          ["تهران، مجتمع دیدار", "/contact"],
          ["سوالات متداول", "/services#faq"],
        ],
      },
    ],
    copyright: "© تمامی حقوق این وب سایت برای دیدار گلد محفوظ است.",
    utility: [
      ["تماس با ما", "/contact"],
      ["رزرو مشاوره", "/contact#appointment"],
      ["حساب کاربری", "/account"],
    ],
  },
  en: {
    statement: "Didar, where beauty becomes enduring trust.",
    columns: [
      {
        title: "About Didar",
        links: [
          ["Our Story", "/our-world"],
          ["Brand Philosophy", "/our-world"],
          ["Journal", "/journal"],
          ["Art Gallery", "/art-gallery"],
        ],
      },
      {
        title: "Creations",
        links: [
          ["Collections", "/collections"],
          ["Rings", "/products"],
          ["Necklaces", "/products"],
          ["Bracelets", "/products"],
          ["Earrings", "/products"],
        ],
      },
      {
        title: "Services",
        links: [
          ["Digital Passport", "/services#passport"],
          ["Authenticity", "/services"],
          ["Buyback Guide", "/services#ownership"],
          ["Care Guide", "/services#ownership"],
        ],
      },
      {
        title: "Partnerships",
        links: [
          ["For Retailers", "/contact"],
          ["Partnership Terms", "/contact"],
          ["Representation Request", "/contact"],
        ],
      },
      {
        title: "Contact & Support",
        links: [
          ["+98 21 9100 2020", "tel:+982191002020"],
          ["info@didargold.com", "mailto:info@didargold.com"],
          ["Didar Complex, Tehran", "/contact"],
          ["FAQ", "/services#faq"],
        ],
      },
    ],
    copyright: "© All rights reserved by Didar Gold.",
    utility: [
      ["Contact", "/contact"],
      ["Private Viewing", "/contact#appointment"],
      ["Account", "/account"],
    ],
  },
};

export function isNativeLink(href) {
  return href.startsWith("tel:") || href.startsWith("mailto:") || href.includes("#");
}
