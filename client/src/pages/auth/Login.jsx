import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Lock,
  Mail,
  AlertCircle,
  Shield,
  Stethoscope,
  Heart,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function Login() {
  const { login, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'ADMIN') navigate('/admin');
        else if (res.user.role === 'DOCTOR') navigate('/doctor');
        else navigate('/patient');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (roleKey) => {
    setLoading(true);
    setError('');
    try {
      const res = await quickSwitch(roleKey);
      if (res?.success) {
        if (res.user.role === 'ADMIN') navigate('/admin');
        else if (res.user.role === 'DOCTOR') navigate('/doctor');
        else navigate('/patient');
      }
    } catch (err) {
      setError(err.message || 'Could not authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-600/25 mb-1">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            CurePulse Telehealth Platform
          </h1>
          <p className="text-sm text-slate-500">
            Secure, role-isolated healthcare portals. Select your designated portal below or sign in with your email credentials.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Dedicated Role Selection Portals */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
                1-Click Direct Portal Access
              </span>
              <p className="text-[11px] text-slate-400">
                Sign in directly to explore features isolated by persona
              </p>
            </div>
            <span className="text-[11px] font-semibold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
              Evaluator Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Admin Portal */}
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-100">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                    Administrator
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Admin Control Center</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Platform governance, manage doctors and patients, audit appointments, and inspect analytics.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuick('ADMIN')}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Enter as Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
                <span className="block text-[10px] text-center text-slate-400 font-mono">
                  admin@health.com
                </span>
              </div>
            </div>

            {/* 2. Doctor Portal */}
            <div className="bg-white rounded-2xl border border-sky-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold border border-sky-100">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200">
                    Clinical Doctor
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Doctor Consultation Desk</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Triage consultations, review medical histories, issue official electronic prescriptions (Rx), and set hours.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuick('DOCTOR_CARDIOLOGY')}
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Dr. Smith (Cardiology)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuick('DOCTOR_DERMATOLOGY')}
                  className="w-full py-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition disabled:opacity-50"
                >
                  <span>Dr. Patel (Dermatology)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            </div>

            {/* 3. Patient Portal */}
            <div className="bg-white rounded-2xl border border-teal-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                    Patient Care
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Patient Health Portal</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Book specialist doctors, chat in real-time, view verified Rx advice slips, and update personal health profile.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuick('PATIENT_JOHN')}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Enter as John Doe</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuick('PATIENT_JANE')}
                  className="w-full py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-teal-200 transition disabled:opacity-50"
                >
                  <span>Enter as Jane Roe</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Traditional Credentials Form Section */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="text-center pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Or Sign In With Custom Credentials
            </h2>
            <p className="text-[11px] text-slate-500">
              Enter registered email and password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-sm transition"
            >
              {loading ? 'Authenticating...' : 'Sign In with Credentials'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Register New Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
