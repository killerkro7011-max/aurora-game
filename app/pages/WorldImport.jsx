import { useState, useEffect } from "react";
import { World } from "@/api/entities";

const PRESET_WORLDS = [
  {
    name: "Middle-earth",
    world_type: "Fantasy",
    setting: "Fantasy",
    climate: "Temperate",
    magic_level: "High",
    technology_level: "Medieval",
    danger_level: "High",
    population_density: "Low",
    description: "A realm of elves, dwarves, and hobbits. The fate of the One Ring hangs in balance.",
    lore: "Middle-earth is a world shaped by ancient powers and the rise and fall of civilizations.",
    factions: "The Fellowship, Gondor, Rohan, Elves, Dwarves, The Enemy",
    landmarks: "Rivendell, Moria, Lothlórien, Mordor, Helm's Deep, Minas Tirith",
    rules_of_nature: "Magic exists but is fading. Dragons, immortal beings, and ancient magic shape the world.",
    tone_themes: "epic, tragic, heroic",
  },
  {
    name: "The Continent (Witcher)",
    world_type: "Fantasy",
    setting: "Fantasy",
    climate: "Varied",
    magic_level: "High",
    technology_level: "Medieval",
    danger_level: "High",
    population_density: "Medium",
    description: "A war-torn world of monsters, magic, and moral ambiguity.",
    lore: "The Continent is threatened by the Wild Hunt and political intrigue. Monsters roam the land.",
    factions: "The Witchers, Northern Kingdoms, The Empire, Scoia'tael, Wild Hunt",
    landmarks: "Kaer Morhen, Novigrad, Oxenfurt Academy, White Orchard",
    rules_of_nature: "Wild magic, monsters evolved through magic, alchemy is powerful.",
    tone_themes: "dark, gritty, morally complex",
  },
  {
    name: "Arrakis (Dune)",
    world_type: "Sci-Fi",
    setting: "Sci-Fi",
    climate: "Desert",
    magic_level: "Medium",
    technology_level: "Advanced",
    danger_level: "Extreme",
    population_density: "Low",
    description: "A desert planet where spice controls destiny and political factions wage eternal war.",
    lore: "Arrakis is the only source of melange, the spice that extends life and enables prescience.",
    factions: "House Atreides, House Harkonnen, Emperor, Bene Gesserit, Fremen",
    landmarks: "Arrakeen, Sietch Tabr, Shield Wall, Polar Ice Caps",
    rules_of_nature: "Spice is currency and transcendence. Massive sandworms rule the deserts.",
    tone_themes: "political, epic, philosophical",
  },
  {
    name: "Yharnam (Bloodborne)",
    world_type: "Fantasy",
    setting: "Fantasy",
    climate: "Gothic",
    magic_level: "Very High",
    technology_level: "Victorian",
    danger_level: "Extreme",
    population_density: "Medium",
    description: "A gothic city consumed by a blood plague and haunted by cosmic horrors.",
    lore: "Ancient rituals and forbidden knowledge have opened doors to otherworldly beings.",
    factions: "Healing Church, Iosefka's Clinic, The Vileblood, Cainhurst Royalty",
    landmarks: "Central Yharnam, Cathedral Ward, Forbidden Woods, Nightmare Frontier",
    rules_of_nature: "Blood is both curse and transcendence. Beasts and cosmic entities stalk the night.",
    tone_themes: "horror, gothic, lovecraftian",
  },
  {
    name: "Milky Way (Mass Effect)",
    world_type: "Sci-Fi",
    setting: "Sci-Fi",
    climate: "Various",
    magic_level: "Low",
    technology_level: "Advanced",
    danger_level: "High",
    population_density: "High",
    description: "A vast galaxy of diverse species, ancient technology, and existential threats.",
    lore: "Reaper cycles have shaped galactic history. Ancient AI civilizations left behind powerful tech.",
    factions: "The Alliance, Citadel Council, Geth, Cerberus, Collectors",
    landmarks: "The Citadel, Noveria, Virmire, Tuchanka, Ilos",
    rules_of_nature: "Advanced AI, genetic engineering, ancient Precursor technology.",
    tone_themes: "epic, sci-fi, political",
  },
  {
    name: "Domains of Dread (Ravenloft)",
    world_type: "Fantasy",
    setting: "Fantasy",
    climate: "Dark",
    magic_level: "Very High",
    technology_level: "Medieval",
    danger_level: "Extreme",
    population_density: "Low",
    description: "A collection of cursed domains ruled by powerful dark lords, isolated from the world.",
    lore: "Dark lords are trapped in their domains by mysterious forces, eternally tormenting their lands.",
    factions: "Strahd's Court, The Vistani, Various Domain Rulers",
    landmarks: "Castle Ravenloft, Barovia, Dementlieu, The Shadowfell Border",
    rules_of_nature: "Powerful dark magic. The Mists separate domains from reality.",
    tone_themes: "horror, gothic, dark fantasy",
  },
  {
    name: "Shinobi World (Naruto)",
    world_type: "Fantasy",
    setting: "Fantasy",
    climate: "Varied",
    magic_level: "Very High",
    technology_level: "Medieval",
    danger_level: "High",
    population_density: "High",
    description: "A world of hidden ninja villages, chakra-based powers, and ancient prophecies.",
    lore: "Chakra flows through all living things. The Ten-Tails and prophecies shape history.",
    factions: "Hidden Villages (Leaf, Sand, Mist, Cloud, Stone), Akatsuki, Samurai",
    landmarks: "Konohagakure, Mount Rushmore, Hidden Leaf Village, Valley of the End",
    rules_of_nature: "Chakra enables jutsu. Tailed beasts and sacred artifacts shape the world.",
    tone_themes: "action, supernatural, epic",
  },
  {
    name: "Elantris (Mistborn/Cosmere)",
    world_type: "Fantasy",
    setting: "Fantasy",
    climate: "Varied",
    magic_level: "Very High",
    technology_level: "Medieval",
    danger_level: "Medium",
    population_density: "Medium",
    description: "A world where metal-based magic powers warriors and rogues, with ancient secrets.",
    lore: "Allomancy fuels a rigid class system. Immortal beings and ancient powers linger.",
    factions: "The Final Empire, The Skaa, The Nobility, Kelsier's Crew",
    landmarks: "Luthadel, Urteau, Fadrex City, The Ashmounts",
    rules_of_nature: "Burning metals grants Allomantic powers. Ash falls from the sky.",
    tone_themes: "epic, dark, revolutionary",
  },
];

