# Database Strategy for Lexitra

This document outlines the database structure and management strategy used in the Lexitra project.

---

## 1. Overview

Lexitra uses **Prisma ORM** with a **SQLite** database (`dev.db`) for local development and prototyping. The plan is to ensure a flexible structure that supports secure, searchable, and updatable Translation Memory (TM) entries.

---

## 2. Current Setup

- **ORM**: Prisma
- **Database**: SQLite (`prisma/dev.db`)
- **Client Library**: `@prisma/client`
- **Main Schema File**: `prisma/schema.prisma`

### Example Model

```prisma
model TranslationMemory {
  id          Int      @id @default(autoincrement())
  source      String
  target      String
  sourceLang  String
  targetLang  String
  updatedAt   DateTime @updatedAt
  status      String   @default("MT")
  createdAt   DateTime @default(now())
  approvedAt  DateTime?
}
```

---

## 3. File Organization

- `prisma/schema.prisma`: Database schema definition
- `lib/prisma.ts`: Initializes and exports Prisma client
- `app/api/update_tm/route.ts`: Handles TM update requests
- `app/api/search_tm/route.ts`: Proxies FastAPI-based TM search (can be replaced with direct DB query)
- `app/api/check_tm/route.ts`: Calls FastAPI to search TM before translation
- `app/api/translate/`: Translation endpoint, using GPT and checking TM

---

## 4. TM Management Strategy

- TM is managed via the `TranslationMemory` table
- UI for CRUD operations lives in `/tm_management/page.tsx`
- Edits and inserts are synced to Prisma and reflected via Studio or API
- Fuzzy matching is handled in FastAPI, which reads directly from SQLite

  ### TM 상태 구분 및 워크플로우

  Lexitra의 번역 메모리(TM)는 다음과 같은 상태를 가지며, 각 상태는 워크플로우 상에서 다음 단계를 의미합니다:

  - **MT (Machine Translation)**: GPT 등을 통해 자동 생성된 번역 결과. 기본적으로 수동 검토되지 않은 상태.
  - **Approved**: 번역가/리뷰어가 검토하여 승인한 번역. TM에서 우선적으로 매칭 대상으로 간주됩니다.
  - **Fuzzy**: 입력 문장과 기존 TM 간의 유사도가 100%가 아닌 경우. UI에서 별도 표시되어 사용자가 수동 확인할 수 있음.
  - **Exact**: 입력 문장과 TM 내 source 문장이 완전히 일치하는 경우. 자동 적용 가능성이 높음.

  이 상태 값은 TM 항목을 Prisma 모델에 저장할 때 `status` 필드를 통해 구분됩니다.

  ### TM 상태 기반 저장 및 승인 워크플로우

  - TM에서 일치하는 항목이 없는 경우, GPT 번역 결과를 생성하여 `status: "MT"`로 저장
  - 번역자가 수동으로 검토 및 수정한 후, 해당 항목을 `status: "Approved"`로 업데이트
  - 추후 UI에서 `status`별 필터링 및 승인 요청 워크플로우 등 확장 가능

---

## 5. Long-term Plan

---

## 6. Integrated Transition Strategy (TS → Python)

Lexitra는 초기 개발 단계에서 TypeScript 기반의 Prisma/Next.js 구조를 사용해 빠르게 기능을 구현하였으며, 이후 자연어 처리 및 GPT API 연동의 효율성을 위해 Python 백엔드로 점진적인 전환을 계획하고 있습니다. 본 전략은 이중 구조를 일시적으로 유지하면서 안정적인 전환을 달성하기 위한 방향성을 제공합니다.

### 🔹 단기: TypeScript 기반 구조 안정화

- Prisma ORM 기반으로 TranslationMemory 관리 통합
- FastAPI 호출 대신 Next.js API Route로 대체
- `/tm_management` 및 관련 API 구조 정비 및 정리
- GPT 호출은 FastAPI에서 수행, 프론트에서는 프록시 형태로 연동

### 🔹 중기: Python 백엔드 기능 확장

