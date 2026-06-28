import { useSitePreferences } from "../context/SitePreferencesContext";
import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";

const fallbackProducts = [
  { id: "atrin-necklace", image: "/images/didar-ui/product-01.jpg", fa: ["گردنبند آترین", "۷.۲۴۰ گرم"], en: ["Atrin Necklace", "7.240 gr"] },
  { id: "vira-bracelet", image: "/images/didar-ui/product-02.jpg", fa: ["دستبند ویرا", "۱۱.۵۰۰ گرم"], en: ["Vira Bracelet", "11.500 gr"] },
  { id: "mahtab-ring", image: "/images/didar-ui/product-03.jpg", fa: ["انگشتر مهتاب", "۶.۱۸۰ گرم"], en: ["Mahtab Ring", "6.180 gr"] },
  { id: "nadia-earrings", image: "/images/didar-ui/product-04.jpg", fa: ["گوشواره نادیا", "۵.۳۶۰ گرم"], en: ["Nadia Earrings", "5.360 gr"] },
  { id: "leila-ring", image: "/images/didar-ui/product-05.jpg", fa: ["انگشتر لیلا", "۸.۷۹۰ گرم"], en: ["Leila Ring", "8.790 gr"] },
];

function FeaturedProducts() {
  const { language } = useSitePreferences();
  const { items, available, loaded } = useCatalog("product");
  const products = loaded && available ? items.slice(0, 5).map((item) => ({
    id: item.slug,
    image: item.data.image,
    fa: [item.data.name?.fa || item.slug, item.data.specs?.weight || ""],
    en: [item.data.name?.en || item.slug, item.data.specs?.weight || ""],
  })) : fallbackProducts;

  return (
    <section id="products" className="bg-[var(--surface)] py-16">
      <div className="mx-auto max-w-[1800px] px-6 sm:px-10">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-normal text-[var(--ink)] sm:text-5xl">{language === "fa" ? "منتخب دیدار" : "Selected by Didar"}</h2>
          <div className="mt-4 flex items-center justify-center gap-3 text-[#B08A57]"><span className="h-px w-12 bg-[#B08A57]" />✦<span className="h-px w-12 bg-[#B08A57]" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {products.map((product) => (
            <article key={product.en[0]} className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface-raised)] transition duration-300 hover:-translate-y-2 hover:shadow-xl">
              <img src={product.image} alt={product[language][0]} loading="lazy" decoding="async" className="h-[220px] w-full object-cover sm:h-[240px]" />
              <div className="px-5 py-5 text-center">
                <h3 className="text-lg text-[var(--ink)]">{product[language][0]}</h3>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{product[language][1]}</p>
                <Link to={`/products/${product.id}`} className="mt-4 inline-flex text-sm text-[#B08A57]">{language === "fa" ? "مشاهده جزئیات" : "View details"}</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
