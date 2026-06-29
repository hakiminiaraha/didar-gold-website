import { HttpError } from "./http-error.js";

export async function readJson(request, maxSize = 32 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxSize) throw new HttpError(413, "PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "INVALID_JSON");
  }
}

export async function readBinary(request, maxSize = 50 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxSize) throw new HttpError(413, "MEDIA_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!size) throw new HttpError(400, "EMPTY_MEDIA");
  return Buffer.concat(chunks);
}
