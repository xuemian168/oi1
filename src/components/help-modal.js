/**
 * 帮助模态框组件
 * 显示oi1算法的详细说明和使用指南
 */

import i18n from '../i18n/index.js';

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
        const similarity = this.generateSimilaritySection();
        const mappingTable = this.generateMappingTable();
        const processFlow = this.generateProcessFlow();
        const exampleDemo = this.generateExampleDemo();
        const visualComparison = this.generateVisualComparison();
        const dataIntegrity = this.generateDataIntegritySection();
        const formatComparison = this.generateFormatComparisonSection();
        const statusGuide = this.generateStatusGuideSection();
        const securityInfo = this.generateSecurityInfo();
        const tipsSection = this.generateTipsSection();
        const specsSection = this.generateSpecsSection();

        return `
            <div class="help-content">
                <!-- 视觉相似性对比 -->
                ${similarity}

                <!-- 字符映射 -->
                <section class="help-section">
                    <h4>${i18n.t('help.mapping.title')}</h4>
                    <p>${i18n.t('help.mapping.subtitle')}</p>
                    ${mappingTable}
                </section>

                <!-- 加密流程 -->
                ${processFlow}

                <!-- 示例演示 -->
                ${exampleDemo}

                <!-- 数据完整性保护 -->
                ${dataIntegrity}

                <!-- 格式对比 -->
                ${formatComparison}

                <!-- 校验状态说明 -->
                ${statusGuide}

                <!-- 视觉效果对比 -->
                ${visualComparison}

                <!-- 安全特性 -->
                ${securityInfo}

                <!-- 使用技巧 -->
                ${tipsSection}

                <!-- 技术规格 -->
                ${specsSection}
            </div>
        `;
    }

    /**
     * 生成视觉相似性对比部分
     * @returns {string} HTML内容
     */
    generateSimilaritySection() {
        const pairs = i18n.currentMessages.help?.similarity?.pairs || [];
        
        return `
            <section class="help-section">
                <h4>${i18n.t('help.similarity.title')}</h4>
                <div class="visual-similarity">
                    <div class="char-comparison">
                        ${pairs.map(pair => `
                            <div class="char-pair">
                                <span class="char-display large">${pair.char1}</span>
                                <span class="vs">vs</span>
                                <span class="char-display large">${pair.char2}</span>
                                <div class="similarity-note">${pair.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 生成加密流程部分
     * @returns {string} HTML内容
     */
    generateProcessFlow() {
        const steps = i18n.currentMessages.help?.process?.steps || [];
        
        return `
            <section class="help-section">
                <h4>${i18n.t('help.process.title')}</h4>
                <div class="flow-diagram">
                    ${steps.map((step, index) => `
                        <div class="flow-step ${step.number === '✓' ? 'final' : ''}">
                            <div class="flow-number">${step.number}</div>
                            <div class="flow-content">
                                <strong>${step.title}</strong>
                                <p>${step.desc}</p>
                            </div>
                        </div>
                        ${index < steps.length - 1 ? '<div class="flow-arrow">↓</div>' : ''}
                    `).join('')}
                </div>
            </section>
        `;
    }

    /**
     * 生成视觉效果对比部分
     * @returns {string} HTML内容
     */
    generateVisualComparison() {
        const normalText = i18n.t('help.visual.normal');
        const monoText = i18n.t('help.visual.mono');
        
        // 安全地解析文本，避免 undefined
        const parseText = (text) => {
            const parts = text.split('：');
            return {
                label: parts[0] || '',
                value: parts[1] || '0OIO0II0'
            };
        };
        
        const normal = parseText(normalText);
        const mono = parseText(monoText);
        
        return `
            <section class="help-section">
                <h4>${i18n.t('help.visual.title')}</h4>
                <div class="visual-comparison">
                    <div class="comparison-item">
                        <span class="comparison-label">${normal.label}：</span>
                        <span class="comparison-value">${normal.value}</span>
                    </div>
                    <div class="comparison-item">
                        <span class="comparison-label">${mono.label}：</span>
                        <span class="comparison-value cipher-display">${mono.value}</span>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 生成使用技巧部分
     * @returns {string} HTML内容
     */
    generateTipsSection() {
        const tips = i18n.currentMessages.help?.tips?.items || [];
        
        return `
            <section class="help-section">
                <h4>${i18n.t('help.tips.title')}</h4>
                <div class="tips-list">
                    ${tips.map(tip => `
                        <div class="tip-item">
                            <span class="tip-icon">${tip.icon}</span>
                            <div class="tip-content">
                                <strong>${tip.title}：</strong>
                                <p>${tip.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    /**
     * 生成技术规格部分
     * @returns {string} HTML内容
     */
    generateSpecsSection() {
        const specs = i18n.currentMessages.help?.specs?.items || [];
        
        return `
            <section class="help-section">
                <h4>${i18n.t('help.specs.title')}</h4>
                <div class="tech-specs">
                    ${specs.map(spec => `
                        <div class="spec-row">
                            <span class="spec-label">${spec.label}：</span>
                            <span class="spec-value">${spec.value}</span>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    /**
     * 生成映射表
     * @returns {string} HTML表格
     */
    generateMappingTable() {
        const tableData = i18n.currentMessages.help?.mapping?.table || [];
        
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
                        ${tableData.map(row => `
                            <tr>
                                <td><code>${row.binary}</code></td>
                                <td><span class="char-display">${row.char}</span></td>
                                <td>${row.desc}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 生成示例演示
     * @returns {string} HTML内容
     */
    generateExampleDemo() {
        const exampleData = i18n.currentMessages.help?.example;
        if (!exampleData) return '';
        
        return `
            <section class="help-section">
                <h4>${exampleData.title}</h4>
                <div class="example-demo">
                    <div class="example-item">
                        <h5>${exampleData.subtitle}</h5>
                        <div class="example-steps">
                            ${exampleData.steps?.map(step => `
                                <div class="example-step">
                                    <span class="step-label">${step.label}</span>
                                    <span class="step-value ${step.label === '密文：' ? 'cipher-display' : ''}">${step.value}</span>
                                </div>
                            `).join('') || ''}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 生成安全信息
     * @returns {string} HTML内容
     */
    generateSecurityInfo() {
        const securityData = i18n.currentMessages.help?.security;
        if (!securityData) return '';
        
        return `
            <section class="help-section">
                <h4>${securityData.title}</h4>
                <div class="security-info">
                    ${securityData.features?.map(feature => `
                        <div class="security-feature">
                            <span class="security-icon">${feature.icon}</span>
                            <div class="security-content">
                                <strong>${feature.title}：</strong>
                                <p>${feature.desc}</p>
                            </div>
                        </div>
                    `).join('') || ''}
                    
                    ${securityData.warning ? `
                        <div class="security-note">
                            <strong>注意：</strong> ${securityData.warning}
                        </div>
                    ` : ''}
                </div>
            </section>
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
     * 生成数据完整性保护部分
     * @returns {string} HTML内容
     */
    generateDataIntegritySection() {
        const features = i18n.t('help.dataIntegrity.features');
        const featuresArray = Array.isArray(features) ? features : [];
        const featuresHtml = featuresArray.map(feature => `
            <div class="feature-item">
                <span class="feature-icon">${feature.icon || '🔧'}</span>
                <div class="feature-content">
                    <h5>${feature.title || 'Feature'}</h5>
                    <p>${feature.desc || 'Description'}</p>
                </div>
            </div>
        `).join('');

        return `
            <section class="help-section">
                <h4>${i18n.t('help.dataIntegrity.title')}</h4>
                <p class="section-subtitle">${i18n.t('help.dataIntegrity.subtitle')}</p>
                <div class="features-grid">
                    ${featuresHtml}
                </div>
            </section>
        `;
    }

    /**
     * 生成格式对比部分
     * @returns {string} HTML内容
     */
    generateFormatComparisonSection() {
        const formats = i18n.t('help.formatCompare.formats');
        const formatsArray = Array.isArray(formats) ? formats : [];
        const formatsHtml = formatsArray.map(format => `
            <div class="format-item">
                <h5 class="format-version">${format.version || 'Format'}</h5>
                <div class="format-structure">${format.structure || 'Structure'}</div>
                <div class="format-example cipher-display">${format.example || 'Example'}</div>
                <div class="format-protection">${format.protection || 'Protection'}</div>
            </div>
        `).join('');

        return `
            <section class="help-section">
                <h4>${i18n.t('help.formatCompare.title')}</h4>
                <p class="section-subtitle">${i18n.t('help.formatCompare.description')}</p>
                <div class="formats-comparison">
                    ${formatsHtml}
                </div>
                <p class="format-note">${i18n.t('help.formatCompare.lengthNote')}</p>
            </section>
        `;
    }

    /**
     * 生成校验状态说明部分
     * @returns {string} HTML内容
     */
    generateStatusGuideSection() {
        const statuses = i18n.t('help.statusGuide.statuses');
        const statusesArray = Array.isArray(statuses) ? statuses : [];
        const statusesHtml = statusesArray.map(status => `
            <div class="status-item">
                <span class="status-icon">${status.icon || '📌'}</span>
                <div class="status-content">
                    <h5 class="status-title">${status.status || 'Status'}</h5>
                    <p class="status-meaning">${status.meaning || 'Meaning'}</p>
                    <p class="status-action">${status.action || 'Action'}</p>
                </div>
            </div>
        `).join('');

        return `
            <section class="help-section">
                <h4>${i18n.t('help.statusGuide.title')}</h4>
                <p class="section-subtitle">${i18n.t('help.statusGuide.description')}</p>
                <div class="status-guide">
                    ${statusesHtml}
                </div>
            </section>
        `;
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