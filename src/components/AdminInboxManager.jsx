import { CalendarDays, CheckCircle2, Clock3, Inbox, LoaderCircle, MessageSquareText, Phone, Save, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const statusLabels = { new: "جدید", contacted: "تماس گرفته‌شده", scheduled: "زمان‌بندی‌شده", closed: "بسته" };
const reasonLabels = { private: "مشاهده خصوصی", selection: "راهنمای انتخاب", service: "خدمات مالکیت", general: "پرسش عمومی" };

function formatDate(value) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminInboxManager() {
  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/inquiries", { credentials: "include" });
    const data = response.ok ? await response.json() : { inquiries: [], counts: {} };
    setInquiries(data.inquiries || []);
    setCounts(data.counts || {});
    setSelectedId((current) => current || data.inquiries?.[0]?.id || "");
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/admin/inquiries", { credentials: "include" })
      .then((response) => response.ok ? response.json() : { inquiries: [], counts: {} })
      .then((data) => { setInquiries(data.inquiries || []); setCounts(data.counts || {}); setSelectedId(data.inquiries?.[0]?.id || ""); setLoading(false); });
  }, []);

  const visible = useMemo(() => inquiries.filter((item) => {
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    const normalized = query.trim().toLowerCase();
    const searchMatch = !normalized || `${item.fullName} ${item.contact} ${item.referenceCode}`.toLowerCase().includes(normalized);
    return statusMatch && searchMatch;
  }), [inquiries, query, statusFilter]);
  const selected = inquiries.find((item) => item.id === selectedId) || visible[0];

  const updateSelected = (field, value) => setInquiries((current) => current.map((item) => item.id === selected?.id ? { ...item, [field]: value } : item));
  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/admin/inquiries", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, status: selected.status, internalNote: selected.internalNote }) });
    setSaving(false);
    if (!response.ok) return setNotice("به‌روزرسانی درخواست انجام نشد.");
    const result = await response.json();
    setInquiries((current) => current.map((item) => item.id === result.id ? result : item));
    setNotice("وضعیت درخواست ذخیره شد.");
    await load();
  };

  return <section>
    <div className="mb-6"><p className="text-xs tracking-[0.16em] text-[#B08A57]">DIDAR RELATIONSHIPS</p><h2 className="mt-2 text-3xl">درخواست‌های تماس و مشاوره</h2><p className="mt-2 text-sm text-[#041E42]/55">پیگیری متمرکز گفت‌وگوهای ورودی از سایت</p></div>
    <div className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-5"><button type="button" onClick={() => setStatusFilter("all")} className={`border px-4 py-3 text-xs ${statusFilter === "all" ? "border-[#041E42] bg-[#041E42] text-white" : "border-[#B08A57]/25 bg-white"}`}>همه · {inquiries.length.toLocaleString("fa-IR")}</button>{Object.entries(statusLabels).map(([status, label]) => <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`border px-4 py-3 text-xs ${statusFilter === status ? "border-[#041E42] bg-[#041E42] text-white" : "border-[#B08A57]/25 bg-white"}`}>{label} · {Number(counts[status] || 0).toLocaleString("fa-IR")}</button>)}</div>
    <div className="grid min-h-[680px] overflow-hidden border border-[#B08A57]/25 bg-white xl:grid-cols-[430px_1fr]">
      <aside className="border-b border-[#B08A57]/20 xl:border-b-0 xl:border-l"><div className="border-b border-[#B08A57]/20 p-4"><label className="flex h-11 items-center gap-3 border border-[#B08A57]/25 px-3"><Search size={16} className="text-[#B08A57]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام، شماره تماس یا کد پیگیری" className="w-full bg-transparent text-sm outline-none" /></label></div><div className="max-h-[610px] overflow-y-auto">{loading ? <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-[#B08A57]" /></div> : visible.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setNotice(""); }} className={`w-full border-b border-[#B08A57]/10 p-4 text-right ${selected?.id === item.id ? "bg-[#041E42] text-white" : "hover:bg-[#F7F3EE]"}`}><div className="flex items-center justify-between gap-3"><strong className="truncate text-sm font-normal">{item.fullName}</strong><span className={`shrink-0 text-[10px] ${selected?.id === item.id ? "text-[#D9B985]" : "text-[#B08A57]"}`}>{statusLabels[item.status]}</span></div><p className={`mt-2 truncate text-xs ${selected?.id === item.id ? "text-white/50" : "text-[#041E42]/45"}`}>{reasonLabels[item.reason]} · {item.contact}</p><p className={`mt-2 text-[10px] ${selected?.id === item.id ? "text-white/35" : "text-[#041E42]/35"}`}>{formatDate(item.createdAt)}</p></button>)}{!loading && !visible.length && <div className="py-20 text-center"><Inbox size={28} className="mx-auto text-[#B08A57]" /><p className="mt-3 text-sm text-[#041E42]/45">درخواستی پیدا نشد.</p></div>}</div></aside>
      <div className="p-5 md:p-8">{selected ? <><div className="flex flex-col justify-between gap-4 border-b border-[#B08A57]/20 pb-6 md:flex-row md:items-start"><div><p className="text-xs text-[#B08A57]" dir="ltr">{selected.referenceCode}</p><h3 className="mt-2 text-3xl">{selected.fullName}</h3><p className="mt-2 text-sm text-[#041E42]/50">{reasonLabels[selected.reason]} · {formatDate(selected.createdAt)}</p></div><select value={selected.status} onChange={(event) => updateSelected("status", event.target.value)} className="h-11 border border-[#B08A57]/30 bg-white px-4 text-sm"><option value="new">جدید</option><option value="contacted">تماس گرفته‌شده</option><option value="scheduled">زمان‌بندی‌شده</option><option value="closed">بسته</option></select></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><Info icon={Phone} label="راه تماس" value={selected.contact} ltr /><Info icon={MessageSquareText} label="شیوه ترجیحی" value={selected.preferredChannel} /><Info icon={CalendarDays} label="تاریخ پیشنهادی" value={selected.preferredDate || "ثبت نشده"} /><Info icon={Clock3} label="زبان درخواست" value={selected.locale === "fa" ? "فارسی" : "English"} /></div>
        <div className="mt-6 border border-[#B08A57]/20 bg-[#F7F3EE] p-5"><p className="text-xs text-[#041E42]/45">توضیحات مراجعه‌کننده</p><p className="mt-3 whitespace-pre-wrap text-sm leading-8">{selected.message || "بدون توضیح"}</p></div>
        <label className="mt-6 block text-xs text-[#041E42]/55">یادداشت داخلی تیم<textarea value={selected.internalNote || ""} onChange={(event) => updateSelected("internalNote", event.target.value)} rows={6} placeholder="نتیجه تماس، زمان هماهنگ‌شده یا نکات پیگیری..." className="mt-2 w-full resize-y border border-[#B08A57]/25 p-4 text-sm leading-7 outline-none focus:border-[#B08A57]" /></label>
        {notice && <p className="mt-4 text-xs text-[#B08A57]">{notice}</p>}<button type="button" onClick={save} disabled={saving} className="mt-5 inline-flex h-11 items-center gap-2 bg-[#B08A57] px-6 text-sm text-white disabled:opacity-50">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} ذخیره پیگیری</button></> : <div className="grid min-h-[560px] place-items-center text-center"><div><CheckCircle2 size={34} className="mx-auto text-[#B08A57]" /><p className="mt-4 text-sm text-[#041E42]/45">برای مشاهده جزئیات، یک درخواست را انتخاب کن.</p></div></div>}</div>
    </div>
  </section>;
}

function Info({ icon: Icon, label, value, ltr = false }) {
  return <div className="flex gap-3 border border-[#B08A57]/20 p-4"><Icon size={17} className="mt-0.5 shrink-0 text-[#B08A57]" /><div><p className="text-[10px] text-[#041E42]/40">{label}</p><p className="mt-1 text-sm" dir={ltr ? "ltr" : "rtl"}>{value}</p></div></div>;
}
