# Didar Gold Website - Technical Documentation

آخرین وضعیت مستند: 2026-06-27  
مسیر پروژه: `C:\Users\Asus\Documents\didar`  
Repository: `https://github.com/hakiminiaraha/didar-gold-website.git`

## 1. خلاصه پروژه

Didar Gold یک وب‌سایت لوکس جواهرات با معماری React + Vite + Tailwind است. پروژه در حال حاضر علاوه بر فرانت‌اند، یک API سبک Node.js نیز دارد که برای احراز هویت OTP، علاقه‌مندی‌ها، CMS، کاتالوگ، ژورنال، فرم‌های تماس، پنل ادمین و اتصال SQLite/PostgreSQL آماده شده است.

جهت بصری پروژه Maison-style و لوکس است و روی رنگ‌های اصلی زیر بنا شده:

| نقش | رنگ |
| --- | --- |
| Navy | `#041E42` |
| Gold | `#B08A57` |
| Cream | `#F7F3EE` |
| White/Ivory | `#FFFCF7` |

## 2. تکنولوژی‌ها

### Frontend

- React `19`
- Vite `8`
- Tailwind CSS `3.4`
- React Router `7`
- Lucide React برای آیکون‌ها
- Context API برای auth، wishlist/selection و تنظیمات زبان/تم

### Backend / API

- Node.js ESM
- Native `node:http`
- `node:sqlite` برای دیتابیس لوکال
- `pg` برای PostgreSQL
- Cookie-based session با `HttpOnly`
- OTP login با providerهای `console`، `http` و `payamsms`

### Deployment

- Render Blueprint از طریق `render.yaml`
- Web service Node
- PostgreSQL database
- Production build با `npm run build`
- Production server با `npm run start:api`

## 3. اسکریپت‌های npm

| دستور | کاربرد |
| --- | --- |
| `npm run dev` | اجرای Vite روی فرانت‌اند |
| `npm run dev:api` | اجرای API لوکال با watch |
| `npm run start:api` | اجرای API برای production |
| `npm run test:api` | تست‌های auth flow و PostgreSQL smoke |
| `npm run db:migrate:postgres` | مهاجرت داده SQLite به PostgreSQL |
| `npm run build` | build production فرانت‌اند |
| `npm run lint` | بررسی ESLint |
| `npm run preview` | preview خروجی Vite |

## 4. ساختار فایل‌ها

```text
public/
  font/              # فونت Doran
  icons/             # آیکون‌های خدمات
  images/            # تصاویر عمومی سایت
  videos/            # ویدئوی hero

server/
  config.js          # تنظیمات env و production guard
  db.js              # adapter مشترک SQLite/PostgreSQL
  index.js           # API server و static production server
  otpProvider.js     # ارسال OTP
  security.js        # hashing, cookies, token helpers
  validation.js      # اعتبارسنجی موبایل/OTP
  schema/postgres.sql
  migrate-sqlite-to-postgres.js

src/
  App.jsx            # route map و providerهای اصلی
  components/        # کامپوننت‌های reusable و ادمین
  context/           # Auth, Selection, Preferences
  data/              # داده‌های static و محتوای مشترک
  hooks/             # useCatalog, useJournal
  Pages/             # صفحات route-level
  utils/             # ابزارهای کوچک مثل authValidation
```

## 5. Routeهای فرانت‌اند

| مسیر | صفحه | توضیح |
| --- | --- | --- |
| `/` | `HomePage` | صفحه اصلی |
| `/collections` | `CollectionsPage` | صفحه کالکشن‌ها |
| `/collections/:collectionId` | `CollectionDetailPage` | جزئیات کالکشن |
| `/products` | `ProductsPage` | صفحه محصولات |
| `/products/:productId` | `ProductStoryPage` | صفحه داستان/جزئیات محصول |
| `/services` | `ServicesPage` | خدمات و اعتماد |
| `/our-world` | `OurWorldPage` | جهان دیدار |
| `/art-gallery` | `ArtGalleryPage` | آرت گالری |
| `/journal` | `JournalPage` | ژورنال |
| `/journal/:articleId` | `JournalArticlePage` | جزئیات مقاله |
| `/shop` | `ShopPage` | شاپ / انتخاب محصولات |
| `/contact` | `ContactPage` | تماس و رزرو مشاوره |
| `/login` | `LoginPage` | ورود OTP |
| `/wishlist` | `WishlistPage` | محافظت‌شده با auth |
| `/account` | `AccountPage` | محافظت‌شده با auth |
| `/selection` | `SelectionPage` | فهرست بررسی/انتخاب |
| `/admin` | `AdminPage` | محافظت‌شده با admin role |
| `*` | `NotFoundPage` | صفحه 404 |

