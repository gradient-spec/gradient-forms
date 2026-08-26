# REST API Specification — GRADIENT FORMS (v1)

Base URL: `http://localhost:4000/api/v1`

---

## 1. Healthcheck

### `GET /health`
Returns server operational health and data store metrics.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-15T06:59:00Z",
  "service": "Gradient Forms REST API Server",
  "formsCount": 3
}
```

---

## 2. Forms Management

### `GET /forms`
List forms with pagination and search filtering.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)

**Response `200 OK`**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### `POST /forms`
Create a new form draft.

**Headers**: `Content-Type: application/json`

**Body Payload Schema (Zod Validated)**:
```json
{
  "title": "CS304 Course Feedback",
  "description": "Lab evaluation form",
  "settings": {
    "collectEmail": true,
    "quizMode": false
  }
}
```

---

## 3. Responses & Submissions

### `POST /forms/:id/responses`
Submit a form response. Protected by IP Rate Limiting middleware (`20 req / min`).

**Body Payload**:
```json
{
  "formId": "form-cs-feedback",
  "respondentEmail": "jordan@university.edu",
  "answers": {
    "q-1": "Option A"
  },
  "timeSpentSeconds": 120
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Thank you for your feedback! Your evaluation score has been recorded.",
  "data": { ... }
}
```

---

## 4. Error Responses

Standardized error payload returned by `errorHandler.ts`:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request payload failed validation check",
    "details": {
      "title": ["Form title is required"]
    }
  }
}
```
