# oi1 Visual Encoder

A visual obfuscation text encoder that leverages the high visual similarity between `O`, `0`, `I`, and `l` characters to create confusion effects.

[中文文档](./README.zh-CN.md) | [Demo](https://oi.zli.li/)

## ✨ Features

- 🔐 **Visual Obfuscation** - Convert any text into ciphertext containing only O0Il characters
- 🛡️ **Data Integrity** - CRC32 checksum for data corruption detection (v2 format)
- 🔄 **Format Compatibility** - Backward compatible with legacy format
- 🌍 **Multi-language Support** - Chinese/English interface switching
- 📊 **Real-time Demo** - Visualize encoding and decoding processes
- 🔧 **Simple & Efficient** - Automatic format detection and verification
- 🔧 **Fully Reversible** - 100% lossless restoration with integrity protection
- 🛡️ **Local Processing** - All operations performed locally in browser
- 📱 **Responsive Design** - Support for desktop and mobile devices

## 🎯 Algorithm Principle

The core idea of oi1 algorithm is to leverage visual character similarity:

```
Character Mapping Table:
00 → O (Uppercase O)
01 → 0 (Digit Zero)
10 → I (Uppercase I)
11 → l (Lowercase L)
```

### Encoding Process (v2 format with CRC32)

1. **Text to UTF-8** - Convert input text to byte array
2. **CRC32 Calculation** - Calculate checksum for integrity verification
3. **Binary Conversion** - Transform each byte to 8-bit binary string
4. **Group Mapping** - Map every 2 bits to one O0Il character
5. **Append Checksum** - Add 16-character CRC32 checksum (seamlessly integrated)
6. **Cipher Output** - Generate ciphertext with integrity protection

### Format Comparison

- **v1 format (legacy)**: Pure O0Il cipher - `0OIO0II0`
- **v2 format (current)**: O0Il cipher + CRC32 - `0OIO0II0O0lIO0Il00IlOOI0`

### Example

```
Original: "Hi"
UTF-8: [72, 105]
CRC32: 0x1234ABCD → O0lIO0Il00IlOOI0 (16 chars)
Binary: 01001000 01101001
Groups: 01|00|10|00 01|10|10|01
Mapping: 0|O|I|O 0|I|I|0
Main Cipher: 0OIO0II0
Final (v2): 0OIO0II0 + O0lIO0Il00IlOOI0 = 0OIO0II0O0lIO0Il00IlOOI0
```

## 🚀 Quick Start

### Requirements

- Node.js 16+
- Modern browser (ES6+ support)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build result
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Access Application

Development mode: `http://localhost:3000`

## 📖 Usage Guide

### Basic Usage

1. **Encrypt Text**
   - Enter plain text in the left panel
   - Click "Encrypt" button
   - Copy the generated cipher from right panel

2. **Decrypt Text**
   - Enter cipher text in the right panel
   - System automatically detects format and validates integrity
   - Click "Decrypt" button
   - View decryption result with verification status

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Execute encrypt/decrypt
- `Ctrl/Cmd + K` - Clear current input
- `ESC` - Close help modal

## 🏗️ Project Structure

```
oi1/
├── src/
│   ├── core/
│   │   └── oi1-algorithm.js     # Core encryption algorithm
│   ├── components/
│   │   ├── demo-viewer.js       # Algorithm demonstration component
│   │   └── help-modal.js        # Help modal
│   ├── i18n/
│   │   ├── zh-CN.json          # Chinese language pack
│   │   └── en-US.json          # English language pack
│   ├── utils/
│   │   └── clipboard.js        # Clipboard utilities
│   ├── styles/
│   │   └── main.css            # Main stylesheet
│   └── main.js                 # Application entry
├── index.html                  # HTML template
├── vite.config.js             # Vite configuration
└── package.json               # Project configuration
```

## 🔧 Tech Stack

- **Build Tool**: Vite
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Native CSS + CSS Variables
- **Font**: JetBrains Mono monospace font
- **i18n**: Custom internationalization system
- **Clipboard**: Modern Clipboard API + legacy fallback

## 🎨 Design Features

### Visual Obfuscation Optimization

- Monospace font to enhance character similarity
- Special character spacing adjustments
- Smart line breaking to avoid obvious patterns
- Optimal display in cipher areas

### User Experience

- Real-time input validation
- Character count display
- One-click copy functionality
- Algorithm process visualization
- Responsive interface design

## 🛡️ Security Notice

**Important Notice**: This tool is primarily for visual obfuscation and **does NOT provide cryptographic security**.

### Security Features

- ✅ Local processing, no data upload
- ✅ Offline usage support
- ✅ Open source, auditable code
- ✅ No server dependencies
- ✅ CRC32 integrity verification (v2 format)
- ✅ Automatic corruption detection

### Suitable Scenarios

- Text visual concealment
- Educational demonstrations
- Fun encoding exercises
- Prototype development

### Unsuitable Scenarios

- Sensitive data encryption
- Secure communications
- Password protection
- Business secrets

## 🌐 Browser Compatibility

- Chrome 80+
- Firefox 74+
- Safari 13.1+
- Edge 80+

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### Development Workflow

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Code Standards

- Use ES6+ syntax
- Follow functional programming principles
- Add appropriate comments
- Keep code clean and simple

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details