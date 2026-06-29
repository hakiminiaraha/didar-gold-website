// One-time asset step. Re-encodes the hero video to a smaller H.264 mp4 with audio
// stripped (it autoplays muted). Re-run if the source video changes.
//
//   node scripts/optimize-video.mjs
//
// Note: a VP9 webm alternative was tried but came out larger than this H.264 mp4
// for this short clip, so mp4-only is served.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ffmpegPath from "ffmpeg-static";

const videoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "videos");
const input = path.join(videoDir, "hero.mp4");
const tmpMp4 = path.join(videoDir, "hero.opt.mp4");
const scale = "scale='min(1600,iw)':-2";

const before = fs.statSync(input).size;

console.log("encoding mp4 (H.264)…");
execFileSync(ffmpegPath, [
  "-y", "-i", input, "-vf", scale,
  "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-an", "-movflags", "+faststart", tmpMp4,
], { stdio: "inherit" });

fs.renameSync(tmpMp4, input);
const mp4After = fs.statSync(input).size;
console.log(`\nmp4: ${(before / 1024).toFixed(0)}KB -> ${(mp4After / 1024).toFixed(0)}KB`);
