import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Sparkles, ZoomIn, Play, Calendar, Layers, ArrowLeft } from 'lucide-react';
import { GalleryItem, EventGalleryAlbum, GalleryMediaItem } from '../types/index.js';
import { api } from '../services/api.js';

export const GalleryPage: React.FC = () => {
  const [albums, setAlbums] = useState<EventGalleryAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<EventGalleryAlbum | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ url: string; title: string; caption?: string; isVideo?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const albumsRes = await api.gallery.getAlbums();
        if (albumsRes.success && albumsRes.albums) {
          setAlbums(albumsRes.albums);
        }
      } catch (err) {
        console.error('Failed to load gallery albums:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryData();
  }, []);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
              <Sparkles size={13} />
              <span>COMPLETED EVENTS & MEDIA ARCHIVE</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Event Media <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Memories, photographs, and video highlights from our completed technical sessions, hackathons, outreach programs, and departmental milestones.
            </p>
          </div>

          {selectedAlbum && (
            <button
              onClick={() => setSelectedAlbum(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to All Albums</span>
            </button>
          )}
        </div>

        {/* Selected Album View or Albums Grid */}
        {selectedAlbum ? (
          <div className="mt-8 space-y-8">
            <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-electric-blue/20 text-electric-cyan border border-electric-blue/30">
                  {selectedAlbum.category}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(selectedAlbum.eventDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{selectedAlbum.title}</h2>
              {selectedAlbum.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {selectedAlbum.description}
                </p>
              )}
            </div>

            {/* Media Items Grid */}
            {selectedAlbum.media && selectedAlbum.media.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedAlbum.media.map((med, idx) => {
                  const isVideo = med.mediaType === 'VIDEO' || med.url.endsWith('.mp4');

                  return (
                    <motion.div
                      key={med._id || idx}
                      whileHover={{ y: -4 }}
                      onClick={() =>
                        setActiveMedia({
                          url: med.url,
                          title: selectedAlbum.title,
                          caption: med.caption || med.altText,
                          isVideo,
                        })
                      }
                      className="glass-card rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                    >
                      <div className="relative aspect-[4/3] bg-navy-950 overflow-hidden">
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/60">
                            <Play size={40} className="text-white drop-shadow-lg" />
                          </div>
                        ) : (
                          <img
                            src={med.url}
                            alt={med.caption || selectedAlbum.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="text-white text-xs font-semibold flex items-center justify-between w-full">
                            <span>{med.caption || 'View Full Media'}</span>
                            <ZoomIn size={16} className="text-electric-cyan" />
                          </div>
                        </div>
                      </div>

                      {med.caption && (
                        <div className="p-3 bg-navy-900/60">
                          <p className="text-xs text-slate-300 truncate">{med.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 glass-card rounded-2xl">
                No individual photos uploaded for this album yet. Check back soon!
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {/* Albums List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => (
                <motion.div
                  key={album._id}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedAlbum(album)}
                  className="rounded-3xl overflow-hidden bg-navy-900 border border-white/10 cursor-pointer group flex flex-col justify-between shadow-xl shadow-black/40"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-navy-950 overflow-hidden">
                      <img
                        src={album.coverImageUrl || '/assets/events/Kachurli_Ashram_Shala_Event.jpg'}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />

                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-950/80 text-electric-cyan backdrop-blur border border-white/15">
                          {album.category}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(album.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-white">
                          {album.media?.length || 2} Assets
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-electric-cyan transition-colors">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between text-xs font-semibold text-electric-cyan group-hover:underline">
                    <span>Explore Album Photos →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeMedia && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-xl"
            onClick={() => setActiveMedia(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full rounded-3xl overflow-hidden bg-navy-900 border border-white/15 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveMedia(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-navy-950/80 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
                {activeMedia.isVideo ? (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    className="max-h-[75vh] w-auto max-w-full"
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.title}
                    className="max-h-[75vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              <div className="p-6 bg-navy-900 border-t border-white/10 space-y-1">
                <h3 className="text-base font-bold text-white">{activeMedia.title}</h3>
                {activeMedia.caption && (
                  <p className="text-xs text-slate-300">{activeMedia.caption}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
