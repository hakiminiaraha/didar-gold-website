import { useEffect, useMemo, useState } from "react";

import { SitePreferencesContext } from "./SitePreferencesContext";

function getInitialPreference(key, queryKey, fallback) {
  if (typeof window === "undefined") return fallback;
  const queryValue = new URLSearchParams(window.location.search).get(queryKey);
  if (queryValue) return queryValue;
  return window.localStorage.getItem(key) || fallback;
}

export function SitePreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() => getInitialPreference("didar-language", "lang", "fa"));
  const [theme, setTheme] = useState(() => getInitialPreference("didar-theme", "theme", "light"));

  useEffect(() => {
    const direction = language === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("didar-language", language);
    window.localStorage.setItem("didar-theme", theme);
  }, [language, theme]);

  const value = useMemo(
    () => ({
      language,
      theme,
      direction: language === "fa" ? "rtl" : "ltr",
      setLanguage,
      setTheme,
      toggleLanguage: () => setLanguage((current) => (current === "fa" ? "en" : "fa")),
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [language, theme],
  );

  return (
    <SitePreferencesContext.Provider value={value}>
      {children}
    </SitePreferencesContext.Provider>
  );
}
