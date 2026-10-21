import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Settings,
  BarChart3,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab derived directly from location.pathname to ensure top Navbar works immediately
  const getActiveTab = () => {
    if (location.pathname.includes('/appointments')) return 'appointments';
    if (location.pathname.includes('/settings')) return 'settings';
    if (location.pathname.includes('/analytics')) return 'analytics';
    return 'users';
  };

  const activeTab = getActiveTab();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [aptStatusFilter, setAptStatusFilter] = useState('');

  // Create / Edit User Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DOCTOR',
    specialty: '',
    phone: '',
    status: 'ACTIVE',
  });

  const notify = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  // Load Data
  const loadUsers = async () => {
    try {
      let query = '?';
      if (userRoleFilter) query += `role=${userRoleFilter}&`;
      if (userSearch) query += `search=${encodeURIComponent(userSearch)}&`;
      const res = await api.getUsers(query);
      if (res.success) setUsers(res.users);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadAppointments = async () => {
    try {
      let query = '?';
      if (aptStatusFilter) query += `status=${aptStatusFilter}&`;
      const res = await api.getAdminAppointments(query);
      if (res.success) setAppointments(res.appointments);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success) setSettings(res.settings);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      if (res.success) setAnalytics(res.analytics);
    } catch (err) {
      notify('error', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'users') loadUsers().finally(() => setLoading(false));
    else if (activeTab === 'appointments') loadAppointments().finally(() => setLoading(false));
    else if (activeTab === 'settings') loadSettings().finally(() => setLoading(false));
    else if (activeTab === 'analytics') loadAnalytics().finally(() => setLoading(false));
  }, [activeTab, userRoleFilter, userSearch, aptStatusFilter]);

  // User Actions
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'DOCTOR',
      specialty: 'General Medicine',
      phone: '',
      status: 'ACTIVE',
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      specialty: user.specialty || '',
      phone: user.phone || '',
      status: user.status,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await api.updateUser(editingUser.id, userForm);
        notify('success', res.message);
      } else {
        const res = await api.createUser(userForm);
        notify('success', res.message);
      }
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      const res = await api.deleteUser(id);
      notify('success', res.message);
      loadUsers();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Appointment Actions
  const handleUpdateAptStatus = async (id, newStatus) => {
    try {
      const res = await api.updateAppointment(id, { status: newStatus });
      notify('success', res.message);
      loadAppointments();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settings);
      notify('success', res.message);
    } catch (err) {
      notify('error', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner (Clean, NO duplicate buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Administrator Workspace
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Platform Control & Analytics</h1>
          <p className="text-xs text-slate-500">Oversee users, appointments, system settings, and performance statistics.</p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Active Panel:</span>
          <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg inline-block mt-0.5 border border-slate-200">
            {activeTab === 'users' ? '👥 User Management' : activeTab === 'appointments' ? '📅 Appointment Oversight' : activeTab === 'settings' ? '⚙️ System Configuration' : '📊 Real-Time Analytics'}
          </span>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search by name, email, or specialty..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="DOCTOR">Doctors</option>
                <option value="PATIENT">Patients</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateUser}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-sky-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User Details</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Specialty / Info</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0284c7&color=fff`}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold text-[10px] px-2 py-0.5 rounded-full border ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : u.role === 'DOCTOR'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.specialty || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded hover:bg-sky-50"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No users found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENT MANAGEMENT */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="font-semibold text-xs text-slate-700">Filter by Status:</span>
            <div className="flex items-center gap-1.5">
              {['', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAptStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    aptStatusFilter === st
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {st || 'All Appointments'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor & Specialty</th>
                    <th className="px-4 py-3">Date & Time Slot</th>
                    <th className="px-4 py-3">Chief Complaint</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{a.patientName}</span>
                        <span className="text-[11px] text-slate-400">{a.patientEmail}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 block">{a.doctorName}</span>
                        <span className="text-[11px] text-sky-600">{a.doctorSpecialty}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {a.appointmentDate} <br />
                        <span className="text-[11px] text-slate-400">{a.timeSlot}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{a.reason || 'General'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            a.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'SCHEDULED'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.status === 'SCHEDULED' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateAptStatus(a.id, 'COMPLETED')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-semibold"
                            >
                              Mark Completed
                            </button>
                            <button
                              onClick={() => handleUpdateAptStatus(a.id, 'CANCELLED')}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-[10px] font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {a.status !== 'SCHEDULED' && <span className="text-slate-400 text-[11px]">Finalized</span>}
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">System Configuration Parameters</h3>
            <p className="text-xs text-slate-500">Persist system-wide settings across the entire consultation platform.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Public Name</label>
              <input
                type="text"
                value={settings.platformName || ''}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support & Helpdesk Email</label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Slot Duration (Minutes)</label>
                <input
                  type="number"
                  value={settings.defaultSlotDuration || '30'}
                  onChange={(e) => setSettings({ ...settings, defaultSlotDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Advance Booking (Days)</label>
                <input
                  type="number"
                  value={settings.maxAdvanceBookingDays || '30'}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceBookingDays: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency 24/7 Helpline</label>
              <input
                type="text"
                value={settings.emergencyHelpline || ''}
                onChange={(e) => setSettings({ ...settings, emergencyHelpline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm shadow-sky-600/20"
              >
                Save System Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SYSTEM ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Registered Users</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{analytics.users.total}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {analytics.users.doctors} Doctors &bull; {analytics.users.patients} Patients
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Consultations</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{analytics.appointments.total}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {analytics.appointments.completed} Successfully Completed
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Consultations</span>
              <div className="text-2xl font-black text-sky-600 mt-1">{analytics.appointments.scheduled}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Scheduled on calendar</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completion Rate</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{analytics.appointments.completionRate}%</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Ratio of booked sessions</span>
            </div>
          </div>

          {/* Specialty Distribution and Doctor Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Specialty Distribution</h3>
              <div className="space-y-3">
                {analytics.specialtyDistribution.map((item, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>{item.specialty}</span>
                      <span>{item.count} doctors</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, item.count * 33)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Doctor Consultation Activity</h3>
              <div className="space-y-2 text-xs">
                {analytics.doctorConsultationStats.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-bold text-slate-800 block">{doc.doctorName}</span>
                      <span className="text-[11px] text-slate-500">{doc.specialty}</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-[11px]">
                      {doc.completedCount} consultations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password {editingUser && '(Leave blank to retain current)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="PATIENT">Patient</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {userForm.role === 'DOCTOR' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medical Specialty</label>
                  <input
                    type="text"
                    value={userForm.specialty}
                    placeholder="e.g. Cardiology, Neurology"
                    onChange={(e) => setUserForm({ ...userForm, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
