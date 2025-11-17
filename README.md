# solideo_Day3_works 과제

---

# Claude Code Cli 과제

# 📚 Claude Code CLI 실습 과제

> 정부 정보 시스템 개발자를 위한 Claude Code CLI 입문 실습 과제입니다.
> 

> 각 과제는 Claude에게 프롬프트를 작성하는 연습을 통해 실무에 필요한 프로그램을 만들어보는 과정입니다.
> 

---

## 🎯 학습 목표

1. Claude Code CLI를 활용한 프로그램 개발 능력 습득
2. 효과적인 프롬프트 작성 방법 학습
3. 정부 시스템 개발에 필요한 실무 도구 제작 경험

---

## 📋 과제 평가 기준

| 평가 항목 | 배점 | 평가 내용 |
| --- | --- | --- |
| 프롬프트 명확성 | 30% | 요구사항을 명확하게 전달했는가 |
| 코드 품질 | 30% | 생성된 코드가 정상 동작하는가 |
| 예외 처리 | 20% | 에러 처리를 요청했는가 |
| 문서화 | 20% | 주석과 설명을 포함했는가 |

---

# 과제 1: 텍스트 분석 도구 📝

## 🎯 학습 목표

텍스트 파일을 분석하여 유용한 통계를 제공하는 프로그램 개발

## 📌 과제 설명

- **목적**: 한글/영문 텍스트 파일의 통계 정보 추출
- **요구사항**:
    - 단어 수, 문장 수, 문자 수 계산
    - 한글과 영문 모두 처리 가능
    - 결과를 보기 좋게 출력

## 📁 제공 자료

### sample_text.txt

```
2024년 정부 디지털 전환 추진 현황 보고서

1. 개요
정부는 디지털 플랫폼 정부 구현을 위해 다양한 사업을 추진하고 있습니다.
올해 총 예산은 2조 3,450억원이며, 전년 대비 15.3% 증가하였습니다.

2. 주요 성과
- 행정 서비스 디지털화율: 87.5%
- 모바일 전자정부 서비스: 156개
- AI 기반 민원 처리율: 45.2%

3. 향후 계획
2025년까지 모든 행정 서비스의 95% 이상을 디지털화할 예정입니다.
시민 참여형 플랫폼을 확대하고, AI/빅데이터 활용을 강화하겠습니다.

문의: 디지털정부국 (02-1234-5678)
작성일: 2024.11.15
```

## ✅ 체크포인트

- Claude가 한글 처리를 포함했는가?
- 통계 정보가 정확하게 계산되는가?
- 출력 형식이 읽기 쉬운가?

---

# 과제 2: 개인정보 보호 프로그램 🔒

## 🎯 학습 목표

문서에서 개인정보를 찾아 안전하게 처리하는 프로그램 개발

## 📌 과제 설명

- **목적**: 민감 정보 자동 마스킹 처리
- **요구사항**:
    - 주민등록번호, 전화번호, 이메일 등 개인정보 탐지
    - 다양한 형식 지원 (하이픈 유무 등)
    - 마스킹 처리 후 파일 저장

## 📁 제공 자료

### personal_info_sample.txt

```
직원 인사 기록부

1. 김철수 과장
   - 주민등록번호: 850315-1234567
   - 전화번호: 010-1234-5678
   - 이메일: [chulsoo.kim@gov.kr](mailto:chulsoo.kim@gov.kr)
   - 주소: 서울시 종로구 세종대로 209
   - 신용카드: 1234-5678-9012-3456

2. 이영희 대리  
   - 주민번호: 9203042345678 (하이픈 없음)
   - 연락처: 010.8765.4321
   - 계좌번호: 국민은행 123456-78-901234
   - 여권번호: M12345678
   - 운전면허: 서울-02-123456-78

3. 박민수 사원
   - 생년월일: 1995-07-20
   - 휴대폰: 01087654321
   - 차량번호: 12가 3456
   - 사업자등록번호: 123-45-67890
   - 건강보험번호: 12345678901
```

## ✅ 체크포인트

- 다양한 개인정보 패턴을 인식하는가?
- 마스킹 처리가 적절한가?
- 원본 파일을 보존하는가?

---

# 과제 3: 데이터 포맷 변환기 🔄

## 🎯 학습 목표

서로 다른 데이터 형식 간 변환이 가능한 프로그램 개발

## 📌 과제 설명

- **목적**: CSV와 JSON 간 상호 변환
- **요구사항**:
    - CSV to JSON, JSON to CSV 양방향 지원
    - 한글 인코딩 처리
    - 중첩된 구조 지원

