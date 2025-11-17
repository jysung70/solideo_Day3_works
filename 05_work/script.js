// 전역 변수
let logData = [];
let allLogs = [];

// DOM 요소
const fileInput = document.getElementById('logFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsContainer = document.getElementById('results');
const levelFilter = document.getElementById('levelFilter');

// 이벤트 리스너
fileInput.addEventListener('change', handleFileSelect);
analyzeBtn.addEventListener('click', analyzeLogs);
levelFilter.addEventListener('change', filterLogs);

// 파일 선택 처리
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const content = event.target.result;
            parseLogFile(content);

            if (logData.length > 0) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = `분석 시작 (${logData.length}개 로그)`;
            } else {
                analyzeBtn.disabled = true;
                analyzeBtn.textContent = '로그를 파싱할 수 없습니다';
                alert('로그 파일을 파싱할 수 없습니다. 올바른 형식인지 확인하세요.');
            }
        };
        reader.readAsText(file);
    }
}

// 로그 파일 파싱
function parseLogFile(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    allLogs = lines.map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        // 정규식을 사용한 정확한 파싱
        // 형식: 날짜 시간 레벨 IP 액션 나머지...
        const regex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(\w+)\s+([\d.]+)\s+(\w+)\s+(.*)$/;
        const match = trimmedLine.match(regex);

        if (!match) {
            console.warn('파싱 실패:', trimmedLine);
            return null;
        }

        const [, date, time, level, ip, action, details] = match;

        // 시간대 추출 (시)
        const hour = parseInt(time.split(':')[0]);

        const log = {
            rawLine: trimmedLine,
            date: date,
            time: time,
            level: level,
            ip: ip,
            action: action,
            details: details,
            hour: hour
        };

        return log;
    }).filter(log => log !== null);

    logData = allLogs;

    // 디버깅: 파싱된 데이터 확인
    console.log('파싱된 로그 개수:', logData.length);
    console.log('첫 번째 로그:', logData[0]);
}

