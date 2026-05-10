import { useState, useEffect } from "react";
import { World, PlayerCharacter } from "@/api/entities";
import { Link, useParams, useNavigate } from "react-router-dom";

const SETTING_ICONS = {
  Fantasy: "🧙", "Sci-Fi": "🚀", Modern: "🏙️", "Post-Apocalyptic": "☢️", Ancient: "🏛️", Custom: "🎨"
};
const MAGIC_ICONS = { None: "🚫", Low: "✨", Medium: "⚡", High: "🔮", Unlimited: "🌌" };
const TECH_ICONS = { Primitive: "🪨", Medieval: "⚔️", Industrial: "⚙️", Modern: "💻", Futuristic: "🤖" };
const DANGER_ICONS = { Peaceful: "☮️", Low: "🛡️", Medium: "⚠️", High: "💀", Extreme: "☠️" };
const CLIMATE_ICONS = { Tropical: "🌴", Arctic: "❄️", Desert: "🏜️", Temperate: "🍃", Oceanic: "🌊", Mixed: "🌦️" };
const POPULATION_ICONS = { Empty: "🏜️", Sparse: "🏕️", Moderate: "🏘️", Dense: "🏙️", Overcrowded: "🌆" };

export default function WorldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPlayModal, setShowPlayModal] = useState(false);

  useEffect(() => {
    Promise.all([
      World.get(id),
      PlayerCharacter.filter({ world_id: id }),
    ]).then(([w, chars]) => {
      setWorld(w);
      setCharacters(chars);
      setLoading(false);
    });
  }, [id]);

  const handleEnterWorld = () => {
    if (characters.length === 0) {
      navigate(`/create-character/${id}`);
    } else if (characters.length === 1) {
      navigate(`/play/narrative/${id}/${characters[0].id}`);
    } else {
      setShowPlayModal(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 animate-pulse">
      Loading world...
    </div>
  );

  if (!world) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      World not found.
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: "🌍" },
    { id: "lore", label: "Lore", icon: "📜" },
    { id: "factions", label: "Factions", icon: "⚔️" },
    { id: "characters", label: "Characters", icon: "🧙" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Character Select Modal */}
      {showPlayModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Choose Your Character</h2>
            <p className="text-gray-400 text-sm mb-5">Who will you be in {world.name}?</p>
            <div className="space-y-3">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => navigate(`/play/narrative/${id}/${char.id}`)}
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 rounded-xl p-4 transition text-left"
                >
                  <span className="text-3xl">🧙</span>
                  <div>
                    <p className="font-bold text-white">{char.name}</p>
                    <p className="text-xs text-gray-400">{char.class} · Level {char.level} · {char.alignment}</p>
                  </div>
                  <span className="ml-auto text-purple-400">→</span>
                </button>
              ))}
              <button
                onClick={() => { setShowPlayModal(false); navigate(`/create-character/${id}`); }}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-xl p-3 text-gray-400 hover:text-purple-300 transition text-sm"
              >
                + Create new character
              </button>
            </div>
            <button
              onClick={() => setShowPlayModal(false)}
              className="mt-4 w-full text-gray-500 hover:text-white text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/worlds")} className="text-gray-400 hover:text-white transition">
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>{SETTING_ICONS[world.setting]}</span> {world.name}
          </h1>
          <p className="text-xs text-gray-400">{world.setting} · {world.experience_mode} Mode</p>
        </div>
        <button
          onClick={handleEnterWorld}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-xl font-semibold text-sm transition shadow-lg shadow-purple-500/20"
        >
          ▶ Enter World
        </button>
      </div>

      {/* Hero */}
      <div className="relative px-6 py-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <p className="text-5xl mb-4">{SETTING_ICONS[world.setting]}</p>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">{world.name}</h2>
        {world.description && (
          <p className="text-gray-400 max-w-xl mx-auto">{world.description}</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Climate", value: world.climate, icon: CLIMATE_ICONS[world.climate] },
            { label: "Magic", value: world.magic_level, icon: MAGIC_ICONS[world.magic_level] },
            { label: "Tech", value: world.technology_level, icon: TECH_ICONS[world.technology_level] },
            { label: "Danger", value: world.danger_level, icon: DANGER_ICONS[world.danger_level] },
            { label: "Pop.", value: world.population_density, icon: POPULATION_ICONS[world.population_density] },
            { label: "Characters", value: characters.length, icon: "🧙" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 max-w-3xl mx-auto">
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition
                ${activeTab === tab.id
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4 pb-10">
            {world.rules_of_nature && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-purple-300 mb-2 flex items-center gap-2">🌿 Rules of Nature</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{world.rules_of_nature}</p>
              </div>
            )}
            {!world.rules_of_nature && !world.lore && !world.factions && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📜</p>
                <p>Your world is still being shaped. Add lore, factions, and details to bring it to life.</p>
              </div>
            )}
            {/* Enter World CTA */}
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/20 border border-purple-700/30 rounded-2xl p-6 text-center mt-6">
              <p className="text-2xl mb-2">⚔️</p>
              <h3 className="font-bold text-white text-lg mb-1">Ready to enter?</h3>
              <p className="text-gray-400 text-sm mb-4">
                {characters.length === 0
                  ? "Create a character to begin your journey."
                  : `You have ${characters.length} character${characters.length > 1 ? "s" : ""} ready.`}
              </p>
              <button
                onClick={handleEnterWorld}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-xl font-bold text-white transition shadow-lg shadow-purple-500/20"
              >
                {characters.length === 0 ? "✨ Create Character" : "▶ Enter World"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "lore" && (
          <div className="space-y-4 pb-10">
            {world.lore ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2">📜 World History & Lore</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{world.lore}</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📜</p>
                <p>No lore written yet. Go back and edit your world to add history.</p>
              </div>
            )}
            {world.landmarks && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2">🏛️ Landmarks & Places</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{world.landmarks}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "factions" && (
          <div className="pb-10">
            {world.factions ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2">⚔️ Factions & Powers</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{world.factions}</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">⚔️</p>
                <p>No factions defined yet. Every world needs its power struggles.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "characters" && (
          <div className="pb-10">
            {characters.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">🧙</p>
                <p className="mb-4">No characters yet. Create one to enter this world.</p>
                <button
                  onClick={() => navigate(`/create-character/${world.id}`)}
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-xl text-white font-semibold transition"
                >
                  Create Character
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 transition"
                    onClick={() => navigate(`/play/narrative/${id}/${char.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🧙</span>
                      <div>
                        <h4 className="font-bold text-white">{char.name}</h4>
                        <p className="text-xs text-gray-400">{char.class} · Level {char.level}</p>
                      </div>
                      <span className="ml-auto text-xs text-purple-400">▶ Play</span>
                    </div>
                    {char.backstory && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{char.backstory}</p>
                    )}
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">HP: {char.health}</span>
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{char.alignment}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate(`/create-character/${world.id}`)}
                  className="flex flex-col items-center justify-center h-36 bg-white/3 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-purple-500/50 transition group"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition">🧙</span>
                  <span className="text-gray-400 font-medium group-hover:text-purple-300 transition text-sm">Create another character</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
