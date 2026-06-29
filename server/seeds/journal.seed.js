const entries = [
  ["gold-in-cultural-memory", "/images/brand-story.png", "culture", "Culture & Inspiration", "طلا در حافظه فرهنگی ما", "Gold in cultural memory", "نگاهی آرام به معنا، آیین و نشانه‌هایی که طلا را از زیور فراتر می‌برند.", "A quiet look at meaning, ritual, and symbols that take gold beyond ornament."],
  ["from-idea-to-form", "/images/world-craft.webp", "craft", "Product Story", "از ایده تا فرم", "From idea to form", "چگونه یک الهام اولیه به تناسب، سطح، جزئیات و یک قطعه دیدار تبدیل می‌شود.", "How an initial inspiration becomes proportion, surface, detail, and a Didar creation."],
  ["didar-design-language", "/images/didar-ui/collection-02.jpg", "design", "Brand World", "زبان طراحی دیدار", "Didar's design language", "فرم‌هایی که میان حافظه ایرانی و نگاه معاصر حرکت می‌کنند.", "Forms that move between Iranian memory and a contemporary gaze."],
  ["choosing-for-an-occasion", "/images/didar-ui/product-03.jpg", "buying", "Experience", "انتخاب قطعه برای یک مناسبت", "Choosing for an occasion", "معیارهایی برای انتخابی شخصی، آرام و ماندگار.", "Simple criteria for a personal, calm, and enduring choice."],
  ["why-in-person-viewing-matters", "/images/gallery-main.JPG", "experience", "Experience", "چرا مشاهده حضوری مهم است", "Why in-person viewing matters", "دیدن، لمس کردن و تصمیم گرفتن در مقیاس واقعی.", "Seeing, touching, and deciding at true scale."],
  ["digital-product-passport", "/images/didar-ui/product-06.jpg", "trust", "Trust", "گذرنامه دیجیتال محصول چیست؟", "What is a product passport?", "شناسه یکتا، اصالت، گارانتی و مسیر خدمات پس از خرید.", "UID, authenticity, warranty, and lifecycle services explained simply."],
];

export const journalSeed = entries.map(([slug, image, category, pillar, faTitle, enTitle, faExcerpt, enExcerpt], index) => ({
  slug,
  image,
  category,
  pillar,
  sortOrder: (index + 1) * 10,
  featured: index === 0,
  dateLabel: "۱۴۰۴/۰۳/۰۸",
  readLabel: { fa: "۴ دقیقه", en: "4 min read" },
  content: {
    fa: { title: faTitle, excerpt: faExcerpt, kicker: pillar, lead: faExcerpt, quote: "هر روایت دیدار، دعوتی است به دیدن جزئیات با دقت بیشتر.", sections: [["روایت", faExcerpt], ["جزئیات", "معنا و ساخت زمانی ماندگار می‌شوند که در یک مسیر روشن کنار هم قرار بگیرند."]] },
    en: { title: enTitle, excerpt: enExcerpt, kicker: pillar, lead: enExcerpt, quote: "Every Didar story is an invitation to look more closely.", sections: [["The story", enExcerpt], ["The details", "Meaning and craft endure when they move together with clarity."]] },
  },
}));
