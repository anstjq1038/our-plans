// ============================================================
// 여행 플래너 대시보드
// - plan-data.js 의 TRIP_PLAN 을 화면에 렌더링
// - 의견(댓글): Firebase 설정 시 실시간 공유, 아니면 로컬 모드
// ============================================================

(function () {
  "use strict";

  const P = TRIP_PLAN;
  const TYPE_COLORS = {
    "이동": "var(--c1)",
    "식사": "var(--c3)",
    "관광": "var(--c2)",
    "액티비티": "var(--c5)",
    "숙소": "var(--c4)",
    "카페": "var(--c6)",
  };
  const won = (n) => "₩" + n.toLocaleString("ko-KR");
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- 저장소 (Firebase or localStorage) ----------
  const firebaseReady =
    typeof FIREBASE_CONFIG !== "undefined" &&
    FIREBASE_CONFIG.projectId &&
    typeof firebase !== "undefined";

  let store;

  if (firebaseReady) {
    firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.firestore();
    const base = db.collection("trips").doc(P.id);

    store = {
      mode: "live",
      onComments(cb) {
        base.collection("comments").orderBy("ts", "desc").limit(100)
          .onSnapshot((snap) => {
            const list = [];
            snap.forEach((d) => list.push(d.data()));
            cb(list);
          });
      },
      async addComment(c) {
        await base.collection("comments").add(c);
      },
    };
  } else {
    // 로컬 모드: 이 브라우저에만 저장 (미리보기용)
    const KEY = "trip-" + P.id;
    const load = () => JSON.parse(localStorage.getItem(KEY) || '{"comments":[]}');
    const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));
    let commentCb = null;

    store = {
      mode: "local",
      onComments(cb) { commentCb = cb; cb(load().comments); },
      async addComment(c) {
        const d = load();
        d.comments.unshift(c);
        save(d);
        if (commentCb) commentCb(d.comments);
      },
    };
  }

  // ---------- 헤더 & 요약 ----------
  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return `${d.getMonth() + 1}월 ${d.getDate()}일(${"일월화수목금토"[d.getDay()]})`;
  }

  function renderHeader() {
    document.title = P.title;
    $("trip-title").textContent = P.title;
    $("trip-sub").textContent =
      `${fmtDate(P.startDate)} ~ ${fmtDate(P.endDate)} · ${P.origin} 출발 · ${P.members.join(", ")}`;

    const badge = $("storage-badge");
    if (store.mode === "live") {
      badge.textContent = "실시간 공유 중";
      badge.classList.add("live");
    } else {
      badge.textContent = "로컬 모드 (미리보기)";
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(P.startDate + "T00:00:00");
    const end = new Date(P.endDate + "T00:00:00");
    const diff = Math.round((start - today) / 86400000);
    let dday;
    if (diff > 0) dday = "D-" + diff;
    else if (today <= end) dday = "여행 중!";
    else dday = "여행 끝";

    const total = P.budget.reduce((s, b) => s + b.amount, 0);
    $("stat-row").innerHTML = `
      <div class="stat"><div class="label">출발까지</div><div class="value accent">${dday}</div></div>
      <div class="stat"><div class="label">일정</div><div class="value">${P.nights}박 ${P.totalDays}일</div></div>
      <div class="stat"><div class="label">인원</div><div class="value">${P.members.length}명</div></div>
      <div class="stat"><div class="label">1인 예산</div><div class="value">${won(total)}</div></div>`;
  }

  // 네이버 지도 검색 링크 (모바일에서 누르면 지도앱/웹으로 열림)
  const mapUrl = (q) => "https://map.naver.com/p/search/" + encodeURIComponent(q);

  // ---------- 확정 사항 ----------
  function renderDecided() {
    $("decided").innerHTML = P.decided.map((d) => `
      <div class="decision">
        <div class="decision-head">
          <span class="decision-item">${esc(d.item)}</span>
          <span class="decision-choice">${esc(d.choice)}</span>
        </div>
        <div class="decision-why">${esc(d.why)}</div>
      </div>`).join("");
  }

  // ---------- 예약 할 일 ----------
  function renderTodos() {
    $("todos").innerHTML = P.todos.map((t) => `<li>${esc(t)}</li>`).join("");
  }

  // ---------- 링크 모음 ----------
  function renderLinks() {
    const groups = [...new Set(P.links.map((l) => l.group))];
    $("links").innerHTML = groups.map((g) => `
      <div class="link-group">
        <h3 class="sub-h">${esc(g)}</h3>
        ${P.links.filter((l) => l.group === g).map((l) => `
          <a class="link-row" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
            <span class="link-label">${esc(l.label)}</span>
            <span class="link-desc">${esc(l.desc)}</span>
            <span class="link-arrow">↗</span>
          </a>`).join("")}
      </div>`).join("");
  }

  // ---------- 항공편 ----------
  function renderFlight() {
    const f = P.flight;
    $("flight").innerHTML = `
      <div class="kv"><span class="k">노선</span><span class="v">${esc(f.route)}</span></div>
      <div class="kv"><span class="k">소요</span><span class="v">${esc(f.duration)}</span></div>
      <div class="kv"><span class="k">운항</span><span class="v">${esc(f.frequency)}</span></div>
      <div class="kv"><span class="k">요금</span><span class="v">${esc(f.price)}</span></div>
      <p class="hint">${esc(f.note)}</p>`;
  }

  // ---------- 일정 ----------
  let activeDay = 0;

  function renderTabs() {
    $("day-tabs").innerHTML = P.days.map((d, i) =>
      `<button class="day-tab ${i === activeDay ? "active" : ""}" data-i="${i}">
        ${esc(d.label)}</button>`).join("");
    $("day-tabs").querySelectorAll(".day-tab").forEach((b) =>
      b.addEventListener("click", () => {
        activeDay = Number(b.dataset.i);
        renderTabs(); renderDay();
      }));
  }

  function renderDay() {
    const d = P.days[activeDay];
    $("day-theme").textContent = d.date ? `${fmtDate(d.date)} — ${d.theme}` : d.theme;
    $("timeline").innerHTML = d.events.map((e) => {
      const color = TYPE_COLORS[e.type] || "var(--muted)";
      return `<li>
        <span class="time">${esc(e.time)}</span>
        <span class="dotcol"><span class="dot" style="--dot:${color}"></span></span>
        <div class="body">
          <div class="title">${esc(e.title)}<span class="type-chip" style="--chip:${color}">${esc(e.type)}</span></div>
          ${e.note ? `<div class="note">${esc(e.note)}</div>` : ""}
          ${e.map ? `<a class="map-link" href="${esc(mapUrl(e.map))}" target="_blank" rel="noopener noreferrer">📍 지도에서 보기</a>` : ""}
        </div>
      </li>`;
    }).join("");
  }

  // ---------- 렌터카 ----------
  function renderCars() {
    $("cars").innerHTML = P.cars.map((c) => `
      <div class="car ${c.unknown ? "unknown" : ""} ${c.pick ? "pick" : ""}">
        <div class="car-name">${esc(c.name)}${c.pick ? `<span class="tag pick-tag">추천</span>` : ""}</div>
        <div class="car-price">${esc(c.price)}</div>
        <div class="car-extra">${esc(c.extra)}</div>
        <div class="car-note">${esc(c.note)}</div>
      </div>`).join("");
    $("ev-notes").innerHTML = P.evNotes.map((n) => `<li>${esc(n)}</li>`).join("");
    $("rental-tips").innerHTML = P.rentalTips.map((n) => `<li>${esc(n)}</li>`).join("");
  }

  // ---------- 숙소 ----------
  function renderStays() {
    $("stays").innerHTML = P.stays.map((s) => `
      <div class="listing ${s.pick ? "pick" : ""}">
        <div class="listing-head">
          <span class="listing-name">${esc(s.name)}</span>
          ${s.pick ? `<span class="tag pick-tag">추천</span>` : ""}
          <span class="tag">${esc(s.area)}</span>
        </div>
        <div class="listing-sub">${esc(s.rooms)}</div>
        <div class="listing-note">${esc(s.note)}</div>
        <a class="map-link" href="${esc(mapUrl(s.name + " 제주"))}" target="_blank" rel="noopener noreferrer">📍 지도·후기 보기</a>
      </div>`).join("");
  }

  // ---------- 맛집 ----------
  function renderFoods() {
    $("foods").innerHTML = P.foods.map((f) => `
      <div class="listing">
        <div class="listing-head">
          <span class="listing-name">${esc(f.name)}</span>
          <span class="tag">${esc(f.cat)}</span>
        </div>
        <div class="listing-sub">${esc(f.area)}</div>
        <div class="listing-note">${esc(f.note)}</div>
        <a class="map-link" href="${esc(mapUrl(f.name + " " + f.area))}" target="_blank" rel="noopener noreferrer">📍 지도·후기 보기</a>
      </div>`).join("");
  }

  // ---------- 예산 ----------
  function renderBudget() {
    const total = P.budget.reduce((s, b) => s + b.amount, 0);
    const max = Math.max(...P.budget.map((b) => b.amount));
    const colors = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];
    $("budget-total").innerHTML = `${won(total)} <small>/ 1인 총액</small>`;
    $("budget-bars").innerHTML = P.budget.map((b, i) => `
      <div class="budget-row">
        <div class="meta"><span>${esc(b.category)}</span><span class="amt">${won(b.amount)}</span></div>
        <div class="budget-track">
          <div class="budget-fill" style="width:${(b.amount / max) * 100}%; --fill:${colors[i % colors.length]}"></div>
        </div>
      </div>`).join("");
  }

  // ---------- 준비물 ----------
  function renderChecklist() {
    const KEY = "trip-check-" + P.id;
    const checked = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
    $("checklist").innerHTML = P.checklist.map((item, i) => `
      <li><label>
        <input type="checkbox" data-i="${i}" ${checked.has(i) ? "checked" : ""}/>
        <span>${esc(item)}</span>
      </label></li>`).join("");
    $("checklist").querySelectorAll("input").forEach((cb) =>
      cb.addEventListener("change", () => {
        const i = Number(cb.dataset.i);
        cb.checked ? checked.add(i) : checked.delete(i);
        localStorage.setItem(KEY, JSON.stringify([...checked]));
      }));
  }

  // ---------- 이름 ----------
  const NAME_KEY = "trip-username";
  const getName = () => localStorage.getItem(NAME_KEY) || "";

  function renderName() {
    const name = getName();
    const card = document.querySelector(".name-card");
    const old = card.querySelector(".greeting");
    if (old) old.remove();
    if (name) {
      $("user-name").value = name;
      card.insertAdjacentHTML("beforeend",
        `<p class="greeting">안녕하세요, <b>${esc(name)}</b>님! 의견을 남겨보세요 👇</p>`);
    }
  }

  $("save-name").addEventListener("click", () => {
    const v = $("user-name").value.trim();
    if (!v) { alert("이름을 입력해주세요!"); return; }
    localStorage.setItem(NAME_KEY, v);
    renderName();
  });

  // ---------- 의견 ----------
  function renderComments(list) {
    if (!list.length) {
      $("comments").innerHTML = `<li class="empty">아직 의견이 없어요. 첫 의견을 남겨보세요!</li>`;
      return;
    }
    $("comments").innerHTML = list.map((c) => {
      const when = c.ts ? new Date(c.ts).toLocaleString("ko-KR", {
        month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
      }) : "";
      return `<li>
        <span class="who">${esc(c.name)}</span><span class="when">${when}</span>
        <div class="txt">${esc(c.text)}</div>
      </li>`;
    }).join("");
  }

  $("send-comment").addEventListener("click", async () => {
    const name = getName();
    const text = $("comment-text").value.trim();
    if (!name) { alert("먼저 위에서 이름을 저장해주세요!"); return; }
    if (!text) return;
    await store.addComment({ name, text, ts: Date.now() });
    $("comment-text").value = "";
  });

  // ---------- 시작 ----------
  renderHeader();
  renderDecided();
  renderTodos();
  renderFlight();
  renderTabs();
  renderDay();
  renderCars();
  renderStays();
  renderFoods();
  renderBudget();
  renderChecklist();
  renderLinks();
  renderName();
  renderComments([]);
  store.onComments(renderComments);
})();
