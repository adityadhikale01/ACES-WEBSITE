import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Sparkles, ZoomIn } from 'lucide-react';
import { GalleryItem } from '../types/index.js';
import { api } from '../services/api.js';

const categories = ['ALL', 'TEAM', 'FLAGSHIP', 'WORKSHOP', 'COMPETITION'];

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.gallery.getAll(
          selectedCategory !== 'ALL' ? selectedCategory : undefined
        );
        if (res.success && res.items) {
          setItems(res.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
              <Sparkles size={13} />
              <span>CAMPUS & ACTIVITY ARCHIVE</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Media & Event <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Capturing team milestones, workshops, competitive coding events, and memories of the Department of Computer Engineering.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-electric-blue text-white border-electric-cyan shadow-lg shadow-electric-blue/30'
                    : 'bg-navy-850/80 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mosaic Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ y: -4 }}
              onClick={() => setActivePhoto(item)}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
            >
              <div className="relative aspect-[4/3] bg-navy-900 overflow-hidden">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white text-xs font-semibold flex items-center justify-between w-full">
                    <span>{item.title}</span>
                    <ZoomIn size={16} className="text-electric-cyan" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-navy-850/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  <span>{item.category}</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                {item.caption && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.caption}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-xl"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full rounded-3xl overflow-hidden bg-navy-900 border border-white/15 shadow-2xl relative"
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-navy-950/80 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activePhoto.mediaUrl}
                  alt={activePhoto.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-navy-850 border-t border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-electric-cyan">
                  {activePhoto.category}
                </span>
                <h3 className="text-lg font-bold text-white">{activePhoto.title}</h3>
                {activePhoto.caption && (
                  <p className="text-xs text-slate-300">{activePhoto.caption}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
