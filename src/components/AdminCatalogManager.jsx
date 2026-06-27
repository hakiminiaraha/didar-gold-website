import { ImagePlus, Layers3, LoaderCircle, Package, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const emptyProduct = {
  id: null, type: "product", slug: "", status: "draft", sortOrder: 0,
  data: { image: "", gallery: [], category: "rings", collection: "signature", occasion: "daily", availability: "viewing", price: 0, uid: "", passport: true, warranty: true, buyback: false, name: { fa: "", en: "" }, typeLabel: { fa: "", en: "" }, positioning: { fa: "", en: "" }, story: { fa: "", en: "" }, design: { fa: "", en: "" }, specs: { weight: "", karat: "18K", finish: { fa: "", en: "" } } },
};

const emptyCollection = {
  id: null, type: "collection", slug: "", status: "draft", sortOrder: 0,
  data: { code: "", hero: "", storyImage: "", name: { fa: "", en: "" }, positioning: { fa: "", en: "" }, intro: { fa: "", en: "" }, storyTitle: { fa: "", en: "" }, story: { fa: "", en: "" }, themes: { fa: [], en: [] }, products: [] },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function TextField({ label, value, onChange, dir, multiline = false, placeholder = "" }) {
  const className = "mt-2 w-full border border-[#B08A57]/25 bg-white px-3 text-sm outline-none focus:border-[#B08A57]";
  return <label className="block text-xs text-[#041E42]/60"><span>{label}</span>{multiline ? <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={4} dir={dir} placeholder={placeholder} className={`${className} resize-y py-3 leading-7`} /> : <input value={value || ""} onChange={(event) => onChange(event.target.value)} dir={dir} placeholder={placeholder} className={`${className} h-11`} />}</label>;
}

export default function AdminCatalogManager() {
  const fileInput = useRef(null);
  const [type, setType] = useState("product");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(clone(emptyProduct));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadTarget, setUploadTarget] = useState("image");
  const [notice, setNotice] = useState("");

  const loadItems = async (itemType = type) => {
    setLoading(true);
    const response = await fetch(`/api/admin/catalog?type=${itemType}`, { credentials: "include" });
    const data = response.ok ? await response.json() : { items: [] };
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch(`/api/admin/catalog?type=${type}`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : { items: [] })
      .then((data) => { setItems(data.items || []); setLoading(false); });
  }, [type]);

  const collections = useMemo(() => items.filter((item) => item.type === "collection"), [items]);
  const updateData = (path, value) => {
    setForm((current) => {
      const next = clone(current);
      const parts = path.split(".");
      let target = next.data;
      parts.slice(0, -1).forEach((part) => { if (!target[part]) target[part] = {}; target = target[part]; });
      target[parts.at(-1)] = value;
      return next;
    });
  };

  const selectType = (nextType) => {
    setType(nextType);
    setForm(clone(nextType === "product" ? emptyProduct : emptyCollection));
    setNotice("");
  };

  const editItem = (item) => {
    setForm(clone(item));
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newItem = () => {
    setForm(clone(type === "product" ? emptyProduct : emptyCollection));
    setNotice("");
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/admin/catalog", {
      method: form.id ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return setNotice(result.error === "CATALOG_SLUG_EXISTS" ? "این slug قبلاً استفاده شده است." : "ذخیره رکورد انجام نشد.");
    setForm(clone(result));
    setNotice(result.status === "published" ? "ذخیره و روی سایت منتشر شد." : "به‌عنوان پیش‌نویس ذخیره شد.");
    await loadItems(type);
  };

  const remove = async () => {
    if (!form.id || !window.confirm("این رکورد حذف شود؟ این عملیات قابل بازگشت نیست.")) return;
    const response = await fetch("/api/admin/catalog", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: form.id }) });
    if (!response.ok) return setNotice("حذف رکورد انجام نشد.");
    newItem();
    await loadItems(type);
  };

  const pickUpload = (target) => {
    setUploadTarget(target);
    fileInput.current?.click();
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setNotice("در حال آپلود رسانه...");
    const response = await fetch("/api/admin/media", { method: "POST", credentials: "include", headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) }, body: file });
    event.target.value = "";
    if (!response.ok) return setNotice("آپلود رسانه انجام نشد.");
    const asset = await response.json();
    if (uploadTarget === "gallery") updateData("gallery", [...(form.data.gallery || []), asset.publicUrl]);
    else updateData(uploadTarget, asset.publicUrl);
    setNotice("رسانه آپلود شد؛ برای ثبت نهایی دکمه ذخیره را بزنید.");
  };

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs tracking-[0.16em] text-[#B08A57]">DIDAR CATALOG</p><h2 className="mt-2 text-3xl">محصولات و کالکشن‌ها</h2><p className="mt-2 text-sm text-[#041E42]/55">ساخت، ویرایش، انتشار و مرتب‌سازی کاتالوگ بدون تغییر کد</p></div>
        <div className="flex gap-2"><button type="button" onClick={() => selectType("product")} className={`inline-flex h-11 items-center gap-2 px-5 text-sm ${type === "product" ? "bg-[#041E42] text-white" : "border border-[#B08A57]/30 bg-white"}`}><Package size={17} /> محصولات</button><button type="button" onClick={() => selectType("collection")} className={`inline-flex h-11 items-center gap-2 px-5 text-sm ${type === "collection" ? "bg-[#041E42] text-white" : "border border-[#B08A57]/30 bg-white"}`}><Layers3 size={17} /> کالکشن‌ها</button></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="border border-[#B08A57]/25 bg-white">
          <div className="flex items-center justify-between border-b border-[#B08A57]/20 px-4 py-4"><h3>{type === "product" ? "فهرست محصولات" : "فهرست کالکشن‌ها"}</h3><button type="button" onClick={newItem} className="inline-flex items-center gap-1 text-xs text-[#B08A57]"><Plus size={15} /> رکورد جدید</button></div>
          <div className="max-h-[720px] overflow-y-auto">{loading ? <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-[#B08A57]" /></div> : items.map((item) => <button key={item.id} type="button" onClick={() => editItem(item)} className={`flex w-full items-center gap-3 border-b border-[#B08A57]/10 p-3 text-right ${form.id === item.id ? "bg-[#041E42] text-white" : "hover:bg-[#F7F3EE]"}`}><span className="h-14 w-14 shrink-0 overflow-hidden bg-[#F7F3EE]">{(item.data.image || item.data.hero) ? <img src={item.data.image || item.data.hero} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={18} className="m-auto mt-4 text-[#B08A57]" />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-normal">{item.data.name?.fa || item.slug}</strong><span className={`mt-1 block text-[10px] ${form.id === item.id ? "text-white/45" : "text-[#041E42]/40"}`}>{item.slug} · {item.status === "published" ? "منتشرشده" : "پیش‌نویس"}</span></span><span className="text-xs text-[#B08A57]">{Number(item.sortOrder).toLocaleString("fa-IR")}</span></button>)}</div>
        </aside>

        <form onSubmit={save} className="border border-[#B08A57]/25 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B08A57]/20 px-5 py-4"><div><h3 className="text-lg">{form.id ? "ویرایش رکورد" : "رکورد جدید"}</h3><p className="mt-1 text-[10px] text-[#041E42]/40">{form.id ? `ID ${form.id}` : "پس از ذخیره شناسه ساخته می‌شود"}</p></div><div className="flex gap-2">{form.id && <button type="button" onClick={remove} className="inline-flex h-10 items-center gap-2 border border-red-200 px-4 text-xs text-red-700"><Trash2 size={15} /> حذف</button>}<button type="submit" disabled={saving || !form.slug} className="inline-flex h-10 items-center gap-2 bg-[#B08A57] px-5 text-xs text-white disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} ذخیره</button></div></div>
          {notice && <div className="border-b border-[#B08A57]/20 bg-[#F7F3EE] px-5 py-3 text-xs">{notice}</div>}
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={upload} className="hidden" />
          <div className="grid gap-5 p-5 md:grid-cols-2 md:p-7">
            <TextField label="Slug انگلیسی (آدرس صفحه)" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} dir="ltr" placeholder="example-product" />
            <div className="grid grid-cols-2 gap-3"><label className="text-xs text-[#041E42]/60">وضعیت<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-2 h-11 w-full border border-[#B08A57]/25 bg-white px-3 outline-none"><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option></select></label><TextField label="ترتیب نمایش" value={String(form.sortOrder)} onChange={(value) => setForm((current) => ({ ...current, sortOrder: Number(value) }))} dir="ltr" /></div>
            <TextField label="نام فارسی" value={form.data.name?.fa} onChange={(value) => updateData("name.fa", value)} />
            <TextField label="English name" value={form.data.name?.en} onChange={(value) => updateData("name.en", value)} dir="ltr" />

            {type === "product" ? <ProductFields form={form} updateData={updateData} pickUpload={pickUpload} collections={collections} /> : <CollectionFields form={form} updateData={updateData} pickUpload={pickUpload} />}
          </div>
        </form>
      </div>
    </section>
  );
}

function ProductFields({ form, updateData, pickUpload }) {
  return <>
    <label className="text-xs text-[#041E42]/60">دسته‌بندی<select value={form.data.category || "rings"} onChange={(event) => updateData("category", event.target.value)} className="mt-2 h-11 w-full border border-[#B08A57]/25 bg-white px-3"><option value="rings">انگشتر</option><option value="necklaces">گردنبند</option><option value="bracelets">دستبند</option><option value="earrings">گوشواره</option><option value="sets">ست</option></select></label>
    <TextField label="Slug کالکشن" value={form.data.collection} onChange={(value) => updateData("collection", value)} dir="ltr" placeholder="signature" />
    <label className="text-xs text-[#041E42]/60">مناسبت<select value={form.data.occasion || "daily"} onChange={(event) => updateData("occasion", event.target.value)} className="mt-2 h-11 w-full border border-[#B08A57]/25 bg-white px-3"><option value="daily">روزمره</option><option value="gift">هدیه</option><option value="ceremony">مراسم</option><option value="signature">قطعه امضا</option></select></label>
    <label className="text-xs text-[#041E42]/60">دسترسی<select value={form.data.availability || "viewing"} onChange={(event) => updateData("availability", event.target.value)} className="mt-2 h-11 w-full border border-[#B08A57]/25 bg-white px-3"><option value="ready">آماده مشاهده</option><option value="viewing">رزرو مشاهده</option><option value="limited">محدود</option></select></label>
    <TextField label="ارزش مرجع" value={String(form.data.price ?? 0)} onChange={(value) => updateData("price", Number(value))} dir="ltr" />
    <TextField label="شناسه محصول / UID" value={form.data.uid} onChange={(value) => updateData("uid", value)} dir="ltr" />
    <TextField label="نوع فارسی" value={form.data.typeLabel?.fa} onChange={(value) => updateData("typeLabel.fa", value)} />
    <TextField label="English type" value={form.data.typeLabel?.en} onChange={(value) => updateData("typeLabel.en", value)} dir="ltr" />
    <MediaField label="تصویر اصلی" value={form.data.image} onChange={(value) => updateData("image", value)} onUpload={() => pickUpload("image")} />
    <div className="flex items-end"><button type="button" onClick={() => pickUpload("gallery")} className="inline-flex h-11 items-center gap-2 border border-[#B08A57]/30 px-4 text-xs"><Upload size={15} /> افزودن تصویر به گالری ({form.data.gallery?.length || 0})</button></div>
    <TextField label="جمله معرفی فارسی" value={form.data.positioning?.fa} onChange={(value) => updateData("positioning.fa", value)} multiline />
    <TextField label="English positioning" value={form.data.positioning?.en} onChange={(value) => updateData("positioning.en", value)} dir="ltr" multiline />
    <TextField label="داستان فارسی" value={form.data.story?.fa} onChange={(value) => updateData("story.fa", value)} multiline />
    <TextField label="English story" value={form.data.story?.en} onChange={(value) => updateData("story.en", value)} dir="ltr" multiline />
    <TextField label="یادداشت طراحی فارسی" value={form.data.design?.fa} onChange={(value) => updateData("design.fa", value)} multiline />
    <TextField label="English design note" value={form.data.design?.en} onChange={(value) => updateData("design.en", value)} dir="ltr" multiline />
    <TextField label="وزن" value={form.data.specs?.weight} onChange={(value) => updateData("specs.weight", value)} dir="ltr" />
    <TextField label="عیار" value={form.data.specs?.karat} onChange={(value) => updateData("specs.karat", value)} dir="ltr" />
    <TextField label="پرداخت فارسی" value={form.data.specs?.finish?.fa} onChange={(value) => updateData("specs.finish.fa", value)} />
    <TextField label="English finish" value={form.data.specs?.finish?.en} onChange={(value) => updateData("specs.finish.en", value)} dir="ltr" />
    <div className="flex flex-wrap gap-5 md:col-span-2">{[["passport", "گذرنامه دیجیتال"], ["warranty", "گارانتی"], ["buyback", "بازخرید"]].map(([key, label]) => <label key={key} className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(form.data[key])} onChange={(event) => updateData(key, event.target.checked)} className="accent-[#B08A57]" />{label}</label>)}</div>
  </>;
}

