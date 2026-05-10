import { useState, useEffect } from "react";
import { PlayerCharacter, World } from "@/api/entities";
import { useNavigate, useParams } from "react-router-dom";

const STEPS = [
  { id: "identity", label: "Identity", icon: "🧙" },
  { id: "origin", label: "Origin", icon: "📖" },
  { id: "abilities", label: "Abilities", icon: "⚡" },
  { id: "alignment", label: "Alignment", icon: "⚖️" },
];

const CLASSES = [
  { id: "Warrior", icon: "⚔️", desc: "Frontline fighter, built for battle" },
  { id: "Mage", icon: "🔮", desc: "Wielder of arcane power and knowledge" },
  { id: "Rogue", icon: "🗡️", desc: "Silent, cunning, strikes from the shadows" },
  { id: "Ranger", icon: "🏹", desc: "Hunter of the wild, one with nature" },
  { id: "Cleric", icon: "✝️", desc: "Servant of the divine, healer and guardian" },
  { id: "Bard", icon: "🎵", desc: "Storyteller, charmer, jack of all trades" },
  { id: "Paladin", icon: "🛡️", desc: "Holy warrior, righteousness in armor" },
  { id: "Necromancer", icon: "💀", desc: "Master of death and the undead" },
  { id: "Druid", icon: "🌿", desc: "Shapeshifter, protector of the natural world" },
  { id: "Custom", icon: "🎨", desc: "Define your own class entirely" },
];

const ALIGNMENTS = [
  { id: "Lawful Good", icon: "🌟", desc: "Honor and compassion above all" },
  { id: "Good", icon: "💛", desc: "Kind-hearted, does what's right" },
  { id: "Neutral", icon: "⚖️", desc: "Balanced, neither hero nor villain" },
  { id: "Chaotic Good", icon: "🔥", desc: "Does good, but plays by no one's rules" },
  { id: "True Neutral", icon: "🌫️", desc: "Indifferent to morality — pure survival" },
  { id: "Lawful Evil", icon: "👑", desc: "Power through order and control" },
  { id: "Chaotic Evil", icon: "💀", desc: "Chaos and destruction, no remorse" },
  { id: "Evil", icon: "🖤", desc: "Self-serving, will harm others to get ahead" },
];

const ABILITY_SUGGESTIONS = [
  "Enhanced strength", "Night vision", "Fire resistance", "Telepathy",
  "Healing touch", "Shapeshifting", "Shadow walking", "Time slowing",
  "Dragon speech", "Invisibility", "Lightning speed", "Mind control",
  "Summon spirits", "Elemental control", "Prophecy sight", "Undying regeneration"
];

