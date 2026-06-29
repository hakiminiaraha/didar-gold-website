import ArticleCard from "./ArticleCard";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { Link } from "react-router-dom";
import { useJournal } from "../hooks/useJournal";

const fallbackArticles = [
  { slug: "choosing-for-an-occasion", image: "/images/didar-ui/product-03.jpg", fa: ["راهنمای انتخاب انگشتر", "۵ دقیقه مطالعه"], en: ["A Guide to Choosing Rings", "5 min read"] },
  { slug: "from-idea-to-form", image: "/images/IMG_7951.JPG", fa: ["هنر دست‌ساز", "۷ دقیقه مطالعه"], en: ["The Art of Handcraft", "7 min read"] },
  { slug: "digital-product-passport", image: "/images/didar-ui/product-06.jpg", fa: ["راهنمای نگهداری طلا", "۶ دقیقه مطالعه"], en: ["Caring for Gold", "6 min read"] },
  { slug: "gold-in-cultural-memory", image: "/images/gallery-3.JPG", fa: ["داستان طلا", "۴ دقیقه مطالعه"], en: ["The Story of Gold", "4 min read"] },
];

function Journal() {
  const { language } = useSitePreferences();
  const { articles: journalArticles, available, loaded } = useJournal();
  const articles = loaded && available ? journalArticles.slice(0, 4).map((article) => ({
    slug: article.slug,
    image: article.image,
    fa: [article.content.fa.title, article.readLabel.fa],
    en: [article.content.en.title, article.readLabel.en],
  })) : fallbackArticles;

  return (
    <section id="journal" className="bg-[var(--surface)] px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-[1450px] items-center gap-8 lg:grid-cols-[300px_1fr]">
        <div className="text-start">
          <h2 className="text-5xl font-normal text-[var(--ink)]">{language === "fa" ? "مجله دیدار" : "Didar Journal"}</h2>
          <Link to="/journal" className="mt-6 inline-flex text-lg text-[var(--gold-text)]">{language === "fa" ? "مطالعه همه مقالات" : "Read all stories"}</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {articles.map((article) => <Link key={article.slug} to={`/journal/${article.slug}`}><ArticleCard image={article.image} title={article[language][0]} readTime={article[language][1]} /></Link>)}
        </div>
      </div>
    </section>
  );
}

export default Journal;
