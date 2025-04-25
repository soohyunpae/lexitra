# API Overview – Lexitra

This document describes the current API structure of the Lexitra project as of 2025-04-23.

## 🔁 Current Hybrid Architecture

Lexitra currently operates with a hybrid backend structure, where:

- **GPT translation** is handled by a FastAPI server (Python).
- **TM (Translation Memory) operations** such as storing, editing, and retrieving entries are managed via Prisma in a Next.js App Router (TypeScript).
- **Project creation and file upload** are handled in Next.js via `app/api/projects`.

## 📁 API Directory Breakdown

### 1. Next.js App Router (under `/app/api/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/projects` | `POST` | Create a new project with uploaded file(s) (multipart/form-data) |
| `/api/projects` | `GET` | Retrieve list of all projects |
| `/api/projects/new` | `POST` | Create a project and auto-translate using GPT + TM lookup |
| `/api/projects/save` | `POST` | Save finalized translation units after review |
| `/api/update_tm` | `POST` | Update or create a TM entry |
| `/api/search_tm` | `GET` | Search TM by fuzzy or exact match |
| `/api/termbase` | `GET`, `POST` | Termbase upload and listing |

### 2. FastAPI (Python-based, typically runs on `localhost:8000`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/translate` | `POST` | Submit text for GPT-based translation |
| `/api/check_tm` | `POST` | TM lookup performed server-side (to be migrated) |

## 🔀 Integration Notes

- Prisma and TM logic are currently managed in the Node.js (Next.js) stack only.
- FastAPI is kept for LLM translation handling and can be scaled or replaced later.
- In future phases, GPT prompt construction may be handled in Next.js instead of FastAPI.

## ✅ Future Direction (Proposal)

- Gradually unify TM and GPT pipeline in one API layer (Next.js preferred for simplicity).
- Isolate FastAPI to handle sensitive or server-only functionality (e.g., fine-tuning, internal LLMs).
- Improve error handling and fallback routing between layers.

---

_Last updated: 2025-04-23_
