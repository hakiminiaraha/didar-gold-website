import React from "react";

const products = [
  {
    id: 1,
    name: "انگشتر آترین",
    weight: "7.240 gr",
    image: "/images/Product-01.png",
  },
  {
    id: 2,
    name: "دستبند ویرا",
    weight: "11.500 gr",
    image: "/images/Product-02.png",
  },
  {
    id: 3,
    name: "گردنبند مهتاب",
    weight: "6.180 gr",
    image: "/images/Product-03.png",
  },
  {
    id: 4,
    name: "گوشواره نادیا",
    weight: "5.360 gr",
    image: "/images/Product-04.png",
  },
  {
    id: 5,
    name: "انگشتر لیلا",
    weight: "8.790 gr",
    image: "/images/Product-05.png",
  },
];

function FeaturedProducts() {
  return (
    <section className="bg-[#F7F3EE] py-15س">

      <div className="max-w-[1800px] mx-auto px-10">

        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-[48px] text-[#041E42] font-normal">
            منتخب دیدار
          </h2>

          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="w-12 h-px bg-[#C8A36A]" />
            <span className="text-[#C8A36A] text-xl">✦</span>
            <span className="w-12 h-px bg-[#C8A36A]" />
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-5 gap-8">

          {products.map((product) => (
            <div
              key={product.id}
              className="
                bg-white
                rounded-[24px]
                overflow-hidden
                border border-[#ECE6DD]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-xl
              "
            >

              {/* Image */}
              <div className="relative">

                <button className="absolute top-5 left-5 z-10 text-xl text-[#041E42]">
                  ♡
                </button>

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[240px] object-cover"
                />
              </div>

              {/* Content */}
              <div className="text-center px-6 py-2">

                <h3 className="text-[#041E42] text-[18px] mb-2">
                  {product.name}
                </h3>

                <p className="text-[#7A7A7A] text-[15px] mb-4">
                  {product.weight}
                </p>

                <a
                  href="#"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-[#B08A57]
                    text-[14px]
                    hover:text-[#041E42]
                    transition
                  "
                >
                  ← مشاهده جزئیات
                </a>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default FeaturedProducts;