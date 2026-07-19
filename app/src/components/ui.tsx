import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`mb-4 rounded-2xl border border-ink/10 bg-surface p-5 shadow-sm dark:border-white/10 dark:shadow-none ${className}`}>
      {children}
    </section>
  );
}

export function Tag({ children, tone = "soft" }: { children: ReactNode; tone?: "soft" | "pick" | "sample" }) {
  const cls = {
    soft: "bg-accent-soft text-accent",
    pick: "bg-c4 text-white",
    sample: "bg-c3 text-white",
  }[tone];
  return <span className={`rounded-full px-2 py-px text-[0.7rem] font-semibold ${cls}`}>{children}</span>;
}

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const cls = {
    "계획중": "bg-accent-soft text-accent",
    "예약중": "bg-c3/20 text-c3 animate-pulse",
    "확정": "bg-c4/15 text-c4",
    "완료": "bg-page text-muted border border-hairline",
  }[status] ?? "bg-page text-muted";
  return <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${cls}`}>{status}</span>;
}

export function MapLink({ q, label = "📍 지도에서 보기" }: { q: string; label?: string }) {
  return (
    <a href={"https://map.naver.com/p/search/" + encodeURIComponent(q)} target="_blank" rel="noopener noreferrer"
      className="mt-1.5 inline-block rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-accent active:scale-95 transition">
      {label}
    </a>
  );
}
