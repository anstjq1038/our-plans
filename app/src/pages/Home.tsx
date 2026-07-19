import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PLANS } from "../data/plans";
import { dateText, ddayOf } from "../lib/util";
import { StatusBadge, Tag } from "../components/ui";

export default function Home() {
  const [filter, setFilter] = useState("전체");
  const types = ["전체", ...new Set(PLANS.map((p) => p.type))];
  const list = filter === "전체" ? PLANS : PLANS.filter((p) => p.type === filter);
  const upcoming = PLANS
    .filter((p) => p.startDate && ddayOf(p)?.startsWith("D-"))
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-[calc(16px+env(safe-area-inset-top))]">
      <header className="px-1 py-6">
        <span className="rounded-full bg-c4/15 px-2.5 py-1 text-xs font-semibold text-c4">실시간 공유 중</span>
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-gradient-to-r from-ink from-30% to-accent bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          우리 계획
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mt-1 text-sm text-ink2">
          {upcoming
            ? `총 ${PLANS.length}개 · 가장 가까운 일정은 "${upcoming.title}" (${ddayOf(upcoming)})`
            : `총 ${PLANS.length}개의 계획`}
        </motion.p>
      </header>

      <nav className="mb-4 flex flex-wrap gap-1.5">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
              t === filter ? "border-accent bg-accent font-semibold text-white" : "border-hairline text-ink2"}`}>
            {t} ({t === "전체" ? PLANS.length : PLANS.filter((p) => p.type === t).length})
          </button>
        ))}
      </nav>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((p, i) => {
          const dd = ddayOf(p);
          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }}>
              <Link to={`/p/${encodeURIComponent(p.id)}`}
                className="block rounded-2xl border border-ink/10 bg-surface p-4.5 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:shadow-none">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-3xl leading-none">{p.emoji || "🗓️"}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-lg font-bold tracking-tight">
                  {p.title}{p.isSample && <Tag tone="sample">예시</Tag>}
                </div>
                <div className="mt-1 text-[0.83rem] text-ink2">{p.summary}</div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-2.5">
                  <span className="text-[0.8rem] text-ink2">{dateText(p)}</span>
                  {dd && <span className="text-sm font-bold text-accent">{dd}</span>}
                </div>
                <div className="mt-1 text-xs text-muted">{(p.members || []).join(", ")}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        새 여행이나 모임을 추가하고 싶으면 Claude에게 말씀하세요.
      </p>
      <footer className="mt-7 text-center text-xs text-muted">Claude Code 플래너 에이전트가 관리합니다 🗓️</footer>
    </div>
  );
}