function CollectionFields({ form, updateData, pickUpload }) {
  return <>
    <TextField label="کد کالکشن" value={form.data.code} onChange={(value) => updateData("code", value.toUpperCase())} dir="ltr" />
    <div />
    <MediaField label="تصویر Hero" value={form.data.hero} onChange={(value) => updateData("hero", value)} onUpload={() => pickUpload("hero")} />
    <MediaField label="تصویر داستان" value={form.data.storyImage} onChange={(value) => updateData("storyImage", value)} onUpload={() => pickUpload("storyImage")} />
    <TextField label="جمله معرفی فارسی" value={form.data.positioning?.fa} onChange={(value) => updateData("positioning.fa", value)} multiline />
    <TextField label="English positioning" value={form.data.positioning?.en} onChange={(value) => updateData("positioning.en", value)} dir="ltr" multiline />
    <TextField label="معرفی فارسی" value={form.data.intro?.fa} onChange={(value) => updateData("intro.fa", value)} multiline />
    <TextField label="English introduction" value={form.data.intro?.en} onChange={(value) => updateData("intro.en", value)} dir="ltr" multiline />
    <TextField label="عنوان داستان فارسی" value={form.data.storyTitle?.fa} onChange={(value) => updateData("storyTitle.fa", value)} />
    <TextField label="English story title" value={form.data.storyTitle?.en} onChange={(value) => updateData("storyTitle.en", value)} dir="ltr" />
    <TextField label="داستان فارسی" value={form.data.story?.fa} onChange={(value) => updateData("story.fa", value)} multiline />
    <TextField label="English story" value={form.data.story?.en} onChange={(value) => updateData("story.en", value)} dir="ltr" multiline />
    <TextField label="تم‌های فارسی (با ویرگول)" value={(form.data.themes?.fa || []).join("، ")} onChange={(value) => updateData("themes.fa", value.split(/[،,]/).map((item) => item.trim()).filter(Boolean))} />
    <TextField label="English themes (comma separated)" value={(form.data.themes?.en || []).join(", ")} onChange={(value) => updateData("themes.en", value.split(",").map((item) => item.trim()).filter(Boolean))} dir="ltr" />
    <div className="md:col-span-2"><TextField label="Slug محصولات کالکشن (با ویرگول)" value={(form.data.products || []).join(", ")} onChange={(value) => updateData("products", value.split(",").map((item) => item.trim()).filter(Boolean))} dir="ltr" /></div>
  </>;
}

function MediaField({ label, value, onChange, onUpload }) {
  return <div><TextField label={label} value={value} onChange={onChange} dir="ltr" /><button type="button" onClick={onUpload} className="mt-2 inline-flex items-center gap-2 text-[11px] text-[#B08A57]"><Upload size={13} /> آپلود از دستگاه</button></div>;
}
