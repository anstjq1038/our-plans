import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlanEvent } from "../types";
import { mapUrl } from "../lib/util";

export interface DayMapHandle {
  // 타임라인의 n번째 일정을 지도에서 포커스 (geo 없으면 무시)
  focusEvent: (eventIndex: number) => void;
}

// 날짜별 동선 지도 (길찾기 스타일) — Leaflet + OpenStreetMap (무료, 키 불필요)
export const DayMap = forwardRef<DayMapHandle, { events: PlanEvent[] }>(function DayMap({ events }, handle) {
  const boxRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [active, setActive] = useState(-1);

  // 원본 일정 인덱스를 보존한 채 geo 있는 것만
  const spots = events
    .map((e, idx) => ({ ...e, idx }))
    .filter((e): e is PlanEvent & { geo: [number, number]; idx: number } => !!e.geo);

  useEffect(() => {
    if (!ref.current || spots.length === 0) return;
    const map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true });
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const pts = spots.map((s) => L.latLng(s.geo[0], s.geo[1]));
    markersRef.current = spots.map((s, i) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:26px;height:26px;border-radius:50%;background:var(--color-accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${i + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      return L.marker(pts[i], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${i + 1}. ${s.title.replace(/</g, "&lt;")}</b><br/><span style="color:#888;font-size:12px">${s.time}</span>` +
          (s.map ? `<br/><a href="${mapUrl(s.map)}" target="_blank" rel="noopener">네이버 지도 ↗</a>` : "")
        )
        .on("click", () => setActive(i));
    });
    L.polyline(pts, { color: "var(--color-accent)", weight: 3, opacity: 0.55, dashArray: "6 8" }).addTo(map);
    map.fitBounds(L.latLngBounds(pts).pad(0.18));
    setActive(-1);

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(spots.map((s) => s.geo))]);

  const focus = (i: number) => {
    setActive(i);
    const m = mapRef.current;
    if (!m || !spots[i]) return;
    m.flyTo(L.latLng(spots[i].geo[0], spots[i].geo[1]), Math.max(m.getZoom(), 12), { duration: 0.6 });
    markersRef.current[i]?.openPopup();
  };

  useImperativeHandle(handle, () => ({
    focusEvent: (eventIndex: number) => {
      const i = spots.findIndex((s) => s.idx === eventIndex);
      if (i < 0) return;
      boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      focus(i);
    },
  }));

  if (spots.length === 0) return null;
  return (
    // 지도·칩에서의 드래그가 탭 스와이프로 번지지 않게 차단
    <div ref={boxRef} className="mb-4" onPointerDownCapture={(e) => e.stopPropagation()} onTouchStartCapture={(e) => e.stopPropagation()}>
      <div ref={ref} className="h-72 w-full overflow-hidden rounded-xl border border-hairline" />
      {/* 시간대별 정거장 칩 — 누르면 지도 이동 */}
      <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {spots.map((s, i) => (
          <button key={i} onClick={() => focus(i)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition active:scale-95 ${
              active === i ? "border-accent bg-accent font-semibold text-white" : "border-hairline text-ink2"}`}>
            <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[0.65rem] font-bold ${
              active === i ? "bg-white text-accent" : "bg-accent text-white"}`}>{i + 1}</span>
            <span className="tabular-nums">{s.time}</span>
            <span className="max-w-32 truncate">{s.title}</span>
          </button>
        ))}
      </div>
      <p className="mt-1 text-[0.7rem] text-muted">아래 일정을 눌러도 지도가 그 위치로 이동해요. 핀 위치는 대략적입니다.</p>
    </div>
  );
});
