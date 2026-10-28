import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { Image as ImageIcon, Calendar } from 'lucide-react';

export function GalleryPage() {
  const { albums = [] } = useLoaderData();

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>EVENT ARCHIVE & MOMENTS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Event Photo <br />
            <span className="text-gradient">Gallery.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            A visual retrospective of workshops, hackathons, seminars, and social initiatives organized by ACES KBTCOE.
          </p>
        </div>

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-navy-850/50 border border-slate-800 text-slate-400 text-sm">
            No gallery albums published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album._id || album.slug}
                className="rounded-3xl overflow-hidden bg-navy-850/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between group transition-all"
              >
                <div className="relative aspect-[16/10] bg-navy-900 overflow-hidden">
                  <img
                    src={album.coverMediaUrl || '/assets/aces-team.jpg'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-navy-950/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                    <ImageIcon size={12} className="text-electric-cyan" />
                    <span>{album.mediaCount || 0} Media</span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar size={13} className="text-electric-cyan" />
                    <span>{new Date(album.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-electric-cyan transition-colors">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
