/**
 * 单位转换器工具组件
 * @module UnitConverter
 */

class UnitConverter {
    constructor() {
        this.currentCategory = 'length';
        this.conversionData = {
            length: {
                name: '长度',
                units: {
                    mm: { name: '毫米', factor: 0.001 },
                    cm: { name: '厘米', factor: 0.01 },
                    m: { name: '米', factor: 1 },
                    km: { name: '千米', factor: 1000 },
                    inch: { name: '英寸', factor: 0.0254 },
                    ft: { name: '英尺', factor: 0.3048 },
                    yd: { name: '码', factor: 0.9144 },
                    mi: { name: '英里', factor: 1609.344 }
                }
            },
            weight: {
                name: '重量',
                units: {
                    mg: { name: '毫克', factor: 0.000001 },
                    g: { name: '克', factor: 0.001 },
                    kg: { name: '千克', factor: 1 },
                    ton: { name: '吨', factor: 1000 },
                    oz: { name: '盎司', factor: 0.0283495 },
                    lb: { name: '磅', factor: 0.453592 }
                }
            },
            temperature: {
                name: '温度',
                units: {
                    c: { name: '摄氏度', convert: (val, to) => this.convertTemperature(val, 'c', to) },
                    f: { name: '华氏度', convert: (val, to) => this.convertTemperature(val, 'f', to) },
                    k: { name: '开尔文', convert: (val, to) => this.convertTemperature(val, 'k', to) }
                }
            },
            area: {
                name: '面积',
                units: {
                    mm2: { name: '平方毫米', factor: 0.000001 },
                    cm2: { name: '平方厘米', factor: 0.0001 },
                    m2: { name: '平方米', factor: 1 },
                    km2: { name: '平方千米', factor: 1000000 },
                    ha: { name: '公顷', factor: 10000 },
                    acre: { name: '英亩', factor: 4046.86 },
                    sqft: { name: '平方英尺', factor: 0.092903 }
                }
            },
            volume: {
                name: '体积',
                units: {
                    ml: { name: '毫升', factor: 0.001 },
                    l: { name: '升', factor: 1 },
                    m3: { name: '立方米', factor: 1000 },
                    gal: { name: '加仑', factor: 3.78541 },
                    qt: { name: '夸脱', factor: 0.946353 },
                    pt: { name: '品脱', factor: 0.473176 },
                    cup: { name: '杯', factor: 0.236588 },
                    oz: { name: '盎司', factor: 0.0295735 }
                }
            },
            speed: {
                name: '速度',
                units: {
                    mps: { name: '米/秒', factor: 1 },
                    kmh: { name: '千米/小时', factor: 0.277778 },
                    mph: { name: '英里/小时', factor: 0.44704 },
                    knot: { name: '节', factor: 0.514444 },
                    ftps: { name: '英尺/秒', factor: 0.3048 }
                }
            }
        };
    }

    /**
     * 初始化单位转换器功能
     */
    init() {
        this.renderControls();
        this.setupEventListeners();
    }

