/**
 * oi1 视觉混淆加密算法核心实现
 * 基于 O0Il 字符的视觉相似性进行文本加密
 */

import i18n from '../i18n/index.js';

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
 * CRC32 校验和算法实现
 * 使用IEEE 802.3标准多项式：0xEDB88320
 */
class CRC32 {
    constructor() {
        // 预计算CRC32查找表
        this.table = this._generateTable();
    }

    /**
     * 生成CRC32查找表
     * @returns {number[]} CRC32查找表
     * @private
     */
    _generateTable() {
        const table = [];
        const polynomial = 0xEDB88320;

        for (let i = 0; i < 256; i++) {
            let crc = i;
            for (let j = 0; j < 8; j++) {
                if (crc & 1) {
                    crc = (crc >>> 1) ^ polynomial;
                } else {
                    crc = crc >>> 1;
                }
            }
            table[i] = crc >>> 0; // 确保无符号32位
        }
        
        return table;
    }

    /**
     * 计算字节数组的CRC32值
     * @param {Uint8Array|number[]} bytes - 字节数组
     * @returns {number} CRC32值（无符号32位整数）
     */
    calculate(bytes) {
        let crc = 0xFFFFFFFF;

        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i] & 0xFF;
            crc = this.table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
        }

        return (crc ^ 0xFFFFFFFF) >>> 0; // 最终异或并确保无符号
    }

    /**
     * 将CRC32值转换为O0Il字符串
     * @param {number} crc32 - CRC32值
     * @returns {string} 16个O0Il字符
     */
    toOI1String(crc32) {
        // 将32位数值转换为4字节
        const bytes = [
            (crc32 >>> 24) & 0xFF,
            (crc32 >>> 16) & 0xFF,
            (crc32 >>> 8) & 0xFF,
            crc32 & 0xFF
        ];

        // 每字节转换为4个O0Il字符（每2bit对应1个字符）
        let result = '';
        for (const byte of bytes) {
            const binary = byte.toString(2).padStart(8, '0');
            for (let i = 0; i < 8; i += 2) {
                const binaryPair = binary.substring(i, i + 2);
                result += BINARY_TO_CHAR[binaryPair];
            }
        }

        return result;
    }

    /**
     * 从O0Il字符串解析CRC32值
     * @param {string} oi1String - 16个O0Il字符
     * @returns {number} CRC32值
     */
    fromOI1String(oi1String) {
        if (oi1String.length !== 16) {
            throw new Error('CRC32字符串长度必须为16');
        }

        // 将O0Il字符转换为二进制字符串
        let binaryString = '';
        for (const char of oi1String) {
            if (!CHAR_TO_BINARY[char]) {
                throw new Error(`无效的O0Il字符: ${char}`);
            }
            binaryString += CHAR_TO_BINARY[char];
        }

        // 将32位二进制转换为数值
        let crc32 = 0;
        for (let i = 0; i < 32; i++) {
            if (binaryString[i] === '1') {
                crc32 |= (1 << (31 - i));
            }
        }

        return crc32 >>> 0; // 确保无符号
    }
}

/**
 * oi1 加密器类
 */
export class OI1Encoder {
    constructor() {
        // 初始化CRC32计算器
        this.crc32 = new CRC32();
    }

    /**
     * 将文本编码为 O0Il 字符串（带CRC32校验）
     * @param {string} plaintext - 要加密的原文
     * @returns {string} 密文字符串（包含CRC32校验码）
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
            
            // 步骤2: 计算CRC32校验码
            const crc32Value = this.crc32.calculate(bytes);
            const crcString = this.crc32.toOI1String(crc32Value);
            
            // 步骤3: 将字节数组转换为二进制字符串
            let binaryString = '';
            for (const byte of bytes) {
                binaryString += byte.toString(2).padStart(8, '0');
            }
            
            // 步骤4: 将二进制串转换为O0Il字符
            const mainCipher = this._binaryToChars(binaryString);
            
            // 步骤5: 组合主密文和CRC校验码
            return mainCipher + crcString;
            
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
     * 检测密文格式版本
     * @param {string} ciphertext - 密文字符串
     * @returns {Object} 格式检测结果
     */
    detectFormat(ciphertext) {
        if (!ciphertext || typeof ciphertext !== 'string') {
            return {
                version: 'unknown',
                hasCRC: false,
                isValid: false
            };
        }

        // 检查长度：新格式应该是 (原文长度*4 + 16) 且 > 16
        // 旧格式应该是 (原文长度*4) 且能被4整除
        const length = ciphertext.length;
        
        if (length > 16 && (length - 16) % 4 === 0) {
            // 可能是新格式（带CRC）
            return {
                version: 'v2',
                hasCRC: true,
                isValid: true,
                mainCipherLength: length - 16,
                crcLength: 16
            };
        } else if (length % 4 === 0 && length > 0) {
            // 可能是旧格式（无CRC）
            return {
                version: 'v1', 
                hasCRC: false,
                isValid: true,
                mainCipherLength: length,
                crcLength: 0
            };
        }

        return {
            version: 'unknown',
            hasCRC: false,
            isValid: false
        };
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
        const formatInfo = this.detectFormat(ciphertext);
        
        return {
            originalLength: plaintext.length,
            originalBytes: originalBytes.length,
            cipherLength: ciphertext.length,
            compressionRatio: ciphertext.length / plaintext.length,
            bytesRatio: ciphertext.length / originalBytes.length,
            formatVersion: formatInfo.version,
            hasCRC: formatInfo.hasCRC,
            crcValue: formatInfo.hasCRC ? this._getCRCFromCipher(ciphertext) : null,
            charDistribution: this._getCharDistribution(ciphertext)
        };
    }

