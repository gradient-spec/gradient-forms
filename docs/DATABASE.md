# Database Schema & Relational Integrity — GRADIENT FORMS

Gradient Forms uses **PostgreSQL** as its primary relational database engine, interfaced via **Prisma ORM**.

---

## 1. Entity-Relationship Summary

- `User` (1) ── (N) `WorkspaceMember` (N) ── (1) `Workspace`
- `Workspace` (1) ── (N) `Form`
- `Form` (1) ── (N) `FormSection` ── (N) `Question` ── (N) `QuestionOption`
- `Form` (1) ── (N) `LogicRule`
- `Form` (1) ── (N) `FormResponse` ── (N) `ResponseAnswer`
- `Form` (1) ── (N) `FormVersion`
- `Form` (1) ── (N) `Comment`

---

## 2. Indexing Strategy

Indexes are applied to frequently queried foreign keys and filter fields to guarantee `O(log N)` query performance:

1. **`User(email)`**: Unique index for fast authentication lookups.
2. **`WorkspaceMember(workspaceId, userId)`**: Composite unique index preventing duplicate memberships.
3. **`Form(workspaceId, status)`**: Composite index for filtering published vs draft forms inside workspace dashboards.
4. **`Question(formId, orderIndex)`**: Composite index for retrieving ordered canvas questions.
5. **`FormResponse(formId, submittedAt)`**: Composite index for fast timeline response pagination and Recharts trend analytics.
