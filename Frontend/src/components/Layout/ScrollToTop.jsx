import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets window scroll to (0, 0) on every route change. React Router v6
 * preserves scroll position by default, which feels broken when you click
 * into a movie detail page and land halfway down. If a hash is present
 * (#showtimes etc), we leave scroll alone so anchor jumps still work.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
