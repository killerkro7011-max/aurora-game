import { useState } from "react";
import { World } from "@/api/entities";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: "basics", label: "World Basics", icon: "🌍" },
  { id: "nature", label: "Nature & Climate", icon: "🌿" },
  { id: "society", label: "Society & Power", icon: "⚔️" },
  { id: "lore", label: "Lore & Landmarks", icon: "📜" },
  { id: "experience", label: "Experience Mode", icon: "✨" },
];

const SETTINGS = ["Fantasy", "Sci-Fi", "Modern", "Post-Apocalyptic", "Ancient", "Custom"];
const CLIMATES = ["Tropical", "Arctic", "Desert", "Temperate", "Oceanic", "Mixed"];
const MAGIC_LEVELS = ["None", "Low", "Medium", "High", "Unlimited"];
const TECH_LEVELS = ["Primitive", "Medieval", "Industrial", "Modern", "Futuristic"];
const DANGER_LEVELS = ["Peaceful", "Low", "Medium", "High", "Extreme"];
const POPULATION_DENSITIES = ["Empty", "Sparse", "Moderate", "Dense", "Overcrowded"];

const SETTING_ICONS = {
  Fantasy: "🧙", "Sci-Fi": "🚀", Modern: "🏙️", "Post-Apocalyptic": "☢️", Ancient: "🏛️", Custom: "🎨"
};
const CLIMATE_ICONS = {
  Tropical: "🌴", Arctic: "❄️", Desert: "🏜️", Temperate: "🍃", Oceanic: "🌊", Mixed: "🌦️"
};
const MAGIC_ICONS = {
  None: "🚫", Low: "✨", Medium: "⚡", High: "🔮", Unlimited: "🌌"
};
const TECH_ICONS = {
  Primitive: "🪨", Medieval: "⚔️", Industrial: "⚙️", Modern: "💻", Futuristic: "🤖"
};
const DANGER_ICONS = {
  Peaceful: "☮️", Low: "🛡️", Medium: "⚠️", High: "💀", Extreme: "☠️"
};
const POPULATION_ICONS = {
  Empty: "🏜️", Sparse: "🏕️", Moderate: "🏘️", Dense: "🏙️", Overcrowded: "🌆"
};

