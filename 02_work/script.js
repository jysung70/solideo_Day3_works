// 전역 변수
let originalText = '';
let maskedText = '';
let detectionResults = {};

// 개인정보 패턴 정의 (정규식)
const patterns = {
    ssn: {
        name: '주민등록번호',
        regex: [
            /\d{6}[-\s]?[1-4]\d{6}/g,  // 123456-1234567 또는 1234561234567
        ]
    },
    phone: {
        name: '전화번호',
        regex: [
            /01[0-9][-.\s]?\d{3,4}[-.\s]?\d{4}/g,  // 010-1234-5678, 010.1234.5678
            /01[0-9]\d{7,8}/g,  // 01012345678
        ]
    },
    email: {
        name: '이메일',
        regex: [
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
        ]
    },
    card: {
        name: '신용카드',
        regex: [
            /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g
        ]
    },
    account: {
        name: '계좌번호',
        regex: [
            /\d{6}[-\s]?\d{2}[-\s]?\d{6}/g,  // 123456-78-901234
            /\d{11,14}/g  // 11-14자리 연속 숫자
        ]
    },
    passport: {
        name: '여권번호',
        regex: [
            /[A-Z]\d{8}/g  // M12345678
        ]
    },
    license: {
        name: '운전면허',
        regex: [
            /[가-힣]{2}[-\s]?\d{2}[-\s]?\d{6}[-\s]?\d{2}/g  // 서울-02-123456-78
        ]
    },
    business: {
        name: '사업자등록번호',
        regex: [
            /\d{3}[-\s]?\d{2}[-\s]?\d{5}/g  // 123-45-67890
        ]
    }
};

// 파일 업로드 처리
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');

fileInput.addEventListener('change', handleFileSelect);

// 드래그 앤 드롭 처리
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.name.endsWith('.txt')) {
        alert('텍스트 파일(.txt)만 업로드 가능합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        document.getElementById('inputText').value = content;
        alert('파일이 성공적으로 로드되었습니다!');
    };
    reader.readAsText(file, 'UTF-8');
}

// 마스킹 처리 메인 함수
function processMasking() {
    const inputText = document.getElementById('inputText').value;

    if (!inputText.trim()) {
        alert('텍스트를 입력하거나 파일을 업로드해주세요.');
        return;
    }

    originalText = inputText;
    maskedText = inputText;
    detectionResults = {};

    // 선택된 옵션에 따라 마스킹 처리
    const options = {
        maskSSN: document.getElementById('maskSSN').checked,
        maskPhone: document.getElementById('maskPhone').checked,
        maskEmail: document.getElementById('maskEmail').checked,
        maskCard: document.getElementById('maskCard').checked,
        maskAccount: document.getElementById('maskAccount').checked,
        maskPassport: document.getElementById('maskPassport').checked,
        maskLicense: document.getElementById('maskLicense').checked,
        maskBusiness: document.getElementById('maskBusiness').checked
    };

    // 각 개인정보 유형별 마스킹
    if (options.maskSSN) {
        maskPersonalInfo('ssn', maskSSN);
    }
    if (options.maskPhone) {
        maskPersonalInfo('phone', maskPhone);
    }
    if (options.maskEmail) {
        maskPersonalInfo('email', maskEmail);
    }
    if (options.maskCard) {
        maskPersonalInfo('card', maskCard);
    }
    if (options.maskAccount) {
        maskPersonalInfo('account', maskAccount);
    }
    if (options.maskPassport) {
        maskPersonalInfo('passport', maskPassport);
    }
    if (options.maskLicense) {
        maskPersonalInfo('license', maskLicense);
    }
    if (options.maskBusiness) {
        maskPersonalInfo('business', maskBusiness);
    }

    // 결과 표시
    displayResults();
}

// 개인정보 탐지 및 마스킹
function maskPersonalInfo(type, maskFunction) {
    const pattern = patterns[type];
    let count = 0;

    pattern.regex.forEach(regex => {
        maskedText = maskedText.replace(regex, (match) => {
            count++;
            return maskFunction(match);
        });
    });

    if (count > 0) {
        detectionResults[type] = {
            name: pattern.name,
            count: count
        };
    }
}

// 각 개인정보 유형별 마스킹 함수
function maskSSN(ssn) {
    // 뒤 7자리를 *로 마스킹
    const cleaned = ssn.replace(/[-\s]/g, '');
    if (cleaned.length === 13) {
        return cleaned.substring(0, 6) + '-' + '*******';
    }
    return '******-*******';
}

function maskPhone(phone) {
    // 중간 번호를 *로 마스킹
    const cleaned = phone.replace(/[-.\s]/g, '');
    if (cleaned.length === 10) {
        return cleaned.substring(0, 3) + '-***-' + cleaned.substring(6);
    } else if (cleaned.length === 11) {
        return cleaned.substring(0, 3) + '-****-' + cleaned.substring(7);
    }
    return '***-****-****';
}

