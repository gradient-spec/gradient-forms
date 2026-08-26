# ADR 001: Domain-Driven Modular Layout & Decoupled Services

## Status
Accepted

## Context
As Gradient Forms scaled to include 20+ question types, 3D visual rendering, real-time analytics, logic rules, and Google integrations, maintaining all state inside monolithic UI components created maintainability risks and tight coupling.

## Decision
We adopted a **Domain-Driven Modular Architecture**:
- UI components, domain logic, and state handlers are isolated into domain packages (`forms/`, `responses/`, `analytics/`, `integrations/`, `auth/`).
- The API interactions are encapsulated inside a typed `ApiClient` service layer with automatic fallback logic to local persistence.

## Consequences
- Highly testable domain modules.
- Clear separation between UI rendering and business logic.
- Frictionless onboarding for new engineering contributors.
