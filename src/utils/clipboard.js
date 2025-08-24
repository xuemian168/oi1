/**
 * 剪贴板操作工具类
 * 提供现代浏览器和旧版浏览器的兼容性支持
 */

export class ClipboardHelper {
    constructor() {
        this.isModernAPI = this.checkModernAPISupport();
    }

    /**
     * 检查是否支持现代剪贴板API
     * @returns {boolean} 是否支持
     */
    checkModernAPISupport() {
        return (
            typeof navigator !== 'undefined' &&
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === 'function' &&
            typeof navigator.clipboard.readText === 'function'
        );
    }

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<void>}
     */
    async copy(text) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }

        if (this.isModernAPI) {
            return await this.copyModern(text);
        } else {
            return await this.copyLegacy(text);
        }
    }

    /**
     * 从剪贴板读取文本
     * @returns {Promise<string>}
     */
    async paste() {
        if (this.isModernAPI) {
            return await this.pasteModern();
        } else {
            return await this.pasteLegacy();
        }
    }

    /**
     * 使用现代API复制文本
     * @param {string} text - 文本
     * @returns {Promise<void>}
     * @private
     */
    async copyModern(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // 如果现代API失败，回退到传统方法
            console.warn('Modern clipboard API failed, falling back to legacy method:', error);
            return await this.copyLegacy(text);
        }
    }

    /**
     * 使用现代API读取文本
     * @returns {Promise<string>}
     * @private
     */
    async pasteModern() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            // 如果现代API失败，回退到传统方法
            console.warn('Modern clipboard API failed, falling back to legacy method:', error);
            return await this.pasteLegacy();
        }
    }

    /**
     * 使用传统方法复制文本
     * @param {string} text - 文本
     * @returns {Promise<void>}
     * @private
     */
    async copyLegacy(text) {
        return new Promise((resolve, reject) => {
            try {
                // 创建临时textarea元素
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-999999px';
                textarea.style.top = '-999999px';
                textarea.style.opacity = '0';
                textarea.style.pointerEvents = 'none';
                
                document.body.appendChild(textarea);
                
                // 选择文本
                textarea.focus();
                textarea.select();
                textarea.setSelectionRange(0, text.length);
                
                // 执行复制命令
                const successful = document.execCommand('copy');
                
                // 清理
                document.body.removeChild(textarea);
                
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command was unsuccessful'));
                }
                
            } catch (error) {
                reject(new Error(`Legacy copy failed: ${error.message}`));
            }
        });
    }

    /**
     * 使用传统方法读取文本（通过用户粘贴操作）
     * @returns {Promise<string>}
     * @private
     */
    async pasteLegacy() {
        return new Promise((resolve, reject) => {
            // 传统方法无法直接读取剪贴板
            // 需要用户手动粘贴，这里返回空字符串或提示用户
            reject(new Error('Legacy paste not supported. Please use Ctrl+V manually.'));
        });
    }

    /**
     * 检查剪贴板权限
     * @returns {Promise<string>} 权限状态
     */
    async checkPermission() {
        if (!this.isModernAPI) {
            return 'legacy'; // 传统方法不需要权限
        }

        try {
            const permission = await navigator.permissions.query({ name: 'clipboard-read' });
            return permission.state; // 'granted', 'denied', 'prompt'
        } catch (error) {
            console.warn('Cannot check clipboard permission:', error);
            return 'unknown';
        }
    }

    /**
     * 复制富文本内容
     * @param {string} html - HTML内容
     * @param {string} text - 纯文本内容（备用）
     * @returns {Promise<void>}
     */
    async copyRich(html, text) {
        if (!this.isModernAPI) {
            // 传统方法只能复制纯文本
            return await this.copyLegacy(text);
        }

        try {
            const clipboardItem = new ClipboardItem({
                'text/html': new Blob([html], { type: 'text/html' }),
                'text/plain': new Blob([text], { type: 'text/plain' })
            });
            
            await navigator.clipboard.write([clipboardItem]);
        } catch (error) {
            console.warn('Rich text copy failed, falling back to plain text:', error);
            return await this.copyModern(text);
        }
    }

    /**
     * 复制图片到剪贴板
     * @param {Blob} imageBlob - 图片数据
     * @returns {Promise<void>}
     */
    async copyImage(imageBlob) {
        if (!this.isModernAPI) {
            throw new Error('Image copying is not supported in legacy browsers');
        }

        try {
            const clipboardItem = new ClipboardItem({
                [imageBlob.type]: imageBlob
            });
            
            await navigator.clipboard.write([clipboardItem]);
        } catch (error) {
            throw new Error(`Image copy failed: ${error.message}`);
        }
    }

    /**
     * 获取剪贴板支持的MIME类型
     * @returns {Promise<string[]>}
     */
    async getSupportedTypes() {
        if (!this.isModernAPI) {
            return ['text/plain'];
        }

        try {
            const clipboardItems = await navigator.clipboard.read();
            if (clipboardItems.length > 0) {
                return clipboardItems[0].types;
            }
            return [];
        } catch (error) {
            console.warn('Cannot get clipboard types:', error);
            return ['text/plain'];
        }
    }

    /**
     * 监听剪贴板变化（如果支持）
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    onClipboardChange(callback) {
        // 大多数浏览器不支持剪贴板变化监听
        // 这里提供一个基础的实现框架
        
        let lastContent = '';
        let isMonitoring = true;
        
        const monitor = async () => {
            if (!isMonitoring) return;
            
            try {
                const content = await this.paste();
                if (content !== lastContent) {
                    lastContent = content;
                    callback(content);
                }
            } catch (error) {
                // 静默处理错误
            }
            
            // 每秒检查一次（这不是最优解，但在缺乏原生支持时是可行的）
            setTimeout(monitor, 1000);
        };
        
        // 开始监听
        monitor();
        
        // 返回停止监听的函数
        return () => {
            isMonitoring = false;
        };
    }

    /**
     * 获取剪贴板状态信息
     * @returns {Promise<Object>}
     */
    async getStatus() {
        const status = {
            isSupported: this.isModernAPI,
            permission: await this.checkPermission(),
            supportedTypes: await this.getSupportedTypes(),
            canRead: false,
            canWrite: false
        };

        // 测试读写能力
        try {
            await this.copy('test');
            status.canWrite = true;
        } catch (error) {
            status.canWrite = false;
        }

        try {
            await this.paste();
            status.canRead = true;
        } catch (error) {
            status.canRead = false;
        }

        return status;
    }
}

// 导出便捷函数
export const copyText = async (text) => {
    const clipboard = new ClipboardHelper();
    return await clipboard.copy(text);
};

export const pasteText = async () => {
    const clipboard = new ClipboardHelper();
    return await clipboard.paste();
};

// 导出默认实例
export default new ClipboardHelper();