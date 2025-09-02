# oi1 视觉加密工具

一个基于视觉相似字符的文本加密工具，利用 `O`、`0`、`I`、`l` 字符的高度相似性实现视觉混淆效果。

[English Documentation](./README.md) | [在线演示](https://oi.zli.li/)

## ✨ 特性

- 🔐 **视觉混淆加密** - 将任意文本转换为仅含 O0Il 的密文
- 🛡️ **数据完整性** - CRC32校验和检测数据损坏（v2格式）
- 🔄 **格式兼容** - 向后兼容旧版格式
- 🌍 **多语言支持** - 中文/英文界面切换
- 📊 **实时演示** - 可视化展示加密解密过程
- 🔧 **简洁高效** - 自动格式检测和验证
- 🔧 **完全可逆** - 100%无损还原，带完整性保护
- 🛡️ **本地处理** - 所有操作在浏览器本地执行
- 📱 **响应式设计** - 支持桌面和移动设备

## 🎯 算法原理

oi1 算法的核心思想是利用字符的视觉相似性：

```
字符映射表：
00 → O (大写O)
01 → 0 (数字零)  
10 → I (大写I)
11 → l (小写L)
```

### 加密流程（v2格式带CRC32）

1. **文本转UTF-8** - 将输入文本转换为字节数组
2. **CRC32计算** - 计算校验和用于完整性验证
3. **二进制转换** - 每个字节转为8位二进制串
4. **分组映射** - 每2位二进制映射为一个 O0Il 字符
5. **附加校验** - 添加16字符CRC32校验码（无缝集成）
6. **密文输出** - 生成带完整性保护的密文

### 格式对比

- **v1格式（旧）**: 纯O0Il密文 - `0OIO0II0`
- **v2格式（新）**: O0Il密文 + CRC32 - `0OIO0II0O0lIO0Il00IlOOI0`

### 示例

```
原文: "Hi"
UTF-8: [72, 105]
CRC32: 0x1234ABCD → O0lIO0Il00IlOOI0 (16字符)
二进制: 01001000 01101001  
分组: 01|00|10|00 01|10|10|01
映射: 0|O|I|O 0|I|I|0
主密文: 0OIO0II0
最终(v2): 0OIO0II0 + O0lIO0Il00IlOOI0 = 0OIO0II0O0lIO0Il00IlOOI0
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- 现代浏览器（支持 ES6+）

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

### 访问应用

- 开发模式：`http://localhost:3000`
- 在线演示：[https://oi.zli.li/](https://oi.zli.li/)

## 📖 使用指南

### 基础使用

1. **加密文本**
   - 在左侧面板输入原文
   - 点击"加密"按钮
   - 复制右侧生成的密文

2. **解密文本**
   - 在右侧面板输入密文
   - 系统自动检测格式并验证完整性
   - 点击"解密"按钮
   - 查看解密结果和验证状态


### 快捷键

- `Ctrl/Cmd + Enter` - 执行加密/解密
- `Ctrl/Cmd + K` - 清空当前输入框
- `ESC` - 关闭帮助弹窗

## 🏗️ 项目结构

```
oi1/
├── src/
│   ├── core/
│   │   └── oi1-algorithm.js     # 核心加密算法
│   ├── components/
│   │   ├── demo-viewer.js       # 算法演示组件
│   │   └── help-modal.js        # 帮助模态框
│   ├── i18n/
│   │   ├── zh-CN.json          # 中文语言包
│   │   └── en-US.json          # 英文语言包
│   ├── utils/
│   │   └── clipboard.js        # 剪贴板工具
│   ├── styles/
│   │   └── main.css            # 主样式文件
│   └── main.js                 # 应用入口
├── index.html                  # HTML模板
├── vite.config.js             # Vite配置
└── package.json               # 项目配置
```

## 🔧 技术栈

- **构建工具**: Vite
- **前端框架**: Vanilla JavaScript (ES6+)
- **样式方案**: 原生CSS + CSS变量
- **字体优化**: JetBrains Mono 等宽字体
- **国际化**: 自定义 i18n 系统
- **剪贴板**: 现代 Clipboard API + 传统方法兼容

## 🎨 设计特色

### 视觉混淆优化

- 使用等宽字体增强字符相似性
- 特殊的字符间距调整
- 智能换行避免明显模式
- 密文区域优化显示

### 用户体验

- 实时输入验证
- 字符计数显示
- 一键复制功能
- 算法过程可视化
- 响应式界面设计

## 🛡️ 安全说明

**重要提醒**: 本工具主要用于视觉混淆，**不提供加密安全保护**。

### 安全特性

- ✅ 本地处理，不上传数据
- ✅ 支持离线使用
- ✅ 开源代码，可审查
- ✅ 无需服务器依赖
- ✅ CRC32完整性验证（v2格式）
- ✅ 自动损坏检测

### 适用场景

- 文本视觉隐蔽
- 教学演示
- 趣味编码
- 原型开发

### 不适用场景

- 敏感数据加密
- 安全通信
- 密码保护
- 商业机密

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发流程

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码规范

- 使用 ES6+ 语法
- 遵循函数式编程原则
- 添加适当的注释
- 保持代码简洁清晰

## 🌐 浏览器兼容性

- Chrome 80+
- Firefox 74+
- Safari 13.1+
- Edge 80+

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 相关链接

- **在线演示**: [https://oi.zli.li/](https://oi.zli.li/)
- **GitHub 仓库**: [https://github.com/xuemian168/oi1](https://github.com/xuemian168/oi1)
- **问题反馈**: [GitHub Issues](https://github.com/xuemian168/oi1/issues)

---

<div align="center">

由 ❤️ 和 [ICT.RUN](https://www.ict.run/) 制作

[![GitHub stars](https://img.shields.io/github/stars/xuemian168/oi1?style=social)](https://github.com/xuemian168/oi1/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xuemian168/oi1?style=social)](https://github.com/xuemian168/oi1/network)

</div>
