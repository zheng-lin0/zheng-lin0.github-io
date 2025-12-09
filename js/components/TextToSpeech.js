/**
 * 文字转语音工具组件
 * @module TextToSpeech
 */

class TextToSpeech {
    constructor() {
        this.speech = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
    }

    /**
     * 初始化文字转语音功能
     */
    init() {
        // 等待语音合成API加载完成
        window.speechSynthesis.onvoiceschanged = () => {
            this.voices = this.speech.getVoices();
            this.currentVoice = this.voices.find(voice => voice.lang === 'zh-CN') || this.voices[0];
            this.renderControls();
        };
    }

    /**
     * 渲染文字转语音控制界面
     * @returns {string} HTML内容
     */
    renderControls() {
        return `
            <div class="text-to-speech-container">
                <div class="tool-input-section">
                    <label for="tts-text">输入要转换的文字：</label>
                    <textarea id="tts-text" class="tool-textarea" placeholder="请输入要转换为语音的文字...">这是一个文字转语音工具的示例，您可以输入任何文字进行转换。</textarea>
                </div>
                
                <div class="tool-controls-section">
                    <div class="control-group">
                        <label for="tts-voice">选择语音：</label>
                        <select id="tts-voice" class="tool-select">
                            ${this.voices.map((voice, index) => 
                                `<option value="${index}" ${this.currentVoice === voice ? 'selected' : ''}>${voice.name} (${voice.lang})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label for="tts-rate">语速：</label>
                        <input type="range" id="tts-rate" class="tool-range" min="0.5" max="2" step="0.1" value="1">
                        <span id="tts-rate-value">1.0</span>
                    </div>
                    
                    <div class="control-group">
                        <label for="tts-pitch">音调：</label>
                        <input type="range" id="tts-pitch" class="tool-range" min="0.5" max="2" step="0.1" value="1">
                        <span id="tts-pitch-value">1.0</span>
                    </div>
                    
                    <div class="control-group">
                        <label for="tts-volume">音量：</label>
                        <input type="range" id="tts-volume" class="tool-range" min="0" max="1" step="0.1" value="1">
                        <span id="tts-volume-value">1.0</span>
                    </div>
                </div>
                
                <div class="tool-actions-section">
                    <button id="tts-play" class="btn btn-primary">
                        <i class="fas fa-play"></i> 开始朗读
                    </button>
                    <button id="tts-pause" class="btn btn-secondary" disabled>
                        <i class="fas fa-pause"></i> 暂停
                    </button>
                    <button id="tts-stop" class="btn btn-secondary" disabled>
                        <i class="fas fa-stop"></i> 停止
                    </button>
                    <button id="tts-download" class="btn btn-secondary">
                        <i class="fas fa-download"></i> 下载音频
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        const downloadBtn = document.getElementById('tts-download');
        const textInput = document.getElementById('tts-text');
        const voiceSelect = document.getElementById('tts-voice');
        const rateRange = document.getElementById('tts-rate');
        const rateValue = document.getElementById('tts-rate-value');
        const pitchRange = document.getElementById('tts-pitch');
        const pitchValue = document.getElementById('tts-pitch-value');
        const volumeRange = document.getElementById('tts-volume');
        const volumeValue = document.getElementById('tts-volume-value');

        // 播放按钮
        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }

        // 暂停按钮
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        // 停止按钮
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        // 下载按钮
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.download());
        }

        // 语音选择
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.currentVoice = this.voices[e.target.value];
            });
        }

        // 语速调节
        if (rateRange && rateValue) {
            rateRange.addEventListener('input', (e) => {
                rateValue.textContent = e.target.value;
            });
        }

        // 音调调节
        if (pitchRange && pitchValue) {
            pitchRange.addEventListener('input', (e) => {
                pitchValue.textContent = e.target.value;
            });
        }

        // 音量调节
        if (volumeRange && volumeValue) {
            volumeRange.addEventListener('input', (e) => {
                volumeValue.textContent = e.target.value;
            });
        }

        // 语音播放结束事件
        window.speechSynthesis.onend = () => {
            this.isPlaying = false;
            this.updateButtonStates();
        };
    }

    /**
     * 播放文字转语音
     */
    play() {
        const textInput = document.getElementById('tts-text');
        if (!textInput || !textInput.value.trim()) {
            alert('请输入要转换的文字！');
            return;
        }

        // 停止当前可能正在播放的语音
        this.stop();

        const utterance = new SpeechSynthesisUtterance(textInput.value);
        utterance.voice = this.currentVoice;
        utterance.rate = parseFloat(document.getElementById('tts-rate').value);
        utterance.pitch = parseFloat(document.getElementById('tts-pitch').value);
        utterance.volume = parseFloat(document.getElementById('tts-volume').value);

        this.speech.speak(utterance);
        this.isPlaying = true;
        this.updateButtonStates();
    }

    /**
     * 暂停文字转语音
     */
    pause() {
        this.speech.pause();
        this.isPlaying = false;
        this.updateButtonStates();
    }

    /**
     * 停止文字转语音
     */
    stop() {
        this.speech.cancel();
        this.isPlaying = false;
        this.updateButtonStates();
    }

    /**
     * 下载音频文件
     * 注意：由于浏览器限制，直接下载音频需要使用MediaRecorder API或后端服务
     */
    download() {
        const textInput = document.getElementById('tts-text');
        if (!textInput || !textInput.value.trim()) {
            alert('请输入要转换的文字！');
            return;
        }

        // 实际项目中需要使用后端服务或更复杂的前端方案
        alert('音频下载功能需要使用后端服务或MediaRecorder API实现');
    }

    /**
     * 更新按钮状态
     */
    updateButtonStates() {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');

        if (this.isPlaying) {
            if (playBtn) playBtn.disabled = true;
            if (pauseBtn) pauseBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = false;
        } else {
            if (playBtn) playBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = true;
        }
    }

    /**
     * 销毁文字转语音功能
     */
    destroy() {
        this.stop();
        this.speech = null;
        this.voices = [];
        this.currentVoice = null;
        this.isPlaying = false;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextToSpeech;
} else {
    window.TextToSpeech = TextToSpeech;
}
