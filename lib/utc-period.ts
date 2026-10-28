const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function utcMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

export function utcShiftedMonthKey(offset: number, date = new Date()) {
  return utcMonthKey(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1)),
  );
}

export function monthDateRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  return {
    from: `${month}-01`,
    to: `${month}-${pad(lastDay)}`,
  };
}

export function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-");
  const label = MONTH_LABELS[Number(monthIndex) - 1];
  return label ? `${label} ${year}` : month;
}

export function currentAndPreviousMonths(date = new Date()) {
  const thisMonth = utcMonthKey(date);
  const lastMonth = utcShiftedMonthKey(-1, date);
  return {
    thisMonth,
    lastMonth,
    monthsParam: `${thisMonth},${lastMonth}`,
  };
}

export function formatDayLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const label = MONTH_LABELS[month - 1];
  return label ? `${label} ${day}, ${year}` : value;
}

export function formatRangeLabel(from?: string, to?: string) {
  if (from && to) return `${formatDayLabel(from)} – ${formatDayLabel(to)}`;
  if (from) return `From ${formatDayLabel(from)}`;
  if (to) return `Until ${formatDayLabel(to)}`;
  return "All time";
}
