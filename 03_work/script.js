// 전역 변수
let currentMode = 'csvToJson';

// 샘플 데이터
const sampleCSV = `부서명,직원수,예산(백만원),디지털화율(%),만족도
기획조정실,45,2340,92.3,4.2
행정안전부,234,15670,88.5,3.9
과학기술정보통신부,189,45230,95.1,4.5`;

const sampleJSON = `[
  {
    "부서명": "기획조정실",
    "직원수": 45,
    "예산(백만원)": 2340,
    "디지털화율(%)": 92.3,
    "만족도": 4.2
  },
  {
    "부서명": "행정안전부",
    "직원수": 234,
    "예산(백만원)": 15670,
    "디지털화율(%)": 88.5,
    "만족도": 3.9
  }
]`;

// 모드 전환
function switchMode(mode) {
    currentMode = mode;

    // 버튼 활성화 상태 변경
    document.getElementById('csvToJsonBtn').classList.toggle('active', mode === 'csvToJson');
    document.getElementById('jsonToCsvBtn').classList.toggle('active', mode === 'jsonToCsv');

    // 입력 필드 초기화
    document.getElementById('inputData').value = '';
    document.getElementById('outputData').value = '';

    // 파일 입력 accept 변경
    const fileInput = document.getElementById('fileInput');
    fileInput.accept = mode === 'csvToJson' ? '.csv' : '.json';

    // 정보 업데이트
    updateInputInfo('입력 대기 중...');
    updateOutputInfo('변환 대기 중...');

    // 통계 숨김
    document.getElementById('statsSection').style.display = 'none';
}

// 파일 업로드 처리
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('inputData').value = content;
        updateInputInfo(`파일 로드 완료: ${file.name} (${formatBytes(file.size)})`);
    };

    // UTF-8로 읽기 (한글 인코딩 지원)
    reader.readAsText(file, 'UTF-8');
}

// 샘플 데이터 로드
function loadSampleData() {
    const inputData = document.getElementById('inputData');
    inputData.value = currentMode === 'csvToJson' ? sampleCSV : sampleJSON;
    updateInputInfo('샘플 데이터 로드 완료');
}

// 입력 초기화
function clearInput() {
    document.getElementById('inputData').value = '';
    document.getElementById('outputData').value = '';
    document.getElementById('fileInput').value = '';
    updateInputInfo('입력 대기 중...');
    updateOutputInfo('변환 대기 중...');
    document.getElementById('statsSection').style.display = 'none';
}

// 데이터 변환 메인 함수
function convertData() {
    const startTime = performance.now();
    const inputData = document.getElementById('inputData').value.trim();

    if (!inputData) {
        showError('입력 데이터가 없습니다.');
        return;
    }

    try {
        let result;
        let stats;

        if (currentMode === 'csvToJson') {
            const converted = csvToJson(inputData);
            result = converted.data;
            stats = converted.stats;
        } else {
            const converted = jsonToCsv(inputData);
            result = converted.data;
            stats = converted.stats;
        }

        // 결과 출력
        document.getElementById('outputData').value = result;

        // 처리 시간 계산
        const processingTime = (performance.now() - startTime).toFixed(2);

        // 통계 표시
        showStats(stats, processingTime);

        updateOutputInfo('✅ 변환 완료!');

    } catch (error) {
        showError(`변환 오류: ${error.message}`);
        console.error('변환 오류:', error);
    }
}

// CSV to JSON 변환
function csvToJson(csvData) {
    const delimiter = document.getElementById('delimiter').value;
    const supportNested = document.getElementById('supportNested').checked;
    const autoDetectTypes = document.getElementById('autoDetectTypes').checked;
    const prettyPrint = document.getElementById('prettyPrint').checked;

    // 줄 단위로 분할 (CR, LF, CRLF 모두 처리)
    const lines = csvData.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) {
        throw new Error('CSV 데이터가 불완전합니다. 최소 헤더와 1개 행이 필요합니다.');
    }

    // 헤더 파싱
    const headers = parseCSVLine(lines[0], delimiter);
    const rows = [];

    // 각 행 파싱
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);

        if (values.length !== headers.length) {
            console.warn(`행 ${i + 1}: 컬럼 수 불일치 (헤더: ${headers.length}, 데이터: ${values.length})`);
        }

        const row = {};

        for (let j = 0; j < headers.length; j++) {
            let key = headers[j];
            let value = values[j] || '';

            // 자동 타입 감지
            if (autoDetectTypes) {
                value = detectType(value);
            }

            // 중첩 구조 지원 (점 표기법)
            if (supportNested && key.includes('.')) {
                setNestedValue(row, key, value);
            } else {
                row[key] = value;
            }
        }

        rows.push(row);
    }

    // JSON 문자열로 변환
    const jsonString = prettyPrint
        ? JSON.stringify(rows, null, 2)
        : JSON.stringify(rows);

    return {
        data: jsonString,
        stats: {
            rowCount: rows.length,
            columnCount: headers.length,
            dataSize: new Blob([jsonString]).size
        }
    };
}

