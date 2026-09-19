import { useEffect, type RefObject } from "react";

// Closes a popover on outside click or Escape (mirrors Alpine's @click.outside / @keydown.escape).
// `panel` covers popovers rendered elsewhere (FloatingPanel portals them to <body>); `ignore` is a
// selector for other outside areas that must not close it (a menu holding nested field popovers).
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
  panel?: RefObject<HTMLElement | null>,
  ignore?: string,
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current || ref.current.contains(target) || panel?.current?.contains(target)) return;
      if (ignore && (target as Element).closest?.(ignore)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, panel, ignore, open, close]);
}
