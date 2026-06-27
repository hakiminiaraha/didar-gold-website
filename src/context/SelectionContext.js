import { createContext, useContext } from "react";

export const SelectionContext = createContext(null);

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection must be used within SelectionProvider");
  return context;
}