## 📁 제공 자료

### government_data.csv

```
부서명,직원수,예산(백만원),디지털화율(%),만족도
기획조정실,45,2340,92.3,4.2
행정안전부,234,15670,88.5,3.9
과학기술정보통신부,189,45230,95.1,4.5
보건복지부,456,234560,76.4,3.7
교육부,345,567890,83.2,4.1
국방부,567,890120,71.5,3.8
외교부,123,34567,89.3,4.3
산업통상자원부,234,123450,91.2,4.0
환경부,178,56789,85.6,4.4
국토교통부,290,234567,79.8,3.6
```

## ✅ 체크포인트

- 인코딩 문제를 해결했는가?
- 데이터 무결성이 유지되는가?
- 변환 후 원본과 동일한 정보를 담고 있는가?

---

# 과제 4: 보안 검증 도구 🛡️

## 🎯 학습 목표

비밀번호의 보안성을 검증하고 개선안을 제시하는 프로그램 개발

## 📌 과제 설명

- **목적**: 비밀번호 강도 측정 및 피드백 제공
- **요구사항**:
    - 정부 보안 기준 적용
    - 강도 점수 산출
    - 구체적인 개선 방안 제시

## 📁 제공 자료

### passwords_to_check.txt

```
# 검증이 필요한 비밀번호 목록
password123
P@ssw0rd!
government2024
Admin123!
qwerty
MySecurePass2024!
abc123
ComplexP@ss#2024$
12345678
Kr!Gov*2024#Secure
password
초안전비밀번호2024!
1q2w3e4r
G0v3rnm3nt$ecur1ty!
admin
```

## ✅ 체크포인트

- 보안 기준이 명확한가?
- 개선 제안이 구체적인가?
- 한글 비밀번호도 처리하는가?

---

# 과제 5: 로그 분석 시스템 📊

## 🎯 학습 목표

로그 파일에서 의미있는 정보를 추출하는 프로그램 개발

## 📌 과제 설명

- **목적**: 시스템 로그 분석 및 통계 생성
- **요구사항**:
    - 로그 레벨별 집계
    - 시간대별 분석
    - 에러 패턴 추출

## 📁 제공 자료

### system_access.log

```
2024-11-15 09:00:12 INFO 192.168.1.100 LOGIN user=kim_cs status=SUCCESS
2024-11-15 09:01:45 INFO 192.168.1.100 ACCESS resource=/admin/users status=200
2024-11-15 09:05:23 WARNING 192.168.1.55 LOGIN user=unknown status=FAILED
2024-11-15 09:05:45 WARNING 192.168.1.55 LOGIN user=admin status=FAILED
2024-11-15 09:06:01 ERROR 192.168.1.55 LOGIN user=admin status=BLOCKED reason="3 failed attempts"
2024-11-15 09:15:30 INFO 192.168.1.101 LOGIN user=lee_yh status=SUCCESS
2024-11-15 09:16:45 INFO 192.168.1.101 ACCESS resource=/documents/report.pdf status=200
2024-11-15 09:20:11 INFO 192.168.1.102 LOGIN user=park_ms status=SUCCESS
2024-11-15 09:25:33 ERROR 192.168.1.103 ACCESS resource=/restricted/data status=403
2024-11-15 09:30:45 INFO 192.168.1.100 LOGOUT user=kim_cs status=SUCCESS
2024-11-15 09:35:12 WARNING 192.168.1.200 ACCESS resource=/api/export status=401
2024-11-15 09:40:23 INFO 192.168.1.101 ACCESS resource=/public/notice status=200
2024-11-15 09:45:55 ERROR 10.0.0.50 CONNECTION status=TIMEOUT
2024-11-15 09:50:12 CRITICAL 192.168.1.1 SYSTEM message="Database connection lost"
2024-11-15 09:51:00 INFO 192.168.1.1 SYSTEM message="Database reconnected"
```

## ✅ 체크포인트

- 통계가 정확한가?
- 보안 이슈를 탐지하는가?
- 시각화나 요약 기능이 있는가?

---

# 과제 6: 암호화 유틸리티 🔐

## 🎯 학습 목표

파일이나 텍스트를 안전하게 보호하는 프로그램 개발

## 📌 과제 설명

- **목적**: 파일 암호화/복호화 기능 구현
- **요구사항**:
    - 양방향 암호화 지원
    - 안전한 키 관리
    - 배치 처리 지원

## 📁 제공 자료

### confidential.txt

