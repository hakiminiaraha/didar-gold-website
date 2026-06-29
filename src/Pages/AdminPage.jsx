import {
  Activity,
  Boxes,
  BookOpen,
  ChevronLeft,
  Database,
  FilePenLine,
  Heart,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  Search,
  Server,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AdminContentManager from "../components/AdminContentManager";
import AdminCatalogManager from "../components/AdminCatalogManager";
import AdminJournalManager from "../components/AdminJournalManager";
import AdminInboxManager from "../components/AdminInboxManager";

const tabs = [
  { id: "content", label: "مدیریت محتوا", icon: FilePenLine, roles: ["admin", "editor"] },
  { id: "catalog", label: "محصولات و کالکشن‌ها", icon: Boxes, roles: ["admin", "editor"] },
  { id: "journal", label: "مدیریت ژورنال", icon: BookOpen, roles: ["admin", "editor"] },
  { id: "inquiries", label: "درخواست‌ها", icon: Inbox, roles: ["admin", "support"] },
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard, roles: ["admin"] },
  { id: "users", label: "کاربران", icon: Users, roles: ["admin"] },
  { id: "activity", label: "گزارش فعالیت", icon: Activity, roles: ["admin"] },
  { id: "system", label: "وضعیت سیستم", icon: Server, roles: ["admin"] },
];

const eventLabels = {
  "auth.otp_requested": "درخواست رمز یک‌بارمصرف",
  "auth.otp_failed": "رمز یک‌بارمصرف نامعتبر",
  "auth.login_succeeded": "ورود موفق",
  "wishlist.replaced": "به‌روزرسانی علاقه‌مندی‌ها",
  "admin.overview_viewed": "مشاهده پنل ادمین",
  "cms.content_published": "انتشار محتوای سایت",
  "cms.content_reset": "بازنشانی محتوای سایت",
  "cms.media_uploaded": "آپلود رسانه جدید",
  "catalog.item_created": "ساخت رکورد کاتالوگ",
  "catalog.item_updated": "ویرایش رکورد کاتالوگ",
  "catalog.item_deleted": "حذف رکورد کاتالوگ",
  "journal.article_created": "ساخت مقاله ژورنال",
  "journal.article_updated": "ویرایش مقاله ژورنال",
  "journal.article_deleted": "حذف مقاله ژورنال",
  "inquiry.created": "ثبت درخواست جدید",
  "inquiry.status_updated": "به‌روزرسانی درخواست",
  "admin.user_role_updated": "تغییر نقش کاربر",
  "admin.user_sessions_revoked": "خروج اجباری نشست‌های کاربر",
};

const roleLabels = {
  user: "عضو",
  support: "پشتیبانی",
  editor: "ویراستار",
  admin: "مدیر",
};

const roleErrorLabels = {
  CANNOT_DEMOTE_SELF: "نمی‌توانید نقش مدیریتی حساب فعلی خود را حذف کنید.",
  ROLE_MANAGED_BY_ENV: "نقش این مدیر از تنظیمات امن سرور تعیین می‌شود و از پنل قابل تغییر نیست.",
  LAST_ADMIN_REQUIRED: "حداقل یک مدیر باید در سیستم باقی بماند.",
};

