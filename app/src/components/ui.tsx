import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mapUrl } from "../lib/util";

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

// 앱 안에서 바로 보는 지도 뷰어 (구글 임베드 — iframe 허용됨)
// 네이버 지도는 iframe을 정상 지원하지 않아 외부 열기 버튼으로 제공
export function MapLink({ q, label = "📍 지도 보기" }: { q: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="mt-1.5 inline-block rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-accent active:scale-95 transition">
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center"
            onClick={() => setOpen(false)}>
            <motion.div
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="w-full overflow-hidden rounded-t-2xl bg-surface sm:max-w-lg sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <b className="min-w-0 truncate text-sm">📍 {q}</b>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a href={mapUrl(q)} target="_blank" rel="noopener noreferrer"
                    className="rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-accent">네이버 지도 ↗</a>
                  <button onClick={() => setOpen(false)}
                    className="rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-muted">닫기</button>
                </div>
              </div>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=ko`}
                className="h-[58vh] w-full border-0" loading="lazy" title={q} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
