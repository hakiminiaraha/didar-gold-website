import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useSitePreferences } from "../context/SitePreferencesContext";

const editableTextTags = new Set(["H1", "H2", "H3", "H4", "H5", "P", "SPAN", "A", "BUTTON", "LABEL", "LI", "SMALL", "STRONG", "TH", "TD", "FIGCAPTION"]);

// Only allow href values that cannot execute script (blocks javascript:, data:, vbscript:, etc.).
const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#|\?|mailto:|tel:)/i;

function elementPath(element) {
  const parts = [];
  let current = element;
  const root = document.getElementById("root");
  while (current && current !== root) {
    const tag = current.tagName.toLowerCase();
    const siblings = current.parentElement ? [...current.parentElement.children].filter((item) => item.tagName === current.tagName) : [];
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:${index}`);
    current = current.parentElement;
  }
  return parts.join("/");
}

function directTextNodes(element) {
  return [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
}

function inventoryPage() {
  const entries = [];
  const elements = document.querySelectorAll("#root h1, #root h2, #root h3, #root h4, #root h5, #root p, #root span, #root a, #root button, #root label, #root li, #root small, #root strong, #root th, #root td, #root figcaption, #root img, #root video, #root source");
  elements.forEach((element) => {
    if (element.closest("[data-cms-ignore]") || element.closest("[aria-hidden='true']")) return;
    const path = elementPath(element);
    if (editableTextTags.has(element.tagName)) {
      directTextNodes(element).forEach((node, index) => entries.push({
        contentKey: `${path}::text:${index}`,
        contentType: "text",
        value: node.nodeValue.trim(),
        label: `${element.tagName.toLowerCase()} · ${node.nodeValue.trim().slice(0, 55)}`,
      }));
    }
    if (element.tagName === "IMG") {
      entries.push({ contentKey: `${path}::image`, contentType: "image", value: element.getAttribute("src") || "", label: `تصویر · ${element.getAttribute("alt") || "بدون عنوان"}` });
      if (element.getAttribute("alt")) entries.push({ contentKey: `${path}::alt`, contentType: "alt", value: element.getAttribute("alt"), label: "متن جایگزین تصویر" });
    }
    if (element.tagName === "VIDEO") {
      if (element.getAttribute("src")) entries.push({ contentKey: `${path}::video`, contentType: "video", value: element.getAttribute("src"), label: "ویدئو" });
      if (element.getAttribute("poster")) entries.push({ contentKey: `${path}::poster`, contentType: "poster", value: element.getAttribute("poster"), label: "پوستر ویدئو" });
    }
    if (element.tagName === "SOURCE" && element.getAttribute("src")) entries.push({ contentKey: `${path}::video`, contentType: "video", value: element.getAttribute("src"), label: "فایل ویدئو" });
    if (element.tagName === "A" && element.getAttribute("href")) entries.push({ contentKey: `${path}::link`, contentType: "link", value: element.getAttribute("href"), label: `لینک · ${element.textContent.trim().slice(0, 45)}` });
  });
  return entries;
}

function findElement(path) {
  const root = document.getElementById("root");
  let current = root;
  for (const segment of path.split("/")) {
    const [tag, rawIndex] = segment.split(":");
    const matches = [...current.children].filter((item) => item.tagName.toLowerCase() === tag);
    current = matches[Number(rawIndex) - 1];
    if (!current) return null;
  }
  return current;
}

function applyEntry(entry) {
  const [path, suffix] = entry.contentKey.split("::");
  const element = findElement(path);
  if (!element) return;
  if (entry.contentType === "text") {
    const index = Number(suffix.split(":")[1]);
    const node = directTextNodes(element)[index];
    if (!node || node.nodeValue.trim() === entry.value) return;
    const leading = node.nodeValue.match(/^\s*/)?.[0] || "";
    const trailing = node.nodeValue.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${entry.value}${trailing}`;
  } else if (entry.contentType === "image" || entry.contentType === "video") {
    if (element.getAttribute("src") !== entry.value) {
      element.setAttribute("src", entry.value);
      if (element.tagName === "VIDEO") element.load();
    }
  } else if (entry.contentType === "poster" && element.getAttribute("poster") !== entry.value) element.setAttribute("poster", entry.value);
  else if (entry.contentType === "link" && SAFE_HREF.test(entry.value) && element.getAttribute("href") !== entry.value) element.setAttribute("href", entry.value);
  else if (entry.contentType === "alt" && element.getAttribute("alt") !== entry.value) element.setAttribute("alt", entry.value);
}

