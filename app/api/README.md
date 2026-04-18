# API Documentation

This document provides a detailed overview of all public API endpoints available under the `app/api` directory of the **PlaceCom** website. Each endpoint description includes:

- **Purpose** – what the endpoint does.
- **HTTP Method(s)** – supported methods (GET, POST, etc.).
- **URL Path** – relative to the base URL.
- **Request Parameters** – query string, URL parameters, or JSON body fields.
- **Response Format** – JSON schema for successful and error responses.
- **Notes** – special behaviours, authentication, rate‑limits, etc.

---

## Health Check

- **Path:** `/api/health`
- **Method:** `GET`
- **Purpose:** Simple health endpoint used by monitoring tools to verify the service is up.
- **Request:** No parameters.
- **Response (200):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-04-06T22:57:50.000Z"
  }
  ```
- **Notes:** No authentication required.

---

## Gmail Abstraction Layer

### Send Email
- **Path:** `/api/gmail/send`
- **Method:** `POST`
- **Purpose:** Send an email via the internal Gmail wrapper.
- **Authentication:** Requires an API key (`key`) matching `process.env.API_KEY_WEB_EXTENSION` or `process.env.API_KEY_FRONTEND`.
- **Request Body (JSON):**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `to` | string | Yes | Recipient email address. |
  | `subject` | string | Yes | Email subject line. |
  | `html` | string | Yes | HTML content of the email. |
  | `fromAlias` | string | No | Optional sender alias. |
  | `key` | string | Yes | API key for authorization. |
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Email sent successfully via Gmail abstraction layer.",
    "details": { /* mailer library result */ }
  }
  ```
- **Error Responses:**
  - `400` – Invalid JSON or missing required fields.
  - `401` – Unauthorized (invalid API key).
  - `500` – Internal server error.

### Health Check for Gmail API
- **Path:** `/api/gmail/send`
- **Method:** `GET`
- **Purpose:** Verify the Gmail endpoint is reachable.
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Gmail Abstraction API Running. Send POST request with key, to, subject, and html payload."
  }
  ```

---

## Duperset – External Opportunities

### List Active Opportunities
- **Path:** `/api/duperset/external-opportunities`
- **Method:** `GET`
- **Purpose:** Retrieve a sorted list of currently active external opportunities.
- **Response (200):**
  ```json
  {
    "success": true,
    "opportunities": [
      {
        "id": 1,
        "title": "...",
        "deadline": "2026-05-01",
        "isRolling": false,
        "created_at": "2026-04-01T12:00:00Z"
        /* other fields defined in `Opportunity` type */
      }
    ]
  }
  ```
- **Error (500):** Generic error message.

### Submit a New Opportunity
- **Path:** `/api/duperset/external-opportunities`
- **Method:** `POST`
- **Purpose:** Create a new external opportunity entry.
- **Request:** `multipart/form-data` (supports file upload for JD).
  - **Required Fields:**
    - `submitter_email` (string)
  - **Optional Fields:** `title`, `recruiting_body`, `deadline`, `jd_link`, `isRolling` ("true"/"false"), `role`, `category`, `compensation`, `duration`, `eligibility`, `skills` (JSON array or comma‑separated), `apply_url`, `placecom_notes`, `job_description`, `eligibility_restrictions`, `apply_method`, plus work‑arrangement related fields.
  - **File Field:** `jd_file` (PDF/Doc) – uploaded to Supabase bucket `opportunity-jds`.
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Opportunity submitted successfully.",
    "opportunity": { /* newly created opportunity object */ }
  }
  ```
- **Error Responses:** `400` for validation errors, `500` for server errors.

---

## Duperset – Major/Minor Change Workflow