const WORLD_FIELDS = [
  { label: "World Name", key: "name", type: "text", required: true },
  { label: "World Type", key: "world_type", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Post-Apocalyptic", "Ancient", "Custom"], required: true },
  { label: "Status", key: "status", type: "select", options: ["Draft", "Active", "Archived"], required: true },
  { label: "Description", key: "description", type: "textarea", required: true },
  { label: "Setting", key: "setting", type: "text", required: false },
  { label: "Climate", key: "climate", type: "text", required: false },
  { label: "Magic Level", key: "magic_level", type: "select", options: ["None", "Low", "Medium", "High", "Very High"], required: false },
  { label: "Technology Level", key: "technology_level", type: "select", options: ["Stone Age", "Medieval", "Victorian", "Modern", "Advanced"], required: false },
  { label: "Danger Level", key: "danger_level", type: "select", options: ["Peaceful", "Low", "Medium", "High", "Extreme"], required: false },
  { label: "Population Density", key: "population_density", type: "select", options: ["Very Low", "Low", "Medium", "High", "Very High"], required: false },
  { label: "Experience Mode", key: "experience_mode", type: "select", options: ["Narrative", "Visual", "Both"], required: false },
  { label: "Lore", key: "lore", type: "textarea", required: false },
  { label: "Factions", key: "factions", type: "textarea", required: false },
  { label: "Landmarks", key: "landmarks", type: "textarea", required: false },
  { label: "Rules of Nature", key: "rules_of_nature", type: "textarea", required: false },
  { label: "Cover Image URL", key: "cover_image", type: "text", required: false },
  { label: "Echo Narrative URL", key: "echo_narrative_story_url", type: "text", required: false },
];

export default function WorldImport() {
  const [tab, setTab] = useState("known");
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importedWorlds, setImportedWorlds] = useState(new Set());
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load existing worlds
  useEffect(() => {
    fetchWorlds();
  }, []);

  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const data = await World.list({ limit: 100 });
      setWorlds(data);
      const imported = new Set(data.map(w => w.name));
      setImportedWorlds(imported);
    } catch (error) {
      console.error("Failed to load worlds:", error);
    }
    setLoading(false);
  };

  const handleImportPreset = async (preset) => {
    setLoading(true);
    setFormError("");
    setSuccessMsg("");
    try {
      await World.create(preset);
      setImportedWorlds(new Set([...importedWorlds, preset.name]));
      setSuccessMsg(`✅ "${preset.name}" imported successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchWorlds();
    } catch (error) {
      setFormError(`❌ Failed to import: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCustomImport = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    // Validate required fields
    const missingFields = WORLD_FIELDS.filter(f => f.required && !formData[f.key]).map(f => f.label);
    if (missingFields.length > 0) {
      setFormError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      await World.create(formData);
      setSuccessMsg(`✅ World "${formData.name}" created successfully!`);
      setFormData({});
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchWorlds();
    } catch (error) {
      setFormError(`❌ Failed to create world: ${error.message}`);
    }
    setLoading(false);
  };

  const handleDeleteWorld = async (worldId) => {
    if (confirm("Are you sure? This cannot be undone.")) {
      setLoading(true);
      try {
        await World.delete(worldId);
        setSuccessMsg("✅ World deleted.");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchWorlds();
      } catch (error) {
        setFormError(`❌ Failed to delete: ${error.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>🌍</span> Import Worlds
          </h1>
          <p className="text-gray-400 text-sm mt-1">Load preset worlds or create custom ones</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Messages */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{successMsg}</div>
        )}
        {formError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{formError}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setTab("known")}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              tab === "known"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            📚 Known Worlds
          </button>
          <button
            onClick={() => setTab("custom")}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              tab === "custom"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            ✨ Custom Import
          </button>
        </div>

        {/* Known Worlds Tab */}
        {tab === "known" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {PRESET_WORLDS.map((preset) => (
                <div
                  key={preset.name}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 hover:bg-white/8 transition-all"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{preset.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{preset.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-gray-500">Magic</span>
                      <p className="text-gray-300">{preset.magic_level}</p>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-gray-500">Danger</span>
                      <p className="text-gray-300">{preset.danger_level}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportPreset(preset)}
                    disabled={loading || importedWorlds.has(preset.name)}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      importedWorlds.has(preset.name)
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white cursor-pointer"
                    }`}
                  >
                    {importedWorlds.has(preset.name) ? "✓ Imported" : "Import"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Import Tab */}
        {tab === "custom" && (
          <form onSubmit={handleCustomImport} className="max-w-3xl bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WORLD_FIELDS.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder={field.label}
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt} className="bg-gray-900">
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      rows="3"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "✨ Create World"}
            </button>
          </form>
        )}

        {/* Existing Worlds Table */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">📚 All Worlds</h2>
          {loading && worlds.length === 0 ? (
            <p className="text-gray-400">Loading...</p>
          ) : worlds.length === 0 ? (
            <p className="text-gray-400">No worlds yet. Import or create one above.</p>
          ) : (
            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Danger</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {worlds.map((world) => (
                    <tr key={world.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="px-4 py-3">{world.name}</td>
                      <td className="px-4 py-3 text-gray-400">{world.world_type}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          world.danger_level === "Extreme" ? "bg-red-500/20 text-red-300" :
                          world.danger_level === "High" ? "bg-orange-500/20 text-orange-300" :
                          "bg-green-500/20 text-green-300"
                        }`}>
                          {world.danger_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          world.status === "Active" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"
                        }`}>
                          {world.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteWorld(world.id)}
                          className="text-red-400 hover:text-red-300 font-semibold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
