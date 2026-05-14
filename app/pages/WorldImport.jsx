import { useState, useEffect } from "react";
import { World } from "@/api/entities";

const PRESET_WORLDS = [
  {
    name: "Middle-earth",
    world_type: "known",
    status: "Active",
    setting: "A mythological ancient age of elves, dwarves, hobbits, and men. Sauron's shadow grows.",
    climate: "Temperate — rolling hills, ancient forests, volcanic wastelands near Mordor.",
    magic_level: "High",
    technology_level: "Medieval",
    danger_level: "High",
    population_density: "Low",
    description: "A realm of deep history and fading magic. The One Ring must be destroyed before Sauron reclaims dominion over all free peoples.",
    lore: "Shaped by the Valar and Eru Ilúvatar. Three ages of war. The Rings of Power bind the great lords. Prophecy of the Ringbearer. Entry point: The One Ring has been found by a hobbit in the Shire.",
    factions: "The Fellowship | Gondor | Rohan | Rivendell Elves | Lothlórien | Moria Dwarves | Mordor | Isengard | Sauron's forces",
    landmarks: "The Shire | Rivendell | Khazad-dûm (Moria) | Lothlórien | Helm's Deep | Minas Tirith | Mount Doom | Isengard | Weathertop",
    rules_of_nature: "Magic is woven into ancient bloodlines and artifacts. Balrogs and dragons are real. Death can be reversed by Valar intervention. The One Ring corrupts all who hold it.",
    experience_mode: "Epic high fantasy. Canon events are starting conditions — player can change the fate of the Ring.",
  },
  {
    name: "The Continent (Witcher)",
    world_type: "known",
    status: "Active",
    setting: "War-torn medieval Europe analog. Monsters are real, magic is feared, and no one is truly good.",
    climate: "Varied — temperate forests, frozen north, war-scorched plains.",
    magic_level: "High",
    technology_level: "Medieval",
    danger_level: "High",
    population_density: "Medium",
    description: "A gritty world of moral ambiguity. Witchers are mutant monster hunters feared and needed in equal measure. Political powers clash while the Wild Hunt closes in.",
    lore: "Conjunction of the Spheres brought monsters to the world. Witchers were created to fight them. Ciri is the child of the Elder Blood — her power can reshape reality. The White Frost threatens all worlds.",
    factions: "The Witchers (School of the Wolf) | Northern Kingdoms | Nilfgaardian Empire | Scoia'tael (elven rebels) | The Wild Hunt | Lodge of Sorceresses | Church of the Eternal Fire",
    landmarks: "Kaer Morhen | Novigrad | Oxenfurt | Vizima | White Orchard | Skellige Isles | Toussaint | Cintra",
    rules_of_nature: "Chaos magic requires sacrifice. Alchemy and mutagens alter the body. Witcher mutations grant enhanced senses and immunity to most disease. Portals are unstable.",
    experience_mode: "Dark moral fantasy. Canon characters active. Player can align with any faction or carve their own path.",
  },
  {
    name: "Arrakis (Dune)",
    world_type: "known",
    status: "Active",
    setting: "A barren desert planet — the only source of the Spice Melange in the known universe.",
    climate: "Extreme desert. No open water. Sandworms patrol the deep desert.",
    magic_level: "Medium",
    technology_level: "Advanced",
    danger_level: "Extreme",
    population_density: "Low",
    description: "Spice controls everything — interstellar travel, prescience, extended life. Whoever controls Arrakis controls the universe. Entry point: House Atreides has just arrived.",
    lore: "The Butlerian Jihad banned thinking machines. The Bene Gesserit bred Paul Atreides as the Kwisatz Haderach. Fremen follow the prophecy of Muad'Dib. The Spice must flow.",
    factions: "House Atreides | House Harkonnen | The Padishah Emperor | Bene Gesserit | Spacing Guild | Fremen | CHOAM",
    landmarks: "Arrakeen | Giedi Prime orbit | Sietch Tabr | The Shield Wall | Polar Ice Caps | The Erg (open desert)",
    rules_of_nature: "Water is more precious than spice. Stillsuits are mandatory in the desert. Sandworms are drawn to rhythmic vibration. Spice extends life and grants limited prescience.",
    experience_mode: "Political epic. Canon events are the starting state — player can accelerate, prevent, or redirect Paul's rise.",
  },
  {
    name: "Shadow Slave — The Dream Realm",
    world_type: "known",
    status: "Active",
    setting: "Contemporary dystopian Earth + the Dream Realm — a vast ruined magical dimension connected through Gates.",
    climate: "Forgotten Shore: desolate crimson sea, black earth, grey sky. Chained Isles: floating rock above infinite void. Godgrave: landscape of dead gods' bones.",
    magic_level: "High",
    technology_level: "Medium",
    danger_level: "Extreme",
    population_density: "Billions of humans, millions infected, thousands of Awakened.",
    description: "The Nightmare Spell infects humans and drags them into the Dream Realm. Survive and become Awakened — gifted with a unique Aspect and bound to increasingly deadly Nightmares. Entry point: Sunny has just been infected. His First Nightmare begins on the Forgotten Shore tonight.",
    lore: "RANKS: Dormant > Awakened > Ascended > Transcendent > Saint > Master. Soul Classes: Monster>Demon>Devil>Tyrant>Terror>Titan. SUNNY: Shadow Aspect, Slave curse, casts no shadow. NEPHIS: Immortal Flame. CASSIE: Oracle, blind seer. MORDRET: Ancient soul-parasite, sleeper threat hidden within the cohort.",
    factions: "THE COHORT: Sunny | Nephis | Cassie | Effie | Kai. GREAT CLANS: Immortal Flame | House of Night | Song Clan | Valor Clan. GOVERNMENT / Evacuation Army. MORDRET (hidden).",
    landmarks: "Forgotten Shore | Crimson Spire | Chained Isles | Night Garden | Antarctica Dream Realm | Godgrave",
    rules_of_nature: "1. Nightmare death = real death. 2. Completing a Nightmare opens a Gate home. 3. Shadow Fragments only from worthy kills. 4. Aspects are unchangeable after awakening. 5. Mordret's soul-combat is invisible to normal senses. 6. The Spell cannot be refused. 7. Cassie's visions are true but easily misread.",
    experience_mode: "Dark progression fantasy. Canon runs parallel. Player can join, betray, or transcend the cohort.",
  },
  {
    name: "Milky Way (Mass Effect)",
    world_type: "known",
    status: "Active",
    setting: "A galaxy of dozens of species, ancient AI civilizations, and an extinction cycle running for millions of years.",
    climate: "Various — each planet unique. The Citadel is the political and cultural hub.",
    magic_level: "Low",
    technology_level: "Advanced",
    danger_level: "High",
    population_density: "High",
    description: "Reaper cycles have harvested advanced civilizations every 50,000 years. The Protheans are gone. Shepard is humanity's first Spectre. The Reapers are returning. Entry point: The Normandy has just been commissioned.",
    lore: "Mass Effect fields enable FTL travel. Biotics manipulate dark energy. The Prothean beacons contain fragmented warnings. Cerberus operates in the shadows. The Illusive Man believes humanity must control the Reapers, not destroy them.",
    factions: "Alliance Military | Citadel Council | Cerberus | Geth | Quarian Fleet | Krogan Clans | Salarian STG | Asari Commandos | Shadow Broker Network | Collectors",
    landmarks: "The Citadel | Normandy SR-2 | Eden Prime | Noveria | Virmire | Tuchanka | Ilos | Omega | Horizon",
    rules_of_nature: "FTL via mass relays. Biotics require implants and training. AI is strictly regulated post-Geth uprising. Reaper indoctrination warps the mind slowly.",
    experience_mode: "Sci-fi epic. Player can be Shepard or an original operative. Canon events are the starting state.",
  },
  {
    name: "Yharnam (Bloodborne)",
    world_type: "known",
    status: "Active",
    setting: "A gothic Victorian city consumed by a blood plague, where night never ends and cosmic horrors bleed through reality.",
    climate: "Perpetual rainy gothic night. Fog-drenched streets and crumbling cathedrals.",
    magic_level: "Very High",
    technology_level: "Victorian",
    danger_level: "Extreme",
    population_density: "Medium",
    description: "Yharnam's blood heals all ailments — but prolonged use triggers beasthood. The Hunt never ends. The Healing Church knows the truth and buries it. Entry point: You have just arrived by carriage, seeking the blood cure.",
    lore: "The Pthumerian civilization discovered the Great Ones in the Chalice Dungeons. The Healing Church weaponized Old Blood. Rom the Vacuous Spider maintains the veil of ignorance. Mergo's Wet Nurse guards a dead god's infant. The Nightmare is a prison and a testing ground.",
    factions: "Healing Church | Hunter Workshop | Cainhurst Vilebloods | Choir (Church's inner circle) | School of Mensis | Iosefka's Clinic | The Doll (Hunters Dream)",
    landmarks: "Central Yharnam | Cathedral Ward | Old Yharnam | Forbidden Woods | Byrgenwerth | Nightmare Frontier | Cainhurst Castle | Research Hall | Fishing Hamlet",
    rules_of_nature: "Insight reveals the truth — and drives you mad. Beasts are stronger in the Hunt's darkest hours. Baptism of fire cleanses beast blood. The Great Ones seek surrogate children. Death in the dream returns you — eventually.",
    experience_mode: "Cosmic horror. The truth is worse than the beasts. Player uncovers the city's secrets while surviving the night.",
  },
  {
    name: "Domains of Dread (Ravenloft)",
    world_type: "known",
    status: "Active",
    setting: "A collection of isolated demi-planes — Domains — each ruled by a Dark Lord imprisoned by the Dark Powers.",
    climate: "Each domain has its own oppressive climate. Barovia: perpetual grey mist and autumn decay.",
    magic_level: "Very High",
    technology_level: "Medieval",
    danger_level: "Extreme",
    population_density: "Low",
    description: "The Mists pull the worthy — and the damned — into the Domains of Dread. Each Dark Lord is trapped in an ironic prison of their own evil, forced to watch their obsession remain forever out of reach. Entry point: You have been drawn through the Mists into Barovia.",
    lore: "Strahd Von Zarovich was the first Dark Lord — he murdered his brother for Tatyana, who chose death over him. Now she reincarnates endlessly and always flees him. The Dark Powers are unknowable. Escape from a Domain is nearly impossible. The Vistani travel freely through the Mists.",
    factions: "Strahd's Court | The Vistani | Church of the Morninglord | The Order of the Guardians | Ezra's Faith | Various Domain Lords (Darklords of each realm)",
    landmarks: "Castle Ravenloft | Village of Barovia | Tser Pool | Amber Temple | Lake Zarovich | Krezk | Argynvostholt | Death House",
    rules_of_nature: "The Dark Powers watch and grant power to the corrupt. Resurrection is unreliable in the Domains. The Mists respond to the Dark Powers' will. Holy symbols work only if faith is genuine. Lycanthropy and vampirism spread easily.",
    experience_mode: "Gothic horror. The Domains trap and torment. Player can seek escape, challenge the Dark Lords, or risk becoming one themselves.",
  },
  {
    name: "Shinobi World (Naruto)",
    world_type: "known",
    status: "Active",
    setting: "A world of hidden ninja villages where chakra-based powers shape politics, war, and destiny.",
    climate: "Varied — Fire Country's forests, Sand's desert, Rain's perpetual storms, Snow's frozen peaks.",
    magic_level: "Very High",
    technology_level: "Medieval",
    danger_level: "High",
    population_density: "High",
    description: "Chakra flows through all living things. The Five Great Nations maintain a fragile peace through mutually assured destruction. The Akatsuki moves in the shadows, collecting Tailed Beasts. Entry point: You are a genin in the Hidden Leaf. The Chunin Exams are beginning.",
    lore: "The Sage of Six Paths split the Ten-Tails into nine Tailed Beasts and distributed them as jinchuriki. Madara Uchiha and Hashirama Senju shaped the current world order. The Uchiha Massacre is recent history. Orochimaru experiments on children. Pain destroyed the Leaf.",
    factions: "Hidden Leaf (Konohagakure) | Hidden Sand | Hidden Mist | Hidden Cloud | Hidden Stone | Akatsuki | Root (ANBU black ops) | Sage communities | Tailed Beast jinchuriki",
    landmarks: "Konohagakure | Valley of the End | The Forest of Death | Hokage Rock | Sunagakure | Amegakure | Otogakure | Mount Myoboku",
    rules_of_nature: "Chakra requires training to control. Bloodline limits (Kekkei Genkai) are inherited. Tailed Beasts can be extracted — killing the host. Edo Tensei can resurrect the dead but binds their will. Shadow Clone jutsu splits chakra dangerously.",
    experience_mode: "Progression action. Canon characters active as rivals and allies. Player can pursue any ninja path — shinobi, sage, jinchuriki.",
  },
];

