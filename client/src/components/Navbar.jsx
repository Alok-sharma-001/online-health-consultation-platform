import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LogOut,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Clock,
  ClipboardList,
  FileText,
  User,
  Heart,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">Admin</span>;
      case 'DOCTOR':
        return <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200">Doctor</span>;
      case 'PATIENT':
        return <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">Patient</span>;
      default:
        return null;
    }
  };

  // Precise route matching so clicking top navbar buttons highlights and triggers navigation immediately
  const isActive = (path) => {
    if (path === '/admin/users') {
      return location.pathname === '/admin' || location.pathname === '/admin/users';
    }
    if (path === '/doctor/consultations') {
      return location.pathname === '/doctor' || location.pathname === '/doctor/consultations';
    }
    if (path === '/patient/book') {
      return location.pathname === '/patient' || location.pathname === '/patient/book';
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent tracking-tight">
              CurePulse
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold -mt-0.5">
              {user?.role === 'ADMIN'
                ? 'Admin Control Center'
                : user?.role === 'DOCTOR'
                ? 'Doctor Clinical Portal'
                : user?.role === 'PATIENT'
                ? 'Patient Care Portal'
                : 'Telehealth Platform'}
            </span>
          </div>
        </Link>

        {/* Primary Role Navigation - Single Unified Source of Truth */}
        {user && (
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/users"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/admin/users')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>
                <Link
                  to="/admin/appointments"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/admin/appointments')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/admin/settings')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/admin/analytics')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
              </>
            )}

            {user.role === 'DOCTOR' && (
              <>
                <Link
                  to="/doctor/consultations"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/doctor/consultations')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Consultations</span>
                </Link>
                <Link
                  to="/doctor/schedule"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/doctor/schedule')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Schedule</span>
                </Link>
                <Link
                  to="/doctor/records"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/doctor/records')
                      ? 'bg-sky-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Patient Records</span>
                </Link>
              </>
            )}

            {user.role === 'PATIENT' && (
              <>
                <Link
                  to="/patient/book"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/patient/book')
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Consultations</span>
                </Link>
                <Link
                  to="/patient/advice"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/patient/advice')
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Prescriptions & Advice</span>
                </Link>
                <Link
                  to="/patient/records"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/patient/records')
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Health Records</span>
                </Link>
                <Link
                  to="/patient/profile"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/patient/profile')
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Right Actions: User info & logout */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
              </div>
              <img
                src={
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0284c7&color=fff`
                }
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition shadow-xs"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 px-3 py-2 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-xl shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
