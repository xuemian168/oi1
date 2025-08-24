/**
 * oi1 视觉加密工具主应用程序
 */

import i18n from './i18n/index.js';
import { OI1Encoder, OI1Decoder, OI1Demo } from './core/oi1-algorithm.js';
import { ClipboardHelper } from './utils/clipboard.js';
import { DemoViewer } from './components/demo-viewer.js';
import { HelpModal } from './components/help-modal.js';

/**
 * 主应用程序类
 */
class OI1App {
    constructor() {
        this.encoder = new OI1Encoder();
        this.decoder = new OI1Decoder();
        this.clipboard = new ClipboardHelper();
        this.demoViewer = new DemoViewer();
        this.helpModal = new HelpModal();
        
        this.elements = {};
        this.isInitialized = false;
        
        // 绑定方法上下文
        this.handleEncode = this.handleEncode.bind(this);
        this.handleDecode = this.handleDecode.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCipherInputChange = this.handleCipherInputChange.bind(this);
    }

    /**
     * 初始化应用程序
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 获取DOM元素
            this.initElements();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            // 初始化组件
            await this.initComponents();
            
            // 应用初始状态
            this.applyInitialState();
            
            this.isInitialized = true;
            console.log('oi1 App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize oi1 App:', error);
            this.showError('应用程序初始化失败', error.message);
        }
    }

    /**
     * 获取DOM元素引用
     */
    initElements() {
        // 输入输出元素
        this.elements.plaintext = document.getElementById('plaintext');
        this.elements.ciphertext = document.getElementById('ciphertext');
        this.elements.cipherInput = document.getElementById('cipherInput');
        this.elements.plaintextOutput = document.getElementById('plaintextOutput');
        
        // 按钮元素
        this.elements.encodeBtn = document.getElementById('encodeBtn');
        this.elements.decodeBtn = document.getElementById('decodeBtn');
        this.elements.clearPlainBtn = document.getElementById('clearPlainBtn');
        this.elements.clearCipherBtn = document.getElementById('clearCipherBtn');
        this.elements.copyCipherBtn = document.getElementById('copyCipherBtn');
        this.elements.copyPlainBtn = document.getElementById('copyPlainBtn');
        this.elements.pasteBtn = document.getElementById('pasteBtn');
        this.elements.helpBtn = document.getElementById('helpBtn');
        
        // 控制元素
        this.elements.languageSelect = document.getElementById('languageSelect');
        
        // 计数显示元素
        this.elements.plaintextCount = document.getElementById('plaintextCount');
        this.elements.ciphertextCount = document.getElementById('ciphertextCount');
        this.elements.cipherInputCount = document.getElementById('cipherInputCount');
        this.elements.plaintextOutputCount = document.getElementById('plaintextOutputCount');
        
        // 状态显示元素
        this.elements.validationStatus = document.getElementById('validationStatus');
        this.elements.errorMessage = document.getElementById('errorMessage');
        
        // 演示相关元素
        this.elements.toggleDemo = document.getElementById('toggleDemo');
        this.elements.demoContent = document.getElementById('demoContent');
        
        // 验证关键元素存在
        const requiredElements = [
            'plaintext', 'ciphertext', 'cipherInput', 'plaintextOutput',
            'encodeBtn', 'decodeBtn', 'languageSelect'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                throw new Error(`Required element not found: ${elementName}`);
            }
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 加密解密按钮
        this.elements.encodeBtn.addEventListener('click', this.handleEncode);
        this.elements.decodeBtn.addEventListener('click', this.handleDecode);
        
        // 清空按钮
        this.elements.clearPlainBtn.addEventListener('click', () => this.clearInput('plaintext'));
        this.elements.clearCipherBtn.addEventListener('click', () => this.clearInput('cipherInput'));
        
        // 复制按钮
        this.elements.copyCipherBtn.addEventListener('click', () => this.copyText('ciphertext'));
        this.elements.copyPlainBtn.addEventListener('click', () => this.copyText('plaintextOutput'));
        
        // 粘贴按钮
        this.elements.pasteBtn.addEventListener('click', () => this.pasteText('cipherInput'));
        
        // 帮助按钮
        this.elements.helpBtn.addEventListener('click', () => this.helpModal.show());
        
        // 语言切换
        this.elements.languageSelect.addEventListener('change', this.handleLanguageChange);
        
        // 输入框变化监听
        this.elements.plaintext.addEventListener('input', this.handleInputChange);
        this.elements.cipherInput.addEventListener('input', this.handleCipherInputChange);
        
        // 演示切换
        if (this.elements.toggleDemo) {
            this.elements.toggleDemo.addEventListener('click', () => this.toggleDemo());
        }
        
        // 快捷键支持
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // 语言变更事件
        window.addEventListener('languageChange', () => this.onLanguageChanged());
    }

    /**
     * 初始化组件
     */
    async initComponents() {
        // 初始化演示查看器
        await this.demoViewer.init(this.elements.demoContent);
        
        // 初始化帮助模态框
        await this.helpModal.init();
        
        // 设置语言选择器
        this.updateLanguageSelector();
    }

