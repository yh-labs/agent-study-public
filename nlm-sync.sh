#!/usr/bin/env bash
# NotebookLM 양방향 연동 스크립트
# 사용법:
#   ./nlm-sync.sh push         산출물 → NotebookLM 소스 등록/갱신
#   ./nlm-sync.sh query "질문" NotebookLM에 질문 (Pull)
#   ./nlm-sync.sh list         현재 등록된 소스 목록 확인

set -euo pipefail

NOTEBOOK="petcare"  # nlm alias: b5d8d225-89d0-4921-88bf-1d7107bc5bd4
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 등록할 산출물 목록 (파일경로:소스제목:소스ID)
# 소스ID는 최초 등록 후 갱신 시 삭제→재등록에 사용
declare -A SOURCES=(
  ["PRD.md"]="PRD.md:b64b5acd-0dfa-41e0-a0cd-662c2e46286d"
  ["01.관리문서/착수보고서.md"]="착수보고서:ec1efbdd-111a-405f-8ae1-fc1df205f2a1"
  ["01.관리문서/WBS.md"]="WBS:98709f6d-cc3d-48d1-9b75-2c75034f623d"
  ["02.기획문서/마켓리서치.md"]="마켓리서치:bbbb0b0c-1be8-48bb-847f-e562472d3e3a"
  ["02.기획문서/서비스기획서.md"]="서비스기획서:"
  ["02.기획문서/요구사항정의서.md"]="요구사항정의서:"
  ["02.기획문서/기능명세서.md"]="기능명세서:"
  ["02.기획문서/API스펙.md"]="API스펙:"
  ["02.기획문서/정보구조도.md"]="정보구조도:"
  ["02.기획문서/화면설계서.md"]="화면설계서:"
  ["03.구현문서/인프라아키텍처.md"]="인프라아키텍처:"
  ["03.구현문서/시스템정의서.md"]="시스템정의서:"
  ["03.구현문서/데이터베이스설계서.md"]="데이터베이스설계서:"
  ["03.구현문서/디자인스타일가이드.md"]="디자인스타일가이드:"
  ["01.관리문서/중간보고서.md"]="중간보고서:"
  ["04.검수문서/테스트시나리오.md"]="테스트시나리오:"
  ["04.검수문서/테스트결과보고서.md"]="테스트결과보고서:"
  ["01.관리문서/완료보고서.md"]="완료보고서:"
)

cmd="${1:-help}"

push() {
  echo "=== NotebookLM Push: 산출물 등록/갱신 ==="
  for rel_path in "${!SOURCES[@]}"; do
    abs_path="$REPO_ROOT/$rel_path"
    meta="${SOURCES[$rel_path]}"
    title="${meta%%:*}"
    source_id="${meta##*:}"

    if [[ ! -f "$abs_path" ]]; then
      echo "  SKIP (미생성) $rel_path"
      continue
    fi

    if [[ -n "$source_id" ]]; then
      # 기존 소스 삭제 후 재등록
      echo "  UPDATE $title (기존 소스 교체)"
      nlm delete source "$source_id" --notebook "$NOTEBOOK" 2>/dev/null || true
    else
      echo "  ADD    $title (신규 등록)"
    fi

    nlm source add "$NOTEBOOK" \
      --text "$(cat "$abs_path")" \
      --title "$title" \
      --wait
  done
  echo "=== Push 완료 ==="
}

query() {
  local question="${2:-프로젝트 현황 요약}"
  echo "=== NotebookLM Query ==="
  echo "질문: $question"
  echo "---"
  nlm query notebook "$NOTEBOOK" "$question" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data['value']['answer'])
"
}

list_sources() {
  echo "=== NotebookLM 등록 소스 목록 ==="
  nlm source list "$NOTEBOOK"
}

case "$cmd" in
  push)   push ;;
  query)  query "$@" ;;
  list)   list_sources ;;
  *)
    echo "사용법: $0 {push|query \"질문\"|list}"
    echo ""
    echo "  push           산출물 파일 → NotebookLM 소스 등록/갱신"
    echo "  query \"질문\"   NotebookLM에 질문하여 답변 출력 (Pull)"
    echo "  list           현재 등록된 소스 목록 확인"
    ;;
esac
