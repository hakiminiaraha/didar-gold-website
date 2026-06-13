import React from "react";
import ArticleCard from "./ArticleCard";

const articles = [
  {
    image: "/images/article-1.jpg",
    title: "راهنمای انتخاب انگشتر",
    readTime: "۵ دقیقه مطالعه",
  },
  {
    image: "/images/article-2.jpg",
    title: "هنر دست‌ساز",
    readTime: "۷ دقیقه مطالعه",
  },
  {
    image: "/images/article-3.jpg",
    title: "راهنمای نگهداری طلا",
    readTime: "۶ دقیقه مطالعه",
  },
  {
    image: "/images/article-4.jpg",
    title: "داستان الماس",
    readTime: "۴ دقیقه مطالعه",
  },
];

function Journal() {
  return (
    <section id="journal" className="bg-[#F7F3EE] px-8 py-16">
      <div className="mx-auto grid max-w-[1450px] grid-cols-[300px_1fr] items-center gap-8">

        {/* Title Side */}
        <div className="text-right">
          <h2 className="text-[58px] font-normal leading-tight text-[#041E42]">
            مجله دیدار
          </h2>

          <a
            href="#"
            className="mt-6 inline-flex text-[18px] text-[#B08A57] transition hover:text-[#041E42]"
          >
            ← مطالعه همه مقالات
          </a>
        </div>

        {/* Articles */}
        <div className="grid grid-cols-4 gap-5">
          {articles.map((article) => (
            <ArticleCard
              key={article.title}
              image={article.image}
              title={article.title}
              readTime={article.readTime}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default Journal;