تمام routeهای اصلی با `React.lazy` بارگذاری می‌شوند.

## 6. Providerها و stateهای اصلی

### `SitePreferencesProvider`

مسئول:

- زبان: `fa` / `en`
- جهت صفحه: `rtl` / `ltr`
- تم: `light` / `dark`
- ذخیره تنظیمات در `localStorage`

### `AuthProvider`

مسئول:

- بازیابی session از `/api/auth/me`
- درخواست OTP
- تایید OTP
- logout
- حالت demo فقط در dev و فقط اگر `VITE_AUTH_DEMO=true` باشد

### `SelectionProvider`

مسئول:

- wishlist کاربر لاگین‌شده از API
- selection local برای فهرست بررسی
- sync علاقه‌مندی‌ها با `/api/wishlist`
- ذخیره selection در `localStorage`

## 7. داده‌های static و CMS-ready

### داده‌های static فعلی

- `src/data/creationCatalog.js`
  - محصولات اولیه برای کارت‌ها، search، wishlist و selection
- `src/data/siteContent.js`
  - navigation مشترک
  - footer content

### Hookهای API-ready

- `src/hooks/useCatalog.js`
  - دریافت `product` یا `collection` از `/api/catalog`
- `src/hooks/useJournal.js`
  - دریافت مقالات از `/api/journal`

این ساختار اجازه می‌دهد در آینده بدون تغییر UI، داده‌ها از CMS/API واقعی جایگزین شوند.

## 8. دارایی‌ها و رسانه‌ها

### مسیرهای اصلی

- تصاویر: `/public/images/`
- ویدئوها: `/public/videos/`
- فونت‌ها: `/public/font/`
- آیکون‌ها: `/public/icons/`

### نمونه مسیرهای استفاده‌شده

- `/images/Collection-01.png`
- `/images/Product-01.png`
- `/images/brand-story.png`
- `/images/world-hero.webp`
- `/videos/hero.mp4`

### ویدئوی Hero

Hero video باید این ویژگی‌ها را حفظ کند:

- `autoPlay`
- `muted`
- `loop`
- `playsInline`
- `poster`

### ریسک Performance

چند تصویر مقاله بسیار سنگین هستند:

- `article-2.jpg` حدود 23MB
- `article-4.jpg` حدود 17MB
- `article-1.jpg` حدود 9.9MB
- `article-3.jpg` حدود 9.2MB

قبل از launch باید این تصاویر به WebP/AVIF responsive تبدیل شوند یا نسخه‌های کوچک‌تر برای وب ساخته شود.

## 9. APIها

Base path در توسعه از طریق Vite proxy:

```text
/api -> http://127.0.0.1:8787
```

### Health

| Method | Path | توضیح |
| --- | --- | --- |
| GET | `/api/health` | بررسی سلامت API |

### Auth

| Method | Path | توضیح |
| --- | --- | --- |
| POST | `/api/auth/request-otp` | درخواست OTP |
| POST | `/api/auth/verify-otp` | تایید OTP و ایجاد session |
| POST | `/api/auth/logout` | خروج |
| GET | `/api/auth/me` | دریافت کاربر فعلی |

### Wishlist

| Method | Path | توضیح |
| --- | --- | --- |
| GET | `/api/wishlist` | دریافت علاقه‌مندی‌های کاربر |
| PUT | `/api/wishlist` | جایگزینی لیست علاقه‌مندی‌ها |

### Public Content

| Method | Path | توضیح |
| --- | --- | --- |
| GET | `/api/content` | دریافت محتوای CMS برای route/locale |
| GET | `/api/catalog` | دریافت محصولات یا کالکشن‌ها |
| GET | `/api/journal` | دریافت مقالات ژورنال |
| POST | `/api/inquiries` | ثبت فرم تماس/درخواست |