    /**
     * 应用初始状态
     */
    applyInitialState() {
        // 更新字符计数
        this.updateCharCount('plaintext');
        this.updateCharCount('ciphertext');
        this.updateCharCount('cipherInput');
        this.updateCharCount('plaintextOutput');
        
        // 设置初始按钮状态
        this.updateButtonStates();
    }

    /**
     * 处理加密操作
     */
    async handleEncode() {
        try {
            const plaintext = this.elements.plaintext.value;
            if (!plaintext.trim()) {
                this.showMessage(i18n.t('messages.invalidInput'), 'warning');
                return;
            }
            
            // 显示加载状态
            this.setButtonLoading(this.elements.encodeBtn, true);
            
            // 执行加密
            const ciphertext = this.encoder.encode(plaintext);
            
            // 显示结果
            this.elements.ciphertext.value = ciphertext;
            this.updateCharCount('ciphertext');
            
            // 显示统计信息
            this.showEncodingStats(plaintext, ciphertext);
            
            // 生成演示
            this.demoViewer.showEncodingDemo(plaintext);
            
            this.showMessage(i18n.t('messages.encodeSuccess'), 'success');
            
        } catch (error) {
            console.error('Encoding error:', error);
            this.showError(i18n.t('messages.encodeError'), error.message);
            
        } finally {
            this.setButtonLoading(this.elements.encodeBtn, false);
        }
    }

    /**
     * 处理解密操作
     */
    async handleDecode() {
        try {
            const ciphertext = this.elements.cipherInput.value;
            if (!ciphertext.trim()) {
                this.showMessage(i18n.t('messages.invalidInput'), 'warning');
                return;
            }
            
            // 显示加载状态
            this.setButtonLoading(this.elements.decodeBtn, true);
            
            // 执行解密
            const plaintext = this.decoder.decode(ciphertext);
            
            // 显示结果
            this.elements.plaintextOutput.value = plaintext;
            this.updateCharCount('plaintextOutput');
            
            // 生成演示
            this.demoViewer.showDecodingDemo(ciphertext);
            
            this.showMessage(i18n.t('messages.decodeSuccess'), 'success');
            
        } catch (error) {
            console.error('Decoding error:', error);
            this.showError(i18n.t('messages.decodeError'), error.message);
            
        } finally {
            this.setButtonLoading(this.elements.decodeBtn, false);
        }
    }

    /**
     * 处理语言变更
     */
    handleLanguageChange() {
        const selectedLang = this.elements.languageSelect.value;
        i18n.setLanguage(selectedLang);
    }

    /**
     * 处理输入框内容变化
     */
    handleInputChange() {
        this.updateCharCount('plaintext');
        this.updateButtonStates();
        
        // 实时预览（可选）
        if (this.elements.plaintext.value.length > 0 && this.elements.plaintext.value.length < 100) {
            this.debouncedPreview();
        }
    }

    /**
     * 处理密文输入框变化
     */
    handleCipherInputChange() {
        this.updateCharCount('cipherInput');
        this.validateCipherInput();
        this.updateButtonStates();
    }

    /**
     * 验证密文输入
     */
    validateCipherInput() {
        const ciphertext = this.elements.cipherInput.value;
        if (!ciphertext) {
            this.updateValidationStatus('', 'none');
            return;
        }
        
        const validation = this.decoder.validateCiphertext(ciphertext);
        if (validation.isValid) {
            this.updateValidationStatus(i18n.t('validation.valid'), 'valid');
        } else {
            this.updateValidationStatus(validation.error, 'invalid');
        }
    }

    /**
     * 更新验证状态显示
     */
    updateValidationStatus(message, type) {
        if (!this.elements.validationStatus) return;
        
        this.elements.validationStatus.textContent = message;
        this.elements.validationStatus.className = `validation-status ${type}`;
        
        if (type === 'none') {
            this.elements.validationStatus.className = 'validation-status';
        }
    }


    /**
     * 更新字符计数显示
     */
    updateCharCount(elementName) {
        const element = this.elements[elementName];
        const countElement = this.elements[elementName + 'Count'];
        
        if (element && countElement) {
            const count = element.value.length;
            countElement.textContent = count;
        }
    }

    /**
     * 更新按钮状态
     */
    updateButtonStates() {
        // 加密按钮状态
        const hasPlaintext = this.elements.plaintext.value.trim().length > 0;
        this.elements.encodeBtn.disabled = !hasPlaintext;
        
        // 解密按钮状态
        const hasCiphertext = this.elements.cipherInput.value.trim().length > 0;
        const isValidCipher = this.decoder.validateCiphertext(this.elements.cipherInput.value).isValid;
        this.elements.decodeBtn.disabled = !hasCiphertext || !isValidCipher;
        
        // 复制按钮状态
        this.elements.copyCipherBtn.disabled = this.elements.ciphertext.value.length === 0;
        this.elements.copyPlainBtn.disabled = this.elements.plaintextOutput.value.length === 0;
    }

