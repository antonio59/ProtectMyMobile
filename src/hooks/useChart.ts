'use client';

import { useEffect, useRef } from 'react';

export function useChartJS(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  buildChart: (Chart: any, ctx: CanvasRenderingContext2D) => any,
  deps: React.DependencyList
) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let instance: any;

    (async () => {
      const { default: Chart } = await import('chart.js/auto');
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      instance = buildChart(Chart, ctx);
      chartRef.current = instance;
    })();

    return () => {
      if (instance) instance.destroy();
      else if (chartRef.current) chartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return chartRef;
}