    /**
     * 从密文中提取CRC值
     * @param {string} ciphertext - 密文字符串
     * @returns {string|null} CRC字符串或null
     * @private
     */
    _getCRCFromCipher(ciphertext) {
        const formatInfo = this.detectFormat(ciphertext);
        if (formatInfo.hasCRC && formatInfo.version === 'v2') {
            return ciphertext.slice(-16); // 末尾16个字符
        }
        return null;
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
    constructor() {
        // 初始化CRC32计算器和格式检测器
        this.crc32 = new CRC32();
        this.encoder = new OI1Encoder(); // 用于格式检测
    }

    /**
     * 将 O0Il 字符串解码为原文（支持CRC32验证）
     * @param {string} ciphertext - 密文字符串
     * @returns {Object} 解码结果，包含原文和校验信息
     */
    decode(ciphertext) {
        if (typeof ciphertext !== 'string') {
            throw new Error('输入必须是字符串');
        }

        if (!ciphertext) {
            return {
                plaintext: '',
                crcVerified: false,
                formatVersion: 'empty'
            };
        }

        // 检测密文格式
        const formatInfo = this.encoder.detectFormat(ciphertext);
        if (!formatInfo.isValid) {
            throw new Error('密文格式不正确，无法识别版本');
        }

        // 验证密文字符
        const validation = this.validateCiphertext(ciphertext);
        if (!validation.isValid) {
            throw new Error(`密文格式错误: ${validation.error}`);
        }

        try {
            if (formatInfo.version === 'v2') {
                // 新格式：带CRC校验
                return this._decodeWithCRC(ciphertext, formatInfo);
            } else {
                // 旧格式：无CRC校验
                return this._decodeWithoutCRC(ciphertext, formatInfo);
            }
            
        } catch (error) {
            throw new Error(`解码过程中发生错误: ${error.message}`);
        }
    }

    /**
     * 解码带CRC校验的密文（v2格式）
     * @param {string} ciphertext - 密文字符串
     * @param {Object} formatInfo - 格式信息
     * @returns {Object} 解码结果
     * @private
     */
    _decodeWithCRC(ciphertext, formatInfo) {
        // 分离主密文和CRC校验码
        const mainCipher = ciphertext.slice(0, formatInfo.mainCipherLength);
        const crcString = ciphertext.slice(-16);

        // 解析CRC值
        const expectedCRC = this.crc32.fromOI1String(crcString);

        // 解码主密文
        const plaintext = this._decodeCipher(mainCipher);

        // 验证CRC校验码
        const textEncoder = new TextEncoder();
        const bytes = textEncoder.encode(plaintext);
        const actualCRC = this.crc32.calculate(bytes);

        const crcVerified = (actualCRC === expectedCRC);

        if (!crcVerified) {
            throw new Error(`CRC32校验失败！数据可能已损坏或被篡改。期望: ${expectedCRC.toString(16).toUpperCase()}, 实际: ${actualCRC.toString(16).toUpperCase()}`);
        }

        return {
            plaintext: plaintext,
            crcVerified: true,
            formatVersion: 'v2',
            crcExpected: expectedCRC,
            crcActual: actualCRC
        };
    }

    /**
     * 解码无CRC校验的密文（v1格式）
     * @param {string} ciphertext - 密文字符串
     * @param {Object} formatInfo - 格式信息
     * @returns {Object} 解码结果
     * @private
     */
    _decodeWithoutCRC(ciphertext, formatInfo) {
        const plaintext = this._decodeCipher(ciphertext);

        return {
            plaintext: plaintext,
            crcVerified: false,
            formatVersion: 'v1',
            crcExpected: null,
            crcActual: null
        };
    }

    /**
     * 核心解码逻辑
     * @param {string} ciphertext - 纯密文字符串（不含CRC）
     * @returns {string} 解码后的原文
     * @private
     */
    _decodeCipher(ciphertext) {
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
            const byteInfo = bytes.map(b => `${b}(0x${b.toString(16)})`).join(', ');
            throw new Error(`UTF-8解码失败，字节序列可能无效: [${byteInfo}]. 原始错误: ${utfError.message}`);
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
                title: i18n.t('demo.steps.encoding.step1.title'),
                description: i18n.t('demo.steps.encoding.step1.description'),
                input: text,
                output: Array.from(bytes).map(b => b.toString()).join(', '),
                technical: `字节数组: [${Array.from(bytes).join(', ')}]`
            });