- FastAPI 기반 번역 API를 고도화
- GPT API 호출 + TM 저장/검색 로직을 Python에서 처리
- Python의 자연어 처리 라이브러리 활용 가능성 탐색
- `lib/tmUtils.ts`에 있는 기능들을 Python으로 점진 이전

### 🔹 장기: 백엔드 Python 단일화

- 번역, TM 관리, GPT 연동 기능을 Python에서 일원화
- 프론트에서는 Python API만 호출하고 UI에 집중
- FastAPI 또는 Flask 기반 API 서버를 정식 백엔드로 구성
- 기존 TypeScript API Route는 점진적으로 제거

이러한 전략을 통해 단기적으로는 기존 시스템의 안정성을 유지하면서도, 중장기적으로는 자연어 처리에 강점을 가진 Python 환경으로의 전환을 무리 없이 진행할 수 있습니다.

- Optional migration to PostgreSQL or MySQL in production
- Add user/project ownership fields for multi-user support
- Enable import/export of TM files (e.g. TMX format)
- TM match logic can be moved fully into Next.js once performance is optimized
- Replace SQLite with scalable DB for concurrent access
- TM status 기반 승인/검수 프로세스 강화 및 필터링 기능 추가

---

## 7. Notes

- Make sure `.env` has correct `DATABASE_URL` (e.g., `file:./dev.db`)
- After updating schema, always run:
  ```
  npx prisma generate
  npx prisma migrate dev --name your-migration-name
  ```

---

_Last updated: 2025-04-17_

---

## 8. Refactoring Roadmap (2025-04-16 기준)

이 리팩토링 로드맵은 기존에 FastAPI, Prisma, sqlite 등 혼재된 DB 구조를 통합하고, 안정적인 서버 실행과 유지보수를 위한 가이드를 포함합니다.

### ✅ 1차 리팩토링 단계

#### 1. DB 접근 방식 일관화
- [x] `lib/prisma.ts`: Prisma Client 초기화 파일 정비
- [x] `.env`: `DATABASE_URL=file:./dev.db` 확인
- [ ] `app/api/update_tm/route.ts`: Prisma 기반으로 통일
- [ ] `app/api/check_tm/route.ts`: FastAPI → Prisma 방식으로 전환 (or 프록시 유지 시 분리 명확화)
- [ ] `app/api/search_tm/route.ts`: FastAPI 프록시 or 직접 Prisma 방식 명확화

#### 2. 백엔드 FastAPI 구조 정리
- [ ] `app/api/translate/main.py`: TM match 함수가 어디에서 오는지 정리 (`lexitra.tm` → Prisma 기반으로 수정)
- [ ] `lexitra/tm.py`: sqlite 직접 접근 → Prisma 기반 구조로 재구성 또는 제거
- [ ] `lexitra/db.py`: 불필요 시 제거, prisma client로 대체

#### 3. 프론트엔드 Next.js 리팩토링
- [ ] `/tm_management/page.tsx`: `lib/prisma.ts` 기반 API 연결
- [ ] `TMEditForm`, `TMSearchPanel`: API 연동 코드 일관화
- [ ] `lib/searchTranslationMemory.ts`: FastAPI 또는 DB API로 통일

#### 4. 기능 중복 정리
- [ ] `app/tm`, `app/tm_management`, `components` 폴더 내 중복된 기능 정리
  - `app/tm`: TM 관련 API 로직만 유지
  - `app/tm_management`: TM 관리 UI 및 페이지 관련 코드만 유지
  - `components`: 공통 UI 컴포넌트로 분리
- [ ] 중복된 TM 상태 관리 로직을 `lib/tmStatus.ts`로 이동
- [ ] `app/tm_management`에서 `components`와 `lib/tmStatus.ts`를 활용하도록 수정
- [ ] 불필요한 파일 및 폴더 삭제

#### 5. 정리 및 최적화
- [ ] 사용하지 않는 API 정리 (예: `/search_tm`, `/check_tm` 등 중복 제거)
- [ ] Prisma client 에러 없는지 확인
- [ ] DB 스키마 및 테스트 데이터 재정비
