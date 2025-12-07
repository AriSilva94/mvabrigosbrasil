import { useEffect } from "react";
import type { RefObject } from "react";
import type Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";

export function useChartReflow(
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  containerRef?: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const isChartDestroyed = () =>
      (chart as Highcharts.Chart & { destroyed?: boolean })?.destroyed;

    const triggerReflow = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);

      if (!chart.container || isChartDestroyed()) return;
      chart.reflow();

      // Run extra passes shortly after mount/resize to avoid layout glitches.
      rafId = requestAnimationFrame(() => {
        if (!chart.container || isChartDestroyed()) return;
        chart.reflow();
      });
      timeoutId = setTimeout(() => {
        if (!chart.container || isChartDestroyed()) return;
        chart.reflow();
      }, 50);
    };

    triggerReflow();

    const handleResize = () => triggerReflow();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    let observer: ResizeObserver | undefined;
    const containerEl = containerRef?.current;
    if (containerEl && "ResizeObserver" in window) {
      observer = new ResizeObserver(() => triggerReflow());
      observer.observe(containerEl);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
