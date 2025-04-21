# TM-Aware GPT Integration Plan

This document outlines the future architecture for integrating Translation Memory (TM) into the GPT-based translation workflow in the Lexitra project.

---

## 1. Background

Currently, Lexitra follows this workflow:

1. User submits a source sentence  
2. System searches TM for existing match  
3. If no match found, GPT generates a translation  
4. GPT output is saved as a new TM entry (`status: "MT"`)

While this approach works, it does not allow GPT to *reference existing TM entries* during translation, which can improve consistency and accuracy.

---

## 2. Goal

Enable GPT to **reference relevant TM entries before generating a translation**. This will:

- Improve term and phrase consistency  
- Encourage reuse of approved translations  
- Reduce review overhead

---

## 3. Target Architecture

### 🔁 Current Structure (After Refactoring)

- TM stored and queried via **Prisma ORM**  
- TM UI edits synced to Prisma DB  
- GPT translation handled in FastAPI (`app/api/translate/main.py`)  
- TM search logic handled in FastAPI (`check_tm`, `search_tm`)

### 🔮 Proposed Future Structure

- **All TM storage and querying consolidated in Prisma**  
- **GPT translation endpoint accepts top-N TM matches** as input  
- GPT is prompted with TM context (e.g., fuzzy matches, approved entries)  
- Fuzzy match logic powered by embedding or keyword similarity

---

## 4. Example GPT Prompt (TM-aware)

```
You are a professional translator.

Here are similar previous translations:
- "기계는 신뢰성 있게 작동해야 한다." → "The machine must operate reliably."

Now translate:
"기계는 빠르고 신뢰성 있게 작동해야 한다."
```

---

## 5. Strategy Phases

### Phase 1 – Core TM Consolidation (🟢 In Progress)
- ✅ Migrate all TM read/write logic to Prisma  
- ✅ Ensure status (`MT`, `Fuzzy`, `Exact`, `Approved`) is stored  
- ✅ Standardize API access via `/api/update_tm`, `/api/search_tm`

### Phase 2 – TM Filtering & Embedding Support
- [ ] Add vector search or similarity scoring  
- [ ] Expose `/api/search_tm?mode=embedding` API  
- [ ] Build top-N match fetcher for GPT prompts

### Phase 3 – GPT Prompt Engineering
- [ ] Enhance GPT prompts to accept TM context  
- [ ] Evaluate quality impact (A/B testing)  
- [ ] Enable override: TM-only / GPT-only modes

### Phase 4 – Workflow Automation
- [ ] Auto-suggest TM matches before GPT call  
- [ ] Use `status: Approved` entries only for prompting  
- [ ] Enable real-time feedback loop from reviewers

---

## 6. Summary

Moving GPT closer to TM will enable Lexitra to:

- Improve translation consistency  
- Maximize reuse of existing human-approved translations  
- Scale confidently for professional/legal content

This phased plan ensures we build on stable TM foundations while enabling smarter LLM usage.

_Last updated: 2025-04-18_

---

## 7. Execution Roadmap (Q2 2025)

This section outlines the actionable steps to implement the TM-aware GPT integration, building on the phased strategy above.

### 🔹 Phase 1: TM Consolidation & Stabilization
- [x] Migrate all TM read/write logic to Prisma
- [x] Normalize `status`, `comment`, and metadata fields
- [x] Unify TM UI and remove legacy pages/components
- [ ] Evaluate `/api/search_tm` FastAPI vs Prisma route, consolidate as needed
### 🔹 Phase 2: Pre-GPT Integration Layer
- [ ] Design reusable top-N TM match function (`getTopMatches`)
- [ ] Filter matches by `status: Approved` or `Fuzzy`
- [ ] Define JSON format for GPT input TM context
- [ ] Test and refine GPT prompts with TM reference included
### 🔹 Phase 3: Embedding-Based Matching
- [ ] Embed all TM source sentences for vector search
- [ ] Build cosine similarity matching logic
- [ ] Add `/api/search_tm?mode=embedding` API endpoint
- [ ] Incorporate similarity scores into GPT prompts (optional)
### 🔹 Phase 4: Feedback & Automation
- [ ] Auto-suggest TM matches before GPT is called
- [ ] Store reviewed GPT outputs with `status: Approved`
- [ ] Build feedback loop for TM and reviewer integration

---

### Optional Considerations
- Token-length-aware prompt generation
- Terminology priority override alongside TM
- User control over TM injection into GPT prompt

This roadmap serves as an evolving blueprint for making Lexitra a TM-aware GPT system with consistent, efficient, and scalable translation workflows.
