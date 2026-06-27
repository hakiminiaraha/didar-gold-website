export const creationCatalog = [
  {
    id: "atrin-necklace",
    image: "/images/Product-01.png",
    collection: { fa: "امضای دیدار", en: "Signature" },
    category: { fa: "گردنبند", en: "Necklace" },
    name: { fa: "گردنبند آترین", en: "Atrin Necklace" },
    note: { fa: "درخششی آرام برای لحظه های ماندگار", en: "Quiet brilliance for enduring moments" },
  },
  {
    id: "vira-bracelet",
    image: "/images/Product-02.png",
    collection: { fa: "امضای دیدار", en: "Signature" },
    category: { fa: "دستبند", en: "Bracelet" },
    name: { fa: "دستبند ویرا", en: "Vira Bracelet" },
    note: { fa: "خطی پیوسته برای همراهی هر روز", en: "A continuous line for everyday presence" },
  },
  {
    id: "mahtab-ring",
    image: "/images/Product-03.png",
    collection: { fa: "میراث", en: "Heritage" },
    category: { fa: "انگشتر", en: "Ring" },
    name: { fa: "انگشتر مهتاب", en: "Mahtab Ring" },
    note: { fa: "بازتابی معاصر از یک نقش آشنا", en: "A contemporary reflection of a familiar motif" },
  },
  {
    id: "nadia-earrings",
    image: "/images/Product-04.png",
    collection: { fa: "مراسم", en: "Ceremony" },
    category: { fa: "گوشواره", en: "Earrings" },
    name: { fa: "گوشواره نادیا", en: "Nadia Earrings" },
    note: { fa: "حرکت نور برای یک حضور رسمی", en: "Light in motion for a ceremonial presence" },
  },
  {
    id: "leila-ring",
    image: "/images/Product-05.png",
    collection: { fa: "امضای دیدار", en: "Signature" },
    category: { fa: "انگشتر", en: "Ring" },
    name: { fa: "انگشتر لیلا", en: "Leila Ring" },
    note: { fa: "یک نقطه نور در تعادلی روشن", en: "A single point of light in clear balance" },
  },
  {
    id: "raha-necklace",
    image: "/images/Product-06.png",
    collection: { fa: "مراسم", en: "Ceremony" },
    category: { fa: "گردنبند", en: "Necklace" },
    name: { fa: "گردنبند رها", en: "Raha Necklace" },
    note: { fa: "فرمی روشن برای یک انتخاب شخصی", en: "A luminous form for a personal choice" },
  },
];

export function getCreation(id) {
  return creationCatalog.find((creation) => creation.id === id);
}
