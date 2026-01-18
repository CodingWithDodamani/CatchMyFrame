# 🎬 Catch My Frame

<div align="center">

![Catch My Frame Banner](assets/og-banner.png)

[![Version](https://img.shields.io/badge/v1.0.1-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQgOFY1LjVBMS41IDEuNSAwIDAxNS41IDRIOCI2IHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE2IDRoMi41QTEuNSAxLjUgMCAwMTIwIDUuNVY4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMCAxNnYyLjVhMS41IDEuNSAwIDAxLTEuNSAxLjVIMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTggMjBINS41QTEuNSAxLjUgMCAwMTQgMTguNVYxNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI1IiBmaWxsPSIjNjM2NmYxIi8+PHBhdGggZD0iTTEwLjUgOS41TDE1IDEyTDEwLjUgMTQuNVY5LjVaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==&label=Catch%20My%20Frame)](https://github.com/CodingWithDodamani/CatchMyFrame)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A professional browser-based tool for extracting high-quality frames from any video source.**

[Live Demo](#) • [Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 **Precision Capture**
- **Frame-by-frame navigation** with millisecond accuracy
- **Lossless PNG export** or high-quality JPEG
- **4K+ resolution support** - preserves original quality
- **DPI injection** for print-ready images

### 🤖 **Smart Automation**
- **AI Scene Detection** - Powered by Google Gemini AI
- **Pixel-difference detection** - Automatically capture scene changes
- **Interval capture** - Set custom FPS for batch extraction
- **Time-range capture** - Define start/end points

### 🎨 **Built-in Editor**
- Brightness, contrast, and saturation controls
- Sharpening filters (Low/Medium/High)
- Real-time preview before export
- Batch editing for all captured frames

### 📦 **Flexible Export**
- Individual frame download (PNG/JPEG)
- Bulk export as ZIP archive
- PDF document generation
- Custom filename formats

### 🔒 **Privacy First**
- **100% client-side processing** - Videos never leave your device
- Works offline with local files
- No data uploaded to servers
- No account required

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ recommended
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/catch-my-frame.git
cd catch-my-frame

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Gemini API key (optional, for AI features)

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required for AI Scene Detection feature
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** The AI Scene Detection feature requires a [Google AI Studio](https://ai.google.dev/) API key. All other features work without an API key.

---

## 📖 Documentation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` / `K` | Play/Pause video |
| `←` / `→` | Seek 5 seconds |
| `,` / `.` | Frame step backward/forward |
| `C` / `Enter` | Capture current frame |

### Supported Video Sources

- **Local files:** MP4, WebM, MOV, M4V
- **YouTube URLs:** Direct links, shorts, embeds
- **Screen capture:** Record browser tabs (Chrome/Edge)

### Auto-Capture Modes

| Mode | Description |
|------|-------------|
| **Interval** | Capture at fixed FPS (1-60) |
| **Time Range** | Capture within start/end boundaries |
| **Pixel Detect** | Capture on scene changes |
| **AI Detect** | Gemini-powered smart detection |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI:** Google Gemini API
- **Export:** JSZip, FileSaver

---

## 📁 Project Structure

```
catch-my-frame/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── sections/       # Page sections (Features, Pricing, etc.)
│   ├── context/        # React contexts (Theme, Toast)
│   └── icons.tsx       # Custom SVG icons
├── index.css           # Global styles & theme
├── App.tsx             # Main application router
├── types.ts            # TypeScript definitions
└── utils.ts            # Utility functions
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Hallu Dodamani**

- GitHub: [@halludodamani](https://github.com/halludodamani)

---

<div align="center">

Made with ❤️ by Hallu Dodamani

⭐ Star this repo if you find it useful!

</div>
