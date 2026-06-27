import { BookOpen, LoaderCircle, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const emptyArticle = {
  id: null, slug: "", status: "draft", sortOrder: 0, featured: false, category: "culture", pillar: "Journal", image: "", dateLabel: "", readLabel: { fa: "۴ دقیقه", en: "4 min read" },
  content: { fa: { title: "", excerpt: "", kicker: "", lead: "", quote: "", sections: [] }, en: { title: "", excerpt: "", kicker: "", lead: "", quote: "", sections: [] } },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function Field({ label, value, onChange, dir, multiline = false }) {
  const style = "mt-2 w-full border border-[#B08A57]/25 bg-white px-3 text-sm outline-none focus:border-[#B08A57]";
  return <label className="block text-xs text-[#041E42]/60">{label}{multiline ? <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={4} dir={dir} className={`${style} resize-y py-3 leading-7`} /> : <input value={value || ""} onChange={(event) => onChange(event.target.value)} dir={dir} className={`${style} h-11`} />}</label>;
}

export default function AdminJournalManager() {
  const fileInput = useRef(null);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(clone(emptyArticle));
  const [language, setLanguage] = useState("fa");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/journal", { credentials: "include" });
    const data = response.ok ? await response.json() : { articles: [] };
    setArticles(data.articles || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/admin/journal", { credentials: "include" })
      .then((response) => response.ok ? response.json() : { articles: [] })
      .then((data) => { setArticles(data.articles || []); setLoading(false); });
  }, []);

  const updateContent = (key, value, locale = language) => setForm((current) => ({ ...current, content: { ...current.content, [locale]: { ...current.content[locale], [key]: value } } }));
  const updateSection = (index, part, value) => {
    const sections = clone(form.content[language].sections || []);
    if (!sections[index]) sections[index] = ["", ""];
    sections[index][part] = value;
    updateContent("sections", sections);
  };
  const addSection = () => updateContent("sections", [...(form.content[language].sections || []), ["", ""]]);
  const removeSection = (index) => updateContent("sections", form.content[language].sections.filter((_, itemIndex) => itemIndex !== index));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/admin/journal", { method: form.id ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return setNotice(result.error === "ARTICLE_SLUG_EXISTS" ? "این slug قبلاً استفاده شده است." : "ذخیره مقاله انجام نشد.");
    setForm(clone(result));
    setNotice(result.status === "published" ? "مقاله منتشر شد." : "پیش‌نویس ذخیره شد.");
    await load();
  };

  const remove = async () => {
    if (!form.id || !window.confirm("این مقاله برای همیشه حذف شود؟")) return;
    const response = await fetch("/api/admin/journal", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: form.id }) });
    if (!response.ok) return setNotice("حذف مقاله انجام نشد.");
    setForm(clone(emptyArticle));
    await load();
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setNotice("در حال آپلود تصویر...");
    const response = await fetch("/api/admin/media", { method: "POST", credentials: "include", headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) }, body: file });
    event.target.value = "";
    if (!response.ok) return setNotice("آپلود تصویر انجام نشد.");
    const asset = await response.json();
    setForm((current) => ({ ...current, image: asset.publicUrl }));
    setNotice("تصویر آپلود شد؛ مقاله را ذخیره کن.");
  };

  return <section>
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs tracking-[0.16em] text-[#B08A57]">DIDAR EDITORIAL</p><h2 className="mt-2 text-3xl">مدیریت ژورنال</h2><p className="mt-2 text-sm text-[#041E42]/55">نوشتن، ویرایش و انتشار روایت‌های دیدار</p></div><button type="button" onClick={() => { setForm(clone(emptyArticle)); setNotice(""); }} className="inline-flex h-11 items-center gap-2 border border-[#B08A57]/30 bg-white px-5 text-sm"><Plus size={16} /> مقاله جدید</button></div>
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <aside className="border border-[#B08A57]/25 bg-white"><div className="border-b border-[#B08A57]/20 px-4 py-4"><h3>مقاله‌ها</h3></div><div className="max-h-[760px] overflow-y-auto">{loading ? <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-[#B08A57]" /></div> : articles.map((article) => <button key={article.id} type="button" onClick={() => { setForm(clone(article)); setNotice(""); }} className={`flex w-full items-center gap-3 border-b border-[#B08A57]/10 p-3 text-right ${form.id === article.id ? "bg-[#041E42] text-white" : "hover:bg-[#F7F3EE]"}`}><span className="h-14 w-14 shrink-0 overflow-hidden bg-[#F7F3EE]">{article.image ? <img src={article.image} alt="" className="h-full w-full object-cover" /> : <BookOpen size={18} className="m-auto mt-4 text-[#B08A57]" />}</span><span className="min-w-0"><strong className="block truncate text-sm font-normal">{article.content.fa.title || article.slug}</strong><span className={`mt-1 block text-[10px] ${form.id === article.id ? "text-white/45" : "text-[#041E42]/40"}`}>{article.status === "published" ? "منتشرشده" : "پیش‌نویس"} · {article.category}</span></span></button>)}</div></aside>
      <form onSubmit={save} className="border border-[#B08A57]/25 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B08A57]/20 px-5 py-4"><div><h3 className="text-lg">{form.id ? "ویرایش مقاله" : "مقاله جدید"}</h3><p className="mt-1 text-[10px] text-[#041E42]/40">{form.slug || "آدرس مقاله پس از ذخیره ساخته می‌شود"}</p></div><div className="flex gap-2">{form.id && <button type="button" onClick={remove} className="inline-flex h-10 items-center gap-2 border border-red-200 px-4 text-xs text-red-700"><Trash2 size={15} /> حذف</button>}<button type="submit" disabled={saving || !form.slug || !form.content.fa.title || !form.content.en.title} className="inline-flex h-10 items-center gap-2 bg-[#B08A57] px-5 text-xs text-white disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} ذخیره</button></div></div>
        {notice && <div className="border-b border-[#B08A57]/20 bg-[#F7F3EE] px-5 py-3 text-xs">{notice}</div>}
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} className="hidden" />
        <div className="grid gap-5 p-5 md:grid-cols-2 md:p-7">
          <Field label="Slug انگلیسی" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} dir="ltr" />
          <div className="grid grid-cols-2 gap-3"><label className="text-xs text-[#041E42]/60">وضعیت<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-2 h-11 w-full border border-[#B08A57]/25 bg-white px-3"><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option></select></label><Field label="ترتیب" value={String(form.sortOrder)} onChange={(value) => setForm((current) => ({ ...current, sortOrder: Number(value) }))} dir="ltr" /></div>
          <label className="text-xs text-[#041E42]/60">دسته‌بندی<select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 h-11 w-full border border-[#B08A57]/25 bg-white px-3"><option value="culture">فرهنگ و الهام</option><option value="craft">ساخت</option><option value="design">طراحی</option><option value="buying">راهنمای انتخاب</option><option value="experience">تجربه</option><option value="trust">اعتماد</option></select></label>
          <Field label="ستون / Pillar" value={form.pillar} onChange={(value) => setForm((current) => ({ ...current, pillar: value }))} dir="ltr" />
          <Field label="تاریخ نمایش" value={form.dateLabel} onChange={(value) => setForm((current) => ({ ...current, dateLabel: value }))} />
          <label className="flex items-center gap-2 self-end pb-3 text-xs"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="accent-[#B08A57]" /> مقاله منتخب ژورنال</label>
          <div className="md:col-span-2"><Field label="تصویر شاخص" value={form.image} onChange={(value) => setForm((current) => ({ ...current, image: value }))} dir="ltr" /><button type="button" onClick={() => fileInput.current?.click()} className="mt-2 inline-flex items-center gap-2 text-[11px] text-[#B08A57]"><Upload size={13} /> آپلود تصویر</button></div>
          <Field label="زمان مطالعه فارسی" value={form.readLabel.fa} onChange={(value) => setForm((current) => ({ ...current, readLabel: { ...current.readLabel, fa: value } }))} />
          <Field label="English reading time" value={form.readLabel.en} onChange={(value) => setForm((current) => ({ ...current, readLabel: { ...current.readLabel, en: value } }))} dir="ltr" />
        </div>
        <div className="border-t border-[#B08A57]/20 p-5 md:p-7"><div className="mb-5 flex w-fit border border-[#B08A57]/30"><button type="button" onClick={() => setLanguage("fa")} className={`h-10 px-5 text-xs ${language === "fa" ? "bg-[#041E42] text-white" : ""}`}>محتوای فارسی</button><button type="button" onClick={() => setLanguage("en")} className={`h-10 px-5 text-xs ${language === "en" ? "bg-[#041E42] text-white" : ""}`}>English content</button></div>
          <div className="grid gap-5 md:grid-cols-2"><Field label={language === "fa" ? "عنوان مقاله" : "Article title"} value={form.content[language].title} onChange={(value) => updateContent("title", value)} dir={language === "en" ? "ltr" : "rtl"} /><Field label={language === "fa" ? "عنوان دسته در مقاله" : "Article kicker"} value={form.content[language].kicker} onChange={(value) => updateContent("kicker", value)} dir={language === "en" ? "ltr" : "rtl"} /><div className="md:col-span-2"><Field label={language === "fa" ? "خلاصه کارت" : "Card excerpt"} value={form.content[language].excerpt} onChange={(value) => updateContent("excerpt", value)} dir={language === "en" ? "ltr" : "rtl"} multiline /></div><div className="md:col-span-2"><Field label={language === "fa" ? "لید مقاله" : "Article lead"} value={form.content[language].lead} onChange={(value) => updateContent("lead", value)} dir={language === "en" ? "ltr" : "rtl"} multiline /></div><div className="md:col-span-2"><Field label={language === "fa" ? "نقل‌قول" : "Pull quote"} value={form.content[language].quote} onChange={(value) => updateContent("quote", value)} dir={language === "en" ? "ltr" : "rtl"} multiline /></div></div>
          <div className="mt-7 flex items-center justify-between"><h4>بخش‌های مقاله</h4><button type="button" onClick={addSection} className="inline-flex items-center gap-2 text-xs text-[#B08A57]"><Plus size={14} /> افزودن بخش</button></div>
          <div className="mt-4 space-y-4">{(form.content[language].sections || []).map((section, index) => <div key={index} className="border border-[#B08A57]/20 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs text-[#B08A57]">بخش {(index + 1).toLocaleString("fa-IR")}</span><button type="button" onClick={() => removeSection(index)} className="text-red-600"><Trash2 size={14} /></button></div><Field label="عنوان بخش" value={section[0]} onChange={(value) => updateSection(index, 0, value)} dir={language === "en" ? "ltr" : "rtl"} /><div className="mt-3"><Field label="متن بخش" value={section[1]} onChange={(value) => updateSection(index, 1, value)} dir={language === "en" ? "ltr" : "rtl"} multiline /></div></div>)}</div>
        </div>
      </form>
    </div>
  </section>;
}