// 로그 분석 메인 함수
function analyzeLogs() {
    if (logData.length === 0) {
        alert('분석할 로그 데이터가 없습니다.');
        return;
    }

    // 결과 컨테이너 표시
    resultsContainer.style.display = 'block';

    // 각 분석 실행
    calculateStatistics();
    analyzeByTime();
    detectSecurityIssues();
    analyzeErrorPatterns();
    analyzeIPAddresses();
    displayLogDetails();
    createCharts();

    // 결과 섹션으로 스크롤
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// 1. 통계 계산
function calculateStatistics() {
    const stats = {
        total: logData.length,
        INFO: 0,
        WARNING: 0,
        ERROR: 0,
        CRITICAL: 0
    };

    logData.forEach(log => {
        if (stats.hasOwnProperty(log.level)) {
            stats[log.level]++;
        }
    });

    // DOM 업데이트
    document.getElementById('totalLogs').textContent = stats.total;
    document.getElementById('infoCount').textContent = stats.INFO;
    document.getElementById('warningCount').textContent = stats.WARNING;
    document.getElementById('errorCount').textContent = stats.ERROR;
    document.getElementById('criticalCount').textContent = stats.CRITICAL;
}

// 2. 시간대별 분석
function analyzeByTime() {
    const hourlyStats = {};

    // 시간대별 집계
    logData.forEach(log => {
        const hour = log.hour;
        if (!hourlyStats[hour]) {
            hourlyStats[hour] = {
                total: 0,
                INFO: 0,
                WARNING: 0,
                ERROR: 0,
                CRITICAL: 0
            };
        }
        hourlyStats[hour].total++;
        if (hourlyStats[hour].hasOwnProperty(log.level)) {
            hourlyStats[hour][log.level]++;
        }
    });

    // 시간대별 요약 표시
    const timeStatsList = document.getElementById('timeStatsList');
    timeStatsList.innerHTML = '';

    Object.keys(hourlyStats).sort((a, b) => a - b).forEach(hour => {
        const stats = hourlyStats[hour];
        const div = document.createElement('div');
        div.className = 'time-stat-item';
        div.innerHTML = `
            <strong>${hour}:00 ~ ${hour}:59</strong>
            <div>총 ${stats.total}개 로그</div>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                INFO: ${stats.INFO} | WARNING: ${stats.WARNING} | ERROR: ${stats.ERROR} | CRITICAL: ${stats.CRITICAL}
            </div>
        `;
        timeStatsList.appendChild(div);
    });

    return hourlyStats;
}

// 3. 보안 이슈 탐지
function detectSecurityIssues() {
    const issues = [];

    // 로그인 실패 패턴 탐지
    const failedLogins = logData.filter(log =>
        log.details.includes('status=FAILED') && log.action === 'LOGIN'
    );

    if (failedLogins.length > 0) {
        const ipMap = {};
        failedLogins.forEach(log => {
            if (!ipMap[log.ip]) {
                ipMap[log.ip] = [];
            }
            ipMap[log.ip].push(log);
        });

        Object.keys(ipMap).forEach(ip => {
            if (ipMap[ip].length >= 2) {
                issues.push({
                    severity: 'high',
                    title: `무차별 대입 공격 시도 의심`,
                    description: `IP ${ip}에서 ${ipMap[ip].length}회의 로그인 실패가 감지되었습니다.`,
                    details: `시간: ${ipMap[ip].map(l => l.time).join(', ')}`,
                    type: 'brute-force'
                });
            }
        });
    }

    // 차단된 계정
    const blockedAccounts = logData.filter(log =>
        log.details.includes('status=BLOCKED')
    );

    blockedAccounts.forEach(log => {
        issues.push({
            severity: 'critical',
            title: '계정 차단 발생',
            description: `${log.ip}에서 계정 차단이 발생했습니다.`,
            details: `상세: ${log.details}`,
            type: 'account-blocked'
        });
    });

    // 접근 거부 (403)
    const accessDenied = logData.filter(log =>
        log.details.includes('status=403')
    );

    if (accessDenied.length > 0) {
        issues.push({
            severity: 'high',
            title: '무단 접근 시도',
            description: `${accessDenied.length}건의 접근 거부가 발생했습니다.`,
            details: `영향받은 IP: ${[...new Set(accessDenied.map(l => l.ip))].join(', ')}`,
            type: 'unauthorized-access'
        });
    }

    // 시스템 크리티컬 이벤트
    const criticalEvents = logData.filter(log => log.level === 'CRITICAL');

    criticalEvents.forEach(log => {
        issues.push({
            severity: 'critical',
            title: '시스템 심각 이벤트',
            description: log.details,
            details: `시간: ${log.date} ${log.time}`,
            type: 'system-critical'
        });
    });

    // 외부 IP 접근
    const externalIPs = logData.filter(log =>
        !log.ip.startsWith('192.168.') && !log.ip.startsWith('10.')
    );

    if (externalIPs.length > 0) {
        const uniqueExternal = [...new Set(externalIPs.map(l => l.ip))];
        if (uniqueExternal.length > 0) {
            issues.push({
                severity: 'warning',
                title: '외부 IP 접근 탐지',
                description: `${uniqueExternal.length}개의 외부 IP 주소에서 접근이 있었습니다.`,
                details: `IP: ${uniqueExternal.join(', ')}`,
                type: 'external-access'
            });
        }
    }

    // 표시
    const securityIssuesDiv = document.getElementById('securityIssues');
    securityIssuesDiv.innerHTML = '';

    if (issues.length === 0) {
        securityIssuesDiv.innerHTML = '<div class="no-data">탐지된 보안 이슈가 없습니다.</div>';
    } else {
        issues.forEach(issue => {
            const div = document.createElement('div');
            div.className = `issue-item ${issue.severity}`;
            div.innerHTML = `
                <div class="issue-title">${issue.title}</div>
                <div class="issue-description">${issue.description}</div>
                <div class="issue-details">${issue.details}</div>
            `;
            securityIssuesDiv.appendChild(div);
        });
    }
}

// 4. 에러 패턴 분석
function analyzeErrorPatterns() {
    const patterns = {};

    // ERROR와 WARNING 로그만 필터링
    const errorLogs = logData.filter(log =>
        log.level === 'ERROR' || log.level === 'WARNING' || log.level === 'CRITICAL'
    );

    // 패턴별 그룹화
    errorLogs.forEach(log => {
        let pattern = '';

        if (log.details.includes('status=FAILED')) {
            pattern = '로그인 실패';
        } else if (log.details.includes('status=BLOCKED')) {
            pattern = '계정 차단';
        } else if (log.details.includes('status=403')) {
            pattern = '접근 권한 없음';
        } else if (log.details.includes('status=401')) {
            pattern = '인증 실패';
        } else if (log.details.includes('TIMEOUT')) {
            pattern = '연결 타임아웃';
        } else if (log.details.includes('Database')) {
            pattern = '데이터베이스 문제';
        } else {
            pattern = '기타 오류';
        }

        if (!patterns[pattern]) {
            patterns[pattern] = {
                count: 0,
                examples: []
            };
        }
        patterns[pattern].count++;
        if (patterns[pattern].examples.length < 3) {
            patterns[pattern].examples.push(log.rawLine);
        }
    });

    // 표시
    const patternsDiv = document.getElementById('errorPatterns');
    patternsDiv.innerHTML = '';

    if (Object.keys(patterns).length === 0) {
        patternsDiv.innerHTML = '<div class="no-data">탐지된 에러 패턴이 없습니다.</div>';
    } else {
        Object.keys(patterns).sort((a, b) => patterns[b].count - patterns[a].count).forEach(pattern => {
            const data = patterns[pattern];
            const div = document.createElement('div');
            div.className = 'pattern-item';
            div.innerHTML = `
                <div class="pattern-title">
                    ${pattern}
                    <span class="pattern-count">${data.count}건</span>
                </div>
                <div class="pattern-examples">
                    <strong>예시:</strong><br>
                    ${data.examples.map(ex => `• ${ex}`).join('<br>')}
                </div>
            `;
            patternsDiv.appendChild(div);
        });
    }
}

// 5. IP 주소 분석
function analyzeIPAddresses() {
    const ipStats = {};

    logData.forEach(log => {
        if (!ipStats[log.ip]) {
            ipStats[log.ip] = {
                total: 0,
                INFO: 0,
                WARNING: 0,
                ERROR: 0,
                CRITICAL: 0,
                actions: new Set()
            };
        }
        ipStats[log.ip].total++;
        if (ipStats[log.ip].hasOwnProperty(log.level)) {
            ipStats[log.ip][log.level]++;
        }
        ipStats[log.ip].actions.add(log.action);
    });

    // 표시
    const ipDiv = document.getElementById('ipAnalysis');
    ipDiv.innerHTML = '';

    Object.keys(ipStats).sort((a, b) => ipStats[b].total - ipStats[a].total).forEach(ip => {
        const stats = ipStats[ip];
        const isSuspicious = stats.ERROR > 2 || stats.CRITICAL > 0 || stats.WARNING > 3;

        const div = document.createElement('div');
        div.className = `ip-item ${isSuspicious ? 'suspicious' : ''}`;
        div.innerHTML = `
            <div class="ip-address">${ip}</div>
            <div class="ip-stats">
                <div class="ip-stat">
                    <span class="ip-stat-label">총 로그</span>
                    <span class="ip-stat-value">${stats.total}</span>
                </div>
                <div class="ip-stat">
                    <span class="ip-stat-label">경고</span>
                    <span class="ip-stat-value">${stats.WARNING}</span>
                </div>
                <div class="ip-stat">
                    <span class="ip-stat-label">에러</span>
                    <span class="ip-stat-value">${stats.ERROR}</span>
                </div>
                <div class="ip-stat">
                    <span class="ip-stat-label">심각</span>
                    <span class="ip-stat-value">${stats.CRITICAL}</span>
                </div>
            </div>
        `;
        ipDiv.appendChild(div);
    });
}

// 6. 상세 로그 표시
function displayLogDetails(filteredData = null) {
    const logsToDisplay = filteredData || logData;
    const logDetailsDiv = document.getElementById('logDetails');
    logDetailsDiv.innerHTML = '';

    logsToDisplay.forEach(log => {
        const div = document.createElement('div');
        div.className = `log-item ${log.level}`;
        div.innerHTML = `
            <span class="log-timestamp">${log.date} ${log.time}</span>
            <span class="log-level ${log.level}">${log.level}</span>
            <span>${log.ip}</span>
            <span>${log.action}</span>
            <span>${log.details}</span>
        `;
        logDetailsDiv.appendChild(div);
    });
}

// 로그 필터링
function filterLogs() {
    const level = levelFilter.value;

    if (level === 'all') {
        displayLogDetails();
    } else {
        const filtered = logData.filter(log => log.level === level);
        displayLogDetails(filtered);
    }
}

// 7. 차트 생성
function createCharts() {
    createLevelChart();
    createTimeChart();
}

// 로그 레벨 차트
function createLevelChart() {
    const canvas = document.getElementById('levelChart');
    const ctx = canvas.getContext('2d');

    const stats = {
        INFO: logData.filter(l => l.level === 'INFO').length,
        WARNING: logData.filter(l => l.level === 'WARNING').length,
        ERROR: logData.filter(l => l.level === 'ERROR').length,
        CRITICAL: logData.filter(l => l.level === 'CRITICAL').length
    };

    drawBarChart(ctx, canvas, stats, {
        'INFO': '#2196F3',
        'WARNING': '#FF9800',
        'ERROR': '#F44336',
        'CRITICAL': '#9C27B0'
    });
}

// 시간대별 차트
function createTimeChart() {
    const canvas = document.getElementById('timeChart');
    const ctx = canvas.getContext('2d');

    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i] = 0;
    }

    logData.forEach(log => {
        hourlyData[log.hour]++;
    });

    drawLineChart(ctx, canvas, hourlyData);
}

