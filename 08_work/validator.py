#!/usr/bin/env python3
"""JSON 데이터 검증 및 오류 보고 도구."""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List


@dataclass
class ValidationError:
    """검증 오류 정보."""

    location: str
    field: str
    message: str
    suggestion: str | None = None

    def format(self) -> str:
        base = f"- [{self.location}] {self.field}: {self.message}"
        if self.suggestion:
            return f"{base}\n    -> 제안: {self.suggestion}"
        return base


def load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def validate_structure(data: Dict[str, Any]) -> List[ValidationError]:
    errors: List[ValidationError] = []
    required_keys = {
        "employees": list,
        "departments": list,
        "salary_range": dict,
    }
    for key, expected_type in required_keys.items():
        if key not in data:
            errors.append(
                ValidationError(
                    location="root",
                    field=key,
                    message="필수 키가 없습니다.",
                    suggestion=f"JSON에 '{key}' 키를 추가하세요.",
                )
            )
            continue
        if not isinstance(data[key], expected_type):
            errors.append(
                ValidationError(
                    location="root",
                    field=key,
                    message=f"{expected_type.__name__} 타입이어야 합니다.",
                    suggestion=f"'{key}'값을 {expected_type.__name__} 타입으로 수정하세요.",
                )
            )
    return errors


def validate_salary_range(salary_range: Dict[str, Any]) -> List[ValidationError]:
    errors: List[ValidationError] = []
    for key in ("min", "max"):
        if key not in salary_range:
            errors.append(
                ValidationError(
                    location="salary_range",
                    field=key,
                    message="필수 항목이 없습니다.",
                    suggestion=f"salary_range에 '{key}'를 추가하세요.",
                )
            )
            continue
        if not isinstance(salary_range[key], (int, float)):
            errors.append(
                ValidationError(
                    location="salary_range",
                    field=key,
                    message="숫자 타입이어야 합니다.",
                    suggestion="정수 혹은 실수 값을 입력하세요.",
                )
            )
    if all(isinstance(salary_range.get(k), (int, float)) for k in ("min", "max")):
        if salary_range["min"] >= salary_range["max"]:
            errors.append(
                ValidationError(
                    location="salary_range",
                    field="min/max",
                    message="min 값은 max 보다 작아야 합니다.",
                    suggestion="급여 범위를 다시 설정하세요 (예: min 30M, max 100M).",
                )
            )
    return errors