### Archive Retrieval
- **Path:** `/api/duperset/major-minor-change/archives`
- **Method:** `POST`
- **Purpose:** Retrieve archived major/minor change requests for a student.
- **Request Body (JSON):** `{ "email": "student@example.com" }`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "raised_at": "2026-03-20T10:00:00Z",
        "modified_at": "2026-03-22T15:30:00Z",
        "modified_by": "poc@example.com",
        "status": "approved"
      }
    ]
  }
  ```
- **Error Responses:** `400` (missing email), `404` (email not found), `500`.
- **GET:** Simple health check returning a message.

### Create Request
- **Path:** `/api/duperset/major-minor-change/create`
- **Method:** `POST`
- **Purpose:** Submit a new major/minor change request.
- **Request Body (JSON):**
  ```json
  {
    "studentId": 123,
    "email": "student@example.com",
    "currentMajor": "Computer Science",
    "currentMinor": "Math",
    "prospectiveMajor": "Data Science",
    "prospectiveMinor": "Statistics"
  }
  ```
  - At least one of `currentMajor`, `currentMinor`, `prospectiveMajor`, `prospectiveMinor` must be provided.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Major/Minor change request submitted successfully.",
    "requestId": 456
  }
  ```
- **Error Responses:** `400` (validation), `404` (student not found), `409` (pending request exists or count exhausted), `500`.
- **GET:** Health endpoint.

### Modify Request (Approve / Reject)
- **Path:** `/api/duperset/major-minor-change/modify`
- **Method:** `POST`
- **Purpose:** Leadership POC approves or rejects a pending request.
- **Request Body (JSON):**
  ```json
  {
    "requestId": 456,
    "method": "approved",   // or "rejected"
    "pocNote": "Approved after review",
    "pocId": 12
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Major/Minor Change Request approved successfully.",
    "requestId": 456,
    "method": "approved"
  }
  ```
- **Error Responses:** `400` (missing/invalid fields), `404` (POC or request not found), `409` (request not pending), `500`.
- **GET:** Health endpoint.

### Request Status
- **Path:** `/api/duperset/major-minor-change/status`
- **Method:** `POST`
- **Purpose:** Retrieve the latest pending request status for a student (if within 7 days).
- **Request Body (JSON):** `{ "email": "student@example.com" }`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "raised_at": "2026-04-01T09:00:00Z",
      "modified_at": null,
      "modified_by": null,
      "status": "pending"
    }
  }
  ```
  - If no recent request, `data` will be `null`.
- **Error Responses:** `400`, `404`, `500`.
- **GET:** Simple health message.

---

## Duperset – OTP Workflow

### Generate OTP
- **Path:** `/api/duperset/otp/generate`
- **Method:** `POST`
- **Purpose:** Generate a one‑time password for a student and email it.
- **Request Body (JSON):** `{ "email": "student@example.com" }`
  - Only the whitelisted email (`soham.tulsyan_ug2023@ashoka.edu.in`) is allowed in the current implementation.
- **Success Response (200):**
  ```json
  { "success": true, "message": "OTP sent successfully." }
  ```
- **Error Responses:** `400` (missing/invalid email), `404` (email not found), `409` (pending request), `500`.
- **GET:** Health endpoint.

### Verify OTP
- **Path:** `/api/duperset/otp/verify`
- **Method:** `POST`
- **Purpose:** Verify a previously generated OTP.
- **Request Body (JSON):**
  ```json
  { "email": "student@example.com", "otp": "1234" }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully.",
    "studentId": 123
  }
  ```
- **Error Responses:** `400` (missing fields), `401/403` (invalid OTP), `500`.
- **GET:** Health endpoint.

---

## Internal Libraries (Not Public Endpoints)

The `_lib` directory contains utility modules used by the API routes:
- `cors.ts` – CORS middleware configuration.
- `mailer.ts` – Wrapper around Gmail API for sending templated emails.
- `verifyOtp.ts` – Logic for OTP verification against Supabase.
- `withAuth.ts` – Higher‑order function to enforce authentication on protected routes.

These files are **not** exposed as HTTP endpoints but are imported by the route handlers above.

---

# Contributing

When adding new API routes, follow these conventions:
1. Export `GET`, `POST`, etc. as async functions returning `NextResponse.json`.
2. Validate input early and return `400` with a clear message.
3. Log errors with a consistent prefix (`[POST /api/... ]`).
4. Document the new endpoint in this README under an appropriate section.
5. Run `npm run dev` and test the endpoint with tools like `curl` or Postman.

---

*Generated on 2026‑04‑06 by Antigravity.*
