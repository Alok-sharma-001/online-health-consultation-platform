import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function BookingModal({ doctor, onClose, onSuccess }) {
  // Default date: tomorrow
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTomorrowString());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [slotsData, setSlotsData] = useState({ slots: [], available: true });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch slots whenever date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!doctor || !date) return;
      setLoadingSlots(true);
      setError('');
      setSelectedSlot('');

      try {
        const res = await api.getAvailableSlots(doctor.id, date);
        if (res.success) {
          setSlotsData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctor slots.');
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [doctor, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available consultation slot.');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const res = await api.bookAppointment({
        doctorId: doctor.id,
        appointmentDate: date,
        timeSlot: selectedSlot,
        reason: reason.trim() || 'General Health Consultation',
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      }
    } catch (err) {
      if (err.status === 403 && err.message?.includes('Current role: DOCTOR')) {
        setError('Session Conflict: A Doctor account token is currently active in your browser. Please click "Sign Out" in the top-right corner, then sign in as a Patient to book.');
      } else {
        setError(err.message || 'Failed to book appointment.');
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={
                doctor.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0284c7&color=fff`
              }
              alt={doctor.name}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            <div>
              <h3 className="font-bold text-base leading-tight">Book Consultation</h3>
              <p className="text-xs text-sky-400 font-medium">
                {doctor.name} &bull; {doctor.specialty}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Appointment Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Available Time Slot <span className="text-rose-500">*</span>
            </label>

            {loadingSlots ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                Checking doctor schedule...
              </div>
            ) : !slotsData.available ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                {slotsData.message || 'Doctor has no scheduled hours on this day.'}
              </div>
            ) : slotsData.slots.length === 0 ? (
              <div className="p-3 bg-slate-50 text-slate-500 text-xs rounded-lg text-center">
                No slots configured for this day.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                {slotsData.slots.map((s) => (
                  <button
                    key={s.timeSlot}
                    type="button"
                    disabled={s.isBooked}
                    onClick={() => setSelectedSlot(s.timeSlot)}
                    className={`py-2 px-2.5 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1 transition ${
                      s.isBooked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : selectedSlot === s.timeSlot
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-bold'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{s.timeSlot.split(' - ')[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Consultation / Symptoms
            </label>
            <textarea
              rows={3}
              placeholder="Briefly describe your symptoms or what you'd like to discuss with the doctor..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={booking || !selectedSlot}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20"
            >
              {booking ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
