class AgeCalculator {
    constructor() {
        this.birthDate = '';
        this.result = null;
        this.history = JSON.parse(localStorage.getItem('ageHistory')) || [];
    }

    renderControls() {
        const container = document.createElement('div');
        container.className = 'age-calculator-container';
        container.innerHTML = `
            <div class="calculator-form">
                <input type="date" id="birthDate" value="${this.birthDate}">
                <button id="calculateAge" class="btn btn-primary btn-lg">计算年龄</button>
            </div>

            ${this.result ? `
                <div class="result-display">
                    <div class="result-item">
                        <strong>年龄:</strong> ${this.result.years} 岁
                    </div>
                    <div class="result-item">
                        <strong>总月份:</strong> ${this.result.totalMonths} 个月
                    </div>
                    <div class="result-item">
                        <strong>总天数:</strong> ${this.result.totalDays} 天
                    </div>
                    <div class="result-item">
                        <strong>下次生日:</strong> ${this.result.nextBirthday}
                    </div>
                    <div class="result-item">
                        <strong>距离下次生日:</strong> ${this.result.daysUntilBirthday} 天
                    </div>
                </div>
            ` : ''}

            <div class="calculator-history">
                <h5>计算历史</h5>
                <div class="history-list">
                    ${this.history.map(item => `
                        <div class="history-item">
                            <div class="history-expression">出生日期: ${item.birthDate}</div>
                            <div class="history-result">年龄: ${item.result.years} 岁</div>
                            <div class="history-time">${item.date}</div>
                        </div>
                    `).join('')}
                    ${this.history.length === 0 ? '<div class="history-empty">暂无计算历史</div>' : ''}
                </div>
            </div>
        `;
        return container;
    }

    calculateAge() {
        const birthDateInput = document.getElementById('birthDate');
        if (!birthDateInput.value) {
            alert('请选择出生日期！');
            return;
        }

        this.birthDate = birthDateInput.value;
        const birth = new Date(this.birthDate);
        const today = new Date();

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        // 处理月份不足的情况
        if (days < 0) {
            months--;
            // 获取上个月的天数
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }

        // 处理年份不足的情况
        if (months < 0) {
            years--;
            months += 12;
        }

        // 计算总月份和总天数
        const totalMonths = years * 12 + months;
        const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));

        // 计算下次生日
        const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.floor((nextBirthday - today) / (1000 * 60 * 60 * 24));

        // 格式化下次生日日期
        const formattedNextBirthday = nextBirthday.toLocaleDateString('zh-CN');

        this.result = {
            years,
            months,
            days,
            totalMonths,
            totalDays,
            nextBirthday: formattedNextBirthday,
            daysUntilBirthday
        };

        this.addToHistory();
        return this.result;
    }

    addToHistory() {
        const historyItem = {
            birthDate: this.birthDate,
            result: this.result,
            date: new Date().toLocaleString('zh-CN')
        };

        this.history.unshift(historyItem);
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        localStorage.setItem('ageHistory', JSON.stringify(this.history));
    }

    setupEventListeners() {
        // 计算按钮事件
        const calculateBtn = document.getElementById('calculateAge');
        calculateBtn.addEventListener('click', () => {
            this.calculateAge();
            // 重新渲染结果
            const container = document.querySelector('.age-calculator-container');
            const newControls = this.renderControls();
            container.innerHTML = newControls.innerHTML;
            this.setupEventListeners(); // 重新绑定事件
        });

        // 日期输入事件
        const birthDateInput = document.getElementById('birthDate');
        birthDateInput.addEventListener('change', (e) => {
            this.birthDate = e.target.value;
        });
    }
}

// 导出类以便在其他地方使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgeCalculator;
} else {
    window.AgeCalculator = AgeCalculator;
}