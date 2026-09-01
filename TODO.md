# 📋 Gradient Forms — Implementation TODO & Task Roadmap

This document tracks all completed features, upcoming implementation tasks, design enhancements, and long-term backlog items for **Gradient Forms**.

---

## 🚀 Priority In-Progress / Next Up

- [ ] **Task Name Here** — Brief description of the task, requirements, and target files.

---

## 🎯 Proposed Features & Enhancements

### 1. Form Builder & Respondent Experience
- [ ] Add more preset themes & custom font pickers
- [ ] Conditional logic branching improvements
- [ ] Rich text formatting in question descriptions & headers

### 2. Analytics & Reporting
- [ ] PDF export for complete Analytics Overview summary
- [ ] Individual respondent response print & PDF export
- [ ] Filter responses by date range, section, or quiz score tier

### 3. Backend & Integrations
- [ ] Connect live PostgreSQL database instance (Neon / Supabase / Railway)
- [ ] Phase 2 Authentication with Argon2id + HTTP-only JWT sessions
- [ ] Webhook payloads for Discord / Slack / Zapier

---

## ✅ Completed Features (Archive)

- [x] **Google Forms-Class Analytics Architecture**: Overview, By-Question (13 specialized cards with `[ Explore ]` disclosure), and By-Respondent tabs with matrix heatmaps and key insights.
- [x] **Form Expiry & Response Deadlines**: Canonical timestamps, progressive disclosure date/time pickers, server/client submission rejection, expired badges, and custom expiry messages.
- [x] **Text Input Deletion & Synchronization Fix**: Fully resolved backspace/delete sticking and empty string preservation across Form Title, Description, Question Titles, Options, and Section inputs.
- [x] **Single-Admin Profile & Workspace Settings**: Clean 3-card control panel (Profile, Workspace, Security) with dedicated edit modal and session status.
- [x] **Toggable Agreement & Consent Checkbox**: Optional data processing and terms checkbox with custom statement text and quick presets.
- [x] **'Other' Custom Answer Option**: Radio, Checkbox, and Dropdown question types with dedicated respondent text inputs.
- [x] **Real-Time Google Sheets Integration**: Live CSV feed (`=IMPORTDATA()`), instant Google Sheet URL sync (`Ctrl+V`), and automatic webhook dispatch.
- [x] **601 / 601 Vitest Unit Tests**: Green across all 13 test suites with 0 TypeScript/build errors.

---

## 📝 How to Add New Tasks
To add a new task, simply append an item under the appropriate category:
```markdown
- [ ] **[Feature Name]**: Description of what needs to be done.
```
