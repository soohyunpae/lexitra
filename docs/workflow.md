# Lexitra 전체 번역 워크플로우 구조

Lexitra는 프로젝트 단위로 문서를 업로드하고, TM 기반 자동 번역과 수동 검수를 통해 고품질 번역 결과를 생성하는 특허 번역 도구입니다. 각 프로젝트는 여러 개의 파일을 포함할 수 있으며, 번역은 프로젝트 상세 페이지에서 개별 파일 단위로 수행됩니다.

---

## 1. 프로젝트 생성 및 파일 업로드 (/projects/new)

- 사용자는 프로젝트 이름과 설명을 입력하고 하나 이상의 문서를 업로드할 수 있습니다.
- 업로드된 파일은 프로젝트에 속한 파일로 저장되며, 이 단계에서는 번역이 수행되지 않습니다.
- 프로젝트 생성 후 `/project/[id]` 상세 페이지로 이동합니다.

---

## 2. 프로젝트 상세 페이지 (/project/[id])

- 프로젝트 정보(이름, 설명, 생성일)와 업로드된 파일 목록이 표시됩니다.
- 각 파일 옆에는 `"번역 시작"` 버튼이 있어, 개별 파일 단위로 번역을 수행합니다.
- 번역을 시작하면 다음 과정이 수행됩니다:
  - 문장 단위로 텍스트 분할
  - TM 검색
  - TM 결과 없을 경우 GPT 기반 번역 실행
  - 번역 결과는 TranslationUnit에 저장됨

---

## 3. 번역 결과 열람 및 검수 (/project/[id]/file/[fileId])

- 해당 파일의 문장별 번역 결과를 표시
- 상태별 필터링(MT, Fuzzy, 100%, Reviewed)
- 문장 수정 및 상태 변경 기능
- 문장별 comment 입력 및 TM 검색 적용 가능
- 번역 내용 저장 시 TM 자동 반영

---

## 4. 결과 다운로드

- 개별 파일 단위로 번역 결과 다운로드 가능
- 지원 형식: `.docx`, `.txt`, `.csv` 등
- 다운로드 옵션:
  - 원문 포함 여부
  - 코멘트 포함 여부
  - 구분자 설정

---

## 데이터 모델 요약

### Project
- id
- name
- note
- createdAt

### File
- id
- filename
- content
- createdAt
- projectId

### TranslationUnit (문장 단위)
- id
- source
- target
- status (`MT`, `Reviewed`, `100%`, `Fuzzy`)
- comment
- fileId

### TranslationMemory (TM)
- source
- target
- status
- context (optional)

### TermbaseEntry (TB)
- term
- definition
- note