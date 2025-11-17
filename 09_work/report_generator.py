#!/usr/bin/env python3
"""HTML 리포트 생성기."""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any, Dict, Iterable, List

STYLE_BLOCK = """
<style>
    :root {
        --primary: #1f4b99;
        --accent: #f4b400;
        --border: #d9e2ef;
        --bg: #f7f9fc;
        --text: #203040;
    }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        font-family: 'Noto Sans KR', 'Segoe UI', sans-serif;
        background: var(--bg);
        color: var(--text);
    }
    header {
        background: white;
        border-bottom: 4px solid var(--primary);
        padding: 32px 48px;
    }
    header h1 {
        margin: 0 0 8px;
        font-size: 28px;
    }
    header p {
        margin: 4px 0;
        color: #4d5d72;
    }
    main {
        padding: 32px 48px;
    }
    section {
        background: white;
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
    }
    h2 {
        margin-top: 0;
        color: var(--primary);
        font-size: 22px;
    }
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
    }
    .card {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 16px;
        background: var(--bg);
    }
    .card span.label {
        font-size: 14px;
        color: #6b7a90;
    }
    .card span.value {
        display: block;
        font-size: 24px;
        font-weight: 600;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
    }
    th, td {
        border: 1px solid var(--border);
        padding: 10px 12px;
        text-align: center;
        font-size: 14px;
    }
    th {
        background: #eef3fb;
        font-weight: 600;
    }
    ul {
        padding-left: 20px;
        margin: 0;
    }
    li {
        margin-bottom: 6px;
    }
    .footnote {
        font-size: 12px;
        color: #6b7a90;
        margin-top: 12px;
    }
    .chart-wrapper {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
    }
</style>
"""


def load_data(path: Path) -> Dict[str, Any]:
    # BOM이 포함된 파일도 읽을 수 있도록 utf-8-sig 사용
    with path.open("r", encoding="utf-8-sig") as fh:
        return json.load(fh)


def format_date(date_str: str | None) -> str:
    if not date_str:
        return "작성일 미상"
    try:
        dt = datetime.fromisoformat(date_str)
        return dt.strftime("%Y년 %m월 %d일")
    except ValueError:
        return date_str


def format_number(value: Any, decimals: int = 0) -> str:
    if isinstance(value, (int, float)):
        if decimals:
            return f"{value:,.{decimals}f}"
        return f"{value:,}"
    return str(value)


def build_summary_cards(summary: Dict[str, Any]) -> str:
    mapping = [
        ("총 서비스 수", summary.get("total_services"), "건"),
        ("신규 서비스", summary.get("new_services"), "건"),
        ("개선 완료", summary.get("improved_services"), "건"),
        ("평균 만족도", summary.get("user_satisfaction"), "점"),
    ]
    cards = []
    for label, value, unit in mapping:
        val = "-" if value is None else f"{format_number(value, 1 if label == '평균 만족도' else 0)} {unit}".strip()
        cards.append(
            f"<div class=\"card\"><span class=\"label\">{escape(label)}</span><span class=\"value\">{escape(val)}</span></div>"
        )
    return f"<div class=\"summary-grid\">{''.join(cards)}</div>"


def build_department_table(rows: Iterable[Dict[str, Any]]) -> str:
    header = """
    <table>
        <thead>
            <tr>
                <th>부서</th>
                <th>제공 서비스</th>
                <th>이용자 수</th>
                <th>만족도</th>
                <th>집행 예산(%)</th>
            </tr>
        </thead>
        <tbody>
    """
    body_rows: List[str] = []
    for row in rows:
        body_rows.append(
            "<tr>"
            f"<td>{escape(str(row.get('name', '-')))}</td>"
            f"<td>{format_number(row.get('services', '-'))}</td>"
            f"<td>{format_number(row.get('users', '-'))}</td>"
            f"<td>{format_number(row.get('satisfaction', '-'), 1)}</td>"
            f"<td>{format_number(row.get('budget_used', '-'), 1)}</td>"
            "</tr>"
        )
    footer = "</tbody></table>"
    return header + "".join(body_rows) + footer


def build_list(items: Iterable[str]) -> str:
    escaped = ''.join(f"<li>{escape(item)}</li>" for item in items)
    return f"<ul>{escaped}</ul>"


def build_monthly_table(rows: Iterable[Dict[str, Any]]) -> str:
    header = """
    <table>
        <thead>
            <tr>
                <th>월</th>
                <th>이용자 수</th>
                <th>서비스 수</th>
            </tr>
        </thead>
        <tbody>
    """
    body_rows: List[str] = []
    for row in rows:
        body_rows.append(
            "<tr>"
            f"<td>{escape(str(row.get('month', '-')))}</td>"
            f"<td>{format_number(row.get('users', '-'))}</td>"
            f"<td>{format_number(row.get('services', '-'))}</td>"
            "</tr>"
        )
    footer = "</tbody></table>"
    return header + "".join(body_rows) + footer


