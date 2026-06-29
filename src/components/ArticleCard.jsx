function ArticleCard({ image, title, readTime }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--surface-raised)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        width={320}
        height={180}
        className="h-[180px] w-full object-cover"
      />

      <div className="px-5 py-5 text-start">
        <h3 className="text-[22px] font-medium leading-[1.5] text-[var(--ink)]">
          {title}
        </h3>

        <p className="mt-3 text-[15px] text-[var(--gold-text)]">
          {readTime}
        </p>
      </div>
    </article>
  );
}

export default ArticleCard;