// 막대 차트 그리기
function drawBarChart(ctx, canvas, data, colors) {
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const padding = 40;
    const barWidth = (width - padding * 2) / Object.keys(data).length - 20;

    const maxValue = Math.max(...Object.values(data));
    const scale = (height - padding * 2) / maxValue;

    ctx.clearRect(0, 0, width, height);

    // 배경 그리드
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (height - padding * 2) * i / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y축 레이블
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxValue * i / 5), padding - 10, y + 5);
    }

    // 막대 그리기
    let x = padding + 10;
    Object.keys(data).forEach(key => {
        const value = data[key];
        const barHeight = value * scale;

        ctx.fillStyle = colors[key] || '#667eea';
        ctx.fillRect(x, height - padding - barHeight, barWidth, barHeight);

        // 레이블
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key, x + barWidth / 2, height - padding + 20);

        // 값
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText(value, x + barWidth / 2, height - padding - barHeight - 5);

        x += barWidth + 20;
    });
}

// 선 차트 그리기
function drawLineChart(ctx, canvas, data) {
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const padding = 40;

    const maxValue = Math.max(...Object.values(data));
    const xStep = (width - padding * 2) / 23;
    const yScale = (height - padding * 2) / (maxValue || 1);

    ctx.clearRect(0, 0, width, height);

    // 배경 그리드
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (height - padding * 2) * i / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y축 레이블
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((maxValue || 1) * i / 5), padding - 10, y + 5);
    }

    // 선 그리기
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    Object.keys(data).forEach((hour, index) => {
        const x = padding + index * xStep;
        const y = height - padding - data[hour] * yScale;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // 점 그리기
    ctx.fillStyle = '#764ba2';
    Object.keys(data).forEach((hour, index) => {
        const x = padding + index * xStep;
        const y = height - padding - data[hour] * yScale;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // X축 레이블 (3시간 간격)
        if (index % 3 === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(hour + ':00', x, height - padding + 20);
        }
    });
}
