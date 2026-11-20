const TZ = "Asia/Bangkok";

const baht = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const bahtCompact = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  notation: "compact",
  maximumFractionDigits: 1,
});

const integer = new Intl.NumberFormat("th-TH");

export const formatBaht = (n: number) => baht.format(n);
export const formatBahtCompact = (n: number) => bahtCompact.format(n);
export const formatNumber = (n: number) => integer.format(n);

/** "20 พ.ย. 2569 18:54 น." */
export function formatDateTime(iso: string) {
  return (
    new Intl.DateTimeFormat("th-TH", {
      timeZone: TZ,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso)) + " น."
  );
}

/** "20 พ.ย. 18:54" (short, for table rows) */
export function formatShortDateTime(iso: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Chart dates are plain YYYY-MM-DD strings, already in Thai local time,
// so they are formatted as UTC to avoid shifting the day.

/** "20 พ.ย." */
export function formatDay(isoDate: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate));
}

/** "พ.ย. 69" */
export function formatMonth(isoDate: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  }).format(new Date(isoDate));
}

/** "พฤศจิกายน 2569" */
export function formatMonthLong(isoDate: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

/** "วันศุกร์ที่ 20 พฤศจิกายน 2569" */
export function formatDayLong(isoDate: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}
