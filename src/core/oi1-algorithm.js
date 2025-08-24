/**
 * oi1 视觉混淆加密算法核心实现
 * 基于 O0Il 字符的视觉相似性进行文本加密
 */

// 字符映射表：二进制 -> O0Il字符
const BINARY_TO_CHAR = {
    '00': 'O',  // 大写O
    '01': '0',  // 数字零  
    '10': 'I',  // 大写I
    '11': 'l'   // 小写L
};

// 字符反映射表：O0Il字符 -> 二进制
const CHAR_TO_BINARY = {
    'O': '00',
    '0': '01', 
    'I': '10',
    'l': '11'
};

// 有效的密文字符集
const VALID_CIPHER_CHARS = new Set(['O', '0', 'I', 'l']);

/**
 * oi1 加密器类
 */
export class OI1Encoder {
    /**
     * 将文本编码为 O0Il 字符串
     * @param {string} plaintext - 要加密的原文
     * @returns {string} 密文字符串
     */
    encode(plaintext) {
        if (typeof plaintext !== 'string') {
            throw new Error('输入必须是字符串');
        }

        if (!plaintext) {
            return '';
        }

        try {
            // 步骤1: 将文本转换为UTF-8字节数组
            const textEncoder = new TextEncoder();
            const bytes = textEncoder.encode(plaintext);
            
            // 步骤2: 将字节数组转换为二进制字符串
            let binaryString = '';
            for (const byte of bytes) {
                binaryString += byte.toString(2).padStart(8, '0');
            }
            
            // 步骤3: 将二进制串转换为O0Il字符
            return this._binaryToChars(binaryString);
            
        } catch (error) {
            throw new Error(`加密过程中发生错误: ${error.message}`);
        }
    }

    /**
     * 将二进制字符串转换为 O0Il 字符
     * @param {string} binaryString - 二进制字符串
     * @returns {string} O0Il 字符串
     * @private
     */
    _binaryToChars(binaryString) {
        // 确保二进制串长度是2的倍数，不足的补0
        const paddingLength = (2 - (binaryString.length % 2)) % 2;
        const paddedBinary = binaryString + '0'.repeat(paddingLength);
        
        let result = '';
        
        // 每2位二进制转换为一个字符
        for (let i = 0; i < paddedBinary.length; i += 2) {
            const binaryPair = paddedBinary.substring(i, i + 2);
            const char = BINARY_TO_CHAR[binaryPair];
            result += char;
        }
        
        return result;
    }


    /**
     * 获取编码统计信息
     * @param {string} plaintext - 原文
     * @param {string} ciphertext - 密文
     * @returns {Object} 统计信息
     */
    getEncodingStats(plaintext, ciphertext) {
        const textEncoder = new TextEncoder();
        const originalBytes = textEncoder.encode(plaintext);
        
        return {
            originalLength: plaintext.length,
            originalBytes: originalBytes.length,
            cipherLength: ciphertext.length,
            compressionRatio: ciphertext.length / plaintext.length,
            bytesRatio: ciphertext.length / originalBytes.length,
            charDistribution: this._getCharDistribution(ciphertext)
        };
    }

    /**
     * 获取密文中字符分布统计
     * @param {string} ciphertext - 密文
     * @returns {Object} 字符分布
     * @private
     */
    _getCharDistribution(ciphertext) {
        const distribution = { 'O': 0, '0': 0, 'I': 0, 'l': 0 };
        
        for (const char of ciphertext) {
            if (distribution.hasOwnProperty(char)) {
                distribution[char]++;
            }
        }
        
        const total = ciphertext.length;
        const percentages = {};
        for (const [char, count] of Object.entries(distribution)) {
            percentages[char] = total > 0 ? (count / total * 100).toFixed(1) : 0;
        }
        
        return {
            counts: distribution,
            percentages: percentages,
            total: total
        };
    }
}

/**
 * oi1 解密器类
 */
export class OI1Decoder {
    /**
     * 将 O0Il 字符串解码为原文
     * @param {string} ciphertext - 密文字符串
     * @returns {string} 解码后的原文
     */
    decode(ciphertext) {
        if (typeof ciphertext !== 'string') {
            throw new Error('输入必须是字符串');
        }

        if (!ciphertext) {
            return '';
        }

        // 验证密文格式
        const validation = this.validateCiphertext(ciphertext);
        if (!validation.isValid) {
            throw new Error(`密文格式错误: ${validation.error}`);
        }

        try {
            // 步骤1: 将 O0Il 字符转换为二进制字符串
            let binaryString = '';
            for (const char of ciphertext) {
                binaryString += CHAR_TO_BINARY[char];
            }
            
            // 步骤2: 将二进制字符串转换为字节数组
            const bytes = [];
            for (let i = 0; i < binaryString.length; i += 8) {
                const binaryByte = binaryString.substring(i, i + 8);
                if (binaryByte.length === 8) { // 忽略不完整的字节
                    bytes.push(parseInt(binaryByte, 2));
                }
            }
            
            // 步骤3: 将字节数组解码为UTF-8文本
            const uint8Array = new Uint8Array(bytes);
            const textDecoder = new TextDecoder('utf-8', { fatal: true });
            
            try {
                return textDecoder.decode(uint8Array);
            } catch (utfError) {
                // UTF-8解码失败，可能是无效的字节序列
                // 尝试显示字节信息帮助调试
                const byteInfo = bytes.map(b => `${b}(0x${b.toString(16)})`).join(', ');
                throw new Error(`UTF-8解码失败，字节序列可能无效: [${byteInfo}]. 原始错误: ${utfError.message}`);
            }
            
        } catch (error) {
            throw new Error(`解码过程中发生错误: ${error.message}`);
        }
    }


