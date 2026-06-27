import { Check, FileText, ImagePlus, LoaderCircle, RefreshCw, Save, Search, Upload, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const pages = [
  ["/", "صفحه اصلی"], ["/collections", "کالکشن‌ها"], ["/products", "محصولات"],
  ["/services", "خدمات و اعتماد"], ["/our-world", "جهان دیدار"], ["/art-gallery", "آرت گالری"],
  ["/journal", "ژورنال"], ["/shop", "شاپ"], ["/contact", "تماس با ما"],
  ["/collections/signature", "کالکشن امضا"], ["/collections/heritage", "کالکشن میراث"],
  ["/collections/ceremony", "کالکشن مراسم"], ["/products/atrin-necklace", "محصول گردنبند آترین"],
  ["/products/vira-bracelet", "محصول دستبند ویرا"], ["/products/mahtab-ring", "محصول انگشتر مهتاب"],
  ["/products/nadia-earrings", "محصول گوشواره نادیا"], ["/products/leila-ring", "محصول انگشتر لیلا"],
  ["/products/raha-necklace", "محصول گردنبند رها"],
  ["/journal/gold-in-cultural-memory", "مقاله طلا در حافظه فرهنگی"], ["/journal/from-idea-to-form", "مقاله از ایده تا فرم"],
  ["/journal/didar-design-language", "مقاله زبان طراحی دیدار"], ["/journal/choosing-for-an-occasion", "مقاله راهنمای انتخاب"],
  ["/journal/why-in-person-viewing-matters", "مقاله تجربه حضوری"], ["/journal/digital-product-passport", "مقاله گذرنامه دیجیتال"],
  ["/selection", "انتخاب‌های من"], ["/wishlist", "علاقه‌مندی‌ها"], ["/account", "فضای شخصی"],
];

const typeLabels = { text: "متن", image: "تصویر", video: "ویدئو", poster: "پوستر", link: "لینک", alt: "متن جایگزین" };
const getEntryId = (entry) => `${entry.contentKey}__${entry.contentType}`;

export default function AdminContentManager() {
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [routePath, setRoutePath] = useState("/");
  const [locale, setLocale] = useState("fa");
  const [inventory, setInventory] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  const selected = inventory.find((entry) => getEntryId(entry) === selectedId);
  const filtered = useMemo(() => inventory.filter((entry) => `${entry.label} ${entry.value}`.toLowerCase().includes(query.toLowerCase())), [inventory, query]);

  useEffect(() => {
    const loadSaved = async (items, path, lang) => {
      const response = await fetch(`/api/admin/content?route=${encodeURIComponent(path)}&locale=${lang}`, { credentials: "include" });
      const saved = response.ok ? (await response.json()).entries : [];
      const next = Object.fromEntries(items.map((item) => [getEntryId(item), item.value]));
      saved.forEach((item) => { next[getEntryId(item)] = item.value; });
      setDrafts(next);
      setLoading(false);
    };
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "didar-cms-inventory") {
        const items = event.data.entries || [];
        setInventory(items);
        setSelectedId((current) => current || (items[0] ? getEntryId(items[0]) : ""));
        void loadSaved(items, event.data.routePath, event.data.locale);
      }
      if (event.data?.type === "didar-cms-select") setSelectedId(getEntryId(event.data.entry));
    };
    window.addEventListener("message", handleMessage);
    fetch("/api/admin/media", { credentials: "include" })
      .then((response) => response.ok ? response.json() : { assets: [] })
      .then((data) => setAssets(data.assets || []));
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const changePage = (value) => {
    setLoading(true);
    setInventory([]);
    setDrafts({});
    setSelectedId("");
    setRoutePath(value);
  };

  const updateSelected = (value) => setDrafts((current) => ({ ...current, [selectedId]: value }));

  const publish = async () => {
    setSaving(true);
    setNotice("");
    const entries = inventory.map((entry) => ({ contentKey: entry.contentKey, contentType: entry.contentType, value: drafts[getEntryId(entry)] ?? entry.value }));
    const response = await fetch("/api/admin/content", {
      method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routePath, locale, entries }),
    });
    setSaving(false);
    if (!response.ok) return setNotice("ذخیره محتوا انجام نشد.");
    setNotice("تغییرات منتشر شد.");
    iframeRef.current?.contentWindow.location.reload();
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice("");
    const response = await fetch("/api/admin/media", {
      method: "POST", credentials: "include", headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) }, body: file,
    });
    setUploading(false);
    event.target.value = "";
    if (!response.ok) return setNotice("آپلود رسانه انجام نشد. فرمت‌های مجاز: JPG، PNG، WebP، GIF، MP4 و WebM.");
    const asset = await response.json();
    setAssets((current) => [asset, ...current]);
    if (selected && ["image", "video", "poster"].includes(selected.contentType)) updateSelected(asset.publicUrl);
    setNotice("رسانه آپلود شد؛ برای نمایش در سایت، انتشار تغییرات را بزنید.");
  };

  const previewUrl = `${routePath}?cmsEditor=1&lang=${locale}&theme=light`;
  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><p className="text-xs tracking-[0.16em] text-[#B08A57]">DIDAR CONTENT STUDIO</p><h2 className="mt-2 text-3xl">مدیریت محتوای سایت</h2><p className="mt-2 text-sm text-[#041E42]/55">روی هر بخش در پیش‌نمایش کلیک کن، ویرایش کن و منتشر کن.</p></div>
        <div className="flex flex-wrap gap-2">
          <select value={routePath} onChange={(event) => changePage(event.target.value)} className="h-11 border border-[#B08A57]/30 bg-white px-3 text-sm outline-none">{pages.map(([path, label]) => <option key={path} value={path}>{label}</option>)}</select>
          <div className="flex border border-[#B08A57]/30 bg-white"><button type="button" onClick={() => { setLocale("fa"); setLoading(true); }} className={`px-4 text-xs ${locale === "fa" ? "bg-[#041E42] text-white" : ""}`}>فارسی</button><button type="button" onClick={() => { setLocale("en"); setLoading(true); }} className={`px-4 text-xs ${locale === "en" ? "bg-[#041E42] text-white" : ""}`}>English</button></div>
          <button type="button" onClick={publish} disabled={saving || loading} className="inline-flex h-11 items-center gap-2 bg-[#B08A57] px-5 text-sm text-white disabled:opacity-50">{saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />} انتشار تغییرات</button>
        </div>
      </div>

      {notice && <div className="mb-4 border border-[#B08A57]/30 bg-white px-4 py-3 text-sm">{notice}</div>}
      <div className="grid min-h-[720px] overflow-hidden border border-[#B08A57]/25 bg-white xl:grid-cols-[380px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-[#B08A57]/20 xl:border-b-0 xl:border-l">
          <div className="border-b border-[#B08A57]/20 p-4">
            <label className="flex h-11 items-center gap-3 border border-[#B08A57]/25 px-3"><Search size={16} className="text-[#B08A57]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی متن یا رسانه" className="w-full bg-transparent text-sm outline-none" /></label>
          </div>
          <div className="max-h-[290px] overflow-y-auto border-b border-[#B08A57]/20 xl:max-h-[340px]">
            {loading && <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-[#B08A57]" /></div>}
            {!loading && filtered.map((entry) => {
              const id = getEntryId(entry); const Icon = entry.contentType === "text" ? FileText : entry.contentType === "video" ? Video : ImagePlus;
              return <button key={id} type="button" onClick={() => setSelectedId(id)} className={`flex w-full gap-3 border-b border-[#B08A57]/10 px-4 py-3 text-right ${selectedId === id ? "bg-[#041E42] text-white" : "hover:bg-[#F7F3EE]"}`}><Icon size={16} className="mt-1 shrink-0 text-[#B08A57]" /><span className="min-w-0"><span className="block truncate text-xs">{entry.label}</span><span className={`mt-1 block text-[10px] ${selectedId === id ? "text-white/45" : "text-[#041E42]/40"}`}>{typeLabels[entry.contentType]}</span></span></button>;
            })}
          </div>
          <div className="flex-1 p-4">
            {selected ? <>
              <div className="flex items-center justify-between"><p className="text-xs text-[#041E42]/55">{selected.label}</p><span className="text-[10px] text-[#B08A57]">{typeLabels[selected.contentType]}</span></div>
              {selected.contentType === "text" ? <textarea value={drafts[selectedId] ?? ""} onChange={(event) => updateSelected(event.target.value)} rows={6} className="mt-3 w-full resize-y border border-[#B08A57]/25 p-3 text-sm leading-7 outline-none focus:border-[#B08A57]" /> : <input value={drafts[selectedId] ?? ""} onChange={(event) => updateSelected(event.target.value)} dir="ltr" className="mt-3 h-12 w-full border border-[#B08A57]/25 px-3 text-left text-xs outline-none focus:border-[#B08A57]" />}
              {["image", "video", "poster"].includes(selected.contentType) && <div className="mt-3"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={upload} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex h-10 items-center gap-2 border border-[#B08A57]/30 px-4 text-xs"><Upload size={15} />{uploading ? "در حال آپلود..." : "آپلود رسانه جدید"}</button></div>}
            </> : <p className="py-8 text-center text-sm text-[#041E42]/45">یک بخش را از فهرست یا پیش‌نمایش انتخاب کن.</p>}
          </div>
          {!!assets.length && <div className="border-t border-[#B08A57]/20 p-4"><p className="mb-3 text-xs">کتابخانه رسانه</p><div className="flex gap-2 overflow-x-auto pb-2">{assets.slice(0, 12).map((asset) => <button key={asset.id} type="button" onClick={() => selected && ["image", "video", "poster"].includes(selected.contentType) && updateSelected(asset.publicUrl)} className="h-14 w-14 shrink-0 overflow-hidden border border-[#B08A57]/20 bg-[#041E42]/5">{asset.mimeType.startsWith("image/") ? <img src={asset.publicUrl} alt={asset.fileName} className="h-full w-full object-cover" /> : <Video size={18} className="mx-auto text-[#B08A57]" />}</button>)}</div></div>}
        </aside>
        <div className="relative min-h-[650px] bg-[#E8E3DC] p-3 md:p-5">
          <div className="mb-3 flex items-center justify-between text-[11px] text-[#041E42]/50"><span>پیش‌نمایش زنده · برای انتخاب روی محتوا کلیک کن</span><button type="button" onClick={() => iframeRef.current?.contentWindow.location.reload()} className="inline-flex items-center gap-2"><RefreshCw size={13} /> تازه‌سازی</button></div>
          <iframe key={`${routePath}-${locale}`} ref={iframeRef} src={previewUrl} title="پیش‌نمایش ویرایش محتوا" onLoad={() => iframeRef.current?.contentWindow.postMessage({ type: "didar-cms-request-inventory" }, window.location.origin)} className="h-[650px] w-full bg-white shadow-[0_12px_45px_rgba(4,30,66,0.14)]" />
          {saving && <div className="absolute inset-0 grid place-items-center bg-white/65"><span className="inline-flex items-center gap-3 bg-[#041E42] px-6 py-4 text-sm text-white"><Check size={17} />در حال انتشار</span></div>}
        </div>
      </div>
    </section>
  );
}
