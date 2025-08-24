/**
 * 算法演示查看器组件
 * 展示oi1加密解密的详细步骤过程
 */

import { OI1Demo } from '../core/oi1-algorithm.js';
import i18n from '../i18n/index.js';

export class DemoViewer {
    constructor() {
        this.container = null;
        this.isInitialized = false;
        this.currentDemo = null;
        this.animationSpeed = 1000; // 动画间隔毫秒
    }

    /**
     * 初始化演示查看器
     * @param {HTMLElement} container - 容器元素
     */
    async init(container) {
        if (this.isInitialized) return;

        this.container = container;
        this.createDemoStructure();
        this.bindEvents();
        
        this.isInitialized = true;
    }

    /**
     * 创建演示界面结构
     */
    createDemoStructure() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-tabs">
                    <button class="demo-tab active" data-tab="encoding" data-i18n="demo.encoding">编码过程</button>
                    <button class="demo-tab" data-tab="decoding" data-i18n="demo.decoding">解码过程</button>
                </div>
            </div>
            
            <div class="demo-content-area">
                <div id="encodingDemo" class="demo-panel active">
                    <div class="demo-steps" id="encodingSteps"></div>
                </div>
                
                <div id="decodingDemo" class="demo-panel">
                    <div class="demo-steps" id="decodingSteps"></div>
                </div>
            </div>
            
            <div class="demo-footer">
                <div class="demo-status" id="demoStatus"></div>
            </div>
        `;

        // 应用国际化
        i18n.applyLanguage();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        if (!this.container) return;

        // Tab切换
        const tabs = this.container.querySelectorAll('.demo-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });


    }

    /**
     * 切换演示标签页
     * @param {string} tabName - 标签页名称
     */
    switchTab(tabName) {
        if (!this.container) return;

        // 更新标签按钮状态
        const tabs = this.container.querySelectorAll('.demo-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // 更新面板显示
        const panels = this.container.querySelectorAll('.demo-panel');
        panels.forEach(panel => {
            if (panel.id === `${tabName}Demo`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    /**
     * 显示编码演示
     * @param {string} text - 要演示的文本
     */
    async showEncodingDemo(text) {
        if (!this.container || !text) return;

        const steps = OI1Demo.generateEncodingDemo(text);
        const container = this.container.querySelector('#encodingSteps');
        
        if (!container) return;

        this.currentDemo = {
            type: 'encoding',
            text: text,
            steps: steps
        };

        await this.renderSteps(container, steps, 'encoding');
        this.updateStatus(`编码演示：${text} → ${steps.length}个步骤`);
    }

    /**
     * 显示解码演示
     * @param {string} ciphertext - 要演示的密文
     */
    async showDecodingDemo(ciphertext) {
        if (!this.container || !ciphertext) return;

        const steps = OI1Demo.generateDecodingDemo(ciphertext);
        const container = this.container.querySelector('#decodingSteps');
        
        if (!container) return;

        this.currentDemo = {
            type: 'decoding',
            text: ciphertext,
            steps: steps
        };

        await this.renderSteps(container, steps, 'decoding');
        this.updateStatus(`解码演示：${ciphertext.substring(0, 20)}... → ${steps.length}个步骤`);
    }

    /**
     * 渲染步骤内容
     * @param {HTMLElement} container - 容器元素
     * @param {Array} steps - 步骤数组
     * @param {string} type - 演示类型
     */
    async renderSteps(container, steps, type) {
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepElement = this.createStepElement(step, i);
            container.appendChild(stepElement);
        }
    }

    /**
     * 创建单个步骤元素
     * @param {Object} step - 步骤数据
     * @param {number} index - 步骤索引
     * @returns {HTMLElement} 步骤元素
     */
    createStepElement(step, index) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'demo-step';
        stepDiv.dataset.step = step.step;

        const isError = step.step === 0;
        if (isError) {
            stepDiv.classList.add('error');
        }

        stepDiv.innerHTML = `
            <div class="step-header">
                <div class="step-number">${isError ? '⚠️' : step.step}</div>
                <div class="step-title">
                    <h4>${step.title}</h4>
                    <p class="step-description">${step.description}</p>
                </div>
            </div>
            
