import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, KeyRound, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useSitePreferences } from "../context/SitePreferencesContext";
import { normalizeMobile, toEnglishDigits } from "../utils/authValidation";

const copy = {
  fa: {
    eyebrow: "PRIVATE DIDAR ACCESS",
    title: "ورود به فضای شخصی دیدار",
    mobile: "شماره موبایل",
    mobilePlaceholder: "09123456789",
    request: "دریافت رمز یک بارمصرف",
    otpTitle: "رمز یک بارمصرف را وارد کنید",
    otpText: "کد ۶ رقمی ارسال شده به",
    otp: "رمز یک بارمصرف",
    verify: "تأیید و ورود",
    edit: "اصلاح اطلاعات",
    resend: "ارسال دوباره کد",
    wait: "ارسال مجدد تا",
    back: "بازگشت به سایت",
    demoTitle: "نسخه نمایشی فرانت اند",
    demoText: "برای تست محلی: موبایل 09123456789 و OTP برابر 123456 است. این حالت در production غیرفعال می شود.",
    errors: {
      INVALID_MOBILE: "شماره موبایل معتبر نیست.",
      INVALID_OTP: "رمز یک بارمصرف صحیح نیست.",
      generic: "ارتباط با سرویس احراز هویت برقرار نشد. دوباره تلاش کنید.",
    },
  },
  en: {
    eyebrow: "PRIVATE DIDAR ACCESS",
    title: "Enter your private Didar space",
    mobile: "Mobile number",
    mobilePlaceholder: "09123456789",
    request: "Receive one-time password",
    otpTitle: "Enter your one-time password",
    otpText: "Enter the six-digit code sent to",
    otp: "One-time password",
    verify: "Verify and continue",
    edit: "Edit information",
    resend: "Resend code",
    wait: "Resend in",
    back: "Back to website",
    demoTitle: "Frontend demo mode",
    demoText: "For local testing: mobile 09123456789 and OTP 123456. Demo mode is disabled in production.",
    errors: {
      INVALID_MOBILE: "Enter a valid Iranian mobile number.",
      INVALID_OTP: "The one-time password is incorrect.",
      generic: "The authentication service is unavailable. Please try again.",
    },
  },
};

const adminCopy = {
  fa: {
    eyebrow: "DIDAR ADMIN ACCESS",
    title: "ورود به پنل مدیریت دیدار",
    mobile: "شماره موبایل مدیر",
    mobilePlaceholder: "شماره موبایل ثبت‌شده مدیر",
    request: "دریافت کد ورود مدیریت",
    otpTitle: "تأیید ورود مدیر",
    otpText: "کد شش‌رقمی ارسال‌شده به",
    otp: "رمز یک‌بارمصرف مدیریت",
    verify: "تأیید و ورود به پنل",
    sideTitle: "مدیریت امن جهان دیجیتال دیدار",
    sideText: "این بخش تنها برای مدیران مجاز پلتفرم در دسترس است و همه ورودها در گزارش امنیتی ثبت می‌شوند.",
  },
  en: {
    eyebrow: "DIDAR ADMIN ACCESS",
    title: "Sign in to Didar administration",
    mobile: "Administrator mobile number",
    mobilePlaceholder: "Registered administrator number",
    request: "Receive administrator access code",
    otpTitle: "Verify administrator access",
    otpText: "Enter the six-digit code sent to",
    otp: "Administrator one-time password",
    verify: "Verify and enter dashboard",
    sideTitle: "Secure management of Didar's digital world",
    sideText: "This area is restricted to authorized platform administrators and every sign-in is recorded in the security log.",
  },
};

function getSafeReturnTo(value) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/wishlist";
}

