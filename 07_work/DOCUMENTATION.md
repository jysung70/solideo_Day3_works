# 문서화 개요

이 문서는 `code.py`에 구현된 민감 정보 처리 도구들의 목적과 사용법을 한눈에 이해할 수 있도록 정리합니다. 모든 함수는 Google 스타일의 한글 docstring을 사용해 코드 레벨에서도 동일한 내용을 확인할 수 있습니다.

## 제공 기능

| 함수 | 설명 |
| --- | --- |
| `validate_korean_id` | 한국 주민등록번호(하이픈 포함 여부 무관) 13자리의 체크섬을 계산해 검증합니다. |
| `mask_sensitive_data` | 문자열에서 전화번호, 이메일, 카드 번호를 탐지해 마스킹 규칙에 따라 가립니다. |
| `analyze_log_file` | 로그 파일을 한 줄씩 읽으며 INFO/WARNING/ERROR/CRITICAL 건수와 전체 줄 수를 집계합니다. |

## 세부 사양

### 1. `validate_korean_id(id_number: str) -> bool`
- 입력: 13자리 주민등록번호 문자열(하이픈 포함 가능).
- 처리: 하이픈 제거 후 공인된 가중치 배열을 사용해 체크섬 계산.
- 반환: 계산 결과가 마지막 자리와 같으면 `True`, 아니면 `False`.
- 활용: 사용자 입력 검증, 데이터 정합성 확인.

### 2. `mask_sensitive_data(text: str, pattern_type: str) -> str`
- 입력: 임의의 문자열과 패턴 유형(`'phone'`, `'email'`, `'card'`).
- 처리: 정규식을 통해 해당 패턴을 찾고 고정 규칙으로 일부 숫자/문자를 `*`로 치환.
- 반환: 요청된 패턴이 존재하면 마스킹된 문자열, 지원하지 않는 유형이면 원본 그대로 반환.
- 주의: 여러 유형을 한 번에 처리하려면 함수를 반복 호출하거나 별도 로직이 필요합니다.

### 3. `analyze_log_file(filepath: str) -> dict[str, int]`
- 입력: 로그 파일 경로.
- 처리: 파일을 순차적으로 읽어 레벨 키워드를 포함하는 줄을 카운팅.
- 반환: `total`, `info`, `warning`, `error`, `critical` 키를 가진 딕셔너리.
- 응용: 간단한 로그 통계, 알림 전용 대시보드의 기초 데이터.

## 사용 예시

```python
from code import validate_korean_id, mask_sensitive_data, analyze_log_file

print(validate_korean_id("800101-1234567"))             # True/False 출력
masked = mask_sensitive_data("연락처 010-1234-5678", "phone")
print(masked)                                            # 010-****-****
stats = analyze_log_file("/var/log/app.log")
print(stats)
```

## 테스트 및 품질 관리

- 현재 자동화된 테스트 스크립트는 포함되어 있지 않습니다.
- 변경 이후에는 가능하다면 다음 절차를 권장합니다.
  1. `pytest` 혹은 기본 `unittest`로 로직 검증 추가.
  2. `flake8` 또는 `ruff` 같은 정적 분석기로 스타일/버그 검사를 수행.
  3. 민감 정보 마스킹 정규식이 실제 데이터 포맷을 모두 포괄하는지 사례별로 수동 확인.

## 확장 아이디어

1. `mask_sensitive_data`에 주민등록번호, 여권번호 등 다른 패턴을 추가.
2. `analyze_log_file`를 스트림 처리로 확장하거나, JSON/CSV 출력 옵션을 제공.
3. docstring 자동 생성 스크립트를 별도 CLI로 만들어 여러 파일에 일괄 적용.
