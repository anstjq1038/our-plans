# ✈️ 여행 플래너 대시보드

Claude Code와 대화하며 여행 계획을 짜고, 결과를 웹 대시보드로 친구들과 공유하는 프로젝트.

## 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 대시보드 페이지 |
| `js/plan-data.js` | **여행 계획 데이터** — Claude에게 말하면 여기가 갱신됨 |
| `js/app.js` | 화면 렌더링 + 투표/댓글 로직 |
| `js/firebase-config.js` | Firebase 설정 (비어 있으면 로컬 모드) |
| `css/style.css` | 스타일 (라이트/다크 모드 자동) |

## 로컬에서 미리보기

`index.html`을 더블클릭해서 브라우저로 열면 끝.
Firebase 설정 전에는 "로컬 모드"로 동작 — 투표/댓글이 내 브라우저에만 저장됩니다.

## 배포하기 (GitHub Pages, 무료)

1. [github.com](https://github.com)에서 새 저장소 생성 (예: `travel-planner`, Public)
2. 이 폴더에서:
   ```
   git init
   git add .
   git commit -m "여행 플래너 대시보드"
   git branch -M main
   git remote add origin https://github.com/<내아이디>/travel-planner.git
   git push -u origin main
   ```
3. 저장소 → **Settings → Pages** → Source를 `main` 브랜치 `/ (root)`로 설정
4. 몇 분 뒤 `https://<내아이디>.github.io/travel-planner/` 링크를 친구들에게 공유!

> 계획을 수정한 뒤에는 `git add . && git commit -m "일정 수정" && git push` 하면 사이트에 반영됩니다.
> (Claude에게 "배포해줘"라고 하면 대신 해줍니다.)

## Firebase 연동하기 (친구들과 투표/댓글 실시간 공유)

무료 Spark 플랜으로 충분합니다.

1. [console.firebase.google.com](https://console.firebase.google.com) → **프로젝트 추가** (이름 자유, 애널리틱스 끄기 OK)
2. 왼쪽 **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3 (서울)` 권장
   - **테스트 모드**로 시작 (30일 후 규칙 만료 — 아래 규칙으로 교체)
3. 프로젝트 개요 옆 ⚙️ → **프로젝트 설정 → 내 앱 → 웹 앱 추가(`</>`)**
   - 등록하면 나오는 `firebaseConfig` 값을 `js/firebase-config.js`에 복사
4. Firestore → **규칙** 탭에 아래를 붙여넣기 (투표/댓글만 쓰기 허용):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/{tripId}/votes/{doc} {
         allow read, write: if true;
       }
       match /trips/{tripId}/comments/{doc} {
         allow read, create: if true;
         allow update, delete: if false;
       }
     }
   }
   ```
5. 다시 배포(`git push`)하면 대시보드 배지가 **"실시간 공유 중"**으로 바뀝니다.

## 계획 바꾸는 법

Claude Code에게 그냥 말하세요:

- "2일차에 카페 투어 추가해줘"
- "예산에서 식비 20만원으로 올려줘"
- "저녁 메뉴 투표 항목 하나 더 추가해줘"
- "다 됐으면 배포해줘"
