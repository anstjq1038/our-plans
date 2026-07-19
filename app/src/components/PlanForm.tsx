import { useState } from "react";
import { motion } from "framer-motion";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Plan } from "../types";

const EMOJIS = ["🏝️", "🌊", "⛰️", "🎿", "🍻", "🎂", "⚽", "🎮", "🎤", "🗓️"];

// 계획 추가/수정 바텀시트 (로그인 필수)
export function PlanForm({ initial, onClose, onSaved }: {
  initial?: Plan;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { user } = useAuth();
  const [type, setType] = useState<"여행" | "모임">(initial?.type ?? "여행");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🏝️");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [status, setStatus] = useState(initial?.status ?? "계획중");
  const [members, setMembers] = useState((initial?.members ?? []).join(", "));
  const [noDate, setNoDate] = useState(!initial?.startDate);
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [dateLabel, setDateLabel] = useState(initial?.dateLabel ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!user) { alert("로그인이 필요해요!"); return; }
    if (!title.trim()) { alert("제목을 입력해주세요!"); return; }
    if (!noDate && !startDate) { alert("날짜를 고르거나 '미정'을 선택해주세요!"); return; }
    setBusy(true);
    const data = {
      type, emoji, title: title.trim(), summary: summary.trim(), status,
      members: members.split(",").map((s) => s.trim()).filter(Boolean),
      startDate: noDate ? null : startDate,
      endDate: noDate ? null : (endDate || startDate),
      dateLabel: noDate ? (dateLabel.trim() || "날짜 미정") : "",
      memo: memo.trim(),
    };
    try {
      if (initial) {
        await updateDoc(doc(db, "plans", initial.id), data);
        onSaved(initial.id);
      } else {
        const ref = await addDoc(collection(db, "plans"), { ...data, uid: user.uid, ts: Date.now() });
        onSaved(ref.id);
      }
    } catch (e: any) {
      alert("저장 실패: " + e.message);
    } finally { setBusy(false); }
  };

  const input = "w-full rounded-xl border border-hairline bg-page px-3.5 py-3 outline-none focus:ring-2 focus:ring-accent";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onPointerDownCapture={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}>
      <motion.div
        initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 pb-[calc(20px+env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold">{initial ? "계획 수정" : "새 계획 만들기"}</h2>

        <div className="mb-3 flex gap-1.5">
          {(["여행", "모임"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition active:scale-95 ${
                type === t ? "border-accent bg-accent text-white" : "border-hairline text-ink2"}`}>
              {t === "여행" ? "✈️ 여행" : "🍻 모임"}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`h-10 w-10 rounded-xl text-xl transition active:scale-90 ${
                emoji === e ? "bg-accent-soft ring-2 ring-accent" : "bg-page"}`}>{e}</button>
          ))}
        </div>

        <div className="grid gap-2.5">
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목 (예: 부산 1박2일)" maxLength={30} />
          <input className={input} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="한 줄 설명 (선택)" maxLength={60} />
          <input className={input} value={members} onChange={(e) => setMembers(e.target.value)} placeholder="멤버 (쉼표로 구분: 문섭, 지웅, 수용)" />

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={noDate} onChange={(e) => setNoDate(e.target.checked)} className="h-4 w-4 accent-accent" />
              날짜 미정
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Plan["status"] & string)}
              className="ml-auto rounded-xl border border-hairline bg-page px-3 py-2 text-sm outline-none">
              {["계획중", "예약중", "확정", "완료"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {noDate ? (
            <input className={input} value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} placeholder="시기 메모 (예: 12월 중 조율)" />
          ) : (
            <div className="flex items-center gap-2">
              <input type="date" className={input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="text-muted">~</span>
              <input type="date" className={input} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          )}

          <textarea className={input} rows={3} value={memo} onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 (선택) — 장소 아이디어, 하고 싶은 것 등" />
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-hairline py-3 text-sm font-semibold text-ink2 active:scale-95 transition">취소</button>
          <button onClick={save} disabled={busy}
            className="flex-[2] rounded-xl bg-accent py-3 text-sm font-bold text-white active:scale-95 transition disabled:opacity-50">
            {busy ? "저장 중…" : initial ? "수정하기" : "만들기"}
          </button>
        </div>
        <p className="mt-3 text-center text-[0.7rem] text-muted">
          만들면 친구들도 바로 보여요. 상세 일정·조사가 필요하면 Claude에게 말씀하세요!
        </p>
      </motion.div>
    </motion.div>
  );
}
