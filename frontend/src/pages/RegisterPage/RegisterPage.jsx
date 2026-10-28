import React, { useEffect } from 'react';
import { Form, useActionData, useNavigation, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';

export function RegisterPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const isSubmitting = navigation.state === 'submitting';
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (actionData?.success && actionData?.user && actionData?.token) {
      login(actionData.user, actionData.token);
      navigate(redirectPath, { replace: true });
    }
  }, [actionData, login, navigate, redirectPath]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Create Student Account</h1>
          <p className="text-xs text-slate-400">
            Join the ACES portal to register for departmental events and track attendance.
          </p>
        </div>

        {actionData?.error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{actionData.error}</span>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-navy-850/90 border border-slate-800">
          <Form method="post" className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Shraddha Patil"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. shraddha@kbtcoe.in"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Password *</label>
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Academic Year</label>
                <select
                  name="academicYear"
                  defaultValue="SE"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-blue"
                >
                  <option value="FE">First Year (FE)</option>
                  <option value="SE">Second Year (SE)</option>
                  <option value="TE">Third Year (TE)</option>
                  <option value="BE">Final Year (BE)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">PRN</label>
                <input
                  type="text"
                  name="prn"
                  placeholder="e.g. 7210..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs uppercase tracking-wider hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-electric-blue/20 flex items-center justify-center gap-2 pt-3"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
            </button>
          </Form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-electric-cyan hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
