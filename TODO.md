# 📋 Gradient Forms — Architecture & Implementation Task Tracker

This document provides a clean **Frontend vs. Backend** segregation of all codebase files, their individual responsibilities/functions, and upcoming implementation tasks.

---

## 🎨 FRONTEND ARCHITECTURE (`src/`)

### 1. Form Builder & Canvas (`src/components/builder/`)
*Core visual editor, questions palette, drag-and-drop canvas, and configuration modal.*
- **[`FormBuilder.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/FormBuilder.tsx)**: Main builder workspace container, header bar, and tab switching.
- **[`FormCanvas.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/FormCanvas.tsx)**: Drag-and-drop sortable question canvas, form title, description, and multi-section manager.
- **[`QuestionCard.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/QuestionCard.tsx)**: Interactive card for each question type with title, options, and actions.
- **[`QuestionPalette.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/QuestionPalette.tsx)**: Sidebar list of all 19 supported question types.
- **[`QuestionProperties.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/QuestionProperties.tsx)**: Right inspector drawer for validations, quiz points, and max selections.
- **[`FormSettingsModal.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/FormSettingsModal.tsx)**: Response limits, email collection, response deadlines (expiry), and consent agreements.
- **[`LogicBuilder.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/LogicBuilder.tsx)**: Conditional question branching and skip logic rule builder.
- **[`GoogleFormsFloatingToolbar.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/GoogleFormsFloatingToolbar.tsx)**: Quick action toolbar docked beside active question.
- **[`ImportQuestionsModal.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/ImportQuestionsModal.tsx)**: Bulk question importer from CSV or existing forms.
- **[`MediaAttachmentModal.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/MediaAttachmentModal.tsx)**: Image and YouTube/video modal.
- **[`ThemeCustomizer.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/ThemeCustomizer.tsx)**: Color palettes, card styling, and typography selection.
- **[`CommentDrawer.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/builder/CommentDrawer.tsx)**: Collaborative comments thread per question.

### 2. Analytics & Reporting Intelligence (`src/components/analytics/`)
*3-tier Google Forms-style analytics with specialized type intelligence.*
- **[`AnalyticsView.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/AnalyticsView.tsx)**: Main analytics view router with tab management.
- **[`AnalyticsHeader.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/AnalyticsHeader.tsx)**: Top bar with response count, completion rates, and export triggers.
- **[`AnalyticsTabs.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/AnalyticsTabs.tsx)**: Tab switcher (`Overview`, `Questions`, `Respondents`).
- **[`OverviewTab.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/OverviewTab.tsx)**: Universal KPIs, key insights callouts, and submission velocity trends.
- **[`ByQuestionTab.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/ByQuestionTab.tsx)**: Question-by-question breakdown with progressive disclosure.
- **[`ByRespondentTab.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/ByRespondentTab.tsx)**: Individual submission browser and response answers.
- **[`questionCards/`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/analytics/questionCards)**: 13 specialized visual analytics cards:
  - `MultipleChoiceAnalyticsCard.tsx`, `DropdownAnalyticsCard.tsx`, `CheckboxesAnalyticsCard.tsx`, `ScaleAnalyticsCard.tsx`, `RatingAnalyticsCard.tsx`, `GridAnalyticsCard.tsx`, `TextAnalyticsCard.tsx`, `NumericAnalyticsCard.tsx`, `DateAnalyticsCard.tsx`, `TimeAnalyticsCard.tsx`, `FileUploadAnalyticsCard.tsx`, `IdentityAnalyticsCard.tsx`, `ConsentAnalyticsCard.tsx`.

### 3. Respondent & Form Rendering (`src/components/published/`, `src/components/preview/`)
*Public-facing form viewer and live previewer.*
- **[`PublishedFormView.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/published/PublishedFormView.tsx)**: Public form respondent experience with multi-page navigation, quiz scoring, agreement validation, and expired deadline blocker.
- **[`FormPreviewModal.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/preview/FormPreviewModal.tsx)**: Responsive device simulator (Desktop, Tablet, Mobile) for creators.

### 4. Dashboard & Management (`src/components/dashboard/`, `src/components/layout/`, `src/components/settings/`)
*Admin dashboard, templates gallery, and settings.*
- **[`DashboardView.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/dashboard/DashboardView.tsx)**: Form grid, search, filters, and KPI summary.
- **[`FormCard.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/dashboard/FormCard.tsx)**: Individual form card with status badge (`OPEN`, `EXPIRED`, `CLOSED`, `DRAFT`), response count, and 3-dots menu.
- **[`CreateFormModal.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/dashboard/CreateFormModal.tsx)**: Blank form and AI generation wizard.
- **[`Header.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/layout/Header.tsx)**: Top navigation, workspace selector, and Admin profile avatar trigger.
- **[`Sidebar.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/layout/Sidebar.tsx)**: Primary navigation rail.
- **[`SettingsView.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/components/settings/SettingsView.tsx)**: Single-admin control panel (Profile, Workspace, Security).