function maskEmail(email) {
    // 이메일 앞부분 일부만 표시
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
        return '*'.repeat(local.length) + '@' + domain;
    }
    return local.substring(0, 2) + '*'.repeat(local.length - 2) + '@' + domain;
}

function maskCard(card) {
    // 처음 4자리와 마지막 4자리만 표시
    const cleaned = card.replace(/[-\s]/g, '');
    if (cleaned.length === 16) {
        return cleaned.substring(0, 4) + '-****-****-' + cleaned.substring(12);
    }
    return '****-****-****-****';
}

function maskAccount(account) {
    // 계좌번호 중간 부분을 *로 마스킹
    const cleaned = account.replace(/[-\s]/g, '');
    if (cleaned.length >= 10) {
        const firstPart = cleaned.substring(0, 3);
        const lastPart = cleaned.substring(cleaned.length - 4);
        return firstPart + '*'.repeat(cleaned.length - 7) + lastPart;
    }
    return '*'.repeat(cleaned.length);
}

function maskPassport(passport) {
    // 마지막 3자리만 표시
    if (passport.length === 9) {
        return passport.substring(0, 1) + '******' + passport.substring(7);
    }
    return '*********';
}

function maskLicense(license) {
    // 운전면허 뒷부분을 *로 마스킹
    const parts = license.split('-');
    if (parts.length >= 2) {
        return parts[0] + '-**-******-**';
    }
    return '**-**-******-**';
}

function maskBusiness(business) {
    // 사업자번호 중간 부분을 *로 마스킹
    const cleaned = business.replace(/[-\s]/g, '');
    if (cleaned.length === 10) {
        return cleaned.substring(0, 3) + '-**-' + cleaned.substring(5);
    }
    return '***-**-*****';
}

// 결과 표시
function displayResults() {
    const resultSection = document.getElementById('resultSection');
    const originalTextDiv = document.getElementById('originalText');
    const maskedTextDiv = document.getElementById('maskedText');
    const detectionStats = document.getElementById('detectionStats');

    // 원본과 마스킹된 텍스트 표시
    originalTextDiv.textContent = originalText;
    maskedTextDiv.innerHTML = highlightMasked(maskedText);

    // 탐지 통계 표시
    let statsHTML = '';
    let totalCount = 0;

    for (const [key, value] of Object.entries(detectionResults)) {
        totalCount += value.count;
        statsHTML += `
            <div class="stat-badge">
                <span class="label">${value.name}:</span>
                <span class="count">${value.count}</span>
            </div>
        `;
    }

    if (totalCount === 0) {
        statsHTML = '<div class="stat-badge"><span class="label">탐지된 개인정보가 없습니다</span></div>';
    } else {
        statsHTML = `<div class="stat-badge"><span class="label">총 탐지:</span><span class="count">${totalCount}</span></div>` + statsHTML;
    }

    detectionStats.innerHTML = statsHTML;

    // 결과 섹션 표시
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 마스킹된 부분 하이라이트
function highlightMasked(text) {
    let highlighted = text;

    // 모든 * 패턴을 찾아서 하이라이트
    highlighted = highlighted.replace(/(\*+)/g, '<span class="masked">$1</span>');

    return highlighted;
}

// 마스킹된 텍스트 다운로드
function downloadMaskedText() {
    if (!maskedText) {
        alert('먼저 마스킹 처리를 실행해주세요.');
        return;
    }

    const blob = new Blob([maskedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);

    a.href = url;
    a.download = `masked_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('마스킹된 파일이 다운로드되었습니다!');
}

// 클립보드에 복사
function copyToClipboard() {
    if (!maskedText) {
        alert('먼저 마스킹 처리를 실행해주세요.');
        return;
    }

    navigator.clipboard.writeText(maskedText).then(() => {
        alert('마스킹된 텍스트가 클립보드에 복사되었습니다!');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('클립보드 복사에 실패했습니다.');
    });
}

// 폼 초기화
function resetForm() {
    document.getElementById('inputText').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('resultSection').style.display = 'none';
    originalText = '';
    maskedText = '';
    detectionResults = {};

    // 모든 체크박스 다시 체크
    document.getElementById('maskSSN').checked = true;
    document.getElementById('maskPhone').checked = true;
    document.getElementById('maskEmail').checked = true;
    document.getElementById('maskCard').checked = true;
    document.getElementById('maskAccount').checked = true;
    document.getElementById('maskPassport').checked = true;
    document.getElementById('maskLicense').checked = true;
    document.getElementById('maskBusiness').checked = true;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 페이지 로드 시 샘플 데이터 로드 (선택사항)
window.addEventListener('DOMContentLoaded', () => {
    console.log('개인정보 마스킹 시스템이 준비되었습니다.');
});
