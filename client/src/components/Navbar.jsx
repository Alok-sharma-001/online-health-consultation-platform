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
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">Admin</span>;
      case 'DOCTOR':
        return <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-sky-200">Doctor</span>;
      case 'PATIENT':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">Patient</span>;
      default:
        return null;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent">
              CurePulse
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
              Telehealth Platform
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation according to Role */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/admin/users') || isActive('/admin')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>
                <Link
                  to="/admin/appointments"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/admin/appointments')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/admin/settings')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/admin/analytics')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/doctor/consultations') || isActive('/doctor')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Consultations</span>
                </Link>
                <Link
                  to="/doctor/schedule"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/doctor/schedule')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Schedule</span>
                </Link>
                <Link
                  to="/doctor/records"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/doctor/records')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/patient/book') || isActive('/patient')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Consultation</span>
                </Link>
                <Link
                  to="/patient/advice"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/patient/advice')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Medical Advice</span>
                </Link>
                <Link
                  to="/patient/records"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/patient/records')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Health Records</span>
                </Link>
                <Link
                  to="/patient/profile"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                    isActive('/patient/profile')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <span className="text-xs text-slate-500">{user.email}</span>
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
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-sky-600 hover:text-sky-700 px-3 py-2 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg shadow-sm"
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
