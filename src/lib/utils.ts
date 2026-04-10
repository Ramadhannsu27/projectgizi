import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInMonths, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Konversi ke WIB (UTC+7)
const WIB_TIMEZONE = "Asia/Jakarta";

function toWIB(date: string | Date): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(d, WIB_TIMEZONE);
}

export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
  return differenceInMonths(new Date(), birth);
}

export function calculateAgeYears(birthDate: string | Date): string {
  const months = calculateAge(birthDate);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} bulan`;
  if (remainingMonths === 0) return `${years} tahun`;
  return `${years} tahun ${remainingMonths} bulan`;
}

export function formatDate(date: string | Date, pattern = "dd MMMM yyyy"): string {
  const d = toWIB(date);
  return format(d, pattern, { locale: id });
}

export function formatShortDate(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy");
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd MMM yyyy, HH:mm");
}

export function formatTime(date: string | Date): string {
  return formatDate(date, "HH:mm");
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
}
