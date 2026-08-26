# ⚡ Gradient Forms — Next-Gen Form Builder & OS Control Center

> **Ideas ARE Automated.** A state-of-the-art, high-performance web form builder, analytics engine, and response management platform crafted with modern glassmorphic aesthetics, 3D interactive UI, real-time data sync, and advanced form logic evaluation.

---

## ✨ Features at a Glance

- **🎨 3D Glassmorphic Interactive UI**: Built with dynamic parallax hero scenes, micro-animations, custom dark mode design system, and responsive layout primitives.
- **⚡ Advanced Form Builder**:
  - Drag-and-drop / manual reordering with Move Up / Move Down controls.
  - Interactive Question Type Switcher supporting 20+ input formats (Short Answer, Paragraph, Multiple Choice, Checkboxes, Dropdown, Rating, Scale, File Upload, Date, Time, Signature, Consent, Matrix).
  - Dynamic Option Selection Limits (`Select Only 1 Option`, `Select Only 2 Options`, etc., strictly enforced).
  - Keyboard navigation shortcuts (<kbd>Enter</kbd> to add and focus new options/questions).
- **📊 Analytics OS Control Center**:
  - Real-time submission velocity tracking, average completion time gauges, and daily influx area charts.
  - Dynamic question answer breakdown bar charts computing real-time response distributions.
- **📈 Responses Dashboard & Data Export**:
  - Detailed response inspector modal, search filters, and delete capabilities.
  - Export collected responses to standard **CSV** or **JSON** formats.
- **🔀 Branching Logic & Quiz Scoring Engine**:
  - Conditional show/hide logic evaluator based on respondent answers.
  - Automated quiz mode grade calculator with instant feedback and score reporting.
- **🔗 Unique Share Links & Scannable QR Codes**:
  - Generates unique public URLs (`#/f/:formId`) for published forms.
  - Generates real, 100% scannable 256x256 QR Code PNGs dynamically on HTML5 Canvas.
- **🧪 500+ Automated Vitest Test Suite**: Comprehensive testing coverage for logic evaluation, field validation, quiz scoring, URL routing, and form filtering.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Recharts
- **Backend API**: Express.js REST Server (running on `http://localhost:4000`), Prisma ORM, PostgreSQL (with graceful in-memory data fallback proxy)
- **Testing**: Vitest (`510 / 510 tests passing`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aryanpandeyspec-cyber/GRADIENT_FORMS.git
   cd GRADIENT_FORMS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Start the Vite development frontend server:
   ```bash
   npm run dev
   ```
   *Frontend running on `http://localhost:5173/` (accessible on local network IP via `--host`).*

2. Start the Express REST API backend server (optional):
   ```bash
   npx tsx server/index.ts
   ```
   *Backend running on `http://localhost:4000/`.*

---

## 🧪 Testing & Verification

Run the comprehensive 510-point unit test suite:
```bash
npm run test
```

Run TypeScript strict type checking:
```bash
npx tsc --noEmit
```

Build the production bundle:
```bash
npm run build
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
