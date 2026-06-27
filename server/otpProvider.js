import { config } from "./config.js";

let payamSmsToken = null;
let payamSmsTokenExpiresAt = 0;

function payamSmsCredentials() {
  const values = {
    PAYAMSMS_CLIENT_ID: config.payamSmsClientId,
    PAYAMSMS_CLIENT_SECRET: config.payamSmsClientSecret,
    PAYAMSMS_SYSTEM_NAME: config.payamSmsSystemName,
    PAYAMSMS_USERNAME: config.payamSmsUsername,
    PAYAMSMS_PASSWORD: config.payamSmsPassword,
    PAYAMSMS_SENDER: config.payamSmsSender,
  };
  const missing = Object.entries(values).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Missing PayamSMS configuration: ${missing.join(", ")}`);
  return values;
}

async function readProviderResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`PayamSMS returned a non-JSON response (${response.status})`);
  }
}

async function getPayamSmsToken() {
  if (payamSmsToken && Date.now() < payamSmsTokenExpiresAt) return payamSmsToken;
  const credentials = payamSmsCredentials();
  const basic = Buffer.from(`${credentials.PAYAMSMS_CLIENT_ID}:${credentials.PAYAMSMS_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${config.payamSmsBaseUrl}/auth/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${basic}` },
    body: JSON.stringify({
      systemName: credentials.PAYAMSMS_SYSTEM_NAME,
      username: credentials.PAYAMSMS_USERNAME,
      password: credentials.PAYAMSMS_PASSWORD,
      scope: "webservice",
      grant_type: "password",
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await readProviderResponse(response);
  if (!response.ok || !payload?.access_token) throw new Error(`PayamSMS authentication failed (${response.status})`);
  payamSmsToken = payload.access_token;
  payamSmsTokenExpiresAt = Date.now() + Math.max(Number(payload.expires_in || 60) - 30, 1) * 1000;
  return payamSmsToken;
}

function internationalMobile(mobile) {
  return mobile.startsWith("0") ? `98${mobile.slice(1)}` : mobile;
}

async function sendWithPayamSms({ mobile, code }) {
  const credentials = payamSmsCredentials();
  const token = await getPayamSmsToken();
  const customerId = `didar-otp-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const response = await fetch(`${config.payamSmsBaseUrl}/panel/webservice/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify([{
      sender: credentials.PAYAMSMS_SENDER,
      recipient: internationalMobile(mobile),
      body: config.payamSmsBodyTemplate.replaceAll("{code}", code),
      customerId,
    }]),
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await readProviderResponse(response);
  if (!response.ok) throw new Error(`PayamSMS send failed (${response.status})`);
  const result = Array.isArray(payload) ? payload[0] : null;
  if (!result?.serverId) throw new Error(`PayamSMS rejected message (${result?.errorCode || "UNKNOWN"})`);
}

export async function sendOtp({ mobile, code }) {
  if (config.otpProvider === "console") {
    console.log(`[didar:otp] ${mobile} -> ${code}`);
    return;
  }

  if (config.otpProvider === "http") {
    if (!config.smsApiUrl || !config.smsApiKey) {
      throw new Error("SMS_API_URL and SMS_API_KEY are required for OTP_PROVIDER=http");
    }
    const response = await fetch(config.smsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.smsApiKey}`,
      },
      body: JSON.stringify({ mobile, code, template: config.smsTemplate }),
    });
    if (!response.ok) throw new Error(`SMS provider failed with status ${response.status}`);
    return;
  }

  if (config.otpProvider === "payamsms") {
    await sendWithPayamSms({ mobile, code });
    return;
  }

  throw new Error(`Unsupported OTP provider: ${config.otpProvider}`);
}
