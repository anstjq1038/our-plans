import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { dateText, ddayOf } from "../lib/util";
import { StatusBadge, Tag } from "../components/ui";
import { PlanForm } from "../components/PlanForm";
import { usePlans } from "../hooks/usePlans";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const [filter, setFilter] = useState("전체");
  const [formOpen, setFormOpen] = useState(false);
  const { plans } = usePlans();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const types = ["전체", ...new Set(plans.map((p) => p.type))];
  const list = filter === "전체" ? plans : plans.filter((p) => p.type === filter);
  const upcoming = plans
    .filter((p) => p.startDate && ddayOf(p)?.startsWith("D-"))
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];

  const openForm = async () => {
    if (!user) {
      if (confirm("계획을 만들려면 Google 로그인이 필요해요. 로그인할까요?")) await login();
      return;
    }
    setFormOpen(true);
  };

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
            ? `총 ${plans.length}개 · 가장 가까운 일정은 "${upcoming.title}" (${ddayOf(upcoming)})`
            : `총 ${plans.length}개의 계획`}
        </motion.p>
      </header>

      <nav className="mb-4 flex flex-wrap gap-1.5">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
              t === filter ? "border-accent bg-accent font-semibold text-white" : "border-hairline text-ink2"}`}>
            {t} ({t === "전체" ? plans.length : plans.filter((p) => p.type === t).length})
          </button>
        ))}
      </nav>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((p, i) => {
          const dd = ddayOf(p);
          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.07, 0.5) }}
              whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }}>
              <Link to={`/p/${encodeURIComponent(p.id)}`}
                className="block rounded-2xl border border-ink/10 bg-surface p-4.5 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:shadow-none">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-3xl leading-none">{p.emoji || "🗓️"}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-lg font-bold tracking-tight">
                  {p.title}
                  {p.isSample && <Tag tone="sample">예시</Tag>}
                  {p.isUser && <Tag>직접 추가</Tag>}
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
        오른쪽 아래 + 버튼으로 직접 추가하거나, 자세한 조사·일정은 Claude에게 맡기세요.
      </p>
      <footer className="mt-7 text-center text-xs text-muted">Claude Code 플래너 에이전트가 관리합니다 🗓️</footer>

      {/* 새 계획 추가 (로그인 필수) */}
      <motion.button onClick={openForm} whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
        className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light text-white shadow-lg shadow-accent/40">
        +
      </motion.button>

      <AnimatePresence>
        {formOpen && (
          <PlanForm onClose={() => setFormOpen(false)}
            onSaved={(id) => { setFormOpen(false); navigate(`/p/${id}`); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
