/**
 * 帮助模态框组件
 * 显示oi1算法的详细说明和使用指南
 */

import i18n from '../i18n/index.js';
import { BINARY_TO_CHAR, CHAR_TO_BINARY } from '../core/oi1-algorithm.js';

export class HelpModal {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
        this.isVisible = false;
    }

    /**
     * 初始化帮助模态框
     */
    async init() {
        if (this.isInitialized) return;

        this.createModal();
        this.bindEvents();
        
        this.isInitialized = true;
    }

    /**
     * 创建模态框结构
     */
    createModal() {
        // 查找现有的模态框或创建新的
        this.modal = document.getElementById('helpModal');
        
        if (!this.modal) {
            this.modal = document.createElement('div');
            this.modal.id = 'helpModal';
            this.modal.className = 'modal';
            document.body.appendChild(this.modal);
        }

        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 data-i18n="help.title">oi1 算法原理</h3>
                    <button id="closeModal" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.generateHelpContent()}
                </div>
            </div>
        `;

        // 应用国际化
        i18n.applyLanguage();
    }

    /**
     * 生成帮助内容
     * @returns {string} HTML内容
     */
    generateHelpContent() {
        const mappingTable = this.generateMappingTable();
        const exampleDemo = this.generateExampleDemo();
        const securityInfo = this.generateSecurityInfo();

        return `
            <div class="help-content">
                <!-- 核心原理 -->
                <section class="help-section">
                    <h4 data-i18n="help.principle.title">核心原理</h4>
                    <p data-i18n="help.principle.content">
                        oi1 算法利用字符 O、0、I、l 在视觉上的高度相似性，将任意文本转换为仅由这些字符组成的密文，实现视觉混淆效果。
                    </p>
                    
                    <div class="visual-similarity">
                        <h5>视觉相似性对比</h5>
                        <div class="char-comparison">
                            <div class="char-pair">
                                <span class="char-display large">O</span>
                                <span class="vs">vs</span>
                                <span class="char-display large">0</span>
                                <div class="similarity-note">大写O ↔ 数字零</div>
                            </div>
                            <div class="char-pair">
                                <span class="char-display large">I</span>
                                <span class="vs">vs</span>
                                <span class="char-display large">l</span>
                                <div class="similarity-note">大写I ↔ 小写L</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 字符映射 -->
                <section class="help-section">
                    <h4 data-i18n="help.mapping.title">字符映射规则</h4>
                    <p data-i18n="help.mapping.content">
                        算法将文本转为二进制，每2位二进制映射为一个字符：
                    </p>
                    ${mappingTable}
                </section>

                <!-- 加密流程 -->
                <section class="help-section">
                    <h4>加密流程</h4>
                    <div class="flow-diagram">
                        <div class="flow-step">
                            <div class="flow-number">1</div>
                            <div class="flow-content">
                                <strong>文本输入</strong>
                                <p>输入任意UTF-8文本</p>
                            </div>
                        </div>
                        <div class="flow-arrow">↓</div>
                        
                        <div class="flow-step">
                            <div class="flow-number">2</div>
                            <div class="flow-content">
                                <strong>UTF-8编码</strong>
                                <p>转换为字节数组</p>
                            </div>
                        </div>
                        <div class="flow-arrow">↓</div>
                        
                        <div class="flow-step">
                            <div class="flow-number">3</div>
                            <div class="flow-content">
                                <strong>二进制转换</strong>
                                <p>每字节转为8位二进制</p>
                            </div>
                        </div>
                        <div class="flow-arrow">↓</div>
                        
                        <div class="flow-step">
                            <div class="flow-number">4</div>
                            <div class="flow-content">
                                <strong>字符映射</strong>
                                <p>每2位二进制映射为O0Il字符</p>
                            </div>
                        </div>
                        <div class="flow-arrow">↓</div>
                        
                        <div class="flow-step final">
                            <div class="flow-number">✓</div>
                            <div class="flow-content">
                                <strong>密文输出</strong>
                                <p>仅含O0Il的视觉混淆文本</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 示例演示 -->
                <section class="help-section">
                    <h4>加密示例</h4>
                    ${exampleDemo}
                </section>


                <!-- 安全特性 -->
                <section class="help-section">
                    <h4 data-i18n="help.security.title">安全特性</h4>
                    ${securityInfo}
                </section>

                <!-- 使用技巧 -->
                <section class="help-section">
                    <h4>使用技巧</h4>
                    <div class="tips-list">
                        <div class="tip-item">
                            <span class="tip-icon">💡</span>
                            <div class="tip-content">
                                <strong>快捷键支持：</strong>
                                <p>Ctrl+Enter 执行加密/解密，Ctrl+K 清空输入</p>
                            </div>
                        </div>
                        
                        <div class="tip-item">
                            <span class="tip-icon">🎨</span>
                            <div class="tip-content">
                                <strong>字体优化：</strong>
                                <p>密文区域使用等宽字体增强视觉混淆效果</p>
                            </div>
                        </div>
                        
                        <div class="tip-item">
                            <span class="tip-icon">📊</span>
                            <div class="tip-content">
                                <strong>实时验证：</strong>
                                <p>输入密文时会自动验证格式并显示状态</p>
                            </div>
                        </div>
                        
                        <div class="tip-item">
                            <span class="tip-icon">🔄</span>
                            <div class="tip-content">
                                <strong>可逆性保证：</strong>
                                <p>标准模式下加密解密完全可逆，无信息丢失</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 技术规格 -->
                <section class="help-section">
                    <h4>技术规格</h4>
                    <div class="tech-specs">
                        <div class="spec-row">
                            <span class="spec-label">字符集：</span>
                            <span class="spec-value">O (大写O)、0 (数字零)、I (大写I)、l (小写L)</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">编码方式：</span>
                            <span class="spec-value">UTF-8 → 二进制 → 2位分组映射</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">压缩比：</span>
                            <span class="spec-value">约 4:1 (1字节 → 4字符)</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">支持语言：</span>
                            <span class="spec-value">所有UTF-8字符，包括中文、英文、符号等</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">浏览器支持：</span>
                            <span class="spec-value">现代浏览器，支持ES6+</span>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * 生成映射表
     * @returns {string} HTML表格
     */
    generateMappingTable() {
        return `
            <div class="mapping-table">
                <table>
                    <thead>
                        <tr>
                            <th>二进制</th>
                            <th>字符</th>
                            <th>描述</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(BINARY_TO_CHAR).map(([binary, char]) => `
                            <tr>
                                <td><code>${binary}</code></td>
                                <td><span class="char-display">${char}</span></td>
                                <td>${this.getCharDescription(char)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 获取字符描述
     * @param {string} char - 字符
     * @returns {string} 描述
     */
    getCharDescription(char) {
        const descriptions = {
            'O': '大写字母 O',
            '0': '数字零',
            'I': '大写字母 I',
            'l': '小写字母 L'
        };
        return descriptions[char] || char;
    }

    /**
     * 生成示例演示
     * @returns {string} HTML内容
     */
    generateExampleDemo() {
        return `
            <div class="example-demo">
                <div class="example-item">
                    <h5>示例：加密 "Hi"</h5>
                    <div class="example-steps">
                        <div class="example-step">
                            <span class="step-label">原文：</span>
                            <span class="step-value">"Hi"</span>
                        </div>
                        <div class="example-step">
                            <span class="step-label">UTF-8：</span>
                            <span class="step-value">[72, 105]</span>
                        </div>
                        <div class="example-step">
                            <span class="step-label">二进制：</span>
                            <span class="step-value">01001000 01101001</span>
                        </div>
                        <div class="example-step">
                            <span class="step-label">分组：</span>
                            <span class="step-value">01|00|10|00 01|10|10|01</span>
                        </div>
                        <div class="example-step">
                            <span class="step-label">映射：</span>
                            <span class="step-value">0|O|I|O 0|I|I|0</span>
                        </div>
                        <div class="example-step">
                            <span class="step-label">密文：</span>
                            <span class="step-value cipher-display">0OIO0II0</span>
                        </div>
                    </div>
                </div>
                
                <div class="example-item">
                    <h5>视觉效果对比</h5>
                    <div class="visual-comparison">
                        <div class="comparison-item">
                            <span class="comparison-label">普通字体：</span>
                            <span class="comparison-value">0OIO0II0</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">等宽字体：</span>
                            <span class="comparison-value cipher-display">0OIO0II0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 生成安全信息
     * @returns {string} HTML内容
     */
    generateSecurityInfo() {
        return `
            <div class="security-info">
                <div class="security-feature">
                    <span class="security-icon">🔒</span>
                    <div class="security-content">
                        <strong>本地处理：</strong>
                        <p data-i18n="help.security.content">
                            加密过程完全在浏览器本地执行，不上传任何数据。支持离线使用，保护隐私安全。
                        </p>
                    </div>
                </div>
                
                <div class="security-feature">
                    <span class="security-icon">👁️</span>
                    <div class="security-content">
                        <strong>视觉混淆：</strong>
                        <p>通过视觉相似字符隐藏真实内容，适用于需要视觉隐蔽的场景。</p>
                    </div>
                </div>
                
                <div class="security-feature">
                    <span class="security-icon">🔄</span>
                    <div class="security-content">
                        <strong>完全可逆：</strong>
                        <p>标准模式下保证100%可逆，无信息损失。</p>
                    </div>
                </div>
                
                <div class="security-note">
                    <strong>注意：</strong> 本工具主要用于视觉混淆，不提供加密安全保护。
                    如需真正的安全加密，请使用专业的加密算法。
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        if (!this.modal) return;

        // 关闭按钮
        const closeBtn = this.modal.querySelector('#closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // 语言变更时更新内容
        window.addEventListener('languageChange', () => {
            if (this.isVisible) {
                this.updateContent();
            }
        });
    }

    /**
     * 显示模态框
     */
    show() {
        if (!this.modal) return;

        this.modal.style.display = 'flex';
        this.isVisible = true;
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 焦点管理
        const closeBtn = this.modal.querySelector('#closeModal');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    /**
     * 隐藏模态框
     */
    hide() {
        if (!this.modal) return;

        this.modal.style.display = 'none';
        this.isVisible = false;
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }

    /**
     * 切换模态框显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 更新内容（语言变更时）
     */
    updateContent() {
        if (!this.modal) return;

        const modalBody = this.modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = this.generateHelpContent();
        }

        // 重新应用国际化
        i18n.applyLanguage();
    }

    /**
     * 销毁模态框
     */
    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
        
        this.modal = null;
        this.isInitialized = false;
        this.isVisible = false;
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
}