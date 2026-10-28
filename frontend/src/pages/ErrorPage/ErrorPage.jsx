import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-navy-850 border border-slate-800 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Something Went Wrong</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error?.statusText || error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold transition-colors"
        >
          <Home size={15} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
