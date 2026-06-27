function ArticleCard({ image, title, readTime }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--surface-raised)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={image}
        alt={title}
        className="h-[180px] w-full object-cover"
      />

      <div className="px-5 py-5 text-start">
        <h3 className="text-[22px] font-medium leading-[1.5] text-[var(--ink)]">
          {title}
        </h3>

        <p className="mt-3 text-[15px] text-[#B08A57]">
          {readTime}
        </p>
      </div>
    </article>
  );
}

export default ArticleCard;
