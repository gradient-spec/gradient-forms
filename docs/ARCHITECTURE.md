# System Architecture & Technical Specification — GRADIENT FORMS

## 1. System Topology

Gradient Forms is structured around a decoupled, domain-driven architecture:

```
[ Respondent Browser ] ──▶ [ Public Answering Engine ] ──┐
                                                         ├──▶ [ Typed ApiClient ] ──▶ [ Express REST API ] ──▶ [ Prisma ORM ] ──▶ [ PostgreSQL ]
[ Workspace User ]     ──▶ [ 3-Column Form Builder OS ] ──┘
```

## 2. Core Subsystems

### 2.1 3-Column Drag-and-Drop Form Builder OS
- **Palette Component Catalog**: Exposes 20+ question types categorized into Basic, Advanced, and Special Compliance fields.
- **Sortable Form Canvas**: Managed by `@dnd-kit/sortable` with custom pointer sensors and keyboard accessibility handles.
- **Inspector Drawer**: Live property reflection (validation, placeholder, tooltip, scale limits, quiz points).

### 2.2 3D Visual Rendering System
- Built on **React Three Fiber (R3F)** and Three.js.
- Includes procedural particle buffers, translucent mesh physical materials (`transmission`, `roughness`, `clearcoat`), and orbiting float controls.
- **WebGL Fallback Pipeline**: CSS radial mesh gradients render automatically if WebGL context is lost or unsupported.

### 2.3 Visual Conditional Logic Engine
- Declarative rules evaluated at runtime during form answering.
- Evaluates `sourceQuestionId`, `operator` (`equals`, `contains`), and `action` (`show`, `hide`).

---

## 3. Resilient Data Pipeline

Gradient Forms incorporates a dual-mode persistence architecture:
1. **Primary**: REST API Server (`/api/v1`) with Zod request validation and PostgreSQL database.
2. **Fallback**: LocalStorage + In-Memory Provider Engine. If network requests fail or backend server is offline, the client seamlessly switches to LocalStorage without breaking user state.

---

## 4. Phase 1 Schema & Database Architecture Justification

The Prisma PostgreSQL schema (`prisma/schema.prisma`) encompasses 15 entity models supporting full-stack features:

1. **`Integration` Model**: Encapsulates workspace integration credentials (Google Sheets OAuth, Webhook endpoints) with a JSON config payload, preventing hardcoded workspace settings.
2. **`Notification` Model**: Supports user alert feeds for submission milestones and system updates.
3. **`Subscription` Model**: Links workspace billing plans (`pro`, `enterprise`) to Stripe customer IDs for subscription entitlement.
4. **Soft-Deletion Strategy (`deletedAt DateTime?`)**: Added to `Form` and `Workspace` entities to enable soft-deletion and trash recovery without cascading data loss.
5. **UUID Canonical Identity**: All database entities use standard UUID strings (`@default(uuid())`) to guarantee global entity uniqueness across workspaces.
