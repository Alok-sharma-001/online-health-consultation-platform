import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ClipboardList,
  Heart,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pill,
  Stethoscope,
  XCircle,
  FileCheck,
  Save,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingModal from '../../components/modals/BookingModal';
import ChatModal from '../../components/modals/ChatModal';

export default function PatientDashboard({ defaultTab = 'book' }) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalAdviceList, setMedicalAdviceList] = useState([]);
  const [healthRecord, setHealthRecord] = useState({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
  });

  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Modals
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [activeChatApt, setActiveChatApt] = useState(null);

  const notify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: '', text: '' }), 4000);
  };

  const loadDoctors = async () => {
    try {
      let query = specialtyFilter ? `?specialty=${encodeURIComponent(specialtyFilter)}` : '';
      const res = await api.getDoctors(query);
      if (res.success) setDoctors(res.doctors);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.getPatientAppointments();
      if (res.success) setAppointments(res.appointments);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadMedicalAdvice = async () => {
    try {
      const res = await api.getMedicalAdvice();
      if (res.success) setMedicalAdviceList(res.medicalAdvice);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadHealthRecord = async () => {
    try {
      const res = await api.getHealthRecord();
      if (res.success && res.healthRecord) {
        setHealthRecord(res.healthRecord);
      }
    } catch (err) {
      notify('error', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'book') {
      Promise.all([loadDoctors(), loadAppointments()]).finally(() => setLoading(false));
    } else if (activeTab === 'advice') {
      loadMedicalAdvice().finally(() => setLoading(false));
    } else if (activeTab === 'records') {
      loadHealthRecord().finally(() => setLoading(false));
    } else if (activeTab === 'profile') {
      setLoading(false);
    }
  }, [activeTab, specialtyFilter]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.cancelAppointment(id);
      notify('success', res.message);
      loadAppointments();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleSaveHealthRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateHealthRecord(healthRecord);
      notify('success', res.message);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(profileForm);
      notify('success', res.message);
      refreshUser();
    } catch (err) {
      notify('error', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Patient Health Dashboard
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Welcome back, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs text-slate-500">Book consultations, review digital prescriptions, and manage your medical records.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'book' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultation Booking</span>
          </button>
          <button
            onClick={() => setActiveTab('advice')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'advice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Medical Advice</span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'records' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Health Records</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Management</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* TAB 1: CONSULTATION BOOKING & MY APPOINTMENTS */}
      {activeTab === 'book' && (
        <div className="space-y-8">
          {/* Section A: My Scheduled Appointments */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>My Consultation Appointments ({appointments.length})</span>
            </h3>

            {appointments.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                You have no scheduled appointments. Browse verified specialists below to book!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              apt.doctorAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName)}&background=0284c7&color=fff`
                            }
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{apt.doctorName}</span>
                            <span className="text-[11px] text-sky-600 font-medium">{apt.doctorSpecialty}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'SCHEDULED'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs space-y-0.5">
                        <div className="flex justify-between text-slate-700">
                          <span className="font-medium">Date:</span>
                          <span className="font-bold">{apt.appointmentDate}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="font-medium">Time Slot:</span>
                          <span>{apt.timeSlot}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 truncate">
                          Reason: {apt.reason || 'General'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveChatApt(apt)}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Doctor</span>
                      </button>

                      {apt.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                      {apt.status === 'COMPLETED' && (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Advice Available</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Find & Book Healthcare Professionals */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  <span>Available Healthcare Professionals</span>
                </h3>
                <p className="text-xs text-slate-500">Select a specialist and reserve your consultation slot.</p>
              </div>

              {/* Specialty filter */}
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        doc.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0284c7&color=fff`
                      }
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                      <span className="text-xs font-semibold text-sky-600 block">{doc.specialty}</span>
                      <span className="text-[11px] text-slate-400">{doc.phone || doc.email}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Available for Teleconsult
                    </span>
                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-sky-600/20"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIVE MEDICAL ADVICE */}
      {activeTab === 'advice' && (
        <div className="space-y-4 max-w-4xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Medical Advice & Prescriptions Vault</h3>
            <p className="text-xs text-slate-500">Access post-consultation diagnoses, medication dosages, and doctor recommendations.</p>
          </div>

          {medicalAdviceList.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              No completed medical advice records available yet. Complete a consultation with your doctor to receive advice.
            </div>
          ) : (
            <div className="space-y-4">
              {medicalAdviceList.map((adv) => (
                <div
                  key={adv.consultationId}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <Stethoscope className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{adv.doctorName}</h4>
                        <span className="text-xs text-sky-600 font-medium">{adv.doctorSpecialty}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-semibold text-slate-800">{adv.appointmentDate}</span>
                      <span className="text-slate-400 block text-[11px]">{adv.timeSlot}</span>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="font-bold text-slate-800 block mb-0.5">Clinical Diagnosis:</span>
                    <p className="text-slate-700 font-medium">{adv.diagnosis}</p>
                  </div>

                  {/* Medical Advice */}
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">Doctor's Advice & Lifestyle Guidance:</span>
                    <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {adv.medicalAdvice}
                    </p>
                  </div>

                  {/* Prescriptions */}
                  {adv.prescriptions && adv.prescriptions.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-sky-600" />
                        <span>Prescribed Medications ({adv.prescriptions.length})</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {adv.prescriptions.map((rx, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-sky-50/60 border border-sky-100 rounded-lg space-y-1"
                          >
                            <span className="font-bold text-slate-900 block text-xs">
                              {rx.medicine} {rx.dosage && `(${rx.dosage})`}
                            </span>
                            <div className="text-slate-600 text-[11px]">
                              <div>Frequency: <span className="font-medium text-slate-800">{rx.frequency}</span></div>
                              {rx.duration && <div>Duration: <span className="font-medium text-slate-800">{rx.duration}</span></div>}
                              {rx.instructions && <div>Instructions: <span className="italic">{rx.instructions}</span></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Note */}
                  {adv.followUpDate && (
                    <div className="p-2.5 bg-amber-50 text-amber-900 rounded-lg text-xs flex items-center gap-2 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span><strong>Follow-up Consultation Advised:</strong> {adv.followUpDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HEALTH RECORD MANAGEMENT */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Personal Health Record (EHR)</h3>
            <p className="text-xs text-slate-500">Keep your medical profile up-to-date so consulting physicians can deliver safe care.</p>
          </div>

          <form onSubmit={handleSaveHealthRecord} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={healthRecord.bloodGroup || 'Not Specified'}
                  onChange={(e) => setHealthRecord({ ...healthRecord, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Drug & Food Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa"
                  value={healthRecord.allergies || ''}
                  onChange={(e) => setHealthRecord({ ...healthRecord, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Existing Chronic Conditions</label>
              <textarea
                rows={2}
                placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes"
                value={healthRecord.chronicConditions || ''}
                onChange={(e) => setHealthRecord({ ...healthRecord, chronicConditions: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Regular Medications</label>
              <input
                type="text"
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                value={healthRecord.currentMedications || ''}
                onChange={(e) => setHealthRecord({ ...healthRecord, currentMedications: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mary Doe (Spouse)"
                  value={healthRecord.emergencyContactName || ''}
                  onChange={(e) => setHealthRecord({ ...healthRecord, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+1 555-0199"
                  value={healthRecord.emergencyContactPhone || ''}
                  onChange={(e) => setHealthRecord({ ...healthRecord, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Health Records</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PROFILE MANAGEMENT */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Account & Profile Settings</h3>
            <p className="text-xs text-slate-500">Update your account name, telephone number, and credentials.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email cannot be changed directly.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password (Leave blank to keep unchanged)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODALS */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => {
            notify('success', 'Consultation scheduled successfully!');
            loadAppointments();
          }}
        />
      )}

      {activeChatApt && (
        <ChatModal
          appointment={activeChatApt}
          onClose={() => setActiveChatApt(null)}
        />
      )}
    </div>
  );
}
