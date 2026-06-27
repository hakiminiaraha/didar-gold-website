import { useEffect, useState } from "react";

export function useCatalog(type) {
  const [items, setItems] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/catalog?type=${type}`)
      .then((response) => {
        if (!response.ok) throw new Error("CATALOG_UNAVAILABLE");
        return response.json();
      })
      .then((data) => { if (active) { setItems(data.items || []); setLoaded(true); } })
      .catch(() => { if (active) { setAvailable(false); setLoaded(true); } });
    return () => { active = false; };
  }, [type]);

  return { items, available, loaded };
}