    /**
     * 设置按钮加载状态
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            const originalText = button.textContent;
            button.dataset.originalText = originalText;
            button.textContent = '...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        }
    }

    /**
     * 清空输入框
     */
    clearInput(elementName) {
        const element = this.elements[elementName];
        if (element) {
            element.value = '';
            this.updateCharCount(elementName);
            this.updateButtonStates();
            
            if (elementName === 'cipherInput') {
                this.updateValidationStatus('', 'none');
            }
            
            this.showMessage(i18n.t('messages.clearSuccess'), 'info');
        }
    }

    /**
     * 复制文本到剪贴板
     */
    async copyText(elementName) {
        const element = this.elements[elementName];
        if (!element || !element.value) return;
        
        try {
            await this.clipboard.copy(element.value);
            this.showMessage(i18n.t('messages.copySuccess'), 'success');
            
            // 短暂高亮复制按钮
            const button = elementName === 'ciphertext' ? this.elements.copyCipherBtn : this.elements.copyPlainBtn;
            this.highlightButton(button);
            
        } catch (error) {
            console.error('Copy failed:', error);
            this.showMessage(i18n.t('messages.copyError'), 'error');
        }
    }

    /**
     * 从剪贴板粘贴文本
     */
    async pasteText(elementName) {
        try {
            const text = await this.clipboard.paste();
            const element = this.elements[elementName];
            
            if (element && text) {
                element.value = text;
                this.updateCharCount(elementName);
                this.updateButtonStates();
                
                if (elementName === 'cipherInput') {
                    this.validateCipherInput();
                }
                
                this.showMessage(i18n.t('messages.pasteSuccess'), 'success');
            }
            
        } catch (error) {
            console.error('Paste failed:', error);
            this.showMessage(i18n.t('messages.pasteError'), 'error');
        }
    }

    /**
     * 短暂高亮按钮
     */
    highlightButton(button) {
        button.classList.add('highlighted');
        setTimeout(() => {
            button.classList.remove('highlighted');
        }, 200);
    }

    /**
     * 切换演示显示
     */
    toggleDemo() {
        const isVisible = this.elements.demoContent.style.display !== 'none';
        
        if (isVisible) {
            this.elements.demoContent.style.display = 'none';
            this.elements.toggleDemo.textContent = i18n.t('ui.expand');
        } else {
            this.elements.demoContent.style.display = 'block';
            this.elements.toggleDemo.textContent = i18n.t('ui.collapse');
        }
    }

    /**
     * 显示加密统计信息
     */
    showEncodingStats(plaintext, ciphertext) {
        const stats = this.encoder.getEncodingStats(plaintext, ciphertext);
        
        // 可以在界面上显示统计信息
        console.log('Encoding stats:', stats);
        
        // 如果有统计面板，在这里更新
        // this.updateStatsPanel(stats);
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(event) {
        // Ctrl+Enter / Cmd+Enter 执行加密
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (document.activeElement === this.elements.plaintext) {
                this.handleEncode();
                event.preventDefault();
            } else if (document.activeElement === this.elements.cipherInput) {
                this.handleDecode();
                event.preventDefault();
            }
        }
        
        // Ctrl+K / Cmd+K 清空当前输入
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            if (document.activeElement === this.elements.plaintext) {
                this.clearInput('plaintext');
            } else if (document.activeElement === this.elements.cipherInput) {
                this.clearInput('cipherInput');
            }
            event.preventDefault();
        }
    }

    /**
     * 语言变更回调
     */
    onLanguageChanged() {
        // 更新按钮状态和其他动态内容
        this.updateButtonStates();
        
        // 重新应用验证状态
        this.validateCipherInput();
    }

    /**
     * 更新语言选择器
     */
    updateLanguageSelector() {
        this.elements.languageSelect.value = i18n.getCurrentLanguage();
    }

    /**
     * 防抖预览函数
     */
    debouncedPreview() {
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        this.previewTimeout = setTimeout(() => {
            // 实现实时预览逻辑
            // this.generatePreview();
        }, 300);
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info', duration = 3000) {
        // 创建或更新消息显示
        let messageElement = document.getElementById('messageToast');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'messageToast';
            messageElement.className = 'message-toast';
            document.body.appendChild(messageElement);
        }
        
        messageElement.textContent = message;
        messageElement.className = `message-toast ${type} show`;
        
        // 自动隐藏
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        this.messageTimeout = setTimeout(() => {
            messageElement.classList.remove('show');
        }, duration);
    }

    /**
     * 显示错误信息
     */
    showError(title, message) {
        const errorElement = this.elements.errorMessage;
        
        if (errorElement) {
            errorElement.innerHTML = `<strong>${title}</strong><br>${message}`;
            errorElement.style.display = 'block';
            
            // 5秒后自动隐藏
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        
        console.error(`${title}:`, message);
    }
}

// 创建应用实例并初始化
const app = new OI1App();

// 应用启动
app.init().catch(error => {
    console.error('Failed to start application:', error);
});

// 导出应用实例
export default app;