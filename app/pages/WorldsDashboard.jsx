import { useState, useEffect } from "react";
import { World } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";

const SETTING_ICONS = {
  Fantasy: "🧙", "Sci-Fi": "🚀", Modern: "🏙️", "Post-Apocalyptic": "☢️", Ancient: "🏛️", Custom: "🎨"
};
const DANGER_COLORS = {
  Peaceful: "text-green-400", Low: "text-blue-400", Medium: "text-yellow-400", High: "text-orange-400", Extreme: "text-red-400"
};
const MODE_ICONS = {
  Visual: "🎮", Narrative: "📖", Both: "✨"
};

export default function WorldsDashboard() {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    World.list().then((data) => {
      setWorlds(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🌌</span> My Worlds
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">You are the god here.</p>
        </div>
        <Link
          to="/create-world"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-xl font-semibold transition shadow-lg shadow-purple-500/30"
        >
          <span>+</span> New World
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-400 animate-pulse">Loading your worlds...</div>
          </div>
        ) : worlds.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">🌌</div>
            <h2 className="text-2xl font-bold text-white mb-2">No worlds yet</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Every god starts somewhere. Create your first world and shape it exactly how you imagine it.
            </p>
            <Link
              to="/create-world"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-xl font-semibold text-lg transition shadow-lg shadow-purple-500/30"
            >
              ✨ Create Your First World
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {worlds.map((world) => (
              <div
                key={world.id}
                onClick={() => navigate(`/worlds/${world.id}`)}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 hover:bg-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
              >
                {/* Setting badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{SETTING_ICONS[world.setting] || "🌍"}</span>
                  <span className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">
                    {MODE_ICONS[world.experience_mode]} {world.experience_mode}
                  </span>
                </div>

                <h3 className="font-bold text-xl text-white mb-1 group-hover:text-purple-300 transition">
                  {world.name}
                </h3>
                {world.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{world.description}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Setting</span>
                    <p className="text-gray-200 font-medium">{world.setting}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Climate</span>
                    <p className="text-gray-200 font-medium">{world.climate}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Magic</span>
                    <p className="text-gray-200 font-medium">{world.magic_level}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Danger</span>
                    <p className={`font-medium ${DANGER_COLORS[world.danger_level]}`}>{world.danger_level}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${world.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {world.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(world.created_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <Link
              to="/create-world"
              className="flex flex-col items-center justify-center h-48 bg-white/3 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all duration-200 group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition">🌌</span>
              <span className="text-gray-400 font-medium group-hover:text-purple-300 transition">Create another world</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
