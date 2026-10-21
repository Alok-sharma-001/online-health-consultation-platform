/**
 * API Service Client
 * Centralized fetch client handling JWT injection, response parsing, and error normalization.
 */

const BASE_URL = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('curepulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me'),
  updateProfile: (profileData) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Admin
  getUsers: (params = '') => apiFetch(`/admin/users${params}`),
  createUser: (userData) => apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => apiFetch(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  deleteUser: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminAppointments: (params = '') => apiFetch(`/admin/appointments${params}`),
  updateAppointment: (id, data) => apiFetch(`/admin/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getSettings: () => apiFetch('/admin/settings'),
  updateSettings: (settings) => apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  getAnalytics: () => apiFetch('/admin/analytics'),

  // Doctor
  getDoctorSchedule: () => apiFetch('/doctor/schedule'),
  updateDoctorSchedule: (schedules) => apiFetch('/doctor/schedule', { method: 'POST', body: JSON.stringify({ schedules }) }),
  getDoctorConsultations: (params = '') => apiFetch(`/doctor/consultations${params}`),
  provideConsultation: (data) => apiFetch('/doctor/consultations', { method: 'POST', body: JSON.stringify(data) }),
  getPatientHistory: (patientId) => apiFetch(`/doctor/patients/${patientId}/history`),

  // Patient
  getDoctors: (params = '') => apiFetch(`/patient/doctors${params}`),
  getAvailableSlots: (doctorId, date) => apiFetch(`/patient/doctors/${doctorId}/slots?date=${date}`),
  bookAppointment: (data) => apiFetch('/patient/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getPatientAppointments: () => apiFetch('/patient/appointments'),
  cancelAppointment: (id) => apiFetch(`/patient/appointments/${id}/cancel`, { method: 'PUT' }),
  getMedicalAdvice: () => apiFetch('/patient/medical-advice'),
  getHealthRecord: () => apiFetch('/patient/health-record'),
  updateHealthRecord: (record) => apiFetch('/patient/health-record', { method: 'PUT', body: JSON.stringify(record) }),

  // Messages
  sendMessage: (data) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: (appointmentId) => apiFetch(`/messages/${appointmentId}`),
};
