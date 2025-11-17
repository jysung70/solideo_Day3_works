// DOM 요소 가져오기
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const resultSection = document.getElementById('resultSection');
const strengthBar = document.getElementById('strengthBar');
const scoreValue = document.getElementById('scoreValue');
const strengthLevel = document.getElementById('strengthLevel');
const criteriaList = document.getElementById('criteriaList');
const recommendationList = document.getElementById('recommendationList');

// 모드 전환 관련
const singleModeBtn = document.getElementById('singleModeBtn');
const batchModeBtn = document.getElementById('batchModeBtn');
const singleMode = document.getElementById('singleMode');
const batchMode = document.getElementById('batchMode');
const batchResultSection = document.getElementById('batchResultSection');

// 파일 업로드 관련
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileName = document.getElementById('fileName');
const checkFileBtn = document.getElementById('checkFileBtn');
const downloadReportBtn = document.getElementById('downloadReportBtn');

let uploadedPasswords = [];

// 비밀번호 표시/숨김 토글
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

// 비밀번호 입력 시 실시간 검증
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;

    if (password.length === 0) {
        resultSection.style.display = 'none';
        return;
    }

    resultSection.style.display = 'block';
    validatePassword(password);
});

// 비밀번호 검증 함수
function validatePassword(password) {
    const criteria = [
        {
            name: '길이 (최소 10자)',
            test: password.length >= 10,
            points: 20,
            recommendation: '비밀번호를 최소 10자 이상으로 설정하세요'
        },
        {
            name: '대문자 포함',
            test: /[A-Z]/.test(password),
            points: 15,
            recommendation: '대문자(A-Z)를 1개 이상 포함하세요'
        },
        {
            name: '소문자 포함',
            test: /[a-z]/.test(password),
            points: 15,
            recommendation: '소문자(a-z)를 1개 이상 포함하세요'
        },
        {
            name: '숫자 포함',
            test: /[0-9]/.test(password),
            points: 15,
            recommendation: '숫자(0-9)를 1개 이상 포함하세요'
        },
        {
            name: '특수문자 포함',
            test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            points: 20,
            recommendation: '특수문자(!@#$%^&* 등)를 1개 이상 포함하세요'
        },
        {
            name: '연속 문자 없음',
            test: !hasSequentialChars(password),
            points: 10,
            recommendation: '연속된 문자(abc, 123 등)를 피하세요'
        },
        {
            name: '반복 문자 없음 (3회 이상)',
            test: !hasRepeatingChars(password),
            points: 5,
            recommendation: '동일한 문자의 반복(aaa, 111 등)을 피하세요'
        }
    ];

    // 추가 보너스 점수
    if (password.length >= 14) {
        criteria.push({
            name: '길이 우수 (14자 이상)',
            test: true,
            points: 10,
            recommendation: null
        });
    }

    if (hasVariedCharacters(password)) {
        criteria.push({
            name: '다양한 문자 조합',
            test: true,
            points: 5,
            recommendation: null
        });
    }

    // 점수 계산
    let totalScore = 0;
    const recommendations = [];

    criteria.forEach(criterion => {
        if (criterion.test) {
            totalScore += criterion.points;
        } else if (criterion.recommendation) {
            recommendations.push(criterion.recommendation);
        }
    });

    // 최대 점수 제한
    totalScore = Math.min(totalScore, 100);

    // UI 업데이트
    updateUI(totalScore, criteria, recommendations);
}

// 연속된 문자 검사
function hasSequentialChars(password) {
    const sequential = [
        'abcdefghijklmnopqrstuvwxyz',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '0123456789'
    ];

    for (let seq of sequential) {
        for (let i = 0; i < seq.length - 2; i++) {
            const substring = seq.substring(i, i + 3);
            if (password.includes(substring)) {
                return true;
            }
        }
    }

    // 역순 검사
    for (let seq of sequential) {
        const reversed = seq.split('').reverse().join('');
        for (let i = 0; i < reversed.length - 2; i++) {
            const substring = reversed.substring(i, i + 3);
            if (password.includes(substring)) {
                return true;
            }
        }
    }

    return false;
}

// 반복 문자 검사
function hasRepeatingChars(password) {
    for (let i = 0; i < password.length - 2; i++) {
        if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
            return true;
        }
    }
    return false;
}

// 다양한 문자 조합 검사
function hasVariedCharacters(password) {
    const types = [
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ];
    return types.filter(Boolean).length >= 4;
}

// UI 업데이트
function updateUI(score, criteria, recommendations) {
    // 점수 표시
    scoreValue.textContent = score;

    // 강도 레벨 결정
    let level, levelClass, barClass;

    if (score < 40) {
        level = '매우 약함';
        levelClass = 'weak';
        barClass = 'weak';
    } else if (score < 60) {
        level = '보통';
        levelClass = 'fair';
        barClass = 'fair';
    } else if (score < 80) {
        level = '좋음';
        levelClass = 'good';
        barClass = 'good';
    } else {
        level = '매우 강함';
        levelClass = 'strong';
        barClass = 'strong';
    }

    strengthLevel.textContent = level;
    strengthLevel.className = `strength-level ${levelClass}`;

    // 강도 바 업데이트
    strengthBar.className = `strength-bar ${barClass}`;
    strengthBar.style.width = `${score}%`;

    // 검증 항목 표시
    criteriaList.innerHTML = '';
    criteria.forEach(criterion => {
        const li = document.createElement('li');
        li.className = criterion.test ? 'passed' : 'failed';
        li.textContent = criterion.name;
        criteriaList.appendChild(li);
    });

    // 개선 방안 표시
    recommendationList.innerHTML = '';
    if (recommendations.length === 0) {
        const li = document.createElement('li');
        li.textContent = '모든 보안 기준을 충족했습니다! 훌륭합니다!';
        li.style.borderBottom = 'none';
        recommendationList.appendChild(li);
    } else {
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationList.appendChild(li);
        });
    }
}

