// ====================================
// 암호화 유틸리티 - 메인 스크립트
// ====================================

// AES 암호화 구현 (SubtleCrypto API 사용)
class CryptoManager {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
    }

    // 비밀번호로부터 암호화 키 생성
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: this.algorithm, length: this.keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // 텍스트 암호화
    async encryptText(text, password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const key = await this.deriveKey(password, salt);

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                data
            );

            // Salt + IV + 암호화된 데이터를 결합
            const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(new Uint8Array(encryptedData), salt.length + iv.length);

            // Base64로 인코딩
            return this.arrayBufferToBase64(result);
        } catch (error) {
            throw new Error('암호화 실패: ' + error.message);
        }
    }

    // 텍스트 복호화
    async decryptText(encryptedText, password) {
        try {
            // Base64 디코딩
            const data = this.base64ToArrayBuffer(encryptedText);

            // Salt, IV, 암호화된 데이터 분리
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encryptedData = data.slice(28);

            const key = await this.deriveKey(password, salt);

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encryptedData
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);
        } catch (error) {
            throw new Error('복호화 실패: 잘못된 키이거나 데이터가 손상되었습니다.');
        }
    }

    // 파일 암호화
    async encryptFile(fileData, password, fileName) {
        try {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const key = await this.deriveKey(password, salt);

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                fileData
            );

            // 파일명 암호화 (선택사항)
            const encoder = new TextEncoder();
            const fileNameData = encoder.encode(fileName);
            const fileNameLength = new Uint8Array([fileNameData.length]);

            // Salt + IV + 파일명 길이 + 파일명 + 암호화된 데이터
            const result = new Uint8Array(
                salt.length +
                iv.length +
                1 +
                fileNameData.length +
                encryptedData.byteLength
            );

            let offset = 0;
            result.set(salt, offset);
            offset += salt.length;
            result.set(iv, offset);
            offset += iv.length;
            result.set(fileNameLength, offset);
            offset += 1;
            result.set(fileNameData, offset);
            offset += fileNameData.length;
            result.set(new Uint8Array(encryptedData), offset);

            return result;
        } catch (error) {
            throw new Error('파일 암호화 실패: ' + error.message);
        }
    }

    // 파일 복호화
    async decryptFile(encryptedData, password) {
        try {
            // Salt, IV, 파일명, 암호화된 데이터 분리
            let offset = 0;
            const salt = encryptedData.slice(offset, offset + 16);
            offset += 16;
            const iv = encryptedData.slice(offset, offset + 12);
            offset += 12;
            const fileNameLength = encryptedData[offset];
            offset += 1;
            const fileNameData = encryptedData.slice(offset, offset + fileNameLength);
            offset += fileNameLength;
            const encryptedFileData = encryptedData.slice(offset);

            const key = await this.deriveKey(password, salt);

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encryptedFileData
            );

            const decoder = new TextDecoder();
            const fileName = decoder.decode(fileNameData);

            return {
                data: decryptedData,
                fileName: fileName
            };
        } catch (error) {
            throw new Error('파일 복호화 실패: 잘못된 키이거나 데이터가 손상되었습니다.');
        }
    }

    // 유틸리티 함수들
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    // 안전한 랜덤 키 생성
    generateSecureKey(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

// ====================================
// UI 관리자
// ====================================

class UIManager {
    constructor() {
        this.cryptoManager = new CryptoManager();
        this.currentFiles = [];
        this.batchFiles = [];
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupTextEncryption();
        this.setupFileEncryption();
        this.setupBatchProcessing();
        this.setupKeyGeneration();
        this.setupDragAndDrop();
    }

    // 탭 전환 설정
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    // 텍스트 암호화 설정
    setupTextEncryption() {
        const encryptBtn = document.getElementById('encrypt-text');
        const decryptBtn = document.getElementById('decrypt-text');
        const clearBtn = document.getElementById('clear-text');
        const copyBtn = document.getElementById('copy-text');
        const toggleKeyBtn = document.getElementById('toggle-text-key');

        encryptBtn.addEventListener('click', () => this.encryptText());
        decryptBtn.addEventListener('click', () => this.decryptText());
        clearBtn.addEventListener('click', () => this.clearText());
        copyBtn.addEventListener('click', () => this.copyTextOutput());
        toggleKeyBtn.addEventListener('click', () => this.togglePasswordVisibility('text-key'));
    }

    // 파일 암호화 설정
    setupFileEncryption() {
        const fileInput = document.getElementById('file-input');
        const encryptBtn = document.getElementById('encrypt-file');
        const decryptBtn = document.getElementById('decrypt-file');
        const toggleKeyBtn = document.getElementById('toggle-file-key');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        encryptBtn.addEventListener('click', () => this.encryptFile());
        decryptBtn.addEventListener('click', () => this.decryptFile());
        toggleKeyBtn.addEventListener('click', () => this.togglePasswordVisibility('file-key'));
    }

    // 배치 처리 설정
    setupBatchProcessing() {
        const batchInput = document.getElementById('batch-input');
        const encryptBtn = document.getElementById('encrypt-batch');
        const decryptBtn = document.getElementById('decrypt-batch');
        const clearBtn = document.getElementById('clear-batch');
        const toggleKeyBtn = document.getElementById('toggle-batch-key');

        batchInput.addEventListener('change', (e) => this.handleBatchFileSelect(e));
        encryptBtn.addEventListener('click', () => this.encryptBatch());
        decryptBtn.addEventListener('click', () => this.decryptBatch());
        clearBtn.addEventListener('click', () => this.clearBatch());
        toggleKeyBtn.addEventListener('click', () => this.togglePasswordVisibility('batch-key'));
    }

    // 키 생성 설정
    setupKeyGeneration() {
        const generateTextKey = document.getElementById('generate-text-key');
        const generateFileKey = document.getElementById('generate-file-key');
        const generateBatchKey = document.getElementById('generate-batch-key');

        generateTextKey.addEventListener('click', () => this.generateKey('text-key'));
        generateFileKey.addEventListener('click', () => this.generateKey('file-key'));
        generateBatchKey.addEventListener('click', () => this.generateKey('batch-key'));
    }

    // 드래그 앤 드롭 설정
    setupDragAndDrop() {
        const fileLabel = document.querySelector('#file-tab .file-label');
        const batchLabel = document.querySelector('#batch-tab .file-label');

        this.setupDragDropForElement(fileLabel, document.getElementById('file-input'));
        this.setupDragDropForElement(batchLabel, document.getElementById('batch-input'));
    }

    setupDragDropForElement(element, fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.parentElement.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.parentElement.classList.remove('dragover');
            });
        });

        element.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        });
    }

    // 텍스트 암호화
    async encryptText() {
        const input = document.getElementById('text-input').value;
        const key = document.getElementById('text-key').value;
        const output = document.getElementById('text-output');

        if (!input) {
            this.showNotification('암호화할 텍스트를 입력하세요.', 'error');
            return;
        }

        if (!key) {
            this.showNotification('암호화 키를 입력하세요.', 'error');
            return;
        }

        try {
            const encrypted = await this.cryptoManager.encryptText(input, key);
            output.value = encrypted;
            this.showNotification('텍스트가 암호화되었습니다.', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 텍스트 복호화
    async decryptText() {
        const input = document.getElementById('text-input').value;
        const key = document.getElementById('text-key').value;
        const output = document.getElementById('text-output');

        if (!input) {
            this.showNotification('복호화할 텍스트를 입력하세요.', 'error');
            return;
        }

        if (!key) {
            this.showNotification('복호화 키를 입력하세요.', 'error');
            return;
        }

        try {
            const decrypted = await this.cryptoManager.decryptText(input, key);
            output.value = decrypted;
            this.showNotification('텍스트가 복호화되었습니다.', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 텍스트 초기화
    clearText() {
        document.getElementById('text-input').value = '';
        document.getElementById('text-output').value = '';
        this.showNotification('텍스트가 초기화되었습니다.', 'info');
    }

    // 결과 복사
    copyTextOutput() {
        const output = document.getElementById('text-output');
        if (!output.value) {
            this.showNotification('복사할 내용이 없습니다.', 'error');
            return;
        }

        output.select();
        document.execCommand('copy');
        this.showNotification('결과가 클립보드에 복사되었습니다.', 'success');
    }

    // 파일 선택 처리
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.currentFiles = [file];

        document.getElementById('file-name').textContent = file.name;
        document.getElementById('info-name').textContent = file.name;
        document.getElementById('info-size').textContent = this.formatFileSize(file.size);
        document.getElementById('info-type').textContent = file.type || '알 수 없음';
        document.getElementById('file-info').style.display = 'block';
    }

    // 파일 암호화
    async encryptFile() {
        if (this.currentFiles.length === 0) {
            this.showNotification('암호화할 파일을 선택하세요.', 'error');
            return;
        }

        const key = document.getElementById('file-key').value;
        if (!key) {
            this.showNotification('암호화 키를 입력하세요.', 'error');
            return;
        }

        const file = this.currentFiles[0];

        try {
            const fileData = await this.readFileAsArrayBuffer(file);
            const encrypted = await this.cryptoManager.encryptFile(fileData, key, file.name);

            this.downloadFile(encrypted, file.name + '.encrypted', 'application/octet-stream');
            this.showNotification('파일이 암호화되었습니다.', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 파일 복호화
    async decryptFile() {
        if (this.currentFiles.length === 0) {
            this.showNotification('복호화할 파일을 선택하세요.', 'error');
            return;
        }

        const key = document.getElementById('file-key').value;
        if (!key) {
            this.showNotification('복호화 키를 입력하세요.', 'error');
            return;
        }

        const file = this.currentFiles[0];

        try {
            const fileData = await this.readFileAsArrayBuffer(file);
            const decrypted = await this.cryptoManager.decryptFile(new Uint8Array(fileData), key);

            this.downloadFile(decrypted.data, decrypted.fileName, 'application/octet-stream');
            this.showNotification('파일이 복호화되었습니다.', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 배치 파일 선택 처리
    handleBatchFileSelect(event) {
        const files = Array.from(event.target.files);
        this.batchFiles = files;

        const listElement = document.getElementById('batch-file-list');
        listElement.innerHTML = '';

        files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'batch-file-item';
            item.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <button class="remove-btn" data-index="${index}">제거</button>
            `;
            listElement.appendChild(item);

            item.querySelector('.remove-btn').addEventListener('click', () => {
                this.removeBatchFile(index);
            });
        });

        document.getElementById('batch-file-name').textContent =
            `${files.length}개의 파일이 선택되었습니다`;
    }

    // 배치 파일 제거
    removeBatchFile(index) {
        this.batchFiles.splice(index, 1);

        const event = new Event('change');
        const input = document.getElementById('batch-input');
        const dt = new DataTransfer();

        this.batchFiles.forEach(file => dt.items.add(file));
        input.files = dt.files;

        this.handleBatchFileSelect({ target: input });
    }

    // 배치 암호화
    async encryptBatch() {
        if (this.batchFiles.length === 0) {
            this.showNotification('암호화할 파일을 선택하세요.', 'error');
            return;
        }

        const key = document.getElementById('batch-key').value;
        if (!key) {
            this.showNotification('암호화 키를 입력하세요.', 'error');
            return;
        }

        await this.processBatchFiles('encrypt', key);
    }

    // 배치 복호화
    async decryptBatch() {
        if (this.batchFiles.length === 0) {
            this.showNotification('복호화할 파일을 선택하세요.', 'error');
            return;
        }

        const key = document.getElementById('batch-key').value;
        if (!key) {
            this.showNotification('복호화 키를 입력하세요.', 'error');
            return;
        }

        await this.processBatchFiles('decrypt', key);
    }

    // 배치 파일 처리
    async processBatchFiles(mode, key) {
        const progressElement = document.getElementById('batch-progress');
        const outputElement = document.getElementById('batch-output');

        progressElement.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill">0%</div>
            </div>
        `;

        outputElement.innerHTML = '';

        const total = this.batchFiles.length;
        let completed = 0;

        for (const file of this.batchFiles) {
            try {
                const fileData = await this.readFileAsArrayBuffer(file);

                if (mode === 'encrypt') {
                    const encrypted = await this.cryptoManager.encryptFile(fileData, key, file.name);
                    this.downloadFile(encrypted, file.name + '.encrypted', 'application/octet-stream');
                    this.addBatchResult(file.name, true, '암호화 완료');
                } else {
                    const decrypted = await this.cryptoManager.decryptFile(new Uint8Array(fileData), key);
                    this.downloadFile(decrypted.data, decrypted.fileName, 'application/octet-stream');
                    this.addBatchResult(file.name, true, '복호화 완료');
                }
            } catch (error) {
                this.addBatchResult(file.name, false, error.message);
            }

            completed++;
            const progress = Math.round((completed / total) * 100);
            document.getElementById('progress-fill').style.width = progress + '%';
            document.getElementById('progress-fill').textContent = progress + '%';

            // 약간의 지연으로 UI 업데이트 보장
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.showNotification(`배치 처리 완료: ${completed}/${total}`, 'success');
    }

    // 배치 결과 추가
    addBatchResult(fileName, success, message) {
        const outputElement = document.getElementById('batch-output');
        const item = document.createElement('div');
        item.className = `batch-result-item ${success ? 'success' : 'error'}`;
        item.innerHTML = `
            <span class="file-name">${fileName}</span>
            <span class="status">${message}</span>
        `;
        outputElement.appendChild(item);
    }

    // 배치 초기화
    clearBatch() {
        this.batchFiles = [];
        document.getElementById('batch-input').value = '';
        document.getElementById('batch-file-list').innerHTML = '';
        document.getElementById('batch-file-name').textContent = '여러 파일을 선택하거나 드래그하세요';
        document.getElementById('batch-progress').innerHTML = '';
        document.getElementById('batch-output').innerHTML = '';
        this.showNotification('배치 목록이 초기화되었습니다.', 'info');
    }

    // 키 생성
    generateKey(inputId) {
        const key = this.cryptoManager.generateSecureKey();
        document.getElementById(inputId).value = key;
        this.showNotification('안전한 키가 생성되었습니다.', 'success');
    }

    // 비밀번호 표시/숨김
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        input.type = input.type === 'password' ? 'text' : 'password';
    }

    // 파일 읽기
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('파일 읽기 실패'));
            reader.readAsArrayBuffer(file);
        });
    }

    // 파일 다운로드
    downloadFile(data, fileName, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 파일 크기 포맷
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    new UIManager();
});
