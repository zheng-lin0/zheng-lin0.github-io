class PasswordGenerator {
    constructor() {
        this.passwordLength = 12;
        this.includeUppercase = true;
        this.includeLowercase = true;
        this.includeNumbers = true;
        this.includeSymbols = true;
        this.excludeAmbiguous = false;
        this.generatedPassword = '';
        this.history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    }

    renderControls() {
        const container = document.createElement('div');
        container.className = 'password-generator-container';
        container.innerHTML = `
            <div class="password-output">
                <input type="text" id="generatedPassword" readonly value="${this.generatedPassword}">
                <button id="copyPassword" class="btn btn-primary">复制</button>
                <button id="regeneratePassword" class="btn btn-secondary">重新生成</button>
            </div>

            <div class="options-grid">
                <div class="option-group">
                    <label>
                        <input type="range" id="passwordLength" min="4" max="32" value="${this.passwordLength}">
                        密码长度: <span id="lengthValue">${this.passwordLength}</span>
                    </label>
                </div>

                <div class="option-group">
                    <label>
                        <input type="checkbox" id="includeUppercase" ${this.includeUppercase ? 'checked' : ''}>
                        包含大写字母 (A-Z)
                    </label>
                    <label>
                        <input type="checkbox" id="includeLowercase" ${this.includeLowercase ? 'checked' : ''}>
                        包含小写字母 (a-z)
                    </label>
                    <label>
                        <input type="checkbox" id="includeNumbers" ${this.includeNumbers ? 'checked' : ''}>
                        包含数字 (0-9)
                    </label>
                    <label>
                        <input type="checkbox" id="includeSymbols" ${this.includeSymbols ? 'checked' : ''}>
                        包含符号 (!@#$%^&*)
                    </label>
                    <label>
                        <input type="checkbox" id="excludeAmbiguous" ${this.excludeAmbiguous ? 'checked' : ''}>
                        排除易混淆字符 (0OIl)
                    </label>
                </div>
            </div>

            <div class="calculator-history">
                <h5>密码历史</h5>
                <div class="history-list">
                    ${this.history.map(pass => `<div class="history-item"><code>${pass}</code></div>`).join('')}
                    ${this.history.length === 0 ? '<div class="history-empty">暂无历史记录</div>' : ''}
                </div>
            </div>
        `;
        return container;
    }

    generatePassword() {
        let charset = '';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const ambiguous = '0OIl';

        if (this.includeUppercase) charset += uppercase;
        if (this.includeLowercase) charset += lowercase;
        if (this.includeNumbers) charset += numbers;
        if (this.includeSymbols) charset += symbols;

        if (this.excludeAmbiguous) {
            charset = charset.split('').filter(char => !ambiguous.includes(char)).join('');
        }

        if (charset === '') {
            alert('请至少选择一种字符类型！');
            return;
        }

        let password = '';
        for (let i = 0; i < this.passwordLength; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        this.generatedPassword = password;
        this.addToHistory(password);
        return password;
    }

    addToHistory(password) {
        this.history.unshift(password);
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        localStorage.setItem('passwordHistory', JSON.stringify(this.history));
    }

    copyToClipboard() {
        if (this.generatedPassword) {
            navigator.clipboard.writeText(this.generatedPassword)
                .then(() => {
                    alert('密码已复制到剪贴板！');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动复制！');
                });
        }
    }

    setupEventListeners() {
        // 长度滑块事件
        const lengthSlider = document.getElementById('passwordLength');
        const lengthValue = document.getElementById('lengthValue');
        lengthSlider.addEventListener('input', (e) => {
            this.passwordLength = parseInt(e.target.value);
            lengthValue.textContent = this.passwordLength;
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });

        // 选项复选框事件
        document.getElementById('includeUppercase').addEventListener('change', (e) => {
            this.includeUppercase = e.target.checked;
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });

        document.getElementById('includeLowercase').addEventListener('change', (e) => {
            this.includeLowercase = e.target.checked;
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });

        document.getElementById('includeNumbers').addEventListener('change', (e) => {
            this.includeNumbers = e.target.checked;
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });

        document.getElementById('includeSymbols').addEventListener('change', (e) => {
            this.includeSymbols = e.target.checked;
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });

        document.getElementById('excludeAmbiguous').addEventListener('change', (e) => {
            this.excludeAmbiguous = e.target.checked;
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });

        // 按钮事件
        document.getElementById('copyPassword').addEventListener('click', () => {
            this.copyToClipboard();
        });

        document.getElementById('regeneratePassword').addEventListener('click', () => {
            this.generatePassword();
            document.getElementById('generatedPassword').value = this.generatedPassword;
        });
    }
}

// 导出类以便在其他地方使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordGenerator;
} else {
    window.PasswordGenerator = PasswordGenerator;
}