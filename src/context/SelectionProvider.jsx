import { useEffect, useMemo, useState } from "react";

import { useAuth } from "./AuthContext";
import { SelectionContext } from "./SelectionContext";

function readStoredList(key) {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function saveWishlist(items) {
  const response = await fetch("/api/wishlist", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) throw new Error("WISHLIST_SAVE_FAILED");
  return response.json();
}

export function SelectionProvider({ children }) {
  const { user } = useAuth();
  const [serverWishlist, setServerWishlist] = useState({ ownerId: null, items: [] });
  const [wishlistError, setWishlistError] = useState("");
  const [selection, setSelection] = useState(() => readStoredList("didar-selection"));
  const wishlist = useMemo(
    () => user && serverWishlist.ownerId === user.id ? serverWishlist.items : [],
    [serverWishlist, user],
  );

  useEffect(() => {
    if (!user) return undefined;
    const controller = new AbortController();
    fetch("/api/wishlist", { credentials: "include", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("WISHLIST_LOAD_FAILED");
        return response.json();
      })
      .then((data) => {
        setServerWishlist({ ownerId: user.id, items: Array.isArray(data.items) ? data.items : [] });
        setWishlistError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setWishlistError(error.message);
      });
    return () => controller.abort();
  }, [user]);

  useEffect(() => window.localStorage.setItem("didar-selection", JSON.stringify(selection)), [selection]);

  const value = useMemo(() => ({
    wishlist,
    wishlistError,
    selection,
    isWishlisted: (id) => wishlist.includes(id),
    isSelected: (id) => selection.includes(id),
    toggleWishlist: (id) => {
      if (!user) return false;
      const previous = wishlist;
      const next = previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id];
      setServerWishlist({ ownerId: user.id, items: next });
      setWishlistError("");
      saveWishlist(next).catch((error) => {
        setServerWishlist({ ownerId: user.id, items: previous });
        setWishlistError(error.message);
      });
      return true;
    },
    addSelection: (id) => setSelection((items) => items.includes(id) ? items : [...items, id]),
    removeSelection: (id) => setSelection((items) => items.filter((item) => item !== id)),
    clearSelection: () => setSelection([]),
  }), [selection, user, wishlist, wishlistError]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}
