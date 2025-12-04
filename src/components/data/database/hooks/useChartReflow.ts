import { useEffect } from "react";
import type { RefObject } from "react";
import type HighchartsReact from "highcharts-react-official";

export function useChartReflow(
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  containerRef?: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    const triggerReflow = () => {
      if (!chart.container) return;
      chart.reflow();
      requestAnimationFrame(() => chart.reflow());
      setTimeout(() => chart.reflow(), 50);
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
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
