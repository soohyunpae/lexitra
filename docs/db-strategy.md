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

---

## 5. Long-term Plan

- Optional migration to PostgreSQL or MySQL in production
- Add user/project ownership fields for multi-user support
- Enable import/export of TM files (e.g. TMX format)
- TM match logic can be moved fully into Next.js once performance is optimized
- Replace SQLite with scalable DB for concurrent access

---

## 6. Notes

- Make sure `.env` has correct `DATABASE_URL` (e.g., `file:./dev.db`)
- After updating schema, always run:
  ```
  npx prisma generate
  npx prisma migrate dev --name your-migration-name
  ```

---

_Last updated: 2025-04-16_

---

## 7. Refactoring Roadmap (2025-04-16 기준)

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

#### 4. 정리 및 최적화
- [ ] 사용하지 않는 API 정리 (예: `/search_tm`, `/check_tm` 등 중복 제거)
- [ ] Prisma client 에러 없는지 확인
- [ ] DB 스키마 및 테스트 데이터 재정비
