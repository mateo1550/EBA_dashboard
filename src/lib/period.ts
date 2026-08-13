import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type PeriodFilter = "day" | "week" | "month" | "year";

export function getPeriodRange(date: Date, period: PeriodFilter) {
  if (period === "day") {
    return { start: startOfDay(date), end: endOfDay(date) };
  }

  if (period === "week") {
    // El negocio trabaja semanas de sábado a viernes.
    return {
      start: startOfWeek(date, { weekStartsOn: 6 }),
      end: endOfWeek(date, { weekStartsOn: 6 }),
    };
  }

  if (period === "year") {
    return {
      start: new Date(date.getFullYear(), 0, 1),
      end: new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999),
    };
  }

  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function getPeriodQueryKey(date: Date, period: PeriodFilter) {
  return `${period}-${format(date, period === "month" ? "yyyy-MM" : period === "year" ? "yyyy" : "yyyy-MM-dd")}`;
}