### Admin

| Method | Path | نقش |
| --- | --- | --- |
| GET | `/api/admin/overview` | داشبورد ادمین |
| GET | `/api/admin/users` | مدیریت کاربران |
| PUT | `/api/admin/users/role` | تغییر نقش کاربر |
| GET | `/api/admin/sessions` | مشاهده sessionها |
| DELETE | `/api/admin/sessions` | حذف sessionها |
| GET | `/api/admin/audit` | audit log |
| GET | `/api/admin/system` | وضعیت سیستم |
| GET | `/api/admin/content` | CMS admin |
| PUT | `/api/admin/content` | ذخیره محتوا |
| DELETE | `/api/admin/content` | حذف محتوا |
| GET | `/api/admin/media` | لیست رسانه‌ها |
| POST | `/api/admin/media` | آپلود رسانه |
| GET | `/api/admin/catalog` | کاتالوگ admin |
| POST | `/api/admin/catalog` | ایجاد آیتم کاتالوگ |
| PUT | `/api/admin/catalog` | بروزرسانی آیتم |
| DELETE | `/api/admin/catalog` | حذف آیتم |
| GET | `/api/admin/journal` | مدیریت ژورنال |
| POST | `/api/admin/journal` | ایجاد مقاله |
| PUT | `/api/admin/journal` | بروزرسانی مقاله |
| DELETE | `/api/admin/journal` | حذف مقاله |
| GET | `/api/admin/inquiries` | inbox درخواست‌ها |
| PUT | `/api/admin/inquiries` | بروزرسانی وضعیت درخواست |

## 10. دیتابیس

پروژه دو حالت دیتابیس دارد:

- SQLite برای local development
- PostgreSQL برای production/Render

اگر `DATABASE_URL` تعریف شود، API به PostgreSQL وصل می‌شود. اگر تعریف نشود، SQLite از `DATABASE_PATH` استفاده می‌کند.

### جدول‌ها

| جدول | کاربرد |
| --- | --- |
| `users` | کاربران OTP و نقش‌ها |
| `otp_challenges` | درخواست‌های OTP |
| `sessions` | sessionهای HttpOnly |
| `wishlist_items` | علاقه‌مندی‌های کاربر |
| `audit_log` | رویدادهای امنیتی/ادمین |
| `cms_content` | محتوای قابل تغییر سایت |
| `media_assets` | رسانه‌های آپلودشده |
| `catalog_items` | محصولات و کالکشن‌ها |
| `journal_articles` | مقالات ژورنال |
| `inquiries` | فرم تماس و leadها |

### نقش‌های کاربر

| Role | کاربرد |
| --- | --- |
| `user` | کاربر عادی |
| `support` | پشتیبانی / inbox |
| `editor` | مدیریت محتوا |
| `admin` | دسترسی کامل |

## 11. احراز هویت و امنیت فعلی

### جریان OTP

1. کاربر موبایل را وارد می‌کند.
2. API یک OTP challenge ایجاد می‌کند.
3. کد OTP از طریق provider ارسال می‌شود.
4. بعد از تایید، session cookie ساخته می‌شود.
5. cookie با `HttpOnly`, `SameSite=Lax` و در production با `Secure` تنظیم می‌شود.

### Providerهای OTP

| Provider | کاربرد |
| --- | --- |
| `console` | فقط development |
| `http` | adapter عمومی SMS API |
| `payamsms` | اتصال PayamSMS REST |

در production، `OTP_PROVIDER=console` ممنوع است.

### نکات امنیتی موجود

- session tokenها در دیتابیس hash می‌شوند.
- IPها hash می‌شوند.
- secrets در production باید حداقل 32 کاراکتر باشند.
- OTP دارای TTL، cooldown و max attempts است.
- admin mobileها از env خوانده می‌شوند.

## 12. Environment Variables

### Frontend

| Key | کاربرد |
| --- | --- |
| `VITE_AUTH_API_URL` | مسیر API احراز هویت، معمولاً `/api/auth` |
| `VITE_AUTH_DEMO` | فعال‌سازی demo auth فقط برای توسعه |

### API / Database

