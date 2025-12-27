import { useEffect } from "react";

export function usePopulationEditScroll(enabled: boolean, options?: { offset?: number }) {
  useEffect(() => {
    if (!enabled) return;

    const yOffset = options?.offset ?? -120;
    let attempts = 0;
    let rafId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scrollToAnchor = () => {
      const anchor = document.getElementById("populacao-inicial");
      if (anchor) {
        const { top } = anchor.getBoundingClientRect();
        const offset = top + window.scrollY + yOffset;
        window.scrollTo({ top: offset, behavior: "smooth" });
        return;
      }

      if (attempts < 10) {
        attempts += 1;
        rafId = requestAnimationFrame(scrollToAnchor);
      } else {
        timeoutId = setTimeout(scrollToAnchor, 150);
      }
    };

    scrollToAnchor();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, options?.offset]);
}
