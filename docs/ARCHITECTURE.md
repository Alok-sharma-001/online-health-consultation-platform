# System Architecture & Technical Design Document (TDD)
## Project 12: Online Health Consultation Platform

---

## 1. System Overview
The **Online Health Consultation Platform** is engineered following the **Model-View-Controller (MVC)** and **Layered Architecture** paradigms. The client application is decoupled from the backend API server, communicating strictly via RESTful JSON over HTTPS.

```mermaid
graph TD
    subgraph Client [Client Application - React SPA]
        AdminUI[Admin Dashboard]
        DoctorUI[Doctor Portal]
        PatientUI[Patient Portal]
        AuthUI[Auth & Role Switcher]
    end

    subgraph Server [Backend Engine - Node.js / Express]
        Router[Express Router]
        AuthGuard[JWT & RBAC Middleware]
        
        subgraph Controllers
            AC[Admin Controller]
            DC[Doctor Controller]
            PC[Patient Controller]
            MC[Message Controller]
            AuthC[Auth Controller]
        end
        
        subgraph Services [Data Access Layer]
            DB[(SQLite Database)]
        end
    end

    AdminUI -->|REST API Requests| Router
    DoctorUI -->|REST API Requests| Router
    PatientUI -->|REST API Requests| Router
    AuthUI -->|REST API Requests| Router

    Router --> AuthGuard
    AuthGuard --> Controllers
    Controllers --> DB
```

---

## 2. Component Layers

### 2.1 Presentation Layer (Frontend)
* Built with **React 18** and **Vite** for rapid bundling and HMR.
* **Tailwind CSS** provides utility-based styling with design tokens optimized for healthcare workflows (calm blues, emerald greens, and high contrast status badges).
* **React Router v6** manages route transitions with client-side RBAC wrappers (`<ProtectedRoute allowedRoles={['ADMIN']} />`).
* Dynamic state management via React Context (`AuthContext`, `NotificationContext`).

### 2.2 API & Middleware Layer (Backend)
* **Express.js** provides REST route definition.
* **CORS** middleware enables secure cross-origin resource sharing.
* **JWT Authentication Middleware (`verifyToken`)**: Decodes and verifies token signatures from the `Authorization: Bearer <token>` header.
* **Role Guard Middleware (`requireRole(['ADMIN', ...])`)**: Intercepts requests and enforces authorization before controller execution.

### 2.3 Persistence Layer (Database)
* **SQLite** managed using `better-sqlite3` for synchronous, low-latency, zero-overhead database transactions.
* Foreign key constraints enforced (`PRAGMA foreign_keys = ON;`).
* Tables indexed on search columns (`email`, `patientId`, `doctorId`, `appointmentDate`, `status`).

---

## 3. Entity-Relationship (ER) Schema

```mermaid
erDiagram
    USERS ||--o{ APPOINTMENTS : participates_in
    USERS ||--o| HEALTH_RECORDS : owns
    USERS ||--o{ SCHEDULES : defines
    APPOINTMENTS ||--o| CONSULTATIONS : produces
    APPOINTMENTS ||--o{ MESSAGES : carries

    USERS {
        TEXT id PK
        TEXT name
        TEXT email UK
        TEXT passwordHash
        TEXT role "ADMIN | DOCTOR | PATIENT"
        TEXT specialty "Cardiology, Dermatology, etc."
        TEXT phone
        TEXT avatarUrl
        TEXT status "ACTIVE | INACTIVE"
        DATETIME createdAt
    }

    SCHEDULES {
        TEXT id PK
        TEXT doctorId FK
        TEXT dayOfWeek "Monday - Sunday"
        TEXT startTime "09:00"
        TEXT endTime "17:00"
        INTEGER slotDurationMinutes "30"
        INTEGER isActive "0 or 1"
    }

    APPOINTMENTS {
        TEXT id PK
        TEXT patientId FK
        TEXT doctorId FK
        TEXT appointmentDate "YYYY-MM-DD"
        TEXT timeSlot "09:00 - 09:30"
        TEXT reason
        TEXT status "SCHEDULED | COMPLETED | CANCELLED"
        DATETIME createdAt
    }

    CONSULTATIONS {
        TEXT id PK
        TEXT appointmentId FK, UK
        TEXT doctorId FK
        TEXT patientId FK
        TEXT diagnosis
        TEXT medicalAdvice
        TEXT prescriptionJson "Array of {medicine, dosage, timing, duration}"
        TEXT followUpDate
        DATETIME completedAt
    }

    HEALTH_RECORDS {
        TEXT id PK
        TEXT patientId FK, UK
        TEXT bloodGroup "A+, O+, etc."
        TEXT allergies "Penicillin, Peanuts, etc."
        TEXT chronicConditions "Asthma, Hypertension"
        TEXT currentMedications
        TEXT emergencyContactName
        TEXT emergencyContactPhone
        DATETIME updatedAt
    }

    MESSAGES {
        TEXT id PK
        TEXT appointmentId FK
        TEXT senderId FK
        TEXT receiverId FK
        TEXT content
        DATETIME sentAt
    }

    SYSTEM_SETTINGS {
        TEXT key PK
        TEXT value
        TEXT description
        DATETIME updatedAt
    }
```

