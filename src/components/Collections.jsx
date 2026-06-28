import { Link } from "react-router-dom";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { useCatalog } from "../hooks/useCatalog";

const fallbackCollections = [
  { id: "ceremony", title: "CEREMONY", fa: "مراسم خاص", en: "Ceremonial moments", image: "/images/didar-ui/collection-03.jpg" },
  { id: "signature", title: "SIGNATURE", fa: "امضای دیدار", en: "The Didar signature", image: "/images/didar-ui/collection-01.jpg" },
  { id: "heritage", title: "HERITAGE", fa: "میراث جاودانه", en: "An enduring heritage", image: "/images/didar-ui/collection-02.jpg" },
];

function Collections() {
  const { language } = useSitePreferences();
  const { items, available, loaded } = useCatalog("collection");
  const collections = loaded && available ? items.map((item) => ({
    id: item.slug,
    title: item.data.code || item.slug.toUpperCase(),
    fa: item.data.name?.fa || item.slug,
    en: item.data.name?.en || item.slug,
    image: item.data.hero,
  })) : fallbackCollections;

  return (
    <section id="collections" className="bg-[var(--surface)] px-8 pb-8 pt-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {collections.map((item) => (
            <article key={item.title} className="group relative h-[290px] overflow-hidden rounded-[24px]">
              <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-6 start-6 text-white">
                <h3 className="text-[34px] font-normal tracking-[0.08em]">{item.title}</h3>
                <p className="mt-1 text-base text-white/85">{item[language]}</p>
                <Link to={`/collections/${item.id}`} className="mt-4 inline-block border border-[#CFA76A] px-5 py-2 text-sm transition hover:bg-[#CFA76A]">
                  {language === "fa" ? "مشاهده" : "Explore"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Collections;