            // 步骤2: 计算CRC32校验码
            const crc32Value = encoder.crc32.calculate(bytes);
            const crcString = encoder.crc32.toOI1String(crc32Value);
            steps.push({
                step: 2,
                title: i18n.t('demo.steps.encoding.step2.title'),
                description: i18n.t('demo.steps.encoding.step2.description'),
                input: `[${Array.from(bytes).join(', ')}]`,
                output: `CRC32: 0x${crc32Value.toString(16).toUpperCase()}`,
                technical: `CRC32(O0Il): ${crcString} (16${i18n.t('validation.chars') || '字符'})`
            });

            // 步骤3: 字节到二进制
            let binaryString = '';
            const binaryParts = [];
            for (const byte of bytes) {
                const binary = byte.toString(2).padStart(8, '0');
                binaryParts.push(binary);
                binaryString += binary;
            }
            steps.push({
                step: 3,
                title: i18n.t('demo.steps.encoding.step3.title'),
                description: i18n.t('demo.steps.encoding.step3.description'),
                input: Array.from(bytes).join(', '),
                output: binaryParts.join(' '),
                technical: `完整二进制串: ${binaryString} (${binaryString.length}位)`
            });

            // 步骤4: 二进制分组
            const groups = [];
            for (let i = 0; i < binaryString.length; i += 2) {
                groups.push(binaryString.substring(i, i + 2));
            }
            steps.push({
                step: 4,
                title: i18n.t('demo.steps.encoding.step4.title'),
                description: i18n.t('demo.steps.encoding.step4.description'),
                input: binaryString,
                output: groups.join(' | '),
                technical: `分组数量: ${groups.length}`
            });

            // 步骤5: 映射到字符
            const chars = [];
            for (const group of groups) {
                const char = BINARY_TO_CHAR[group] || '?';
                chars.push(`${group}→${char}`);
            }
            const mainCipher = groups.map(g => BINARY_TO_CHAR[g] || '?').join('');
            steps.push({
                step: 5,
                title: i18n.t('demo.steps.encoding.step5.title'),
                description: i18n.t('demo.steps.encoding.step5.description'),
                input: groups.join(' '),
                output: chars.join(' '),
                technical: `主密文: ${mainCipher} (${mainCipher.length}字符)`
            });

            // 步骤6: 附加CRC32校验码
            const finalCipher = mainCipher + crcString;
            steps.push({
                step: 6,
                title: i18n.t('demo.steps.encoding.step6.title'),
                description: i18n.t('demo.steps.encoding.step6.description'),
                input: `主密文: ${mainCipher}\nCRC32: ${crcString}`,
                output: finalCipher,
                technical: `最终密文(v2): ${finalCipher} (${finalCipher.length}字符) = ${mainCipher.length}主密文 + 16CRC`
            });

