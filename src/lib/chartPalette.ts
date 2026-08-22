// Shared chart palette — muted editorial system (warm paper / ink / alert red).
// Single source for all dashboard + statistics charts.

export const CHART_SERIES_COLORS = [
  '#16130f', // ink
  '#c8322b', // alert red
  '#2f6b4f', // deep green
  '#9a4f00', // amber
  '#6b6459', // warm grey
  '#e0685f', // soft red
  '#8a7a54', // bronze
  '#58524a', // slate ink
  '#a39b8d', // stone
  '#453f36', // umber
];

export const CHART_KEY_COLORS = {
  red: '#c8322b',
  orange: '#9a4f00',
  blue: '#16130f',
  green: '#2f6b4f',
  purple: '#58524a',
  teal: '#6b6459',
  pink: '#e0685f',
  cyan: '#a39b8d',
};

export const CHART_BODY_COLOR = '#6b6459'; // muted-foreground

// Shared Chart.js option fragments — same light tooltip card, dashed grid and
// small grey ticks everywhere.
export const CHART_TOOLTIP_BASE = {
  backgroundColor: 'rgba(255,255,255,0.95)',
  titleColor: '#1f2937',
  bodyColor: CHART_BODY_COLOR,
  borderColor: '#e5e7eb',
  borderWidth: 1,
};

export const CHART_TICKS = { font: { size: 10 }, color: '#6b7280' };
export const CHART_GRID = { color: '#e5e7eb', borderDash: [3, 3] };