const WORLD_FIELDS = [
  { label: "World Name", key: "name", type: "text", required: true },
  { label: "World Type", key: "world_type", type: "select", options: ["known", "custom", "event", "continent"], required: true },
  { label: "Status", key: "status", type: "select", options: ["active", "draft", "archived"], required: true },
  { label: "Description", key: "description", type: "textarea", required: true },
  { label: "Setting", key: "setting", type: "textarea", required: false },
  { label: "Climate", key: "climate", type: "text", required: false },
  { label: "Magic Level", key: "magic_level", type: "select", options: ["None", "Low", "Medium", "High", "Very High"], required: false },
  { label: "Technology Level", key: "technology_level", type: "select", options: ["Stone Age", "Medieval", "Victorian", "Modern", "Medium", "Advanced"], required: false },
  { label: "Danger Level", key: "danger_level", type: "select", options: ["Peaceful", "Low", "Medium", "High", "Extreme"], required: false },
  { label: "Population Density", key: "population_density", type: "text", required: false },
  { label: "Experience Mode", key: "experience_mode", type: "textarea", required: false },
  { label: "Lore", key: "lore", type: "textarea", required: false },
  { label: "Factions", key: "factions", type: "textarea", required: false },
  { label: "Landmarks", key: "landmarks", type: "textarea", required: false },
  { label: "Rules of Nature", key: "rules_of_nature", type: "textarea", required: false },
  { label: "Cover Image URL", key: "cover_image", type: "text", required: false },
  { label: "Echo Narrative URL", key: "echo_narrative_story_url", type: "text", required: false },
  { label: "Continent Position", key: "continent_position", type: "text", required: false },
  { label: "Player Count", key: "player_count", type: "text", required: false },
];