            return steps;
        } catch (error) {
            return [{
                step: 0,
                title: i18n.t('errors.error') || '错误',
                description: i18n.t('demo.errorGeneration') || '演示生成失败',
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
                    title: i18n.t('validation.invalid') || '验证失败',
                    description: i18n.t('demo.validationFailed') || '密文格式不正确',
                    input: ciphertext,
                    output: validation.error,
                    technical: ''
                }];
            }

            // 步骤1: 格式检测
            const formatInfo = decoder.encoder.detectFormat(ciphertext);
            steps.push({
                step: 1,
                title: i18n.t('demo.steps.decoding.step1.title'),
                description: i18n.t('demo.steps.decoding.step1.description'),
                input: `密文长度: ${ciphertext.length}`,
                output: `格式: ${formatInfo.version} ${formatInfo.hasCRC ? '(包含CRC32)' : '(无CRC)'}`,
                technical: `主密文: ${formatInfo.mainCipherLength}字符, CRC: ${formatInfo.crcLength}字符`
            });

            let mainCipher = ciphertext;
            let crcString = '';
            let expectedCRC = null;

            // 步骤2: 分离CRC32校验码（仅v2格式）
            if (formatInfo.version === 'v2' && formatInfo.hasCRC) {
                mainCipher = ciphertext.slice(0, formatInfo.mainCipherLength);
                crcString = ciphertext.slice(-16);
                expectedCRC = decoder.crc32.fromOI1String(crcString);
                steps.push({
                    step: 2,
                    title: i18n.t('demo.steps.decoding.step2.title'),
                    description: i18n.t('demo.steps.decoding.step2.description'),
                    input: ciphertext,
                    output: `主密文: ${mainCipher}\nCRC32: ${crcString}`,
                    technical: `CRC32值: 0x${expectedCRC.toString(16).toUpperCase()}`
                });
            }

            // 步骤3: 字符到二进制映射
            const mappings = [];
            let binaryString = '';
            for (const char of mainCipher) {
                const binary = CHAR_TO_BINARY[char];
                mappings.push(`${char}→${binary}`);
                binaryString += binary;
            }
            steps.push({
                step: formatInfo.hasCRC ? 3 : 2,
                title: i18n.t('demo.steps.decoding.step3.title'),
                description: i18n.t('demo.steps.decoding.step3.description'),
                input: mainCipher,
                output: mappings.join(' '),
                technical: `完整二进制串: ${binaryString} (${binaryString.length}位)`
            });

            // 步骤4: 二进制分组为字节
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
                step: formatInfo.hasCRC ? 4 : 3,
                title: i18n.t('demo.steps.decoding.step4.title'),
                description: i18n.t('demo.steps.decoding.step4.description'),
                input: binaryString,
                output: byteGroups.join(' '),
                technical: `字节数组: [${bytes.join(', ')}]`
            });

            // 步骤5: UTF-8解码
            const uint8Array = new Uint8Array(bytes);
            const textDecoder = new TextDecoder('utf-8');
            const plaintext = textDecoder.decode(uint8Array);
            steps.push({
                step: formatInfo.hasCRC ? 5 : 4,
                title: i18n.t('demo.steps.decoding.step5.title'),
                description: i18n.t('demo.steps.decoding.step5.description'),
                input: `[${bytes.join(', ')}]`,
                output: plaintext,
                technical: `解码成功，共${plaintext.length}个字符`
            });

            // 步骤6: CRC32校验验证（仅v2格式）
            if (formatInfo.version === 'v2' && formatInfo.hasCRC && expectedCRC !== null) {
                const textEncoder = new TextEncoder();
                const plaintextBytes = textEncoder.encode(plaintext);
                const actualCRC = decoder.crc32.calculate(plaintextBytes);
                const isVerified = (actualCRC === expectedCRC);
                
                steps.push({
                    step: 6,
                    title: i18n.t('demo.steps.decoding.step6.title'),
                    description: i18n.t('demo.steps.decoding.step6.description'),
                    input: `期望CRC32: 0x${expectedCRC.toString(16).toUpperCase()}\n实际CRC32: 0x${actualCRC.toString(16).toUpperCase()}`,
                    output: isVerified ? '✓ CRC32校验通过 - 数据完整无误' : '✗ CRC32校验失败 - 数据可能损坏或被篡改',
                    technical: `校验结果: ${isVerified ? '通过' : '失败'} - ${isVerified ? '数据完整性得到保证' : '检测到数据损坏或篡改'}`
                });
            } else if (formatInfo.version === 'v1') {
                steps.push({
                    step: 5,
                    title: i18n.t('demo.steps.decoding.legacyNote.title'),
                    description: i18n.t('demo.steps.decoding.legacyNote.description'),
                    input: '旧格式密文',
                    output: '⚠️ 无完整性保护 - 建议使用v2格式',
                    technical: 'v1格式为向后兼容保留，推荐升级到v2格式获得完整性保护'
                });
            }

            return steps;
        } catch (error) {
            return [{
                step: 0,
                title: i18n.t('errors.error') || '错误',
                description: i18n.t('demo.errorGeneration') || '演示生成失败',
                input: ciphertext,
                output: error.message,
                technical: ''
            }];
        }
    }
}

// 导出常量和类以供外部使用
export {
    BINARY_TO_CHAR,
    CHAR_TO_BINARY, 
    VALID_CIPHER_CHARS,
    CRC32
};