function SelectGrid({ options, value, onChange, icons }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
            ${value === opt
              ? "border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20 scale-105"
              : "border-white/10 bg-white/5 text-gray-300 hover:border-purple-400/50 hover:bg-white/10"
            }`}
        >
          <span className="text-2xl mb-1">{icons[opt]}</span>
          <span className="text-sm font-medium">{opt}</span>
        </button>
      ))}
    </div>
  );
}

function SliderField({ label, options, value, onChange, icons }) {
  const index = options.indexOf(value);
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-gray-400 font-medium">{label}</label>
        <span className="text-purple-300 font-semibold flex items-center gap-1">
          <span>{icons[value]}</span> {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={options.length - 1}
        value={index}
        onChange={(e) => onChange(options[parseInt(e.target.value)])}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
      />
      <div className="flex justify-between mt-1">
        {options.map((opt) => (
          <span key={opt} className="text-xs text-gray-500">{opt}</span>
        ))}
      </div>
    </div>
  );
}

export default function WorldCreator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [world, setWorld] = useState({
    name: "",
    description: "",
    setting: "Fantasy",
    climate: "Temperate",
    magic_level: "Medium",
    technology_level: "Medieval",
    danger_level: "Medium",
    population_density: "Moderate",
    lore: "",
    factions: "",
    landmarks: "",
    rules_of_nature: "",
    experience_mode: "Both",
    status: "Draft",
  });

  const update = (field, value) => setWorld((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (currentStep === 0) return world.name.trim().length > 0;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await World.create({ ...world, status: "Active" });
      navigate(`/worlds/${created.id}`);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌌</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">World Creator</h1>
            <p className="text-xs text-gray-400">Shape your universe</p>
          </div>
        </div>
        {world.name && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Creating</p>
            <p className="font-semibold text-purple-300">{world.name}</p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all
                ${i === currentStep ? "bg-purple-600 text-white font-semibold" :
                  i < currentStep ? "bg-purple-900/50 text-purple-300 cursor-pointer hover:bg-purple-800/50" :
                  "bg-white/5 text-gray-500 cursor-default"}`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{step.icon}</span>
            <h2 className="text-2xl font-bold">{step.label}</h2>
          </div>
          <p className="text-gray-400 text-sm">Step {currentStep + 1} of {STEPS.length}</p>
        </div>

        {/* Step 0 — Basics */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">World Name *</label>
              <input
                type="text"
                value={world.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Give your world a name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">World Description</label>
              <textarea
                value={world.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe your world in a few sentences. What makes it unique?"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">World Setting</label>
              <SelectGrid
                options={SETTINGS}
                value={world.setting}
                onChange={(v) => update("setting", v)}
                icons={SETTING_ICONS}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Nature & Climate */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Climate</label>
              <SelectGrid
                options={CLIMATES}
                value={world.climate}
                onChange={(v) => update("climate", v)}
                icons={CLIMATE_ICONS}
              />
            </div>
            <SliderField
              label="Magic Level"
              options={MAGIC_LEVELS}
              value={world.magic_level}
              onChange={(v) => update("magic_level", v)}
              icons={MAGIC_ICONS}
            />
            <SliderField
              label="Technology Level"
              options={TECH_LEVELS}
              value={world.technology_level}
              onChange={(v) => update("technology_level", v)}
              icons={TECH_ICONS}
            />
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Rules of Nature</label>
              <textarea
                value={world.rules_of_nature}
                onChange={(e) => update("rules_of_nature", e.target.value)}
                placeholder="What are the laws of physics, magic, or nature in this world? Can the dead rise? Does gravity work differently?"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Society & Power */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <SliderField
              label="Danger Level"
              options={DANGER_LEVELS}
              value={world.danger_level}
              onChange={(v) => update("danger_level", v)}
              icons={DANGER_ICONS}
            />
            <SliderField
              label="Population Density"
              options={POPULATION_DENSITIES}
              value={world.population_density}
              onChange={(v) => update("population_density", v)}
              icons={POPULATION_ICONS}
            />
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Factions & Powers</label>
              <textarea
                value={world.factions}
                onChange={(e) => update("factions", e.target.value)}
                placeholder="Who holds power in this world? Describe kingdoms, empires, gangs, guilds, factions, religions..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3 — Lore & Landmarks */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">World Lore</label>
              <textarea
                value={world.lore}
                onChange={(e) => update("lore", e.target.value)}
                placeholder="The history of your world. How did it come to be? What wars were fought? What legends are whispered?"
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Landmarks & Places</label>
              <textarea
                value={world.landmarks}
                onChange={(e) => update("landmarks", e.target.value)}
                placeholder="Name the important places. Ancient ruins, floating cities, forbidden forests, sacred temples..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4 — Experience Mode */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">How do you want to experience this world? You can always change this later.</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  id: "Visual",
                  icon: "🎮",
                  title: "Visual Mode",
                  desc: "Explore your world through a 2D/3D environment. Navigate, build, and interact visually.",
                },
                {
                  id: "Narrative",
                  icon: "📖",
                  title: "Narrative Mode",
                  desc: "Experience your world through rich text storytelling. Every action unfolds as a living story.",
                },
                {
                  id: "Both",
                  icon: "✨",
                  title: "Both Modes",
                  desc: "Get the best of both worlds — switch between visual and narrative at any time.",
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => update("experience_mode", mode.id)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200
                    ${world.experience_mode === mode.id
                      ? "border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/20"
                      : "border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10"
                    }`}
                >
                  <span className="text-3xl mt-0.5">{mode.icon}</span>
                  <div>
                    <p className="font-bold text-white">{mode.title}</p>
                    <p className="text-sm text-gray-400 mt-1">{mode.desc}</p>
                  </div>
                  {world.experience_mode === mode.id && (
                    <span className="ml-auto text-purple-400 text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <span>🌌</span> World Summary
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Name</div>
                <div className="text-white font-medium">{world.name || "—"}</div>
                <div className="text-gray-400">Setting</div>
                <div className="text-white">{SETTING_ICONS[world.setting]} {world.setting}</div>
                <div className="text-gray-400">Climate</div>
                <div className="text-white">{CLIMATE_ICONS[world.climate]} {world.climate}</div>
                <div className="text-gray-400">Magic</div>
                <div className="text-white">{MAGIC_ICONS[world.magic_level]} {world.magic_level}</div>
                <div className="text-gray-400">Tech</div>
                <div className="text-white">{TECH_ICONS[world.technology_level]} {world.technology_level}</div>
                <div className="text-gray-400">Danger</div>
                <div className="text-white">{DANGER_ICONS[world.danger_level]} {world.danger_level}</div>
                <div className="text-gray-400">Population</div>
                <div className="text-white">{POPULATION_ICONS[world.population_density]} {world.population_density}</div>
                <div className="text-gray-400">Mode</div>
                <div className="text-white">{world.experience_mode}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex-1 py-3 px-6 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition font-medium"
            >
              ← Back
            </button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition
                ${canProceed()
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
                }`}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 transition disabled:opacity-60"
            >
              {saving ? "Creating World..." : "✨ Create My World"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
