import { useEffect, useState } from "react";
import { Award, Trophy } from "lucide-react";
import { api } from "../../services/api.js";
export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.activities.getAll("ACHIEVEMENT");
        if (res.success && res.items) {
          setAchievements(res.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);
  return <div className="pt-28 pb-20 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-400 font-semibold">
            <Trophy size={13} />
            <span>HONORS & RECOGNITIONS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Club & Student <span className="text-gradient-gold">Achievements</span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed font-normal">
            Celebrating the milestones, hackathon victories, and academic accomplishments of students mentored and supported by ACES KBTCOE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.length > 0 ? achievements.map((item) => <div
    key={item._id}
    className="glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group"
  >
                <div>
                  <div className="relative aspect-[16/10] bg-navy-900 overflow-hidden">
                    <img
    src={item.imageUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"}
    alt={item.title}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-amber-500 text-navy-950 uppercase flex items-center gap-1">
                        <Award size={12} />
                        <span>HONOR</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="text-xs text-amber-400 font-medium">
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                    {item.tags?.map((t) => <span
    key={t}
    className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300 border border-white/5"
  >
                        {t}
                      </span>)}
                  </div>
                </div>
              </div>) : <div className="col-span-3 text-center py-16 text-slate-400 text-xs">
              Loading achievements...
            </div>}
        </div>
      </section>
    </div>;
};

export default AchievementsPage;