// JSON to CSV 변환
function jsonToCsv(jsonData) {
    const delimiter = document.getElementById('delimiter').value;
    const includeHeader = document.getElementById('includeHeader').checked;
    const supportNested = document.getElementById('supportNested').checked;

    // JSON 파싱
    let data;
    try {
        data = JSON.parse(jsonData);
    } catch (e) {
        throw new Error('유효하지 않은 JSON 형식입니다.');
    }

    // 배열이 아닌 경우 배열로 변환
    if (!Array.isArray(data)) {
        data = [data];
    }

    if (data.length === 0) {
        throw new Error('JSON 데이터가 비어있습니다.');
    }

    // 모든 키 수집 (중첩 구조 포함)
    const allKeys = new Set();
    data.forEach(item => {
        const keys = supportNested ? getFlattenedKeys(item) : Object.keys(item);
        keys.forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const csvLines = [];

    // 헤더 추가
    if (includeHeader) {
        csvLines.push(headers.map(h => escapeCSVValue(h, delimiter)).join(delimiter));
    }

    // 각 행 변환
    data.forEach(item => {
        const flatItem = supportNested ? flattenObject(item) : item;
        const row = headers.map(header => {
            const value = flatItem[header];
            return escapeCSVValue(value, delimiter);
        });
        csvLines.push(row.join(delimiter));
    });

    const csvString = csvLines.join('\n');

    return {
        data: csvString,
        stats: {
            rowCount: data.length,
            columnCount: headers.length,
            dataSize: new Blob([csvString]).size
        }
    };
}

// CSV 라인 파싱 (따옴표 처리)
function parseCSVLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // 이스케이프된 따옴표
                current += '"';
                i++;
            } else {
                // 따옴표 토글
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            // 구분자 발견 (따옴표 밖)
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
}

// CSV 값 이스케이프
function escapeCSVValue(value, delimiter) {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    // 구분자, 따옴표, 개행이 포함된 경우 따옴표로 감싸기
    if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
}

// 자동 타입 감지
function detectType(value) {
    if (value === '') return '';

    // 숫자 체크
    if (/^-?\d+$/.test(value)) {
        return parseInt(value, 10);
    }

    if (/^-?\d+\.\d+$/.test(value)) {
        return parseFloat(value);
    }

    // 불린 체크
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // null 체크
    if (value.toLowerCase() === 'null') return null;

    return value;
}

// 중첩된 값 설정 (점 표기법)
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
}

// 객체 평탄화 (중첩 구조를 점 표기법으로)
function flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(flattened, flattenObject(value, newKey));
            } else {
                flattened[newKey] = value;
            }
        }
    }

    return flattened;
}

// 평탄화된 키 목록 가져오기
function getFlattenedKeys(obj, prefix = '') {
    const keys = [];

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                keys.push(...getFlattenedKeys(value, newKey));
            } else {
                keys.push(newKey);
            }
        }
    }

    return keys;
}

// 통계 표시
function showStats(stats, processingTime) {
    document.getElementById('processingTime').textContent = `${processingTime} ms`;
    document.getElementById('rowCount').textContent = stats.rowCount.toLocaleString();
    document.getElementById('columnCount').textContent = stats.columnCount.toLocaleString();
    document.getElementById('dataSize').textContent = formatBytes(stats.dataSize);
    document.getElementById('statsSection').style.display = 'block';
}

// 클립보드에 복사
function copyToClipboard() {
    const outputData = document.getElementById('outputData');

    if (!outputData.value) {
        showError('복사할 데이터가 없습니다.');
        return;
    }

    outputData.select();
    document.execCommand('copy');

    // 임시 메시지 표시
    const originalInfo = document.getElementById('outputInfo').textContent;
    updateOutputInfo('📋 클립보드에 복사되었습니다!');

    setTimeout(() => {
        updateOutputInfo(originalInfo);
    }, 2000);
}

// 결과 다운로드
function downloadResult() {
    const outputData = document.getElementById('outputData').value;

    if (!outputData) {
        showError('다운로드할 데이터가 없습니다.');
        return;
    }

    const extension = currentMode === 'csvToJson' ? 'json' : 'csv';
    const mimeType = currentMode === 'csvToJson' ? 'application/json' : 'text/csv';
    const filename = `converted_${Date.now()}.${extension}`;

    // UTF-8 BOM 추가 (엑셀 한글 호환성)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + outputData], { type: `${mimeType};charset=utf-8;` });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // 임시 메시지 표시
    const originalInfo = document.getElementById('outputInfo').textContent;
    updateOutputInfo(`💾 ${filename} 다운로드 완료!`);

    setTimeout(() => {
        updateOutputInfo(originalInfo);
    }, 2000);
}

// 정보 업데이트 함수
function updateInputInfo(message) {
    document.getElementById('inputInfo').textContent = message;
}

function updateOutputInfo(message) {
    const outputInfo = document.getElementById('outputInfo');
    outputInfo.textContent = message;
    outputInfo.parentElement.className = 'info-box success';
}

function showError(message) {
    const outputInfo = document.getElementById('outputInfo');
    outputInfo.textContent = `❌ ${message}`;
    outputInfo.parentElement.className = 'info-box error';
}

// 바이트 포맷팅
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    updateInputInfo('입력 대기 중...');
    updateOutputInfo('변환 대기 중...');
});