---

## 4. End-to-End Data Workflows

### 4.1 Consultation Booking Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Client as React Client
    participant API as Express API
    participant DB as SQLite DB

    Patient->>Client: Selects Doctor & Date
    Client->>API: GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
    API->>DB: Query Doctor's Schedule & Existing Appointments
    DB-->>API: Return Booked & Available Slots
    API-->>Client: Available Slots List
    Patient->>Client: Selects Slot & Enters Symptoms
    Client->>API: POST /api/appointments (patientId, doctorId, date, slot, reason)
    API->>DB: Check Conflict & Insert Appointment (Status: SCHEDULED)
    DB-->>API: Appointment Record Created
    API-->>Client: HTTP 201 Booking Confirmed
    Client-->>Patient: Render Booking Confirmation & Calendar Update
```

### 4.2 Consultation Provision & Medical Advice Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant Client as React Client
    participant API as Express API
    participant DB as SQLite DB
    actor Patient

    Doctor->>Client: Opens Scheduled Appointment
    Client->>API: GET /api/patients/:id/medical-history
    API->>DB: Retrieve Patient Health Record & Past Notes
    DB-->>API: Health Record Dossier
    API-->>Client: Render Clinical History
    Doctor->>Client: Enters Diagnosis, Advice & Prescriptions
    Client->>API: POST /api/consultations (appointmentId, diagnosis, advice, prescriptions)
    API->>DB: Insert Consultation Record & Set Appointment Status = COMPLETED
    DB-->>API: Transaction Committed
    API-->>Client: Consultation Saved Confirmation
    Patient->>Client: Checks Medical Advice Tab
    Client->>API: GET /api/patient/medical-advice
    API-->>Client: Returns Diagnostic Advice & Prescriptions
```

---

## 5. Security & Role-Based Access Matrix

| Resource / Action | Admin | Doctor | Patient | Public |
| :--- | :---: | :---: | :---: | :---: |
| **Register / Login** | ❌ (Pre-created) | ❌ (Admin-managed) | ✅ | ✅ |
| **User CRUD** | ✅ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |
| **System Analytics** | ✅ | ❌ | ❌ | ❌ |
| **Set Doctor Schedule** | ❌ | ✅ (Own) | ❌ | ❌ |
| **View Available Slots** | ✅ | ✅ | ✅ | ✅ |
| **Book Appointment** | ❌ | ❌ | ✅ | ❌ |
| **Provide Consultation / Advice** | ❌ | ✅ (Assigned) | ❌ | ❌ |
| **View Patient Health Record** | ✅ (Audit) | ✅ (During consult) | ✅ (Own) | ❌ |
| **Update Health Record** | ❌ | ❌ | ✅ (Own) | ❌ |
| **Chat / Messages** | ❌ | ✅ (Involved) | ✅ (Involved) | ❌ |

---

## 6. Directory Structure
```
shreya/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── PRESENTATION.md
│   └── presentation.html
├── server/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── db/
│       │   ├── database.js
│       │   └── seed.js
│       ├── middleware/
│       └── routes/
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   ├── doctor/
│       │   ├── patient/
│       │   └── auth/
│       ├── services/
│       └── App.jsx
└── README.md
```