export default function CmsRuntime() {
  const location = useLocation();
  const { language } = useSitePreferences();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return undefined;
    let active = true;
    let entries = [];
    let timer;
    let observer;
    let highlighted;
    const editorMode = new URLSearchParams(location.search).get("cmsEditor") === "1";

    const applyAll = () => entries.forEach(applyEntry);
    const announceInventory = () => {
      if (!editorMode || window.parent === window) return;
      window.parent.postMessage({ type: "didar-cms-inventory", routePath: location.pathname, locale: language, entries: inventoryPage() }, window.location.origin);
    };
    // For ordinary visitors with no CMS overrides there is nothing to apply, so
    // skip the debounce timer and DOM work entirely (avoids per-render main-thread cost).
    const hasWork = () => editorMode || entries.length > 0;
    const schedule = () => {
      if (!hasWork()) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { applyAll(); announceInventory(); }, 250);
    };
    // Only observe the DOM when there is a reason to re-apply (editor mode, or real overrides exist).
    const ensureObserver = () => {
      if (observer || !hasWork()) return;
      const root = document.getElementById("root");
      if (!root) return;
      observer = new MutationObserver(schedule);
      observer.observe(root, { childList: true, subtree: true });
    };

    fetch(`/api/content?route=${encodeURIComponent(location.pathname)}&locale=${language}`)
      .then((response) => response.ok ? response.json() : { entries: [] })
      .then((data) => { if (active) { entries = data.entries || []; ensureObserver(); schedule(); } })
      .catch(() => {});

    const handleMessage = (event) => {
      if (event.origin === window.location.origin && event.data?.type === "didar-cms-request-inventory") announceInventory();
    };
    const handleEditorClick = (event) => {
      const element = event.target.closest("h1,h2,h3,h4,h5,p,span,a,button,label,li,small,strong,th,td,figcaption,img,video,source");
      if (!element || element.closest("[data-cms-ignore]")) return;
      event.preventDefault();
      event.stopPropagation();
      const path = elementPath(element);
      const entry = inventoryPage().find((item) => item.contentKey.startsWith(`${path}::`));
      if (entry) window.parent.postMessage({ type: "didar-cms-select", entry }, window.location.origin);
    };
    const handleEditorHover = (event) => {
      const element = event.target.closest("h1,h2,h3,h4,h5,p,span,a,button,label,li,small,strong,th,td,figcaption,img,video");
      if (!element || element === highlighted) return;
      if (highlighted) highlighted.style.outline = "";
      highlighted = element;
      highlighted.style.outline = "2px solid #B08A57";
      highlighted.style.outlineOffset = "3px";
    };

    // Editor-only interaction listeners are attached solely in editor mode.
    if (editorMode) {
      ensureObserver();
      window.addEventListener("message", handleMessage);
      document.addEventListener("click", handleEditorClick, true);
      document.addEventListener("mouseover", handleEditorHover, true);
    }

    return () => {
      active = false;
      if (observer) observer.disconnect();
      if (editorMode) {
        window.removeEventListener("message", handleMessage);
        document.removeEventListener("click", handleEditorClick, true);
        document.removeEventListener("mouseover", handleEditorHover, true);
      }
      if (highlighted) highlighted.style.outline = "";
      window.clearTimeout(timer);
    };
  }, [language, location.pathname, location.search]);

  return null;
}