async function getAdminData(path) {
  const response = await fetch(`/api/admin/${path}`, { credentials: "include" });
  if (!response.ok) throw new Error(response.status === 403 ? "ADMIN_REQUIRED" : "REQUEST_FAILED");
  return response.json();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function Metric({ label, value, note, icon: Icon }) {
  return (
    <article className="border-e border-[#B08A57]/20 px-5 py-5 first:border-e-0 lg:px-7">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs text-white/55">{label}</p><strong className="mt-3 block text-3xl font-normal text-[#F7F3EE]">{Number(value || 0).toLocaleString("fa-IR")}</strong></div>
        <Icon size={22} strokeWidth={1.2} className="text-[#D9B985]" />
      </div>
      <p className="mt-4 text-[11px] text-white/38">{note}</p>
    </article>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.role === "support" ? "inquiries" : "content");
  const [menuOpen, setMenuOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [system, setSystem] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [userNotice, setUserNotice] = useState("");
  const [loading, setLoading] = useState(user?.role === "admin");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return undefined;
    let active = true;
    Promise.all([
      getAdminData("overview"),
      getAdminData("users?limit=50"),
      getAdminData("audit?limit=40"),
      getAdminData("system"),
    ]).then(([overviewData, usersData, auditData, systemData]) => {
      if (!active) return;
      setOverview(overviewData);
      setUsers(usersData.users);
      setEvents(auditData.events);
      setSystem(systemData);
    }).catch(() => active && setError("دریافت اطلاعات پنل انجام نشد. سرویس API را بررسی کنید."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user?.role]);

  const allowedTabs = tabs.filter((tab) => tab.roles.includes(user?.role));

  const filteredUsers = useMemo(() => users.filter((item) => item.mobileMasked.includes(query.trim())), [query, users]);

  const selectTab = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login?returnTo=%2Fadmin");
  };

  const changeUserRole = async (userId, role) => {
    setUserNotice("");
    const response = await fetch("/api/admin/users/role", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const result = await response.json();
    if (!response.ok) {
      setUserNotice(roleErrorLabels[result.error] || "تغییر نقش کاربر انجام نشد.");
      return;
    }
    setUsers((items) => items.map((item) => item.id === String(userId) ? { ...item, role: result.role, active_sessions: 0 } : item));
    setUserNotice("نقش کاربر ذخیره شد و نشست‌های قبلی او برای اعمال دسترسی جدید بسته شدند.");
  };

  const loadSessions = async (member) => {
    setSelectedUser(member);
    setSessionsLoading(true);
    setUserNotice("");
    try {
      const result = await getAdminData(`sessions?userId=${member.id}`);
      setSessions(result.sessions);
    } catch {
      setUserNotice("دریافت نشست‌های کاربر انجام نشد.");
    } finally {
      setSessionsLoading(false);
    }
  };

  const revokeSessions = async () => {
    if (!selectedUser) return;
    const response = await fetch("/api/admin/sessions", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id }),
    });
    const result = await response.json();
    if (!response.ok) {
      setUserNotice("بستن نشست‌های کاربر انجام نشد.");
      return;
    }
    setSessions([]);
    setUsers((items) => items.map((item) => item.id === selectedUser.id ? { ...item, active_sessions: 0 } : item));
    setUserNotice(`${Number(result.revoked).toLocaleString("fa-IR")} نشست بسته شد.`);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F3EE] text-[#041E42]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-20 items-center justify-between border-b border-[#B08A57]/20 bg-[#F7F3EE]/95 px-5 backdrop-blur md:px-8 lg:ps-[296px]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center border border-[#B08A57]/30 lg:hidden" aria-label="باز کردن منو"><Menu size={20} /></button>
          <div><p className="text-xs text-[#041E42]/50">مرکز مدیریت</p><h1 className="mt-1 text-xl">پنل ادمین دیدار</h1></div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="hidden text-[#041E42]/55 sm:inline">{user?.mobileMasked}</span>
          <Link to="/" className="inline-flex items-center gap-2 border border-[#B08A57]/30 px-4 py-2.5 transition hover:bg-[#041E42] hover:text-white">مشاهده سایت <ChevronLeft size={14} /></Link>
        </div>
      </header>

      <aside className={`fixed inset-y-0 right-0 z-50 w-[280px] bg-[#041E42] text-white transition-transform duration-300 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-7">
          <Link to="/" className="text-center"><span className="block text-xl tracking-[0.2em] text-[#D9B985]">DIDAR</span><span className="text-[9px] tracking-[0.16em] text-white/45">GOLD ADMINISTRATION</span></Link>
          <button type="button" onClick={() => setMenuOpen(false)} className="lg:hidden" aria-label="بستن منو"><X size={20} /></button>
        </div>
        <nav className="px-4 py-8">
          <p className="px-4 text-[10px] tracking-[0.12em] text-[#D9B985]">مدیریت پلتفرم</p>
          <div className="mt-4 space-y-1">
            {allowedTabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => selectTab(id)} className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm transition ${activeTab === id ? "bg-white/10 text-[#D9B985]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}><Icon size={18} strokeWidth={1.4} />{label}</button>)}
          </div>
        </nav>
        <div className="absolute inset-x-4 bottom-5 border-t border-white/10 pt-5">
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/55 hover:text-[#D9B985]"><LogOut size={17} />خروج امن</button>
        </div>
      </aside>
      {menuOpen && <button type="button" className="fixed inset-0 z-40 bg-[#020b17]/55 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="بستن منو" />}

      <main className="min-h-screen px-5 pb-12 pt-28 md:px-8 lg:me-0 lg:ps-[312px] lg:pe-8">
        <div className="mx-auto max-w-[1400px]">
          {error && <div className="mb-6 border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">{error}</div>}
          {loading ? <div className="grid min-h-[60vh] place-items-center"><span className="h-10 w-10 animate-spin rounded-full border border-[#B08A57]/25 border-t-[#B08A57]" /></div> : <>
            {activeTab === "content" && <AdminContentManager />}
            {activeTab === "catalog" && <AdminCatalogManager />}
            {activeTab === "journal" && <AdminJournalManager />}
            {activeTab === "inquiries" && <AdminInboxManager />}
            {activeTab === "overview" && <section>
              <div className="mb-7"><p className="text-xs tracking-[0.16em] text-[var(--gold-text)]">DIDAR OPERATIONS</p><h2 className="mt-2 text-3xl">تصویر امروز پلتفرم</h2><p className="mt-2 text-sm text-[#041E42]/55">شاخص‌های عضویت، تعامل و امنیت در یک نگاه</p></div>
              <div className="grid overflow-hidden bg-[#041E42] sm:grid-cols-2 xl:grid-cols-5">
                <Metric label="کاربران تأییدشده" value={overview?.users} note="کل اعضای فضای شخصی" icon={Users} />
                <Metric label="علاقه‌مندی‌ها" value={overview?.wishlistItems} note="قطعات ذخیره‌شده توسط اعضا" icon={Heart} />
                <Metric label="نشست‌های فعال" value={overview?.activeSessions} note="ورودهای معتبر در حال حاضر" icon={ShieldCheck} />
                <Metric label="ورودهای امروز" value={overview?.verifiedToday} note={`${Number(overview?.otpFailuresToday || 0).toLocaleString("fa-IR")} تلاش ناموفق امروز`} icon={Activity} />
                <Metric label="درخواست‌های جدید" value={overview?.newInquiries} note="نیازمند بررسی و پیگیری" icon={Inbox} />
              </div>
              <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
                <UsersTable users={users.slice(0, 6)} compact />
                <ActivityFeed events={events.slice(0, 7)} />
              </div>
            </section>}

            {activeTab === "users" && <section>
              <SectionHeading eyebrow="MEMBERS" title="کاربران فضای شخصی" description="حساب‌های تأییدشده با OTP و میزان تعامل آن‌ها" />
              <label className="mb-5 flex max-w-md items-center gap-3 border border-[#B08A57]/30 bg-white px-4"><Search size={17} className="text-[var(--gold-text)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در شماره موبایل" className="h-12 w-full bg-transparent text-sm outline-none" /></label>
              {userNotice && <p className="mb-5 border border-[#B08A57]/30 bg-[#FFFCF7] px-4 py-3 text-sm text-[#041E42]/75">{userNotice}</p>}
              <UsersTable users={filteredUsers} onRoleChange={changeUserRole} onSessions={loadSessions} />
              {selectedUser && <section className="mt-7 border border-[#B08A57]/25 bg-white">
                <div className="flex flex-col gap-4 border-b border-[#B08A57]/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs text-[var(--gold-text)]">نشست‌های ورود</p><h3 className="mt-1 text-xl" dir="ltr">{selectedUser.mobileMasked}</h3></div>
                  <button type="button" onClick={revokeSessions} disabled={!sessions.length} className="border border-[#041E42] px-5 py-2.5 text-sm transition hover:bg-[#041E42] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">خروج از همه دستگاه‌ها</button>
                </div>
                {sessionsLoading ? <p className="px-5 py-10 text-center text-sm text-[#041E42]/45">در حال دریافت نشست‌ها...</p> : sessions.length ? <div className="divide-y divide-[#B08A57]/15">{sessions.map((session) => <div key={session.id} className="flex items-start gap-4 px-5 py-5"><MonitorSmartphone size={21} className="mt-0.5 shrink-0 text-[var(--gold-text)]" /><div className="min-w-0"><p className="truncate text-sm" dir="ltr">{session.userAgent}</p><p className="mt-2 text-xs text-[#041E42]/45">آخرین فعالیت: {formatDate(session.lastSeenAt)} · انقضا: {formatDate(session.expiresAt)}</p></div></div>)}</div> : <p className="px-5 py-10 text-center text-sm text-[#041E42]/45">نشست فعالی برای این کاربر وجود ندارد.</p>}
              </section>}
            </section>}

            {activeTab === "activity" && <section><SectionHeading eyebrow="AUDIT LOG" title="گزارش فعالیت و امنیت" description="ردپای رویدادهای مهم احراز هویت، مدیریت و علاقه‌مندی‌ها" /><ActivityFeed events={events} wide /></section>}

            {activeTab === "system" && <section>
              <SectionHeading eyebrow="SYSTEM HEALTH" title="وضعیت زیرساخت" description="نمای زنده سرویس API، پایگاه داده و ارائه‌دهنده OTP" />
              <div className="border border-[#B08A57]/25 bg-white">
                <StatusRow icon={Server} title="سرویس API" value="عملیاتی" active />
                <StatusRow icon={Database} title="پایگاه داده" value="عملیاتی" active />
                <StatusRow icon={ShieldCheck} title="سرویس OTP" value={system?.otpProvider === "console" ? "حالت توسعه" : "متصل"} active={system?.otpProvider !== "console"} />
                <StatusRow icon={Activity} title="درخواست‌های OTP در انتظار" value={Number(system?.pendingOtps || 0).toLocaleString("fa-IR")} />
              </div>
              <p className="mt-4 text-xs text-[#041E42]/45">آخرین بررسی: {formatDate(system?.timestamp)}</p>
            </section>}
          </>}
        </div>
      </main>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return <div className="mb-7"><p className="text-xs tracking-[0.16em] text-[var(--gold-text)]">{eyebrow}</p><h2 className="mt-2 text-3xl">{title}</h2><p className="mt-2 text-sm text-[#041E42]/55">{description}</p></div>;
}

function UsersTable({ users, compact = false, onRoleChange, onSessions }) {
  const manageable = Boolean(onRoleChange && onSessions);
  return <div className="overflow-hidden border border-[#B08A57]/25 bg-white"><div className="flex items-center justify-between border-b border-[#B08A57]/20 px-5 py-4"><h3 className="text-lg">{compact ? "آخرین اعضا" : "فهرست اعضا"}</h3><span className="text-xs text-[#041E42]/45">{users.length.toLocaleString("fa-IR")} کاربر</span></div><div className="overflow-x-auto"><table className={`w-full ${manageable ? "min-w-[820px]" : "min-w-[650px]"} text-right text-sm`}><thead className="bg-[#041E42]/[0.035] text-xs text-[#041E42]/55"><tr><th className="px-5 py-3 font-normal">عضو</th><th className="px-5 py-3 font-normal">نقش</th><th className="px-5 py-3 font-normal">علاقه‌مندی</th><th className="px-5 py-3 font-normal">وضعیت</th><th className="px-5 py-3 font-normal">تاریخ عضویت</th>{manageable && <th className="px-5 py-3 font-normal">دسترسی</th>}</tr></thead><tbody>{users.map((item) => <tr key={item.id} className="border-t border-[#B08A57]/15"><td className="px-5 py-4"><span className="font-medium" dir="ltr">{item.mobileMasked}</span><span className="mt-1 block text-[10px] text-[#041E42]/40">ID {item.id}</span></td><td className="px-5 py-4">{manageable ? <select value={item.role} onChange={(event) => onRoleChange(item.id, event.target.value)} className="min-w-28 border border-[#B08A57]/30 bg-[#FFFCF7] px-3 py-2 text-xs outline-none focus:border-[#B08A57]">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <span className={item.role === "admin" ? "text-[var(--gold-text)]" : "text-[#041E42]/60"}>{roleLabels[item.role] || item.role}</span>}</td><td className="px-5 py-4">{Number(item.wishlist_count).toLocaleString("fa-IR")}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-xs"><i className={`h-1.5 w-1.5 rounded-full ${item.active_sessions ? "bg-emerald-500" : "bg-[#041E42]/20"}`} />{item.active_sessions ? "فعال" : "غیرفعال"}</span></td><td className="px-5 py-4 text-xs text-[#041E42]/55">{formatDate(item.created_at)}</td>{manageable && <td className="px-5 py-4"><button type="button" onClick={() => onSessions(item)} className="border-b border-[#B08A57] pb-1 text-xs text-[#041E42]">مدیریت نشست‌ها</button></td>}</tr>)}</tbody></table>{!users.length && <p className="py-16 text-center text-sm text-[#041E42]/45">کاربری پیدا نشد.</p>}</div></div>;
}

function ActivityFeed({ events, wide = false }) {
  return <div className="border border-[#B08A57]/25 bg-white"><div className="border-b border-[#B08A57]/20 px-5 py-4"><h3 className="text-lg">آخرین فعالیت‌ها</h3></div><div className={wide ? "grid md:grid-cols-2" : ""}>{events.map((event) => <div key={event.id} className="flex gap-4 border-b border-[#B08A57]/15 px-5 py-4 last:border-b-0 md:last:border-b"><span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#041E42] text-[#D9B985]"><Activity size={14} /></span><div className="min-w-0"><p className="text-sm">{eventLabels[event.eventType] || event.eventType}</p><p className="mt-1 text-[11px] text-[#041E42]/45">{event.actorMobileMasked || "رویداد سیستمی"} · {formatDate(event.createdAt)}</p></div></div>)}</div></div>;
}

function StatusRow({ icon: Icon, title, value, active = false }) {
  return <div className="flex items-center justify-between border-b border-[#B08A57]/15 px-5 py-5 last:border-b-0 sm:px-7"><div className="flex items-center gap-4"><Icon size={21} strokeWidth={1.3} className="text-[var(--gold-text)]" /><span className="text-sm sm:text-base">{title}</span></div><span className={`inline-flex items-center gap-2 text-xs ${active ? "text-emerald-700" : "text-[#041E42]/55"}`}><i className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-[#B08A57]"}`} />{value}</span></div>;
}
