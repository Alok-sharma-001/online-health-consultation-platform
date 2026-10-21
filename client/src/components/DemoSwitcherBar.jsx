import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Stethoscope, User, Zap } from 'lucide-react';

export default function DemoSwitcherBar() {
  const { user, quickSwitch } = useAuth();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-2 border-b border-slate-700 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-sky-400">
          <Zap className="w-4 h-4 animate-pulse" />
          <span>Evaluation Demo Switcher:</span>
          <span className="text-slate-400 font-normal hidden sm:inline">
            (1-Click test any persona)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Admin */}
          <button
            onClick={() => quickSwitch('ADMIN')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              user?.role === 'ADMIN'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Doctors */}
          <button
            onClick={() => quickSwitch('DOCTOR_CARDIOLOGY')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              user?.email === 'dr.smith@health.com'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Dr. Smith (Cardio)</span>
          </button>

          <button
            onClick={() => quickSwitch('DOCTOR_DERMATOLOGY')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              user?.email === 'dr.patel@health.com'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Dr. Patel (Derma)</span>
          </button>

          {/* Patients */}
          <button
            onClick={() => quickSwitch('PATIENT_JOHN')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              user?.email === 'john.doe@patient.com'
                ? 'bg-emerald-500 text-white font-bold shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient John</span>
          </button>

          <button
            onClick={() => quickSwitch('PATIENT_JANE')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              user?.email === 'jane.roe@patient.com'
                ? 'bg-emerald-500 text-white font-bold shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Jane</span>
          </button>
        </div>
      </div>
    </div>
  );
}