```
[기밀] 2024년 정부 주요 정책 계획

1. 디지털 정부 혁신 방안
- 예산: 5조원
- 추진 기간: 2024-2028
- 주관 부처: 행정안전부

2. 국가 사이버보안 강화
- 보안 인력: 10,000명 증원
- 보안 시스템: 차세대 방화벽 도입
- 대응 체계: 24시간 모니터링

3. 데이터 기반 행정
- 빅데이터 센터: 5개소 구축
- AI 분석 시스템: 전 부처 도입
- 개인정보보호: 강화된 암호화 적용

※ 이 문서는 3급 기밀로 분류됩니다.
```

## ✅ 체크포인트

- 암호화가 안전한가?
- 키 관리가 적절한가?
- 사용자 친화적인가?

---

# 과제 7: 코드 문서화 도구 📖

## 🎯 학습 목표

기존 코드에 설명을 자동으로 추가하는 프로그램 개발

## 📌 과제 설명

- **목적**: Python 코드에 docstring 자동 생성
- **요구사항**:
    - 함수별 설명 추가
    - 매개변수와 반환값 문서화
    - 표준 형식 준수

## 📁 제공 자료

### undocumented_[code.py](http://code.py)

```python
def validate_korean_id(id_number):
    id_number = id_number.replace('-', '')
    if len(id_number) != 13:
        return False
    
    multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
    check_sum = 0
    
    for i in range(12):
        check_sum += int(id_number[i]) * multipliers[i]
    
    check_digit = (11 - (check_sum % 11)) % 10
    return check_digit == int(id_number[12])

def mask_sensitive_data(text, pattern_type):
    import re
    
    patterns = {
        'phone': r'(\d{3})[-.]?(\d{4})[-.]?(\d{4})',
        'email': r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
        'card': r'(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})'
    }
    
    if pattern_type not in patterns:
        return text
    
    pattern = patterns[pattern_type]
    
    if pattern_type == 'phone':
        return re.sub(pattern, r'\1-****-****', text)
    elif pattern_type == 'email':
        return re.sub(pattern, lambda m: [m.group](http://m.group)(1)[:3] + '***@' + [m.group](http://m.group)(2), text)
    elif pattern_type == 'card':
        return re.sub(pattern, r'\1-****-****-\4', text)
    
    return text

def analyze_log_file(filepath):
    stats = {
        'total': 0,
        'info': 0,
        'warning': 0,
        'error': 0,
        'critical': 0
    }
    
    with open(filepath, 'r') as f:
        for line in f:
            stats['total'] += 1
            if 'INFO' in line:
                stats['info'] += 1
            elif 'WARNING' in line:
                stats['warning'] += 1
            elif 'ERROR' in line:
                stats['error'] += 1
            elif 'CRITICAL' in line:
                stats['critical'] += 1
    
    return stats
```

## ✅ 체크포인트

- 문서화가 완전한가?
- 표준 형식을 따르는가?
- 설명이 명확한가?

---

# 과제 8: 데이터 검증기 ✔️

## 🎯 학습 목표

입력 데이터의 유효성을 검사하고 보고하는 프로그램 개발

## 📌 과제 설명

- **목적**: JSON 데이터 검증 및 오류 보고
- **요구사항**:
    - 스키마 검증
    - 중복 검사
    - 상세한 오류 보고서 생성

## 📁 제공 자료

### validation_data.json

```json
{
  "employees": [
    {
      "id": "EMP001",
      "name": "김철수",
      "email": "invalid-email",
      "phone": "010-1234-567",
      "department": "IT",
      "salary": "not_a_number"
    },
    {
      "id": "EMP002",
      "name": "",
      "email": "[lee@gov.kr](mailto:lee@gov.kr)",
      "phone": "010-8765-4321",
      "department": "HR",
      "salary": 45000000
    },
    {
      "id": "EMP001",
      "name": "박민수",
      "email": "[park@gov.kr](mailto:park@gov.kr)",
      "phone": "010-1111-2222",
      "department": "Finance",
      "salary": -5000000
    },
    {
      "id": "EMP004",
      "name": "최영희",
      "email": "choi@gov@kr",
      "phone": "010-3333-44444",
      "department": "Unknown",
      "salary": 38000000
    }
  ],
  "departments": ["IT", "HR", "Finance", "Admin", "Security"],
  "salary_range": {
    "min": 30000000,
    "max": 100000000
  }
}
```

## ✅ 체크포인트

- 모든 오류를 찾아내는가?
- 오류 설명이 명확한가?
- 수정 제안을 제공하는가?

---

# 과제 9: 리포트 생성기 📈

## 🎯 학습 목표

