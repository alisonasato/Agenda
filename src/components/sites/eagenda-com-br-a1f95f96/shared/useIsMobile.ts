import { useEffect, useState } from "react";

/**
 * The original swaps markup in JS at md (768px) instead of toggling it with CSS.
 * Doing the same avoids relying on responsive utilities, which the site's own
 * compiled `.hidden` rule would override.
 */
export function useIsMobile(query = "(max-width: 767px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return isMobile;
}