// 모드 전환
singleModeBtn.addEventListener('click', () => {
    singleModeBtn.classList.add('active');
    batchModeBtn.classList.remove('active');
    singleMode.style.display = 'block';
    batchMode.style.display = 'none';
    resultSection.style.display = 'none';
    batchResultSection.style.display = 'none';
});

batchModeBtn.addEventListener('click', () => {
    batchModeBtn.classList.add('active');
    singleModeBtn.classList.remove('active');
    batchMode.style.display = 'block';
    singleMode.style.display = 'none';
    resultSection.style.display = 'none';
    batchResultSection.style.display = 'none';
});

// 파일 선택 버튼
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// 파일 선택 시
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        checkFileBtn.style.display = 'block';

        // 파일 읽기
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            uploadedPasswords = content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (uploadedPasswords.length === 0) {
                alert('파일에 비밀번호가 없습니다.');
                checkFileBtn.style.display = 'none';
            }
        };
        reader.readAsText(file);
    }
});

// 파일 검증 시작
checkFileBtn.addEventListener('click', () => {
    if (uploadedPasswords.length === 0) {
        alert('먼저 파일을 업로드하세요.');
        return;
    }

    batchResultSection.style.display = 'block';
    processBatchPasswords(uploadedPasswords);
});

// 배치 검증 함수
function processBatchPasswords(passwords) {
    const results = [];
    let totalScore = 0;
    const stats = {
        strong: 0,
        good: 0,
        fair: 0,
        weak: 0
    };

    passwords.forEach((password, index) => {
        const result = getPasswordAnalysis(password);
        results.push({
            index: index + 1,
            password: password,
            score: result.score,
            level: result.level,
            levelClass: result.levelClass,
            issues: result.issues
        });

        totalScore += result.score;
        stats[result.levelClass]++;
    });

    const averageScore = Math.round(totalScore / passwords.length);

    // UI 업데이트
    updateBatchUI(results, stats, averageScore);
}

// 비밀번호 분석 결과 반환
function getPasswordAnalysis(password) {
    const criteria = [
        {
            name: '길이 (최소 10자)',
            test: password.length >= 10,
            points: 20,
            issue: '길이 부족'
        },
        {
            name: '대문자 포함',
            test: /[A-Z]/.test(password),
            points: 15,
            issue: '대문자 없음'
        },
        {
            name: '소문자 포함',
            test: /[a-z]/.test(password),
            points: 15,
            issue: '소문자 없음'
        },
        {
            name: '숫자 포함',
            test: /[0-9]/.test(password),
            points: 15,
            issue: '숫자 없음'
        },
        {
            name: '특수문자 포함',
            test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            points: 20,
            issue: '특수문자 없음'
        },
        {
            name: '연속 문자 없음',
            test: !hasSequentialChars(password),
            points: 10,
            issue: '연속 문자'
        },
        {
            name: '반복 문자 없음',
            test: !hasRepeatingChars(password),
            points: 5,
            issue: '반복 문자'
        }
    ];

    // 추가 보너스
    if (password.length >= 14) {
        criteria.push({
            name: '길이 우수',
            test: true,
            points: 10,
            issue: null
        });
    }

    if (hasVariedCharacters(password)) {
        criteria.push({
            name: '다양한 조합',
            test: true,
            points: 5,
            issue: null
        });
    }

    let score = 0;
    const issues = [];

    criteria.forEach(criterion => {
        if (criterion.test) {
            score += criterion.points;
        } else if (criterion.issue) {
            issues.push(criterion.issue);
        }
    });

    score = Math.min(score, 100);

    let level, levelClass;
    if (score < 40) {
        level = '매우 약함';
        levelClass = 'weak';
    } else if (score < 60) {
        level = '보통';
        levelClass = 'fair';
    } else if (score < 80) {
        level = '좋음';
        levelClass = 'good';
    } else {
        level = '매우 강함';
        levelClass = 'strong';
    }

    return {
        score,
        level,
        levelClass,
        issues: issues.length > 0 ? issues.join(', ') : '문제 없음'
    };
}

// 배치 결과 UI 업데이트
function updateBatchUI(results, stats, averageScore) {
    // 통계 업데이트
    document.getElementById('totalPasswords').textContent = results.length;
    document.getElementById('strongCount').textContent = stats.strong;
    document.getElementById('goodCount').textContent = stats.good;
    document.getElementById('fairCount').textContent = stats.fair;
    document.getElementById('weakCount').textContent = stats.weak;
    document.getElementById('averageScore').textContent = averageScore;

    // 테이블 업데이트
    const tableBody = document.getElementById('resultTableBody');
    tableBody.innerHTML = '';

    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.index}</td>
            <td class="password-cell">${escapeHtml(result.password)}</td>
            <td class="score-cell">${result.score}</td>
            <td><span class="level-badge ${result.levelClass}">${result.level}</span></td>
            <td class="issues-cell">${result.issues}</td>
        `;
        tableBody.appendChild(row);
    });

    // 다운로드 버튼 이벤트 저장
    downloadReportBtn.onclick = () => downloadCSV(results, averageScore);
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CSV 다운로드
function downloadCSV(results, averageScore) {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += '번호,비밀번호,점수,강도,주요 문제점\n';

    results.forEach(result => {
        csv += `${result.index},"${result.password}",${result.score},${result.level},"${result.issues}"\n`;
    });

    csv += `\n평균 점수,${averageScore}/100\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `password_security_report_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 페이지 로드 시 입력창에 포커스
window.addEventListener('load', () => {
    passwordInput.focus();
});
