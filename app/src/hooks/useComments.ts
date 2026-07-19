import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, onSnapshot, orderBy, query, limit, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Comment } from "../types";

// 경로는 기존과 동일하게 유지 (기존 댓글 보존): trips/{planId}/comments
const colRef = (planId: string) => collection(db, "trips", planId, "comments");

export function useComments(planId: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const q = query(colRef(planId), orderBy("ts", "asc"), limit(300));
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment));
    });
  }, [planId]);

  const add = (c: Omit<Comment, "id">) => addDoc(colRef(planId), c);

  // 원댓글 삭제 시 달린 답글도 함께 (고아 답글 방지)
  const remove = async (id: string, replyIds: string[]) => {
    const batch = writeBatch(db);
    [id, ...replyIds].forEach((x) => batch.delete(doc(db, "trips", planId, "comments", x)));
    await batch.commit();
  };

  return { comments, add, remove };
}