export default function LoginPage() {
  const { language, direction } = useSitePreferences();
  const { isAuthenticated, isDemo, requestOtp, verifyOtp } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState("identity");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [developmentCode, setDevelopmentCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const Arrow = language === "fa" ? ArrowLeft : ArrowRight;
  const returnTo = useMemo(() => getSafeReturnTo(searchParams.get("returnTo")), [searchParams]);
  const isAdminLogin = returnTo === "/admin";
  const text = isAdminLogin ? { ...copy[language], ...adminCopy[language] } : copy[language];

  useEffect(() => {
    if (!countdown) return undefined;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  const showError = (reason) => {
    const key = reason?.message;
    setError(text.errors[key] || (key && !key.startsWith("INVALID_") ? key : text.errors.generic));
  };

  const sendOtp = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await requestOtp({ mobile });
      setMobile(result.mobile || normalizeMobile(mobile));
      setChallengeId(result.challengeId);
      setDevelopmentCode(result.demoCode || "");
      setOtp("");
      setStep("otp");
      setCountdown(60);
    } catch (reason) {
      showError(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIdentity = async (event) => {
    event.preventDefault();
    await sendOtp();
  };

  const handleVerification = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await verifyOtp({ mobile, challengeId, code: otp });
      navigate(returnTo, { replace: true });
    } catch (reason) {
      showError(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir={direction} className="min-h-screen bg-[#041E42] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <img src="/images/Collection-01.png" alt="Didar Gold" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041E42] via-[#041E42]/35 to-[#041E42]/15" />
          <div className="absolute inset-x-0 bottom-0 p-14 text-start">
            <ShieldCheck size={38} strokeWidth={1.2} className="text-[#D9B985]" />
            <h2 className="mt-5 max-w-xl text-4xl leading-[1.6]">{isAdminLogin ? text.sideTitle : (language === "fa" ? "علاقه مندی های شما، در فضای شخصی شما" : "Your wishlist, inside your private space")}</h2>
            <p className="mt-4 max-w-lg text-sm leading-8 text-white/65">{isAdminLogin ? text.sideText : (language === "fa" ? "ورود امن کمک می کند انتخاب های شما میان دستگاه ها و مراجعات بعدی به هویت درست متصل بمانند." : "Secure access keeps your choices connected to the right identity across future visits.")}</p>
          </div>
        </section>

        <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[580px]">
            <div className="flex items-center justify-between gap-5">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-[#D9B985]"><ChevronLeft size={17} />{text.back}</Link>
              <img src="/images/logo-didar.png" alt="Didar Gold" className="h-20 brightness-0 invert" />
            </div>

            <div className="mt-12 text-start">
              <p className="text-xs tracking-[0.26em] text-[#D9B985]">{text.eyebrow}</p>
              <h1 className="mt-5 text-4xl leading-[1.55] sm:text-5xl">{step === "identity" ? text.title : text.otpTitle}</h1>
              {step === "otp" && <p className="mt-5 text-base leading-8 text-white/64">{text.otpText} {mobile}</p>}
            </div>

            {isDemo && (
              <div className="mt-7 border border-[#B08A57]/45 bg-[#B08A57]/10 p-4 text-start">
                <p className="text-sm text-[#D9B985]">{text.demoTitle}</p>
                <p className="mt-2 text-xs leading-6 text-white/58">{text.demoText}</p>
              </div>
            )}

            {!isDemo && developmentCode && step === "otp" && (
              <div className="mt-7 border border-[#B08A57]/45 bg-[#B08A57]/10 p-4 text-start">
                <p className="text-sm text-[#D9B985]">{language === "fa" ? "OTP توسعه محلی" : "Local development OTP"}</p>
                <p className="mt-2 font-mono text-xl tracking-[0.3em] text-white">{developmentCode}</p>
              </div>
            )}

            {step === "identity" ? (
              <form onSubmit={handleIdentity} className="mt-8 space-y-5">
                <label className="block text-start">
                  <span className="mb-2 block text-sm text-white/72">{text.mobile}</span>
                  <span className="flex h-14 items-center gap-3 border border-white/16 bg-white/5 px-4 focus-within:border-[#B08A57]">
                    <Phone size={18} className="text-[#D9B985]" strokeWidth={1.4} />
                    <input value={mobile} onChange={(event) => setMobile(normalizeMobile(event.target.value).slice(0, 11))} inputMode="numeric" autoComplete="tel" placeholder={text.mobilePlaceholder} className="w-full bg-transparent text-start outline-none placeholder:text-white/28" />
                  </span>
                </label>
                {error && <p role="alert" className="border-s-2 border-red-400 ps-3 text-start text-sm text-red-300">{error}</p>}
                <button disabled={submitting} className="flex h-14 w-full items-center justify-center gap-3 bg-[#B08A57] text-sm transition hover:bg-[#D9B985] hover:text-[#041E42] disabled:opacity-55">{text.request}<Arrow size={17} /></button>
              </form>
            ) : (
              <form onSubmit={handleVerification} className="mt-8">
                <label className="block text-start">
                  <span className="mb-2 block text-sm text-white/72">{text.otp}</span>
                  <span className="flex h-16 items-center gap-3 border border-white/16 bg-white/5 px-4 focus-within:border-[#B08A57]">
                    <KeyRound size={19} className="text-[#D9B985]" strokeWidth={1.4} />
                    <input value={otp} onChange={(event) => setOtp(toEnglishDigits(event.target.value).replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="------" className="w-full bg-transparent text-center text-2xl tracking-[0.45em] outline-none placeholder:text-white/20" />
                  </span>
                </label>
                {error && <p role="alert" className="mt-5 border-s-2 border-red-400 ps-3 text-start text-sm text-red-300">{error}</p>}
                <button disabled={submitting || otp.length !== 6} className="mt-6 flex h-14 w-full items-center justify-center gap-3 bg-[#B08A57] text-sm transition hover:bg-[#D9B985] hover:text-[#041E42] disabled:opacity-55"><CheckCircle2 size={18} />{text.verify}</button>
                <div className="mt-5 flex items-center justify-between gap-5 text-xs">
                  <button type="button" onClick={() => { setStep("identity"); setError(""); }} className="text-white/55 transition hover:text-white">{text.edit}</button>
                  <button type="button" disabled={countdown > 0 || submitting} onClick={sendOtp} className="text-[#D9B985] disabled:text-white/35">{countdown > 0 ? `${text.wait} ${countdown}` : text.resend}</button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
