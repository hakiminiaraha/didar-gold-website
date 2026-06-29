import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, test } from "node:test";

process.env.API_PORT = "0";
process.env.DATABASE_PATH = ":memory:";
process.env.NODE_ENV = "test";
process.env.OTP_PROVIDER = "console";
process.env.AUTH_HASH_SECRET = "test-auth-hash-secret-with-more-than-32-characters";
process.env.SESSION_SECRET = "test-session-secret-with-more-than-32-characters";
process.env.ADMIN_MOBILES = "09120000000";

const { server } = await import("../index.js");
const { db } = await import("../db.js");
const { config } = await import("../config.js");
const { sendOtp } = await import("../otpProvider.js");

if (!server.listening) await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await db.close();
});

test("OTP creates a session and protects server-side wishlist", async () => {
  const requestResponse = await fetch(`${baseUrl}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: "09123456789" }),
  });
  assert.equal(requestResponse.status, 200);
  const challenge = await requestResponse.json();
  assert.equal(challenge.demoCode, "123456");

  const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: challenge.mobile, challengeId: challenge.challengeId, code: challenge.demoCode }),
  });
  assert.equal(verifyResponse.status, 200);
  const user = await verifyResponse.json();
  assert.equal(user.mobileMasked, "0912***6789");
  const cookie = verifyResponse.headers.get("set-cookie").split(";")[0];
  assert.match(cookie, /^didar_session=/);

  const saveResponse = await fetch(`${baseUrl}/api/wishlist`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ items: ["atrin-necklace", "mahtab-ring"] }),
  });
  assert.equal(saveResponse.status, 200);

  const wishlistResponse = await fetch(`${baseUrl}/api/wishlist`, { headers: { Cookie: cookie } });
  assert.equal(wishlistResponse.status, 200);
  assert.deepEqual((await wishlistResponse.json()).items, ["atrin-necklace", "mahtab-ring"]);

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie } });
  assert.equal(logoutResponse.status, 200);

  const rejectedResponse = await fetch(`${baseUrl}/api/wishlist`, { headers: { Cookie: cookie } });
  assert.equal(rejectedResponse.status, 401);
});

test("health check reports service identity", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: "didar-api" });
});

test("invalid mobile is rejected before issuing OTP", async () => {
  const response = await fetch(`${baseUrl}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: "12345" }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "INVALID_MOBILE");
});

