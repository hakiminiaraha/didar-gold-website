import { useEffect, useState } from "react";

export function useJournal() {
  const [articles, setArticles] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/journal")
      .then((response) => response.ok ? response.json() : { articles: [] })
      .then((data) => { if (active) { setArticles(data.articles || []); setLoaded(true); } })
      .catch(() => { if (active) { setAvailable(false); setLoaded(true); } });
    return () => { active = false; };
  }, []);

  return { articles, available, loaded };
}