export default function CharacterCreator() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [world, setWorld] = useState(null);
  const [customClass, setCustomClass] = useState("");
  const [selectedAbilities, setSelectedAbilities] = useState([]);
  const [customAbility, setCustomAbility] = useState("");

  const [character, setCharacter] = useState({
    name: "",
    world_id: worldId || "",
    class: "",
    backstory: "",
    abilities: "",
    inventory: "A worn travel pack, a small journal, basic rations",
    current_location: "Starting Village",
    health: 100,
    level: 1,
    experience: 0,
    alignment: "",
    status: "Active",
  });

  useEffect(() => {
    if (worldId) {
      World.get(worldId).then(setWorld).catch(() => {});
    }
  }, [worldId]);

  const update = (field, value) => setCharacter((prev) => ({ ...prev, [field]: value }));

  const toggleAbility = (ability) => {
    setSelectedAbilities((prev) =>
      prev.includes(ability) ? prev.filter((a) => a !== ability) : [...prev, ability]
    );
  };

  const addCustomAbility = () => {
    if (customAbility.trim() && !selectedAbilities.includes(customAbility.trim())) {
      setSelectedAbilities((prev) => [...prev, customAbility.trim()]);
      setCustomAbility("");
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return character.name.trim().length > 0 && character.class.length > 0;
    if (currentStep === 3) return character.alignment.length > 0;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    const allAbilities = selectedAbilities.join(", ");
    const finalClass = character.class === "Custom" ? customClass || "Custom" : character.class;
    try {
      const created = await PlayerCharacter.create({
        ...character,
        class: finalClass,
        abilities: allAbilities,
        world_id: worldId,
      });
      navigate(`/worlds/${worldId}`);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/worlds/${worldId}`)} className="text-gray-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">Character Creator</h1>
            {world && <p className="text-xs text-indigo-400">Entering: {world.name}</p>}
          </div>
        </div>
        {character.name && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Creating</p>
            <p className="font-semibold text-indigo-300">{character.name}</p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all
                ${i === currentStep ? "bg-indigo-600 text-white font-semibold" :
                  i < currentStep ? "bg-indigo-900/50 text-indigo-300 cursor-pointer hover:bg-indigo-800/50" :
                  "bg-white/5 text-gray-500 cursor-default"}`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{step.icon}</span>
            <h2 className="text-2xl font-bold">{step.label}</h2>
          </div>
          <p className="text-gray-400 text-sm">Step {currentStep + 1} of {STEPS.length}</p>
        </div>

        {/* Step 0 — Identity */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Character Name *</label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="What is your name, traveler?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3 font-medium">Choose Your Class *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => update("class", cls.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${character.class === cls.id
                        ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/20"
                        : "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-white/10"
                      }`}
                  >
                    <span className="text-2xl">{cls.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{cls.id}</p>
                      <p className="text-xs text-gray-400">{cls.desc}</p>
                    </div>
                    {character.class === cls.id && (
                      <span className="ml-auto text-indigo-400 text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {character.class === "Custom" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Name your custom class..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — Origin / Backstory */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Backstory</label>
              <p className="text-xs text-gray-500 mb-2">Where did you come from? What drives you?</p>
              <textarea
                value={character.backstory}
                onChange={(e) => update("backstory", e.target.value)}
                placeholder="You were born in a small village at the edge of the known world. The night everything burned, you were the only one who escaped..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Starting Location</label>
              <input
                type="text"
                value={character.current_location}
                onChange={(e) => update("current_location", e.target.value)}
                placeholder="Where do you begin your journey?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Starting Inventory</label>
              <textarea
                value={character.inventory}
                onChange={(e) => update("inventory", e.target.value)}
                placeholder="What do you carry with you?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Abilities */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <p className="text-gray-400 text-sm">Pick up to 5 abilities, or add your own. These shape how you interact with your world.</p>
            <div className="flex flex-wrap gap-2">
              {ABILITY_SUGGESTIONS.map((ability) => (
                <button
                  key={ability}
                  onClick={() => selectedAbilities.length < 5 || selectedAbilities.includes(ability) ? toggleAbility(ability) : null}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all
                    ${selectedAbilities.includes(ability)
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : selectedAbilities.length >= 5
                        ? "border-white/5 bg-white/3 text-gray-600 cursor-not-allowed"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-indigo-400/50"
                    }`}
                >
                  {selectedAbilities.includes(ability) ? "✓ " : ""}{ability}
                </button>
              ))}
            </div>

            {/* Custom ability */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customAbility}
                onChange={(e) => setCustomAbility(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomAbility()}
                placeholder="Add a custom ability..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              />
              <button
                onClick={addCustomAbility}
                disabled={selectedAbilities.length >= 5}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition"
              >
                Add
              </button>
            </div>

            {selectedAbilities.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">Your abilities ({selectedAbilities.length}/5)</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAbilities.map((a) => (
                    <span
                      key={a}
                      onClick={() => toggleAbility(a)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm cursor-pointer hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition"
                    >
                      {a} <span className="text-xs opacity-60">×</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Alignment */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Your moral compass. How do you move through the world?</p>
            <div className="grid grid-cols-1 gap-3">
              {ALIGNMENTS.map((align) => (
                <button
                  key={align.id}
                  onClick={() => update("alignment", align.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${character.alignment === align.id
                      ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-white/10"
                    }`}
                >
                  <span className="text-2xl">{align.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{align.id}</p>
                    <p className="text-xs text-gray-400">{align.desc}</p>
                  </div>
                  {character.alignment === align.id && (
                    <span className="text-indigo-400">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            {character.alignment && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4">
                <h3 className="font-bold text-indigo-300 mb-3 flex items-center gap-2">
                  🧙 Character Summary
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Name</div>
                  <div className="text-white font-medium">{character.name}</div>
                  <div className="text-gray-400">Class</div>
                  <div className="text-white">{character.class === "Custom" ? customClass || "Custom" : character.class}</div>
                  <div className="text-gray-400">Alignment</div>
                  <div className="text-white">{character.alignment}</div>
                  <div className="text-gray-400">Abilities</div>
                  <div className="text-white">{selectedAbilities.length > 0 ? selectedAbilities.join(", ") : "None selected"}</div>
                  <div className="text-gray-400">Starts at</div>
                  <div className="text-white">{character.current_location}</div>
                  <div className="text-gray-400">Health</div>
                  <div className="text-white">100 HP</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex-1 py-3 px-6 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition font-medium"
            >
              Back
            </button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition
                ${canProceed()
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
                }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !canProceed()}
              className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transition disabled:opacity-60"
            >
              {saving ? "Creating Character..." : "Enter the World"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
