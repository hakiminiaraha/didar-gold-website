import { createContext, useContext } from "react";

export const SitePreferencesContext = createContext(null);

export function useSitePreferences() {
  const context = useContext(SitePreferencesContext);

  if (!context) {
    throw new Error("useSitePreferences must be used inside SitePreferencesProvider");
  }

  return context;
}