    /**
     * 渲染单位转换器控制界面
     * @returns {string} HTML内容
     */
    renderControls() {
        const categories = Object.keys(this.conversionData);
        const categoryData = this.conversionData[this.currentCategory];
        const units = Object.keys(categoryData.units);

        return `
            <div class="unit-converter-container">
                <!-- 分类选择 -->
                <div class="converter-categories">
                    ${categories.map(category => `
                        <button 
                            id="conv-cat-${category}" 
                            class="btn btn-sm ${this.currentCategory === category ? 'btn-primary' : 'btn-secondary'}"
                            data-category="${category}"
                        >
                            ${this.conversionData[category].name}
                        </button>
                    `).join('')}
                </div>

                <!-- 转换界面 -->
                <div class="converter-main">
                    <div class="conversion-panel">
                        <!-- 输入面板 -->
                        <div class="conversion-input">
                            <div class="input-group">
                                <input 
                                    type="number" 
                                    id="conv-from-value" 
                                    class="form-control" 
                                    placeholder="输入数值"
                                    value="1"
                                >
                                <select id="conv-from-unit" class="form-select">
                                    ${units.map(unit => `
                                        <option value="${unit}">${categoryData.units[unit].name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- 转换按钮 -->
                        <div class="conversion-toggle">
                            <button id="conv-swap" class="btn btn-secondary btn-lg">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>

                        <!-- 输出面板 -->
                        <div class="conversion-output">
                            <div class="input-group">
                                <input 
                                    type="text" 
                                    id="conv-to-value" 
                                    class="form-control" 
                                    readonly
                                >
                                <select id="conv-to-unit" class="form-select">
                                    ${units.map(unit => `
                                        <option value="${unit}" ${unit === units[1] ? 'selected' : ''}>${categoryData.units[unit].name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 历史记录 -->
                    <div class="conversion-history">
                        <h5>转换历史</h5>
                        <div id="conv-history" class="history-list">
                            <p class="history-empty">暂无转换记录</p>
                        </div>
                    </div>

                    <!-- 常用转换 -->
                    <div class="quick-conversions">
                        <h5>常用转换</h5>
                        <div id="conv-quick" class="quick-list">
                            ${this.getQuickConversions()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 分类切换
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // 转换计算
        ['conv-from-value', 'conv-from-unit', 'conv-to-unit'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.convert();
                });
            }
        });

        // 单位交换
        const swapBtn = document.getElementById('conv-swap');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                this.swapUnits();
            });
        }

        // 常用转换
        const quickList = document.getElementById('conv-quick');
        if (quickList) {
            quickList.addEventListener('click', (e) => {
                if (e.target.dataset.quick) {
                    const [from, to] = e.target.dataset.quick.split('-');
                    this.applyQuickConversion(from, to);
                }
            });
        }
    }

    /**
     * 切换转换分类
     */
    switchCategory(category) {
        this.currentCategory = category;
        const container = document.querySelector('.unit-converter-container');
        if (container) {
            container.innerHTML = this.renderControls();
            this.setupEventListeners();
            this.convert();
        }
    }

    /**
     * 执行单位转换
     */
    convert() {
        const fromValue = parseFloat(document.getElementById('conv-from-value').value);
        const fromUnit = document.getElementById('conv-from-unit').value;
        const toUnit = document.getElementById('conv-to-unit').value;
        const toValueInput = document.getElementById('conv-to-value');

        if (isNaN(fromValue) || !fromUnit || !toUnit) {
            toValueInput.value = '';
            return;
        }

        let result;
        const categoryData = this.conversionData[this.currentCategory];

        // 温度转换需要特殊处理
        if (this.currentCategory === 'temperature') {
            result = categoryData.units[fromUnit].convert(fromValue, toUnit);
        } else {
            // 其他单位转换
            const baseValue = fromValue * categoryData.units[fromUnit].factor;
            result = baseValue / categoryData.units[toUnit].factor;
        }

        // 格式化结果
        const formattedResult = this.formatResult(result);
        toValueInput.value = formattedResult;

        // 保存到历史记录
        this.saveToHistory(fromValue, fromUnit, formattedResult, toUnit);
    }

    /**
     * 温度转换特殊处理
     */
    convertTemperature(value, from, to) {
        let celsius;

        // 转换为摄氏度
        switch (from) {
            case 'c':
                celsius = value;
                break;
            case 'f':
                celsius = (value - 32) * 5 / 9;
                break;
            case 'k':
                celsius = value - 273.15;
                break;
        }

        // 从摄氏度转换为目标单位
        switch (to) {
            case 'c':
                return celsius;
            case 'f':
                return celsius * 9 / 5 + 32;
            case 'k':
                return celsius + 273.15;
        }
    }

    /**
     * 交换单位
     */
    swapUnits() {
        const fromValue = document.getElementById('conv-from-value').value;
        const fromUnit = document.getElementById('conv-from-unit').value;
        const toValue = document.getElementById('conv-to-value').value;
        const toUnit = document.getElementById('conv-to-unit').value;

        document.getElementById('conv-from-value').value = toValue;
        document.getElementById('conv-from-unit').value = toUnit;
        document.getElementById('conv-to-value').value = fromValue;
        document.getElementById('conv-to-unit').value = fromUnit;

        this.convert();
    }

    /**
     * 格式化转换结果
     */
    formatResult(result) {
        if (isNaN(result)) return '错误';
        
        // 限制小数位数
        if (Math.abs(result) < 0.000001 && result !== 0) {
            return result.toExponential(6);
        } else if (Math.abs(result) >= 1000000) {
            return result.toExponential(6);
        } else {
            return parseFloat(result.toPrecision(10)).toString();
        }
    }

    /**
     * 保存转换历史
     */
    saveToHistory(fromValue, fromUnit, toValue, toUnit) {
        const history = JSON.parse(localStorage.getItem('unitConverterHistory') || '[]');
        const categoryData = this.conversionData[this.currentCategory];

        const historyItem = {
            category: this.currentCategory,
            categoryName: categoryData.name,
            fromValue: parseFloat(fromValue),
            fromUnit: fromUnit,
            fromUnitName: categoryData.units[fromUnit].name,
            toValue: parseFloat(toValue),
            toUnit: toUnit,
            toUnitName: categoryData.units[toUnit].name,
            timestamp: new Date().toLocaleString()
        };

        // 添加到历史记录开头
        history.unshift(historyItem);
        
        // 只保留最近20条记录
        if (history.length > 20) {
            history.pop();
        }

        localStorage.setItem('unitConverterHistory', JSON.stringify(history));
        this.updateHistoryDisplay();
    }

    /**
     * 更新历史记录显示
     */
    updateHistoryDisplay() {
        const history = JSON.parse(localStorage.getItem('unitConverterHistory') || '[]');
        const historyContainer = document.getElementById('conv-history');

        if (historyContainer) {
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="history-empty">暂无转换记录</p>';
            } else {
                const historyHTML = history
                    .filter(item => item.category === this.currentCategory)
                    .slice(0, 10)
                    .map(item => `
                        <div class="history-item">
                            <div class="history-expression">
                                ${item.fromValue} ${item.fromUnitName} = ${item.toValue} ${item.toUnitName}
                            </div>
                            <div class="history-time">${item.timestamp}</div>
                        </div>
                    `).join('');
                
                historyContainer.innerHTML = historyHTML;
            }
        }
    }

    /**
     * 获取常用转换
     */
    getQuickConversions() {
        const quickConversions = {
            length: [['m', 'ft'], ['km', 'mi'], ['cm', 'inch']],
            weight: [['kg', 'lb'], ['g', 'oz'], ['ton', 'kg']],
            temperature: [['c', 'f'], ['f', 'c'], ['c', 'k']],
            area: [['m2', 'sqft'], ['km2', 'ha'], ['acre', 'ha']],
            volume: [['l', 'gal'], ['ml', 'oz'], ['m3', 'l']],
            speed: [['kmh', 'mph'], ['mps', 'kmh'], ['knot', 'kmh']]
        };

        const category = this.currentCategory;
        const categoryData = this.conversionData[category];

        return quickConversions[category].map(([from, to]) => `
            <button 
                class="btn btn-sm btn-outline-secondary quick-btn"
                data-quick="${from}-${to}"
            >
                ${categoryData.units[from].name} → ${categoryData.units[to].name}
            </button>
        `).join('');
    }

    /**
     * 应用常用转换
     */
    applyQuickConversion(from, to) {
        document.getElementById('conv-from-unit').value = from;
        document.getElementById('conv-to-unit').value = to;
        this.convert();
    }

    /**
     * 清除历史记录
     */
    clearHistory() {
        localStorage.removeItem('unitConverterHistory');
        this.updateHistoryDisplay();
    }

    /**
     * 销毁单位转换器功能
     */
    destroy() {
        // 清除事件监听
        document.removeEventListener('input', this.convert);
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitConverter;
} else {
    window.UnitConverter = UnitConverter;
}