    /**
     * 验证密文格式是否有效
     * @param {string} ciphertext - 密文字符串
     * @returns {Object} 验证结果
     */
    validateCiphertext(ciphertext) {
        if (!ciphertext || typeof ciphertext !== 'string') {
            return {
                isValid: false,
                error: '密文不能为空'
            };
        }

        // 检查是否只包含有效字符
        for (let i = 0; i < ciphertext.length; i++) {
            const char = ciphertext[i];
            if (!VALID_CIPHER_CHARS.has(char)) {
                return {
                    isValid: false,
                    error: `包含无效字符 '${char}' (位置: ${i + 1})`
                };
            }
        }

        // 检查长度是否合理（应该是偶数，因为每2位二进制对应1个字符）
        // 但由于可能有填充，这里不做严格检查

        return {
            isValid: true,
            error: null
        };
    }

    /**
     * 获取密文质量评估
     * @param {string} ciphertext - 密文字符串  
     * @returns {Object} 质量评估结果
     */
    getCiphertextQuality(ciphertext) {
        const validation = this.validateCiphertext(ciphertext);
        if (!validation.isValid) {
            return {
                quality: 0,
                issues: [validation.error],
                recommendations: ['请检查密文格式']
            };
        }

        const distribution = this._getCharDistribution(ciphertext);
        const issues = [];
        const recommendations = [];
        let quality = 100;

        // 检查字符分布是否均匀
        const percentages = Object.values(distribution.percentages).map(p => parseFloat(p));
        const variance = this._calculateVariance(percentages);
        
        if (variance > 300) { // 分布不均匀
            quality -= 20;
            issues.push('字符分布不均匀');
            recommendations.push('考虑使用混合模式提高分布均匀性');
        }

        // 检查长度合理性
        if (ciphertext.length < 8) {
            quality -= 10;
            issues.push('密文长度较短');
        }

        // 检查是否有明显的模式
        if (this._hasObviousPatterns(ciphertext)) {
            quality -= 15;
            issues.push('存在明显的重复模式');
            recommendations.push('原文可能包含重复内容');
        }

        return {
            quality: Math.max(0, quality),
            distribution: distribution,
            issues: issues,
            recommendations: recommendations
        };
    }

    /**
     * 计算数组的方差
     * @param {number[]} numbers - 数字数组
     * @returns {number} 方差
     * @private
     */
    _calculateVariance(numbers) {
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    }

    /**
     * 检查是否存在明显的重复模式
     * @param {string} text - 文本
     * @returns {boolean} 是否存在模式
     * @private
     */
    _hasObviousPatterns(text) {
        // 检查连续重复的字符
        for (let i = 0; i < text.length - 3; i++) {
            if (text[i] === text[i + 1] && text[i] === text[i + 2] && text[i] === text[i + 3]) {
                return true;
            }
        }

        // 检查简单的交替模式
        let alternatingCount = 0;
        for (let i = 0; i < text.length - 1; i++) {
            if (i > 0 && text[i] === text[i - 2] && text[i] !== text[i - 1]) {
                alternatingCount++;
            }
        }
        
        return alternatingCount > text.length * 0.3; // 超过30%是交替模式
    }

    /**
     * 获取字符分布统计
     * @param {string} text - 文本
     * @returns {Object} 字符分布
     * @private
     */
    _getCharDistribution(text) {
        const distribution = { 'O': 0, '0': 0, 'I': 0, 'l': 0 };
        
        for (const char of text) {
            if (distribution.hasOwnProperty(char)) {
                distribution[char]++;
            }
        }
        
        const total = text.length;
        const percentages = {};
        for (const [char, count] of Object.entries(distribution)) {
            percentages[char] = total > 0 ? (count / total * 100).toFixed(1) : 0;
        }
        
        return {
            counts: distribution,
            percentages: percentages,
            total: total
        };
    }
}

/**
 * 算法演示工具类
 */
