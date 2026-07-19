import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Plan } from "../types";
import { PLANS } from "../data/plans";

// 코드에 있는 계획(Claude 관리) + 화면에서 추가한 계획(Firestore) 병합
export function usePlans() {
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "plans"), orderBy("ts", "desc"));
    return onSnapshot(q,
      (snap) => {
        setUserPlans(snap.docs.map((d) => ({ id: d.id, ...d.data(), isUser: true }) as Plan));
        setReady(true);
      },
      () => setReady(true) // 오류여도 정적 계획은 보여줌
    );
  }, []);

  return { plans: [...userPlans, ...PLANS], ready };
}