데이터를 받아 보기 좋은 보고서를 만드는 프로그램 개발

## 📌 과제 설명

- **목적**: HTML 형식의 보고서 자동 생성
- **요구사항**:
    - 표와 차트 포함
    - CSS 스타일링 적용
    - 공문서 형식 준수

## 📁 제공 자료

### report_data.json

```json
{
  "title": "2024년 3분기 정부 디지털 서비스 현황",
  "date": "2024-11-15",
  "summary": {
    "total_services": 156,
    "new_services": 12,
    "improved_services": 34,
    "user_satisfaction": 4.2
  },
  "departments": [
    {
      "name": "행정안전부",
      "services": 23,
      "users": 1250000,
      "satisfaction": 4.3,
      "budget_used": 87.5
    },
    {
      "name": "과학기술정보통신부",
      "services": 18,
      "users": 890000,
      "satisfaction": 4.5,
      "budget_used": 92.3
    },
    {
      "name": "보건복지부",
      "services": 31,
      "users": 3450000,
      "satisfaction": 3.9,
      "budget_used": 78.4
    }
  ],
  "monthly_stats": [
    {"month": "7월", "users": 4500000, "services": 144},
    {"month": "8월", "users": 4750000, "services": 148},
    {"month": "9월", "users": 5100000, "services": 156}
  ],
  "issues": [
    "서버 과부하 3건 발생",
    "보안 업데이트 필요",
    "모바일 최적화 개선 요구"
  ],
  "next_steps": [
    "클라우드 인프라 확장",
    "AI 챗봇 서비스 도입",
    "사용자 인증 시스템 개선"
  ]
}
```

## ✅ 체크포인트

- 보고서가 전문적인가?
- 시각화가 효과적인가?
- 재사용 가능한 템플릿인가?

---

# 과제 10: 자동화 도구 ⚙️

## 🎯 학습 목표

반복적인 파일 작업을 자동으로 처리하는 프로그램 개발

## 📌 과제 설명

- **목적**: 파일 백업 및 정리 자동화
- **요구사항**:
    - 날짜별 백업
    - 파일 정리 규칙 적용
    - 설정 파일 기반 동작

## 📁 제공 자료

### 폴더 구조

```
project_files/
├── documents/
│   ├── report_2024_01.docx
│   ├── report_2024_02.docx
│   ├── meeting_notes.txt
│   └── temp_draft.tmp
├── data/
│   ├── january.csv
│   ├── february.csv
│   └── backup/
│       └── old_data.csv
├── logs/
│   ├── system_20241101.log
│   ├── system_20241102.log
│   └── error.log
└── config/
    └── settings.ini
```

### automation_config.json

```json
{
  "backup_rules": {
    "folders": ["documents", "data"],
    "exclude_patterns": ["*.tmp", "*.cache", "temp_*"],
    "schedule": "daily",
    "retention_days": 30,
    "compression": true
  },
  "file_organization": {
    "rules": [
      {
        "pattern": "*.log",
        "destination": "logs/archive/",
        "older_than_days": 7
      },
      {
        "pattern": "report_*.docx",
        "destination": "documents/reports/",
        "create_year_folders": true
      }
    ]
  },
  "cleanup": {
    "delete_empty_folders": true,
    "remove_duplicates": true,
    "max_file_age_days": 90
  }
}
```

## ✅ 체크포인트

- 설정 파일을 읽어 처리하는가?
- 안전한 백업이 이루어지는가?
- 로그를 남기는가?

---

## 📝 프롬프트 작성 가이드

### 우수한 프롬프트 예시

```
다음 요구사항을 만족하는 Python 프로그램을 작성해주세요:
1. 기능: [구체적인 기능 설명]
2. 입력: [입력 형식과 예시]
3. 출력: [출력 형식과 예시]
4. 예외처리: [처리해야 할 예외 상황]
5. 추가사항: [코드 스타일, 주석 등]
```

### 피해야 할 프롬프트

- ❌ "프로그램 만들어줘"
- ❌ "잘 동작하게 해줘"
- ❌ "보안 처리해줘"

---

## 🏆 과제 제출 방법

1. 각 과제별로 생성된 Python 코드 파일 (.py)
2. 실행 결과 스크린샷
3. 사용한 프롬프트 텍스트 파일
4. 간단한 실행 설명서

## 💡 팁

- 프롬프트는 구체적일수록 좋습니다
- 예시 입출력을 포함하면 더 정확한 결과를 얻을 수 있습니다
- 에러 처리와 예외 상황을 명시하세요
- 한글 처리가 필요한 경우 명확히 언급하세요
