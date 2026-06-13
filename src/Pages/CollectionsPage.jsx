import React from "react";

function CollectionsPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F3EE] text-[#041E42] font-doran"
    >
      <section className="px-8 py-24">
        <div className="mx-auto max-w-[1450px] text-center">
          <h1 className="text-[64px] font-normal leading-tight">
            کالکشن‌های دیدار
          </h1>

          <p className="mx-auto mt-6 max-w-[620px] text-[20px] leading-9 text-[#111820]/65">
            هر کالکشن، روایتی متفاوت از زیبایی، اصالت و اعتماد است.
          </p>
        </div>
      </section>
    </main>
  );
}

export default CollectionsPage;