# ADR 002: Role-Based Access Control (RBAC) & Rate-Limiting Protection

## Status
Accepted

## Context
Published forms are public endpoints susceptible to spam, automated submissions, and malicious payload spikes. Simultaneously, team collaboration requires granular role-based permissions (`OWNER`, `EDITOR`, `VIEWER`).

## Decision
1. **Public Response Security**: Public submission endpoints are protected by IP rate-limiting middleware (`rateLimiter(20, 60000)`) enforcing a maximum of 20 requests per minute per IP.
2. **Role-Based Access Control (RBAC)**: Workspace access is enforced at the membership level (`OWNER` can manage billing & delete workspace; `EDITOR` can build and edit forms; `VIEWER` can view responses & analytics).

## Consequences
- Guaranteed API protection against public automated spam.
- Enforced security boundaries across team collaboration.