### 5. Services, State & Utilities (`src/context/`, `src/services/`, `src/utils/`, `src/types/`)
*Application store, analytics engine, and type definitions.*
- **[`AppContext.tsx`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/context/AppContext.tsx)**: Central React context store, local persistence, defaults sanitizer, and response dispatch.
- **[`analyticsEngine.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/utils/analyticsEngine.ts)**: Frequency calculators, 2D matrix heatmaps, checkbox combinations, and key insight algorithms.
- **[`formStatus.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/utils/formStatus.ts)**: Effective status resolution (`CLOSED` > `DRAFT` > `EXPIRED` > `OPEN`), deadline computations, and validation.
- **[`googleSheetsService.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/services/googleSheetsService.ts)**: Real-time Google Sheets sync, URL parser, and webhook dispatch.
- **[`apiClient.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/services/apiClient.ts)**: Axios/Fetch API wrapper for backend endpoints.
- **[`index.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/types/index.ts)**: Core TypeScript interfaces (`Form`, `Question`, `FormSettings`, `FormResponse`, `EffectiveFormStatus`).

### 6. Frontend Test Suites (`src/tests/`)
*601 Vitest unit tests covering all components and algorithms.*
- **[`analyticsEngine.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/analyticsEngine.test.ts)**: Analytics stats, insights, and heatmaps.
- **[`formExpiry.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/formExpiry.test.ts)**: Expiry precedence, formatting, and date validation.
- **[`builderInputState.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/builderInputState.test.ts)**: Input deletion, empty string preservation, and backspace sync.
- **[`googleSheetsIntegration.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/googleSheetsIntegration.test.ts)**: Google Sheets live viewer and webhook sync.
- **[`multiSectionEngine.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/multiSectionEngine.test.ts)**: Multi-page section transitions and validation.
- **[`toggableAgreement.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/toggableAgreement.test.ts)**: Consent checkbox enforcement.
- **[`otherOptionFeature.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/otherOptionFeature.test.ts)**: Custom 'Other' answer capture.
- **[`adminProfile.test.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/src/tests/adminProfile.test.ts)**: Single-admin profile updates.

---

## ⚙️ BACKEND ARCHITECTURE (`server/` & `prisma/`)

### 1. REST API Server & Middlewares (`server/`)
*Node.js / Express REST API with security and validation.*
- **[`server/index.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/server/index.ts)**:
  - `GET /api/v1/forms`: Form listing with response counts.
  - `POST /api/v1/forms`: Create new form with settings.
  - `GET /api/v1/forms/:id`: Get form detail with effective status calculation.
  - `PATCH /api/v1/forms/:id`: Update form settings, response deadlines, and status.
  - `POST /api/v1/forms/:id/responses`: Rate-limited submission endpoint enforcing deadline (`FORM_EXPIRED`) and closed (`FORM_CLOSED`) protection.
  - `GET /api/v1/forms/:id/responses`: List responses for analytics.
  - `GET /api/v1/forms/:id/export.csv`: Live CSV endpoint for Google Sheets `=IMPORTDATA()` formula.
  - `POST /api/v1/forms/:id/integrations/google-sheets`: Connect Google Sheets sync.
  - `GET /api/v1/health/db`: Database connection health probe.

### 2. Database Schema & ORM (`prisma/`)
*PostgreSQL schema and client generation.*
- **[`prisma/schema.prisma`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/prisma/schema.prisma)**: Prisma models (`User`, `Workspace`, `Form`, `FormSection`, `Question`, `QuestionOption`, `FormResponse`, `ResponseAnswer`, `FormVersion`, `AuditLog`).
- **[`prisma/seed.ts`](file:///d:/DESKTOP/Desktop/HACKATHONS/GRADIENT%20FORMS/prisma/seed.ts)**: Database seeder with sample forms and responses.

---

## 🚀 UPCOMING TASKS & ROADMAP

### Frontend Tasks
- [ ] **Task 1**: [Describe Frontend Feature]
- [ ] **Task 2**: [Describe UI / Component Enhancement]

### Backend Tasks
- [ ] **Live Database Connection**: Configure PostgreSQL credentials (Neon / Supabase / Railway).
- [ ] **Argon2id Authentication**: User registration, login, and JWT HTTP-only cookie sessions.
- [ ] **Third-party Webhooks**: Discord, Slack, and Zapier payload dispatch on new response.