            <div class="step-content">
                <div class="step-io">
                    <div class="step-input">
                        <label>${i18n.t('demo.input')}:</label>
                        <div class="step-data${step.step > 2 ? ' cipher-display' : ''}">${this.escapeHtml(step.input)}</div>
                    </div>
                    
                    <div class="step-arrow">→</div>
                    
                    <div class="step-output">
                        <label>${i18n.t('demo.output')}:</label>
                        <div class="step-data${step.step > 2 ? ' cipher-display' : ''}">${this.escapeHtml(step.output)}</div>
                    </div>
                </div>
                
                ${step.technical ? `
                    <div class="step-technical">
                        <details>
                            <summary>${i18n.t('demo.technical')}</summary>
                            <div class="technical-details">${this.escapeHtml(step.technical)}</div>
                        </details>
                    </div>
                ` : ''}
            </div>
        `;

        return stepDiv;
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text - 文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 更新演示状态
     * @param {string} status - 状态信息
     */
    updateStatus(status) {
        const statusElement = this.container?.querySelector('#demoStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }



    /**
     * 高亮显示特定步骤
     * @param {number} stepNumber - 步骤号
     */
    highlightStep(stepNumber) {
        if (!this.container) return;

        const steps = this.container.querySelectorAll('.demo-step');
        steps.forEach(step => {
            if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('highlighted');
                step.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 3秒后移除高亮
                setTimeout(() => {
                    step.classList.remove('highlighted');
                }, 3000);
            }
        });
    }

    /**
     * 导出演示数据
     * @returns {Object|null} 演示数据
     */
    exportDemo() {
        return this.currentDemo ? {
            ...this.currentDemo,
            timestamp: new Date().toISOString(),
            version: '1.0'
        } : null;
    }

    /**
     * 生成演示报告
     * @returns {string} HTML报告
     */
    generateReport() {
        if (!this.currentDemo) {
            return '<p>没有可用的演示数据</p>';
        }

        const { type, text, steps } = this.currentDemo;
        const typeName = type === 'encoding' ? '编码' : '解码';
        
        let report = `
            <div class="demo-report">
                <h3>oi1 ${typeName}演示报告</h3>
                <p><strong>输入文本：</strong> ${this.escapeHtml(text)}</p>
                <p><strong>步骤数量：</strong> ${steps.length}</p>
                <p><strong>生成时间：</strong> ${new Date().toLocaleString()}</p>
                
                <div class="report-steps">
        `;

        steps.forEach((step) => {
            report += `
                <div class="report-step">
                    <h4>步骤 ${step.step}: ${step.title}</h4>
                    <p>${step.description}</p>
                    <div class="report-step-data">
                        <p><strong>输入：</strong> <code>${this.escapeHtml(step.input)}</code></p>
                        <p><strong>输出：</strong> <code>${this.escapeHtml(step.output)}</code></p>
                        ${step.technical ? `<p><strong>技术详情：</strong> ${this.escapeHtml(step.technical)}</p>` : ''}
                    </div>
                </div>
            `;
        });

        report += `
                </div>
            </div>
        `;

        return report;
    }

    /**
     * 清空演示内容
     */
    clear() {
        if (!this.container) return;

        const encodingContainer = this.container.querySelector('#encodingSteps');
        const decodingContainer = this.container.querySelector('#decodingSteps');
        
        if (encodingContainer) encodingContainer.innerHTML = '';
        if (decodingContainer) decodingContainer.innerHTML = '';
        
        this.currentDemo = null;
        this.updateStatus('演示已清空');
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.container = null;
        this.currentDemo = null;
        this.isInitialized = false;
    }
}