def validate_employees(data: Dict[str, Any]) -> List[ValidationError]:
    errors: List[ValidationError] = []
    employees = data.get("employees", [])
    departments = set(data.get("departments", []))
    salary_range = data.get("salary_range", {})

    id_counts = Counter()
    email_counts = Counter()

    for emp in employees:
        emp_id = emp.get("id")
        if isinstance(emp_id, str):
            id_counts[emp_id] += 1
        email = emp.get("email")
        if isinstance(email, str):
            email_counts[email] += 1

    email_pattern = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
    phone_pattern = re.compile(r"^010-\d{4}-\d{4}$")

    for idx, emp in enumerate(employees):
        location = f"employees[{idx}]/{emp.get('id', 'unknown')}"
        # required fields
        for field in ("id", "name", "email", "phone", "department", "salary"):
            if field not in emp:
                errors.append(
                    ValidationError(
                        location=location,
                        field=field,
                        message="필수 필드가 없습니다.",
                        suggestion=f"'{field}' 값을 추가하세요.",
                    )
                )
        emp_id = emp.get("id")
        if not isinstance(emp_id, str) or not emp_id.strip():
            errors.append(
                ValidationError(
                    location=location,
                    field="id",
                    message="문자열 ID가 필요합니다.",
                    suggestion="예: 'EMP001'처럼 영문+숫자 ID를 사용하세요.",
                )
            )
        name = emp.get("name")
        if not isinstance(name, str) or not name.strip():
            errors.append(
                ValidationError(
                    location=location,
                    field="name",
                    message="이름이 비어 있습니다.",
                    suggestion="정상적인 이름 문자열을 입력하세요.",
                )
            )
        email = emp.get("email")
        if not isinstance(email, str) or not email_pattern.match(email):
            errors.append(
                ValidationError(
                    location=location,
                    field="email",
                    message="이메일 형식이 잘못되었습니다.",
                    suggestion="user@example.com 형태를 사용하세요.",
                )
            )
        phone = emp.get("phone")
        if not isinstance(phone, str) or not phone_pattern.match(phone):
            errors.append(
                ValidationError(
                    location=location,
                    field="phone",
                    message="전화번호는 010-1234-5678 형식이어야 합니다.",
                    suggestion="하이픈 포함 010-XXXX-XXXX로 수정하세요.",
                )
            )
        department = emp.get("department")
        if not isinstance(department, str):
            errors.append(
                ValidationError(
                    location=location,
                    field="department",
                    message="문자열 값이 필요합니다.",
                    suggestion="등록된 부서명을 문자열로 입력하세요.",
                )
            )
        elif department not in departments:
            errors.append(
                ValidationError(
                    location=location,
                    field="department",
                    message="정의되지 않은 부서입니다.",
                    suggestion=f"사용 가능한 부서: {', '.join(sorted(departments))}",
                )
            )
        salary = emp.get("salary")
        if not isinstance(salary, (int, float)):
            errors.append(
                ValidationError(
                    location=location,
                    field="salary",
                    message="급여는 숫자여야 합니다.",
                    suggestion="정수 혹은 실수로 입력하세요 (예: 42000000).",
                )
            )
        else:
            min_salary = salary_range.get("min")
            max_salary = salary_range.get("max")
            if isinstance(min_salary, (int, float)) and salary < min_salary:
                errors.append(
                    ValidationError(
                        location=location,
                        field="salary",
                        message=f"최소 급여 {min_salary:,} 미만입니다.",
                        suggestion="급여 데이터를 재확인하거나 기본 범위를 조정하세요.",
                    )
                )
            if isinstance(max_salary, (int, float)) and salary > max_salary:
                errors.append(
                    ValidationError(
                        location=location,
                        field="salary",
                        message=f"최대 급여 {max_salary:,} 초과입니다.",
                        suggestion="실제 급여가 맞다면 salary_range 값을 상향 조정하세요.",
                    )
                )

    for dup_id, count in id_counts.items():
        if count > 1:
            errors.append(
                ValidationError(
                    location="employees",
                    field="id",
                    message=f"ID '{dup_id}'가 {count}회 중복되었습니다.",
                    suggestion="ID를 고유하게 재할당하세요.",
                )
            )
    for dup_email, count in email_counts.items():
        if count > 1:
            errors.append(
                ValidationError(
                    location="employees",
                    field="email",
                    message=f"이메일 '{dup_email}'가 {count}회 중복되었습니다.",
                    suggestion="각 직원마다 고유 이메일을 입력하세요.",
                )
            )

    return errors


def run_validation(path: Path) -> int:
    data = load_json(path)
    errors: List[ValidationError] = []
    errors.extend(validate_structure(data))

    salary_range = data.get("salary_range")
    if isinstance(salary_range, dict):
        errors.extend(validate_salary_range(salary_range))

    errors.extend(validate_employees(data))

    if not errors:
        print("OK: 모든 검증을 통과했습니다.")
        return 0

    print(f"FAIL: 총 {len(errors)}건의 오류가 발견되었습니다:\n")
    for err in errors:
        print(err.format())
    return 1


def main() -> None:
    parser = argparse.ArgumentParser(description="JSON 데이터 검증 도구")
    parser.add_argument(
        "path",
        nargs="?",
        default="validation_data.json",
        help="검증할 JSON 파일 경로 (기본값: validation_data.json)",
    )
    args = parser.parse_args()
    exit_code = run_validation(Path(args.path))
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