const DANGER_COLORS = {
  Peaceful: "text-green-400 bg-green-400/10",
  Low: "text-blue-400 bg-blue-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  High: "text-orange-400 bg-orange-400/10",
  Extreme: "text-red-400 bg-red-400/10",
};

const MAGIC_COLORS = {
  None: "text-gray-400 bg-gray-400/10",
  Low: "text-blue-300 bg-blue-300/10",
  Medium: "text-purple-300 bg-purple-300/10",
  High: "text-purple-400 bg-purple-400/10",
  "Very High": "text-pink-400 bg-pink-400/10",
};

export default function WorldImport() {
  const [tab, setTab] = useState("known");
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [importedWorlds, setImportedWorlds] = useState(new Set());
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingWorld, setEditingWorld] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { fetchWorlds(); }, []);

  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const data = await World.list();
      setWorlds(data);
      setImportedWorlds(new Set(data.map(w => w.name)));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const flash = (msg, isError = false) => {
    if (isError) setFormError(msg); else setSuccessMsg(msg);
    setTimeout(() => { setFormError(""); setSuccessMsg(""); }, 3500);
  };

  const WORLD_ENTITY_KEYS = ["name","description","setting","climate","magic_level","technology_level","danger_level","population_density","lore","factions","landmarks","rules_of_nature","experience_mode","status","cover_image","world_type","continent_position","player_count","echo_narrative_story_url"];

  const handleImportPreset = async (preset) => {
    setImporting(preset.name);
    try {
      // Strip any non-entity keys before creating
      const clean = {};
      WORLD_ENTITY_KEYS.forEach(k => { if (preset[k] !== undefined) clean[k] = preset[k]; });
      await World.create(clean);
      setImportedWorlds(prev => new Set([...prev, preset.name]));
      flash(`✅ "${preset.name}" imported successfully!`);
      fetchWorlds();
    } catch (e) { flash(`❌ ${e.message || JSON.stringify(e)}`, true); }
    setImporting(null);
  };

  const handleCustomImport = async (e) => {
    e.preventDefault();
    setFormError(""); setSuccessMsg("");
    const missing = WORLD_FIELDS.filter(f => f.required && !formData[f.key]).map(f => f.label);
    if (missing.length) { flash(`Missing required fields: ${missing.join(", ")}`, true); return; }
    setLoading(true);
    try {
      await World.create(formData);
      flash(`✅ World "${formData.name}" created!`);
      setFormData({});
      fetchWorlds();
    } catch (e) { flash(`❌ ${e.message}`, true); }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await World.delete(id);
      flash(`✅ "${name}" deleted.`);
      fetchWorlds();
    } catch (e) { flash(`❌ ${e.message}`, true); }
    setLoading(false);
  };

  const openEdit = (w) => { setEditingWorld(w.id); setEditData({ ...w }); };
  const closeEdit = () => { setEditingWorld(null); setEditData({}); };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await World.update(editingWorld, editData);
      flash(`✅ "${editData.name}" updated.`);
      closeEdit();
      fetchWorlds();
    } catch (e) { flash(`❌ ${e.message}`, true); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">🌍 World Import</h1>
            <p className="text-gray-400 text-sm mt-1">Import preset worlds or create custom ones</p>
          </div>
          <div className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            {worlds.length} world{worlds.length !== 1 ? "s" : ""} in database
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Toast messages */}
        {successMsg && <div className="mb-6 p-4 bg-green-500/15 border border-green-500/40 rounded-xl text-green-300 text-sm">{successMsg}</div>}
        {formError && <div className="mb-6 p-4 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-sm">{formError}</div>}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {[["known", "📚 Known Worlds"], ["custom", "✨ Custom Import"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === key ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── KNOWN WORLDS ── */}
        {tab === "known" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PRESET_WORLDS.map((preset) => {
              const isImported = importedWorlds.has(preset.name);
              const isImporting = importing === preset.name;
              return (
                <div key={preset.name}
                  className={`relative flex flex-col bg-white/4 border rounded-xl p-5 transition-all ${isImported ? "border-purple-500/40 bg-purple-500/5" : "border-white/10 hover:border-purple-500/40 hover:bg-white/6"}`}>
                  {isImported && (
                    <span className="absolute top-3 right-3 text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full px-2 py-0.5 font-semibold">✓ Imported</span>
                  )}
                  <h3 className="text-base font-bold text-white mb-1 pr-16">{preset.name}</h3>
                  <p className="text-gray-400 text-xs mb-3 flex-1 line-clamp-3">{preset.description}</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MAGIC_COLORS[preset.magic_level] || "text-gray-400 bg-gray-400/10"}`}>
                      ✨ {preset.magic_level}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DANGER_COLORS[preset.danger_level] || "text-gray-400 bg-gray-400/10"}`}>
                      ⚔️ {preset.danger_level}
                    </span>
                  </div>
                  <button onClick={() => handleImportPreset(preset)}
                    disabled={isImported || isImporting}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition ${isImported ? "bg-gray-700/50 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"}`}>
                    {isImporting ? "Importing..." : isImported ? "✓ Imported" : "Import World"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CUSTOM IMPORT ── */}
        {tab === "custom" && (
          <form onSubmit={handleCustomImport} className="max-w-3xl">
            <div className="bg-white/4 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-6 text-white">Create Custom World</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {WORLD_FIELDS.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                      {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === "text" && (
                      <input type="text" value={formData[field.key] || ""}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                        placeholder={field.label} />
                    )}
                    {field.type === "select" && (
                      <select value={formData[field.key] || ""}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition">
                        <option value="">Select...</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                    {field.type === "textarea" && (
                      <textarea value={formData[field.key] || ""}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        rows={3} placeholder={field.label}
                        className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition resize-none" />
                    )}
                  </div>
                ))}
              </div>
              <button type="submit" disabled={loading}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition">
                {loading ? "Creating..." : "Create World"}
              </button>
            </div>
          </form>
        )}

        {/* ── WORLDS TABLE ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">All Worlds <span className="text-gray-500 text-sm font-normal">({worlds.length})</span></h2>
            <button onClick={fetchWorlds} className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition">
              ↺ Refresh
            </button>
          </div>

          {worlds.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white/3 border border-white/8 rounded-xl">
              No worlds yet. Import one above to get started.
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Danger</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Magic</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {worlds.map((w) => (
                    <tr key={w.id} className="hover:bg-white/3 transition">
                      <td className="px-4 py-3 font-medium text-white">{w.name}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell capitalize">{w.world_type || "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${DANGER_COLORS[w.danger_level] || "text-gray-400 bg-gray-400/10"}`}>
                          {w.danger_level || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${MAGIC_COLORS[w.magic_level] || "text-gray-400 bg-gray-400/10"}`}>
                          {w.magic_level || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${w.status === "active" ? "text-green-400 bg-green-400/10" : w.status === "draft" ? "text-yellow-400 bg-yellow-400/10" : "text-gray-400 bg-gray-400/10"}`}>
                          {w.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(w)}
                            className="text-xs text-blue-400 hover:text-blue-300 border border-blue-400/20 hover:border-blue-400/40 rounded px-2 py-1 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(w.id, w.name)}
                            className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 rounded px-2 py-1 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editingWorld && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-bold text-white">Edit: {editData.name}</h3>
              <button onClick={closeEdit} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORLD_FIELDS.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{field.label}</label>
                  {field.type === "text" && (
                    <input type="text" value={editData[field.key] || ""}
                      onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition" />
                  )}
                  {field.type === "select" && (
                    <select value={editData[field.key] || ""}
                      onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition">
                      <option value="">Select...</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  {field.type === "textarea" && (
                    <textarea value={editData[field.key] || ""}
                      onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                      rows={3}
                      className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition resize-none" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-5 justify-end">
              <button onClick={closeEdit} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg transition">Cancel</button>
              <button onClick={handleSaveEdit} disabled={loading}
                className="px-5 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
