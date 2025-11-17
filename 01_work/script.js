// DOM 요소 가져오기
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const results = document.getElementById('results');

// 파일 선택 이벤트
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            textInput.value = text;
            analyzeText(text);
        };
        reader.readAsText(file, 'UTF-8');
    }
});

// 분석 버튼 클릭 이벤트
analyzeBtn.addEventListener('click', function() {
    const text = textInput.value;
    if (text.trim()) {
        analyzeText(text);
    } else {
        alert('분석할 텍스트를 입력하거나 파일을 선택해주세요.');
    }
});

// 텍스트 분석 함수
function analyzeText(text) {
    // 문자 수 계산 (공백 포함)
    const charCount = text.length;

    // 문자 수 계산 (공백 제외)
    const charCountNoSpace = text.replace(/\s/g, '').length;

    // 단어 수 계산
    const wordCount = countWords(text);

    // 문장 수 계산
    const sentenceCount = countSentences(text);

    // 한글 문자 수
    const koreanCount = countKorean(text);

    // 영문 문자 수
    const englishCount = countEnglish(text);

    // 숫자 수
    const numberCount = countNumbers(text);

    // 줄 수 계산
    const lineCount = text.split('\n').length;

    // 평균 계산
    const avgWordLength = wordCount > 0 ? (charCountNoSpace / wordCount).toFixed(2) : 0;
    const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(2) : 0;

    // 비율 계산
    const totalLetters = koreanCount + englishCount;
    const koreanPercent = totalLetters > 0 ? ((koreanCount / totalLetters) * 100).toFixed(1) : 0;
    const englishPercent = totalLetters > 0 ? ((englishCount / totalLetters) * 100).toFixed(1) : 0;

    // 결과 표시
    displayResults({
        charCount,
        charCountNoSpace,
        wordCount,
        sentenceCount,
        koreanCount,
        englishCount,
        numberCount,
        lineCount,
        avgWordLength,
        avgSentenceLength,
        koreanPercent,
        englishPercent
    });
}

// 단어 수 계산 함수
function countWords(text) {
    // 공백으로 구분된 단어들
    const words = text.trim().split(/\s+/);

    // 빈 문자열 제거
    const validWords = words.filter(word => word.length > 0);

    return validWords.length;
}

// 문장 수 계산 함수
function countSentences(text) {
    // 문장 종결 부호: . ! ? 。(한글 마침표)
    const sentences = text.split(/[.!?。]+/);

    // 빈 문자열과 공백만 있는 문장 제거
    const validSentences = sentences.filter(sentence => sentence.trim().length > 0);

    return validSentences.length;
}

// 한글 문자 수 계산 함수
function countKorean(text) {
    // 한글 자모 및 음절 매칭 (가-힣: 완성형 한글, ㄱ-ㅎ: 자음, ㅏ-ㅣ: 모음)
    const korean = text.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g);
    return korean ? korean.length : 0;
}

// 영문 문자 수 계산 함수
function countEnglish(text) {
    // 영문 대소문자 매칭
    const english = text.match(/[a-zA-Z]/g);
    return english ? english.length : 0;
}

// 숫자 수 계산 함수
function countNumbers(text) {
    // 숫자 매칭
    const numbers = text.match(/[0-9]/g);
    return numbers ? numbers.length : 0;
}

// 결과 표시 함수
function displayResults(stats) {
    // 각 통계값 업데이트
    document.getElementById('charCount').textContent = stats.charCount.toLocaleString();
    document.getElementById('charCountNoSpace').textContent = stats.charCountNoSpace.toLocaleString();
    document.getElementById('wordCount').textContent = stats.wordCount.toLocaleString();
    document.getElementById('sentenceCount').textContent = stats.sentenceCount.toLocaleString();
    document.getElementById('koreanCount').textContent = stats.koreanCount.toLocaleString();
    document.getElementById('englishCount').textContent = stats.englishCount.toLocaleString();
    document.getElementById('numberCount').textContent = stats.numberCount.toLocaleString();
    document.getElementById('lineCount').textContent = stats.lineCount.toLocaleString();

    // 상세 통계 업데이트
    document.getElementById('avgWordLength').textContent = stats.avgWordLength + ' 문자';
    document.getElementById('avgSentenceLength').textContent = stats.avgSentenceLength + ' 단어';
    document.getElementById('koreanPercent').textContent = stats.koreanPercent + '%';
    document.getElementById('englishPercent').textContent = stats.englishPercent + '%';

    // 결과 섹션 표시
    results.classList.remove('hidden');

    // 결과로 부드럽게 스크롤
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 페이지 로드 시 sample_text.txt가 있다면 자동으로 로드 (선택적)
window.addEventListener('load', function() {
    // 드래그 앤 드롭 기능 추가
    const uploadSection = document.querySelector('.upload-section');

    uploadSection.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadSection.style.borderColor = '#764ba2';
        uploadSection.style.background = '#f0f0ff';
    });

    uploadSection.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadSection.style.borderColor = '#667eea';
        uploadSection.style.background = '#f8f9fa';
    });

    uploadSection.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadSection.style.borderColor = '#667eea';
        uploadSection.style.background = '#f8f9fa';

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/plain') {
            fileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = function(event) {
                const text = event.target.result;
                textInput.value = text;
                analyzeText(text);
            };
            reader.readAsText(file, 'UTF-8');
        } else {
            alert('텍스트 파일(.txt)만 업로드 가능합니다.');
        }
    });
});