| Key | کاربرد |
| --- | --- |
| `API_PORT` | پورت API لوکال |
| `PORT` | پورت production، مخصوص Render |
| `HOST` | host API |
| `DATABASE_PATH` | مسیر SQLite |
| `DATABASE_URL` | اتصال PostgreSQL |
| `DATABASE_SSL` | فعال‌سازی SSL برای Postgres |
| `DATABASE_POOL_MAX` | max connection pool |
| `DATABASE_SEED` | seed اولیه کاتالوگ/ژورنال |
| `APP_ORIGINS` | originهای مجاز development |
| `NODE_ENV` | `development` یا `production` |

### Auth / OTP

| Key | کاربرد |
| --- | --- |
| `AUTH_HASH_SECRET` | secret برای HMAC داده‌های حساس |
| `SESSION_SECRET` | secret برای hash session token |
| `OTP_PROVIDER` | `console`, `http`, `payamsms` |
| `OTP_TTL_SECONDS` | عمر OTP |
| `OTP_COOLDOWN_SECONDS` | فاصله درخواست مجدد |
| `OTP_MAX_ATTEMPTS` | تعداد تلاش مجاز |
| `SESSION_TTL_DAYS` | عمر session |
| `ADMIN_MOBILES` | موبایل‌های ادمین، comma-separated |

### PayamSMS

| Key | کاربرد |
| --- | --- |
| `PAYAMSMS_BASE_URL` | آدرس پایه سرویس |
| `PAYAMSMS_CLIENT_ID` | Client ID |
| `PAYAMSMS_CLIENT_SECRET` | Client Secret |
| `PAYAMSMS_SYSTEM_NAME` | System Name |
| `PAYAMSMS_USERNAME` | Username |
| `PAYAMSMS_PASSWORD` | Password |
| `PAYAMSMS_SENDER` | شماره فرستنده |
| `PAYAMSMS_BODY_TEMPLATE` | قالب متن OTP با `{code}` |

## 13. Render Deployment

فایل deployment:

```text
render.yaml
```

### Web Service

| مقدار | توضیح |
| --- | --- |
| name | `didar-gold` |
| runtime | Node |
| region | Frankfurt |
| plan | Free |
| branch | `main` |
| buildCommand | `npm ci && npm run build` |
| startCommand | `npm run start:api` |
| healthCheckPath | `/api/health` |

### Database

| مقدار | توضیح |
| --- | --- |
| name | `didar-gold-db` |
| databaseName | `didar_gold` |
| Postgres | 16 |
| region | Frankfurt |
| external access | بسته، `ipAllowList: []` |

### Render Blueprint URL

```text
https://dashboard.render.com/blueprint/new?repo=https://github.com/hakiminiaraha/didar-gold-website
```

## 14. SEO و Meta

### وضعیت فعلی

- `index.html` دارای `lang="fa"` و `dir="rtl"` است.
- meta description وجود دارد.
- Open Graph title/description/image وجود دارد.
- Twitter card وجود دارد.
- `robots.txt` فعلاً همه مسیرها را allow می‌کند.

### کارهای لازم قبل launch

- ایجاد `sitemap.xml`
- افزودن canonical URL بعد از مشخص شدن دامنه
- استفاده از absolute URL برای `og:image`
- بررسی دقیق H1 هر صفحه
- افزودن structured data برای Organization و Product در صفحات محصول
- ساخت meta title/description اختصاصی برای صفحات اصلی

## 15. Analytics و Marketing Tracking

در حال حاضر GA4/GTM واقعی وصل نشده است، چون Tracking ID و env مربوطه تعریف نشده‌اند.

### Eventهایی که باید آماده/وصل شوند

| Event | کاربرد |
| --- | --- |
| `click_hero_cta` | کلیک CTA هیرو |
| `click_collection_card` | کلیک کالکشن |
| `click_product_card` | کلیک محصول |
| `click_trust_card` | کلیک کارت اعتماد |
| `click_contact` | کلیک تماس |
| `click_reserve_appointment` | رزرو مشاوره |
| `scroll_50` | رسیدن به 50% صفحه |
| `scroll_90` | رسیدن به 90% صفحه |
| `submit_lead_form` | ارسال فرم lead |
| `download_catalog` | دانلود کاتالوگ |

### مقصدهای آینده

- GA4
- GTM
- Meta Pixel
- LinkedIn Insight Tag
- Microsoft Clarity

