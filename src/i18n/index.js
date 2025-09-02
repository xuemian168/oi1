/**
 * oi1 国际化系统
 * 支持中英文动态切换
 */

// 导入语言包
import zhCN from './zh-CN.json';
import enUS from './en-US.json';

/**
 * 国际化管理器类
 */
class I18nManager {
    constructor() {
        this.languages = {
            'zh-CN': zhCN,
            'en-US': enUS
        };
        
        this.currentLang = this.detectLanguage();
        this.currentMessages = this.languages[this.currentLang];
        
        // 初始化时应用语言
        this.applyLanguage();
    }

    /**
     * 检测用户首选语言
     * @returns {string} 语言代码
     */
    detectLanguage() {
        // 优先从localStorage读取用户设置
        const savedLang = localStorage.getItem('oi1-language');
        if (savedLang && this.languages[savedLang]) {
            return savedLang;
        }
        
        // 从浏览器语言检测
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang.startsWith('zh')) {
            return 'zh-CN';
        } else if (browserLang.startsWith('en')) {
            return 'en-US';
        }
        
        // 默认中文
        return 'zh-CN';
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键，支持点分隔的嵌套路径
     * @param {Object} params - 替换参数
     * @returns {string} 翻译后的文本
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.currentMessages;
        
        // 遍历嵌套路径
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // 返回原始key作为fallback
            }
        }
        
        if (typeof value !== 'string' && !Array.isArray(value) && typeof value !== 'object') {
            console.warn(`Translation key should resolve to string, array, or object: ${key}`);
            return key;
        }
        
        // 如果是数组或对象，直接返回
        if (Array.isArray(value) || typeof value === 'object') {
            return value;
        }
        
        // 替换参数
        return this.interpolate(value, params);
    }

    /**
     * 字符串插值
     * @param {string} template - 模板字符串
     * @param {Object} params - 参数对象
     * @returns {string} 替换后的字符串
     */
    interpolate(template, params) {
        return template.replace(/{(\w+)}/g, (match, key) => {
            return params.hasOwnProperty(key) ? params[key] : match;
        });
    }

    /**
     * 切换语言
     * @param {string} langCode - 语言代码
     */
    setLanguage(langCode) {
        if (!this.languages[langCode]) {
            console.error(`Unsupported language: ${langCode}`);
            return;
        }
        
        this.currentLang = langCode;
        this.currentMessages = this.languages[langCode];
        
        // 保存到localStorage
        localStorage.setItem('oi1-language', langCode);
        
        // 更新HTML lang属性
        document.documentElement.lang = langCode;
        
        // 应用翻译
        this.applyLanguage();
        
        // 触发语言变更事件
        this.dispatchLanguageChangeEvent();
    }

    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * 获取可用语言列表
     * @returns {Object} 语言列表
     */
    getAvailableLanguages() {
        return {
            'zh-CN': '中文',
            'en-US': 'English'
        };
    }

    /**
     * 应用当前语言到DOM
     */
    applyLanguage() {
        // 更新所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.t(key);
            }
        });

        // 更新带有data-i18n-placeholder属性的元素
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.placeholder = this.t(key);
            }
        });

        // 更新带有data-i18n-title属性的元素
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.title = this.t(key);
            }
        });

        // 更新页面标题
        document.title = this.t('app.title');
    }

    /**
     * 触发语言变更事件
     */
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languageChange', {
            detail: {
                language: this.currentLang,
                messages: this.currentMessages
            }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * 格式化数字
     * @param {number} number - 数字
     * @param {Object} options - 格式化选项
     * @returns {string} 格式化后的数字
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLang === 'zh-CN' ? 'zh-CN' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    /**
     * 格式化日期
     * @param {Date} date - 日期对象
     * @param {Object} options - 格式化选项
     * @returns {string} 格式化后的日期
     */
    formatDate(date, options = {}) {
        const locale = this.currentLang === 'zh-CN' ? 'zh-CN' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    /**
     * 格式化相对时间
     * @param {Date} date - 目标日期
     * @param {Date} baseDate - 基准日期（默认为当前时间）
     * @returns {string} 相对时间描述
     */
    formatRelativeTime(date, baseDate = new Date()) {
        const locale = this.currentLang === 'zh-CN' ? 'zh-CN' : 'en-US';
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        const diffInSeconds = Math.round((date - baseDate) / 1000);
        const diffInMinutes = Math.round(diffInSeconds / 60);
        const diffInHours = Math.round(diffInMinutes / 60);
        const diffInDays = Math.round(diffInHours / 24);
        
        if (Math.abs(diffInSeconds) < 60) {
            return rtf.format(diffInSeconds, 'second');
        } else if (Math.abs(diffInMinutes) < 60) {
            return rtf.format(diffInMinutes, 'minute');
        } else if (Math.abs(diffInHours) < 24) {
            return rtf.format(diffInHours, 'hour');
        } else {
            return rtf.format(diffInDays, 'day');
        }
    }

    /**
     * 验证翻译完整性
     * @returns {Object} 验证结果
     */
    validateTranslations() {
        const issues = [];
        const languages = Object.keys(this.languages);
        
        // 检查语言包结构一致性
        const referenceKeys = this._getFlatKeys(this.languages[languages[0]]);
        
        for (let i = 1; i < languages.length; i++) {
            const currentKeys = this._getFlatKeys(this.languages[languages[i]]);
            
            // 检查缺失的键
            const missingKeys = referenceKeys.filter(key => !currentKeys.includes(key));
            if (missingKeys.length > 0) {
                issues.push({
                    language: languages[i],
                    type: 'missing_keys',
                    keys: missingKeys
                });
            }
            
            // 检查多余的键
            const extraKeys = currentKeys.filter(key => !referenceKeys.includes(key));
            if (extraKeys.length > 0) {
                issues.push({
                    language: languages[i],
                    type: 'extra_keys',
                    keys: extraKeys
                });
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * 获取对象的扁平化键数组
     * @param {Object} obj - 对象
     * @param {string} prefix - 前缀
     * @returns {string[]} 键数组
     * @private
     */
    _getFlatKeys(obj, prefix = '') {
        const keys = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                keys.push(...this._getFlatKeys(value, fullKey));
            } else {
                keys.push(fullKey);
            }
        }
        
        return keys;
    }
}

// 创建全局实例
const i18n = new I18nManager();

// 导出实例和类
export { I18nManager };
export default i18n;