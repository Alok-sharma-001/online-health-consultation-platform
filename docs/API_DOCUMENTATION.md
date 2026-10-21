# REST API Documentation
## Project 12: Online Health Consultation Platform

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer Token via `Authorization: Bearer <JWT_TOKEN>` header  
**Content-Type**: `application/json`

---

## 1. Authentication Endpoints

### 1.1 Register Patient
* **Method**: `POST`
* **Endpoint**: `/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "name": "Alice Green",
  "email": "alice@patient.com",
  "password": "password123",
  "phone": "+1 555-0199"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-patient-alice",
    "name": "Alice Green",
    "email": "alice@patient.com",
    "role": "PATIENT"
  }
}
```

### 1.2 User Login
* **Method**: `POST`
* **Endpoint**: `/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "dr.smith@health.com",
  "password": "password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-doc-smith",
    "name": "Dr. Robert Smith",
    "email": "dr.smith@health.com",
    "role": "DOCTOR",
    "specialty": "Cardiology"
  }
}
```

### 1.3 Get Current Profile
* **Method**: `GET`
* **Endpoint**: `/auth/me`
* **Access**: Authenticated (`ADMIN`, `DOCTOR`, `PATIENT`)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "u-doc-smith",
    "name": "Dr. Robert Smith",
    "email": "dr.smith@health.com",
    "role": "DOCTOR",
    "specialty": "Cardiology",
    "phone": "+1 555-0101"
  }
}
```

---

## 2. Administrator Endpoints

### 2.1 List All Users
* **Method**: `GET`
* **Endpoint**: `/admin/users`
* **Access**: `ADMIN`
* **Query Params**: `?role=DOCTOR&search=Smith`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "users": [
    {
      "id": "u-doc-smith",
      "name": "Dr. Robert Smith",
      "email": "dr.smith@health.com",
      "role": "DOCTOR",
      "specialty": "Cardiology",
      "status": "ACTIVE",
      "createdAt": "2026-10-15T09:00:00.000Z"
    }
  ]
}
```

### 2.2 Create User
* **Method**: `POST`
* **Endpoint**: `/admin/users`
* **Access**: `ADMIN`
* **Request Body**:
```json
{
  "name": "Dr. Emily Watson",
  "email": "dr.watson@health.com",
  "password": "password123",
  "role": "DOCTOR",
  "specialty": "Neurology",
  "phone": "+1 555-0188"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "userId": "u-doc-watson"
}
```

### 2.3 Update User & Toggle Status
* **Method**: `PUT`
* **Endpoint**: `/admin/users/:id`
* **Access**: `ADMIN`
* **Request Body**:
```json
{
  "name": "Dr. Emily Watson",
  "specialty": "Pediatric Neurology",
  "status": "ACTIVE"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### 2.4 Delete User
* **Method**: `DELETE`
* **Endpoint**: `/admin/users/:id`
* **Access**: `ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 2.5 Master Appointment Management
* **Method**: `GET`
* **Endpoint**: `/admin/appointments`
* **Access**: `ADMIN`
* **Query Params**: `?status=SCHEDULED&date=2026-10-22`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "appointments": [
    {
      "id": "apt-101",
      "patientName": "John Doe",
      "doctorName": "Dr. Robert Smith",
      "specialty": "Cardiology",
      "appointmentDate": "2026-10-22",
      "timeSlot": "10:00 - 10:30",
      "reason": "Chest tightness on exertion",
      "status": "SCHEDULED"
    }
  ]
}
```

### 2.6 System Settings
* **Method**: `GET` | `PUT`
* **Endpoint**: `/admin/settings`
* **Access**: `ADMIN`
* **PUT Request Body**:
```json
{
  "platformName": "CurePulse Health",
  "supportEmail": "support@curepulse.org",
  "defaultSlotDuration": "30",
  "maxAdvanceBookingDays": "30",
  "enableChatMessaging": "true"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "System settings updated successfully",
  "settings": { ... }
}
```

### 2.7 System Analytics Dashboard
* **Method**: `GET`
* **Endpoint**: `/admin/analytics`
* **Access**: `ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "metrics": {
    "totalUsers": 28,
    "totalDoctors": 6,
    "totalPatients": 20,
    "totalAppointments": 45,
    "completedConsultations": 38,
    "cancelledAppointments": 3,
    "specialtyDistribution": [
      { "specialty": "Cardiology", "count": 18 },
      { "specialty": "Dermatology", "count": 14 },
      { "specialty": "General Medicine", "count": 13 }
    ],
    "monthlyTrend": [
      { "month": "Aug", "consultations": 22 },
      { "month": "Sep", "consultations": 31 },
      { "month": "Oct", "consultations": 45 }
    ]
  }
}
```

---

## 3. Healthcare Professional (Doctor) Endpoints

### 3.1 Manage Schedule & Availability
* **Method**: `GET` | `POST`
* **Endpoint**: `/doctor/schedule`
* **Access**: `DOCTOR`
* **POST Request Body**:
```json
{
  "schedules": [
    { "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "17:00", "slotDurationMinutes": 30, "isActive": 1 },
    { "dayOfWeek": "Tuesday", "startTime": "09:00", "endTime": "17:00", "slotDurationMinutes": 30, "isActive": 1 },
    { "dayOfWeek": "Wednesday", "startTime": "10:00", "endTime": "16:00", "slotDurationMinutes": 30, "isActive": 1 }
  ]
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Doctor schedule updated successfully"
}
```

### 3.2 View Doctor Consultations
* **Method**: `GET`
* **Endpoint**: `/doctor/consultations`
* **Access**: `DOCTOR`
* **Query Params**: `?status=SCHEDULED`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "consultations": [
    {
      "appointmentId": "apt-101",
      "patientId": "u-patient-john",
      "patientName": "John Doe",
      "appointmentDate": "2026-10-22",
      "timeSlot": "10:00 - 10:30",
      "reason": "Chest discomfort",
      "status": "SCHEDULED"
    }
  ]
}
```

### 3.3 Record Consultation Advice & Prescriptions
* **Method**: `POST`
* **Endpoint**: `/doctor/consultations`
* **Access**: `DOCTOR`
* **Request Body**:
```json
{
  "appointmentId": "apt-101",
  "diagnosis": "Mild sinus bradycardia with muscular fatigue",
  "medicalAdvice": "Hydrate adequately, avoid heavy exertion for 48 hours, monitor resting heart rate.",
  "prescriptions": [
    { "medicine": "Metoprolol Succinate", "dosage": "25mg", "frequency": "Once daily with breakfast", "duration": "14 days" },
    { "medicine": "Electrolyte Solution", "dosage": "1 packet", "frequency": "Twice daily", "duration": "5 days" }
  ],
  "followUpDate": "2026-11-05"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Consultation completed and medical advice recorded successfully"
}
```

### 3.4 Access Patient Medical History
* **Method**: `GET`
* **Endpoint**: `/doctor/patients/:patientId/history`
* **Access**: `DOCTOR`, `ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "patient": {
    "id": "u-patient-john",
    "name": "John Doe",
    "email": "john.doe@patient.com",
    "phone": "+1 555-0123"
  },
  "healthRecord": {
    "bloodGroup": "O+",
    "allergies": "Penicillin, Pollen",
    "chronicConditions": "Mild Hypertension",
    "currentMedications": "Lisinopril 10mg",
    "emergencyContact": "Mary Doe (+1 555-0124)"
  },
  "pastConsultations": [
    {
      "consultationId": "con-55",
      "doctorName": "Dr. Robert Smith",
      "date": "2026-09-15",
      "diagnosis": "Routine cardiovascular checkup",
      "medicalAdvice": "Normal ECG. Follow DASH diet."
    }
  ]
}
```

---

## 4. Patient Endpoints

### 4.1 Browse Doctors & Specialties
* **Method**: `GET`
* **Endpoint**: `/patient/doctors`
* **Access**: Authenticated / Public
* **Query Params**: `?specialty=Cardiology`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "doctors": [
    {
      "id": "u-doc-smith",
      "name": "Dr. Robert Smith",
      "specialty": "Cardiology",
      "email": "dr.smith@health.com",
      "phone": "+1 555-0101"
    }
  ]
}
```

### 4.2 Query Available Slots for Doctor
* **Method**: `GET`
* **Endpoint**: `/patient/doctors/:id/slots?date=2026-10-23`
* **Access**: Authenticated
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "date": "2026-10-23",
  "slots": [
    { "time": "09:00 - 09:30", "available": true },
    { "time": "09:30 - 10:00", "available": false },
    { "time": "10:00 - 10:30", "available": true }
  ]
}
```

