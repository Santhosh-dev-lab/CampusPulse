# CampusPulse API Conventions & Specification

CampusPulse adopts a standardized, envelope-based JSON API response format across all Route Handlers.

---

## 1. Response Envelope Format

### Successful Response (HTTP 200 / 201)

```json
{
  "success": true,
  "data": {
    "id": "evt_clx12345",
    "title": "HackSRM 2026"
  },
  "meta": {
    "timestamp": "2026-10-24T09:00:00.000Z"
  }
}
```

### Error Response (HTTP 4xx / 5xx)

```json
{
  "success": false,
  "error": {
    "code": "EVENT_FULL",
    "message": "This event has reached maximum seating capacity.",
    "details": null
  },
  "meta": {
    "timestamp": "2026-10-24T09:00:00.000Z"
  }
}
```

---

## 2. Standard Error Codes Matrix

| HTTP Status         | Error Code               | Description                                                                  |
| :------------------ | :----------------------- | :--------------------------------------------------------------------------- |
| `401 Unauthorized`  | `UNAUTHENTICATED`        | User session is missing or expired                                           |
| `403 Forbidden`     | `FORBIDDEN`              | Caller lacks the necessary role (e.g., student calling admin endpoints)      |
| `404 Not Found`     | `NOT_FOUND`              | Requested entity does not exist                                              |
| `422 Unprocessable` | `VALIDATION_ERROR`       | Schema validation failed; `details` array contains field-specific violations |
| `409 Conflict`      | `DUPLICATE_REGISTRATION` | Student already has an active registration for this event                    |
| `409 Conflict`      | `EVENT_FULL`             | Event capacity has been fully claimed                                        |
| `400 Bad Request`   | `EVENT_NOT_PUBLISHED`    | Cannot register for an event that is still in draft or pending review        |
| `409 Conflict`      | `VENUE_CONFLICT`         | Venue already booked by another active event in this time interval           |
| `400 Bad Request`   | `INVALID_TICKET`         | Ticket token is not recognized, malformed, or cancelled                      |
| `409 Conflict`      | `DUPLICATE_CHECKIN`      | Ticket has already been checked in at an entry gate                          |
| `500 Server Error`  | `INTERNAL_SERVER_ERROR`  | Unexpected server failure; internal stack traces are redacted                |

---

## 3. Core System Endpoints

### `GET /api/health`

Checks process liveness without disclosing credentials or internal details.

- **Status**: `200 OK`
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-24T09:00:00.000Z",
    "uptime": 142.5,
    "service": "campuspulse-api",
    "version": "0.1.0"
  }
  ```

### `GET /api/readiness`

Verifies critical infrastructure dependencies (including PostgreSQL database connectivity).

- **Status**: `200 OK` (when dependencies are healthy) or `503 Service Unavailable`
- **Response**:
  ```json
  {
    "status": "ready",
    "checks": {
      "database": "ok"
    },
    "timestamp": "2026-10-24T09:00:00.000Z"
  }
  ```