async function login(mobile) {
  const requestResponse = await fetch(`${baseUrl}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  const challenge = await requestResponse.json();
  const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, challengeId: challenge.challengeId, code: challenge.demoCode }),
  });
  return {
    response: verifyResponse,
    cookie: verifyResponse.headers.get("set-cookie")?.split(";")[0],
    user: await verifyResponse.json(),
  };
}

async function freshLogin(mobile) {
  await db.prepare("DELETE FROM otp_challenges WHERE mobile = ?").run(mobile);
  return login(mobile);
}

test("admin endpoints reject members and expose operational data to admins", async () => {
  const member = await login("09121111111");
  assert.equal(member.user.role, "user");
  const forbidden = await fetch(`${baseUrl}/api/admin/overview`, { headers: { Cookie: member.cookie } });
  assert.equal(forbidden.status, 403);

  const admin = await login("09120000000");
  assert.equal(admin.user.role, "admin");

  for (const endpoint of ["overview", "users", "audit", "system"]) {
    const response = await fetch(`${baseUrl}/api/admin/${endpoint}`, { headers: { Cookie: admin.cookie } });
    assert.equal(response.status, 200, `${endpoint} should be available to admins`);
  }

  const usersResponse = await fetch(`${baseUrl}/api/admin/users?query=0912`, { headers: { Cookie: admin.cookie } });
  const usersBody = await usersResponse.json();
  assert.ok(usersBody.users.length >= 2);
  assert.ok(usersBody.users.every((user) => !Object.hasOwn(user, "mobile")));

  const contentEntry = { contentKey: "main:1/h1:1::text:0", contentType: "text", value: "عنوان منتشرشده" };
  const saveContent = await fetch(`${baseUrl}/api/admin/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ routePath: "/", locale: "fa", entries: [contentEntry] }),
  });
  assert.equal(saveContent.status, 200);
  const publicContent = await fetch(`${baseUrl}/api/content?route=%2F&locale=fa`);
  assert.deepEqual((await publicContent.json()).entries[0].value, contentEntry.value);

  const deleteContent = await fetch(`${baseUrl}/api/admin/content`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ routePath: "/", locale: "fa", contentKey: contentEntry.contentKey, contentType: contentEntry.contentType }),
  });
  assert.equal(deleteContent.status, 200);
  const afterDelete = await fetch(`${baseUrl}/api/content?route=%2F&locale=fa`);
  assert.equal((await afterDelete.json()).entries.length, 0);

  const pngBytes = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from("didar-test-image")]);
  const upload = await fetch(`${baseUrl}/api/admin/media`, {
    method: "POST",
    headers: { "Content-Type": "image/png", "X-File-Name": "cms-test.png", Cookie: admin.cookie },
    body: pngBytes,
  });
  assert.equal(upload.status, 201);

  const rejectedUpload = await fetch(`${baseUrl}/api/admin/media`, {
    method: "POST",
    headers: { "Content-Type": "image/png", "X-File-Name": "evil.png", Cookie: admin.cookie },
    body: Buffer.from("<svg onload=alert(1)></svg>"),
  });
  assert.equal(rejectedUpload.status, 415);
  const uploadedAsset = await upload.json();
  assert.match(uploadedAsset.publicUrl, /^\/uploads\//);

  const mediaList = await fetch(`${baseUrl}/api/admin/media`, { headers: { Cookie: admin.cookie } });
  assert.equal(mediaList.status, 200);
  assert.ok((await mediaList.json()).assets.some((asset) => asset.publicUrl === uploadedAsset.publicUrl));

  fs.unlinkSync(path.resolve("public", uploadedAsset.publicUrl.replace(/^\//, "")));

  const catalogDraft = {
    type: "product",
    slug: "api-test-ring",
    status: "draft",
    sortOrder: 999,
    data: { image: "/images/didar-ui/product-03.jpg", name: { fa: "حلقه تست", en: "Test Ring" }, category: "rings" },
  };
  const createCatalog = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify(catalogDraft),
  });
  assert.equal(createCatalog.status, 201);
  const createdItem = await createCatalog.json();
  const draftPublicList = await fetch(`${baseUrl}/api/catalog?type=product`);
  assert.ok(!(await draftPublicList.json()).items.some((item) => item.slug === catalogDraft.slug));

  const publishCatalog = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ ...createdItem, status: "published" }),
  });
  assert.equal(publishCatalog.status, 200);
  const publishedItem = await fetch(`${baseUrl}/api/catalog?type=product&slug=${catalogDraft.slug}`);
  assert.equal(publishedItem.status, 200);
  assert.equal((await publishedItem.json()).data.name.en, "Test Ring");

  const deleteCatalog = await fetch(`${baseUrl}/api/admin/catalog`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ id: createdItem.id }),
  });
  assert.equal(deleteCatalog.status, 200);

  const articleDraft = {
    slug: "api-test-article", status: "draft", sortOrder: 999, featured: false,
    category: "design", pillar: "Test", image: "/images/brand-story.png", dateLabel: "۱۴۰۴/۰۴/۰۱",
    readLabel: { fa: "۲ دقیقه", en: "2 min read" },
    content: {
      fa: { title: "مقاله تست", excerpt: "خلاصه", kicker: "تست", lead: "لید", quote: "نقل قول", sections: [["بخش", "متن"]] },
      en: { title: "Test article", excerpt: "Excerpt", kicker: "Test", lead: "Lead", quote: "Quote", sections: [["Section", "Body"]] },
    },
  };
  const createArticle = await fetch(`${baseUrl}/api/admin/journal`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: admin.cookie }, body: JSON.stringify(articleDraft) });
  assert.equal(createArticle.status, 201);
  const createdArticle = await createArticle.json();
  const adminJournalList = await fetch(`${baseUrl}/api/admin/journal`, { headers: { Cookie: admin.cookie } });
  assert.equal(adminJournalList.status, 200);
  assert.ok((await adminJournalList.json()).articles.some((article) => article.slug === articleDraft.slug));
  assert.equal((await fetch(`${baseUrl}/api/journal?slug=${articleDraft.slug}`)).status, 404);
  const publishArticle = await fetch(`${baseUrl}/api/admin/journal`, { method: "PUT", headers: { "Content-Type": "application/json", Cookie: admin.cookie }, body: JSON.stringify({ ...createdArticle, status: "published" }) });
  assert.equal(publishArticle.status, 200);
  const publicArticle = await fetch(`${baseUrl}/api/journal?slug=${articleDraft.slug}`);
  assert.equal(publicArticle.status, 200);
  assert.equal((await publicArticle.json()).content.en.title, "Test article");
  const deleteArticle = await fetch(`${baseUrl}/api/admin/journal`, { method: "DELETE", headers: { "Content-Type": "application/json", Cookie: admin.cookie }, body: JSON.stringify({ id: createdArticle.id }) });
  assert.equal(deleteArticle.status, 200);

  const inquiryResponse = await fetch(`${baseUrl}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "private", name: "کاربر تست", contact: "09125555555", channel: "تماس تلفنی", date: "2026-07-01", message: "درخواست مشاهده", locale: "fa" }),
  });
  assert.equal(inquiryResponse.status, 201);
  assert.match((await inquiryResponse.json()).referenceCode, /^DIDAR-/);
  assert.equal((await fetch(`${baseUrl}/api/admin/inquiries`)).status, 401);
  const inquiryList = await fetch(`${baseUrl}/api/admin/inquiries`, { headers: { Cookie: admin.cookie } });
  const inquiry = (await inquiryList.json()).inquiries[0];
  assert.equal(inquiry.contact, "09125555555");
  const updateInquiry = await fetch(`${baseUrl}/api/admin/inquiries`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ id: inquiry.id, status: "contacted", internalNote: "تماس انجام شد" }),
  });
  assert.equal(updateInquiry.status, 200);
  assert.equal((await updateInquiry.json()).status, "contacted");
});

test("role permissions and session revocation are enforced", async () => {
  const admin = await freshLogin("09120000000");
  const staffMobile = "09123334444";
  const member = await freshLogin(staffMobile);
  assert.equal(member.user.role, "user");

  const promoteEditor = await fetch(`${baseUrl}/api/admin/users/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ userId: member.user.id, role: "editor" }),
  });
  assert.equal(promoteEditor.status, 200);
  assert.equal((await promoteEditor.json()).role, "editor");

  const revokedMember = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: member.cookie } });
  assert.equal(await revokedMember.json(), null);

  const editor = await freshLogin(staffMobile);
  assert.equal(editor.user.role, "editor");
  assert.ok(editor.user.permissions.includes("content"));
  assert.equal((await fetch(`${baseUrl}/api/admin/catalog`, { headers: { Cookie: editor.cookie } })).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/admin/inquiries`, { headers: { Cookie: editor.cookie } })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/admin/users`, { headers: { Cookie: editor.cookie } })).status, 403);

  const promoteSupport = await fetch(`${baseUrl}/api/admin/users/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ userId: editor.user.id, role: "support" }),
  });
  assert.equal(promoteSupport.status, 200);
  const support = await freshLogin(staffMobile);
  assert.equal(support.user.role, "support");
  assert.equal((await fetch(`${baseUrl}/api/admin/inquiries`, { headers: { Cookie: support.cookie } })).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/admin/content?route=%2F&locale=fa`, { headers: { Cookie: support.cookie } })).status, 403);

  const sessionsResponse = await fetch(`${baseUrl}/api/admin/sessions?userId=${support.user.id}`, { headers: { Cookie: admin.cookie } });
  assert.equal(sessionsResponse.status, 200);
  assert.ok((await sessionsResponse.json()).sessions.length >= 1);
  const revokeResponse = await fetch(`${baseUrl}/api/admin/sessions`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ userId: support.user.id }),
  });
  assert.equal(revokeResponse.status, 200);
  assert.ok((await revokeResponse.json()).revoked >= 1);
  assert.equal(await (await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: support.cookie } })).json(), null);

  const selfDemotion = await fetch(`${baseUrl}/api/admin/users/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ userId: admin.user.id, role: "user" }),
  });
  assert.equal(selfDemotion.status, 409);
  assert.equal((await selfDemotion.json()).error, "CANNOT_DEMOTE_SELF");
});

test("PayamSMS provider authenticates, caches its token, and validates send results", async () => {
  const previousFetch = globalThis.fetch;
  const previousConfig = {
    otpProvider: config.otpProvider,
    payamSmsBaseUrl: config.payamSmsBaseUrl,
    payamSmsClientId: config.payamSmsClientId,
    payamSmsClientSecret: config.payamSmsClientSecret,
    payamSmsSystemName: config.payamSmsSystemName,
    payamSmsUsername: config.payamSmsUsername,
    payamSmsPassword: config.payamSmsPassword,
    payamSmsSender: config.payamSmsSender,
    payamSmsBodyTemplate: config.payamSmsBodyTemplate,
  };
  Object.assign(config, {
    otpProvider: "payamsms",
    payamSmsBaseUrl: "https://www.payamsms.com",
    payamSmsClientId: "client-id",
    payamSmsClientSecret: "client-secret",
    payamSmsSystemName: "didar",
    payamSmsUsername: "api-user",
    payamSmsPassword: "api-password",
    payamSmsSender: "9820001234",
    payamSmsBodyTemplate: "کد ورود دیدار: {code}",
  });

  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/auth/oauth/token")) {
      return new Response(JSON.stringify({ access_token: "access-token", expires_in: 3600 }), { status: 200 });
    }
    return new Response(JSON.stringify([{ customerId: "didar-otp", mobile: "989123456789", serverId: "server-id" }]), { status: 200 });
  };

  try {
    await sendOtp({ mobile: "09123456789", code: "654321" });
    await sendOtp({ mobile: "09123456789", code: "123456" });
    assert.equal(calls.filter((call) => call.url.endsWith("/auth/oauth/token")).length, 1);
    assert.equal(calls.filter((call) => call.url.endsWith("/panel/webservice/send")).length, 2);
    assert.equal(calls[0].options.headers.Authorization, `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`);
    const sendBody = JSON.parse(calls[1].options.body)[0];
    assert.equal(sendBody.sender, "9820001234");
    assert.equal(sendBody.recipient, "989123456789");
    assert.equal(sendBody.body, "کد ورود دیدار: 654321");
    assert.match(sendBody.customerId, /^didar-otp-/);

    globalThis.fetch = async () => new Response(JSON.stringify([{ errorCode: "E800", description: "blacklist" }]), { status: 200 });
    await assert.rejects(() => sendOtp({ mobile: "09123456789", code: "111111" }), /E800/);
  } finally {
    globalThis.fetch = previousFetch;
    Object.assign(config, previousConfig);
  }
});
