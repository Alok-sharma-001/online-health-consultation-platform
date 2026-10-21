import React from 'react';
import { X, Printer, Stethoscope, Heart, Calendar, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PrescriptionModal({ consultation, onClose }) {
  if (!consultation) return null;

  const handlePrint = () => {
    window.print();
  };

  const prescriptions = consultation.prescriptions || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:max-w-full">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-400/30">
              Official Medical Prescription
            </span>
            <span className="text-xs text-slate-400">Ref: #{consultation.appointmentId || consultation.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Slip */}
        <div className="p-8 space-y-6 text-slate-800 bg-white" id="printable-rx">
          {/* Clinic & Doctor Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">CurePulse Telehealth Clinic</h2>
                <p className="text-xs text-slate-500 font-medium">Department of {consultation.doctorSpecialty || 'Clinical Care'}</p>
                <p className="text-[11px] text-slate-400">Accredited Digital Health & Teleconsultation Center &bull; Reg #CP-2026-994</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-sm text-slate-900 block">{consultation.doctorName}</span>
              <span className="text-xs text-sky-700 font-semibold">{consultation.doctorSpecialty}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Lic: MED-884210-MD</span>
            </div>
          </div>

          {/* Patient Details & Vitals Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{consultation.patientName || 'Consultation Patient'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Consultation Date</span>
              <span className="font-semibold text-slate-800">{consultation.appointmentDate} ({consultation.timeSlot || 'Session'})</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Visit Type</span>
              <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 inline-block">
                Online Consultation
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient ID</span>
              <span className="font-semibold text-slate-700">{consultation.patientId || 'PT-RECORD'}</span>
            </div>
          </div>

          {/* Diagnosis & Clinical Findings */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Assessment & Diagnosis</span>
            <div className="p-3.5 bg-sky-50/70 border border-sky-200/60 rounded-xl">
              <span className="text-xs font-bold text-sky-950 block text-sm">{consultation.diagnosis}</span>
              {consultation.reason && (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Reported Symptoms: <em>{consultation.reason}</em>
                </span>
              )}
            </div>
          </div>

          {/* Rx Medications Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif font-black text-sky-700 italic">℞</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Prescribed Medications</span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic text-center">
                No pharmaceutical medications prescribed during this consultation. Follow clinical advice below.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5">#</th>
                      <th className="px-3.5 py-2.5">Medication & Form</th>
                      <th className="px-3.5 py-2.5">Dosage</th>
                      <th className="px-3.5 py-2.5">Frequency</th>
                      <th className="px-3.5 py-2.5">Duration</th>
                      <th className="px-3.5 py-2.5">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescriptions.map((rx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3.5 py-2.5 text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">{rx.medicine}</td>
                        <td className="px-3.5 py-2.5 text-slate-700 font-semibold">{rx.dosage || '—'}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                            {rx.frequency}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700">{rx.duration || '—'}</td>
                        <td className="px-3.5 py-2.5 text-slate-600 italic">{rx.instructions || 'As advised'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Clinical Advice & Lifestyle Instructions */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Physician's Guidance & Lifestyle Advice</span>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
              {consultation.medicalAdvice}
            </div>
          </div>

          {/* Follow-up & Doctor Verification Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              {consultation.followUpDate ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Next Recommended Follow-up Visit: {consultation.followUpDate}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Follow-up as needed upon symptom progression.</span>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Signed & Verified</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {consultation.doctorName} &bull; CurePulse Medical Board
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center print:hidden">
          <span className="text-[11px] text-slate-500">Official Teleconsultation Record</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