def render_report(data: Dict[str, Any]) -> str:
    title = escape(data.get("title", "데이터 리포트"))
    date = format_date(data.get("date"))
    summary_cards = build_summary_cards(data.get("summary", {}))
    dept_table = build_department_table(data.get("departments", []))
    monthly_table = build_monthly_table(data.get("monthly_stats", []))
    monthly_json = json.dumps(data.get("monthly_stats", []), ensure_ascii=False)
    issues = build_list(data.get("issues", []))
    next_steps = build_list(data.get("next_steps", []))

    parts: List[str] = []
    parts.append("<!DOCTYPE html>")
    parts.append("<html lang=\"ko\">")
    parts.append("<head>")
    parts.append("<meta charset=\"utf-8\">")
    parts.append("<title>" + title + "</title>")
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1">')
    parts.append('<link rel="preconnect" href="https://fonts.gstatic.com">')
    parts.append('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap" rel="stylesheet">')
    parts.append(STYLE_BLOCK)
    parts.append("</head>")
    parts.append("<body>")
    parts.append("<header>")
    parts.append(f"<h1>{title}</h1>")
    parts.append(f"<p>작성일: {escape(date)}</p>")
    parts.append("<p>문서번호: GOV-DS-" + datetime.now().strftime("%Y%m%d") + "</p>")
    parts.append("</header>")
    parts.append("<main>")

    parts.append("<section>")
    parts.append("<h2>1. 핵심 지표 요약</h2>")
    parts.append(summary_cards)
    parts.append("</section>")

    parts.append("<section>")
    parts.append("<h2>2. 부처별 운영 현황</h2>")
    parts.append(dept_table)
    parts.append("</section>")

    parts.append("<section>")
    parts.append("<h2>3. 월별 이용 추이</h2>")
    parts.append('<div class="chart-wrapper"><canvas id="monthlyChart" height="320"></canvas></div>')
    parts.append(monthly_table)
    parts.append("</section>")

    parts.append("<section>")
    parts.append("<h2>4. 주요 이슈</h2>")
    parts.append(issues)
    parts.append("</section>")

    parts.append("<section>")
    parts.append("<h2>5. 향후 조치 계획</h2>")
    parts.append(next_steps)
    parts.append("<p class=\"footnote\">※ 본 문서는 내부 검토용 공문서 형식을 따릅니다.</p>")
    parts.append("</section>")

    parts.append("</main>")
    parts.append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>')
    parts.append("<script>")
    parts.append(
        "const monthlyData = " + monthly_json + ";\n"
        "const labels = monthlyData.map(item => item.month);\n"
        "const userData = monthlyData.map(item => item.users);\n"
        "const serviceData = monthlyData.map(item => item.services);\n"
        "const ctx = document.getElementById('monthlyChart').getContext('2d');\n"
        "new Chart(ctx, {\n"
        "    type: 'bar',\n"
        "    data: {\n"
        "        labels,\n"
        "        datasets: [\n"
        "            { label: '이용자 수', data: userData, backgroundColor: 'rgba(31,75,153,0.7)', yAxisID: 'y' },\n"
        "            { label: '서비스 수', data: serviceData, type: 'line', borderColor: '#f4b400', backgroundColor: '#f4b400', yAxisID: 'y1' }\n"
        "        ]\n"
        "    },\n"
        "    options: {\n"
        "        responsive: true,\n"
        "        interaction: { mode: 'index', intersect: false },\n"
        "        scales: {\n"
        "            y: { beginAtZero: true, position: 'left', ticks: { callback: value => value.toLocaleString() } },\n"
        "            y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }\n"
        "        }\n"
        "    }\n"
        "});"
    )
    parts.append("</script>")
    parts.append("</body></html>")

    return "".join(parts)


def generate_report(input_path: Path, output_path: Path) -> Path:
    data = load_data(input_path)
    html = render_report(data)
    output_path.write_text(html, encoding="utf-8")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="JSON 데이터를 HTML 보고서로 변환")
    parser.add_argument("input", nargs="?", default="report_data.json", help="입력 JSON 경로")
    parser.add_argument("-o", "--output", default="report.html", help="생성할 HTML 경로")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output = generate_report(Path(args.input), Path(args.output))
    print(f"보고서가 생성되었습니다: {output.resolve()}")


if __name__ == "__main__":
    main()