export class OI1Demo {
    /**
     * 生成加密过程的步骤演示
     * @param {string} text - 演示文本
     * @returns {Object[]} 演示步骤数组
     */
    static generateEncodingDemo(text) {
        if (!text) return [];

        const steps = [];
        const encoder = new OI1Encoder();
        
        try {
            // 步骤1: 文本到UTF-8字节
            const textEncoder = new TextEncoder();
            const bytes = textEncoder.encode(text);
            steps.push({
                step: 1,
                title: '文本转UTF-8字节',
                description: '将输入文本转换为UTF-8编码的字节数组',
                input: text,
                output: Array.from(bytes).map(b => b.toString()).join(', '),
                technical: `字节数组: [${Array.from(bytes).join(', ')}]`
            });

            // 步骤2: 字节到二进制
            let binaryString = '';
            const binaryParts = [];
            for (const byte of bytes) {
                const binary = byte.toString(2).padStart(8, '0');
                binaryParts.push(binary);
                binaryString += binary;
            }
            steps.push({
                step: 2,
                title: '字节转二进制',
                description: '将每个字节转换为8位二进制数',
                input: Array.from(bytes).join(', '),
                output: binaryParts.join(' '),
                technical: `完整二进制串: ${binaryString}`
            });

            // 步骤3: 二进制分组
            const groups = [];
            for (let i = 0; i < binaryString.length; i += 2) {
                groups.push(binaryString.substring(i, i + 2));
            }
            steps.push({
                step: 3,
                title: '二进制分组',
                description: '将二进制串按每2位分组',
                input: binaryString,
                output: groups.join(' | '),
                technical: `分组数量: ${groups.length}`
            });

            // 步骤4: 映射到字符
            const chars = [];
            for (const group of groups) {
                const char = BINARY_TO_CHAR[group] || '?';
                chars.push(`${group}→${char}`);
            }
            const finalCipher = groups.map(g => BINARY_TO_CHAR[g] || '?').join('');
            steps.push({
                step: 4,
                title: '映射到O0Il字符',
                description: '将每个2位二进制组映射到对应的字符',
                input: groups.join(' '),
                output: chars.join(' '),
                technical: `最终密文: ${finalCipher}`
            });

            return steps;
        } catch (error) {
            return [{
                step: 0,
                title: '错误',
                description: '演示生成失败',
                input: text,
                output: error.message,
                technical: ''
            }];
        }
    }

    /**
     * 生成解密过程的步骤演示
     * @param {string} ciphertext - 密文
     * @returns {Object[]} 演示步骤数组
     */
    static generateDecodingDemo(ciphertext) {
        if (!ciphertext) return [];

        const steps = [];
        const decoder = new OI1Decoder();

        try {
            // 验证密文
            const validation = decoder.validateCiphertext(ciphertext);
            if (!validation.isValid) {
                return [{
                    step: 0,
                    title: '验证失败',
                    description: '密文格式不正确',
                    input: ciphertext,
                    output: validation.error,
                    technical: ''
                }];
            }

            // 步骤1: 字符到二进制映射
            const mappings = [];
            let binaryString = '';
            for (const char of ciphertext) {
                const binary = CHAR_TO_BINARY[char];
                mappings.push(`${char}→${binary}`);
                binaryString += binary;
            }
            steps.push({
                step: 1,
                title: '字符反映射',
                description: '将O0Il字符反映射为二进制',
                input: ciphertext,
                output: mappings.join(' '),
                technical: `完整二进制串: ${binaryString}`
            });

            // 步骤2: 二进制分组为字节
            const byteGroups = [];
            const bytes = [];
            for (let i = 0; i < binaryString.length; i += 8) {
                const binaryByte = binaryString.substring(i, i + 8);
                if (binaryByte.length === 8) {
                    const byteValue = parseInt(binaryByte, 2);
                    byteGroups.push(`${binaryByte}(${byteValue})`);
                    bytes.push(byteValue);
                }
            }
            steps.push({
                step: 2,
                title: '重组为字节',
                description: '将二进制串按8位分组转换为字节',
                input: binaryString,
                output: byteGroups.join(' '),
                technical: `字节数组: [${bytes.join(', ')}]`
            });

            // 步骤3: UTF-8解码
            const uint8Array = new Uint8Array(bytes);
            const textDecoder = new TextDecoder('utf-8');
            const plaintext = textDecoder.decode(uint8Array);
            steps.push({
                step: 3,
                title: 'UTF-8解码',
                description: '将字节数组解码为UTF-8文本',
                input: `[${bytes.join(', ')}]`,
                output: plaintext,
                technical: `解码成功，共${plaintext.length}个字符`
            });

            return steps;
        } catch (error) {
            return [{
                step: 0,
                title: '错误',
                description: '演示生成失败',
                input: ciphertext,
                output: error.message,
                technical: ''
            }];
        }
    }
}

// 导出常量以供外部使用
export {
    BINARY_TO_CHAR,
    CHAR_TO_BINARY, 
    VALID_CIPHER_CHARS
};