### 4.3 Book Consultation Appointment
* **Method**: `POST`
* **Endpoint**: `/patient/appointments`
* **Access**: `PATIENT`
* **Request Body**:
```json
{
  "doctorId": "u-doc-smith",
  "appointmentDate": "2026-10-23",
  "timeSlot": "10:00 - 10:30",
  "reason": "Follow-up regarding palpitations and stress"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "id": "apt-105",
    "doctorName": "Dr. Robert Smith",
    "appointmentDate": "2026-10-23",
    "timeSlot": "10:00 - 10:30",
    "status": "SCHEDULED"
  }
}
```

### 4.4 View Received Medical Advice
* **Method**: `GET`
* **Endpoint**: `/patient/medical-advice`
* **Access**: `PATIENT`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "records": [
    {
      "appointmentId": "apt-101",
      "doctorName": "Dr. Robert Smith",
      "specialty": "Cardiology",
      "date": "2026-10-20",
      "diagnosis": "Mild sinus bradycardia",
      "medicalAdvice": "Hydrate adequately, avoid heavy exertion for 48 hours.",
      "prescriptions": [
        { "medicine": "Metoprolol Succinate", "dosage": "25mg", "frequency": "Once daily", "duration": "14 days" }
      ],
      "followUpDate": "2026-11-05"
    }
  ]
}
```

### 4.5 Manage Health Record
* **Method**: `GET` | `PUT`
* **Endpoint**: `/patient/health-record`
* **Access**: `PATIENT`
* **PUT Request Body**:
```json
{
  "bloodGroup": "O+",
  "allergies": "Penicillin, Peanuts",
  "chronicConditions": "Hypertension",
  "currentMedications": "Lisinopril 10mg",
  "emergencyContactName": "Mary Doe",
  "emergencyContactPhone": "+1 555-0124"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Health record updated successfully"
}
```

---

## 5. Communication & Messaging Endpoints

### 5.1 Send Message
* **Method**: `POST`
* **Endpoint**: `/messages`
* **Access**: `DOCTOR`, `PATIENT`
* **Request Body**:
```json
{
  "appointmentId": "apt-101",
  "receiverId": "u-patient-john",
  "content": "Please remember to monitor your blood pressure morning and evening."
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### 5.2 Get Messages for Appointment
* **Method**: `GET`
* **Endpoint**: `/messages/:appointmentId`
* **Access**: `DOCTOR`, `PATIENT`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-01",
      "senderId": "u-doc-smith",
      "senderName": "Dr. Robert Smith",
      "content": "Please remember to monitor your blood pressure morning and evening.",
      "sentAt": "2026-10-22T14:30:00.000Z"
    }
  ]
}
```