## 16. Sales / Lead Readiness

### مسیرهای فعلی فروش و lead

- Hero CTA به کالکشن‌ها
- CTA رزرو تجربه حضوری
- صفحه تماس
- فرم inquiry
- wishlist نیازمند OTP
- selection list برای بررسی محصولات
- پنل admin برای مشاهده inquiries

### Backendهای آینده موردنیاز

- appointment booking واقعی
- CRM customer profile
- product inquiry workflow
- inventory status
- sales pipeline
- sales dashboard
- analytics dashboard
- integration با WhatsApp/Telegram/SMS/call center

## 17. Accessibility

### وضعیت فعلی

- بسیاری از buttonها `aria-label` دارند.
- routeهای محافظت‌شده تجربه login دارند.
- رنگ‌های اصلی کنتراست قابل قبول دارند.
- فونت اختصاصی Doran با `font-display: swap` تعریف شده است.

### موارد لازم برای بهبود

- بررسی کامل keyboard navigation در mobile menu و search overlay
- focus ring یکپارچه برای button/link/input
- alt text دقیق‌تر برای تصاویر تزئینی و محصولی
- بررسی H1/H2 hierarchy در همه صفحات
- اطمینان از قابل خواندن بودن متن روی تصویر/ویدئو در هر دو theme

## 18. Performance / Lighthouse

### ریسک‌های اصلی

- چند تصویر مقاله بسیار سنگین هستند.
- تصاویر gallery/product در بعضی بخش‌ها باید lazy loading کامل‌تری داشته باشند.
- hero video باید نسخه فشرده production داشته باشد.
- برای تصویرهای بالا/پایین صفحه بهتر است responsive image یا WebP/AVIF استفاده شود.

### هدف Lighthouse

| بخش | هدف |
| --- | --- |
| Performance | 85+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 90+ |

### Checklist پیشنهادی

- optimize تصاویر بالای 500KB
- lazy load همه تصاویر غیر hero
- preload فونت اصلی در صورت نیاز
- بررسی contrast در dark/light
- اضافه کردن sitemap و canonical
- حذف dependencies بلااستفاده
- بررسی bundle size بعد از build

## 19. ریسک‌های امنیتی باقی‌مانده

| ریسک | وضعیت / اقدام لازم |
| --- | --- |
| فرم‌ها | نیازمند rate limit و anti-spam قوی‌تر در production |
| media upload | نیازمند محدودیت size، MIME واقعی، storage policy و scan |
| CMS content | محتوا باید text/plain بماند؛ HTML خام ممنوع مگر sanitization اضافه شود |
| OTP abuse | مانیتورینگ، rate limit بر اساس IP/mobile و alert لازم است |
| admin access | `ADMIN_MOBILES` باید فقط شماره‌های مالک/تیم باشد |
| secrets | همه secretها فقط در Render/env، نه در repo |
| external links | باید `rel="noopener noreferrer"` اضافه شود |
| logging | OTP و داده حساس نباید در production log شود |

## 20. وضعیت آماده‌سازی launch

### آماده است

- فرانت اصلی و صفحات برند
- احراز هویت OTP
- wishlist
- selection/review list
- CMS و media admin
- کاتالوگ admin/public
- ژورنال admin/public
- inquiries inbox
- SQLite local
- PostgreSQL schema و migration
- Render Blueprint

### قبل از launch باید انجام شود

- وارد کردن secretهای Render
- ساخت دیتابیس production
- تصمیم درباره seed یا migration
- تست OTP واقعی PayamSMS
- بهینه‌سازی تصاویر سنگین
- ساخت sitemap و canonical
- تست کامل موبایل
- تست کامل فرم تماس
- تعریف policy برای upload
- اتصال analytics با consent plan

## 21. مسیر پیشنهادی مرحله بعد

1. کامل کردن refactor سبک و تمیزکاری کد.
2. افزودن tracking utility بدون اتصال واقعی.
3. بهینه‌سازی metadata و SEO پایه.
4. فشرده‌سازی تصاویر سنگین.
5. تست production build.
6. دیپلوی Render.
7. ورود secretهای PayamSMS و admin.
8. تست OTP واقعی.
9. راه‌اندازی analytics و dashboard.
10. آماده‌سازی CRM/appointment backend.
