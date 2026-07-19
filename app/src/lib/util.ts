import type { Plan } from "../types";

export const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

export const mapUrl = (q: string) =>
  "https://map.naver.com/p/search/" + encodeURIComponent(q);

export function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${"일월화수목금토"[d.getDay()]})`;
}

export function dateText(p: Plan): string {
  if (!p.startDate) return p.dateLabel || "날짜 미정";
  return p.endDate && p.endDate !== p.startDate
    ? `${fmtDate(p.startDate)} ~ ${fmtDate(p.endDate)}`
    : fmtDate(p.startDate);
}

export function ddayOf(p: Plan): string | null {
  if (!p.startDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(p.startDate + "T00:00:00");
  const end = new Date((p.endDate || p.startDate) + "T00:00:00");
  const diff = Math.round((start.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return "D-" + diff;
  if (today <= end) return "진행 중!";
  return "완료";
}

export const TYPE_COLORS: Record<string, string> = {
  "이동": "var(--color-c1)",
  "식사": "var(--color-c3)",
  "관광": "var(--color-c2)",
  "액티비티": "var(--color-c5)",
  "숙소": "var(--color-c4)",
  "카페": "var(--color-c6)",
};

export const fmtWhen = (ts?: number) =>
  ts ? new Date(ts).toLocaleString("ko-KR", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "";
