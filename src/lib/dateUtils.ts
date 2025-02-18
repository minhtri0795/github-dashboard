import { DateRange } from "react-day-picker";
import { DateFilterDto } from "../types/github";

export const normalizeDate = (date: Date) => {
  return new Date(date.toISOString().split('T')[0]);
};

export const validateDateRange = (range: DateRange): DateRange => {
  if (!range.from || !range.to) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return { from: startDate, to: endDate };
  }

  const startDate = normalizeDate(range.from);
  const endDate = normalizeDate(range.to);

  return {
    from: new Date(Math.min(startDate.getTime(), endDate.getTime())),
    to: new Date(Math.max(startDate.getTime(), endDate.getTime())),
  };
};

export const createDateFilter = (range: DateRange): DateFilterDto => {
  const validRange = validateDateRange(range);
  return {
    startDate: validRange.from.toISOString(),
    endDate: validRange.to.toISOString(),
  };
};
