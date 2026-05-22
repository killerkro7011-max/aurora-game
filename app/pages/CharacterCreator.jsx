import { useState, useEffect } from "react";
import { PlayerCharacter, World } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { useNavigate, useParams } from "react-router-dom";

const STATS = ["STR","DEX","CON","INT","WIS","CHA","SMY"];
const BASE_STAT = 50;

const STAT_GRADE = (v) => {
  if (v >= 151) return "A";
  if (v >= 111) return "B";
  if (v >= 71)  return "C";
  if (v >= 41)  return "D";
  return "E";
};

const ORIGINS = [
  { id:"orphan", label:"Orphan", icon:"🏚️", desc:"Loss shaped you early. Self-reliance is bone-deep." },
  { id:"noble_exile", label:"Noble Exile", icon:"👑", desc:"You had everything, then lost it. Privilege and resentment war in you." },
  { id:"god_touched", label:"God-Touched", icon:"✨", desc:"Something divine noticed you. You're not sure if that's good." },
  { id:"cursed_lineage", label:"Cursed Lineage", icon:"🩸", desc:"Your blood carries a price. Power came with a cost already paid." },
  { id:"wanderer", label:"Wanderer", icon:"🌄", desc:"No roots. You've seen more than most, trusted less than most." },
  { id:"fallen_hero", label:"Fallen Hero", icon:"🗡️", desc:"You were great once. Something broke that. Now you rebuild." },
  { id:"chosen_one", label:"Chosen One", icon:"⚡", desc:"Prophecy found you. You're still deciding if you believe in it." },
  { id:"outcast_scholar", label:"Outcast Scholar", icon:"📚", desc:"Knowledge made you dangerous. They drove you out for it." },
  { id:"criminal_survivor", label:"Criminal Survivor", icon:"🎲", desc:"You did what it took. The world gave you no better options." },
  { id:"monster_kin", label:"Monster-Kin", icon:"🐺", desc:"Something inhuman runs in your veins. People sense it." },
  { id:"resurrected", label:"Resurrected", icon:"💀", desc:"You died once. What came back isn't quite what left." },
  { id:"the_forgotten", label:"The Forgotten", icon:"🌫️", desc:"No record of you exists. You exist outside the world's story." },
];

const FLAWS = [
  { id:"curiosity_without_caution", label:"Curiosity Without Caution", icon:"🔍", desc:"You cannot leave a mystery alone. Even dangerous ones. Especially dangerous ones." },
  { id:"cannot_lie", label:"Cannot Lie", icon:"⚖️", desc:"Compelled to truth. Even when silence would save you." },
  { id:"battle_hunger", label:"Battle Hunger", icon:"⚔️", desc:"You escalate. Every conflict risks becoming a fight." },
  { id:"price_of_power", label:"Price of Power", icon:"💸", desc:"Every major ability costs you something. Physically. Each use." },
  { id:"haunted", label:"Haunted", icon:"👻", desc:"The dead follow you. Sometimes just metaphorically." },
  { id:"overprotective", label:"Overprotective", icon:"🛡️", desc:"You'll sacrifice strategy for anyone you care about." },
  { id:"proud", label:"Unbreakable Pride", icon:"🦁", desc:"You cannot back down. Even when you should." },
  { id:"debt", label:"The Debt", icon:"📋", desc:"Someone owns a favor. They'll collect at the worst time." },
  { id:"the_addiction", label:"The Addiction", icon:"🌀", desc:"Something weakens your judgment. You keep going back." },
  { id:"glass_jaw", label:"Glass Jaw", icon:"💥", desc:"Exceptional in most ways. One stat is catastrophically low." },
];

const ALIGNMENTS = [
  { id:"Lawful Good", icon:"⚖️✨", desc:"Protect the innocent. Uphold the system. Even when it costs you." },
  { id:"Neutral Good", icon:"💚", desc:"Do what's right. Rules are a suggestion." },
  { id:"Chaotic Good", icon:"🔥💚", desc:"Freedom and goodness. The rules can get wrecked." },
  { id:"Lawful Neutral", icon:"⚖️", desc:"Order above all. You follow the law even when it's wrong." },
  { id:"True Neutral", icon:"⚪", desc:"Balance. You tip no scales." },
  { id:"Chaotic Neutral", icon:"🌀", desc:"Free agent. Principles are for people who don't adapt." },
  { id:"Lawful Evil", icon:"⚖️🖤", desc:"Power through structure. You use the system as a weapon." },
  { id:"Neutral Evil", icon:"🖤", desc:"Self-interest, purely. Everything else is negotiable." },
  { id:"Chaotic Evil", icon:"💀🔥", desc:"Destruction without structure. You are the chaos." },
];

const SURVIVAL_MODES = [
  { id:"story", label:"Story Mode", icon:"📖", desc:"Death suspended. Pure narrative experience." },
  { id:"standard", label:"Standard", icon:"⚔️", desc:"Death matters. Penalties on loss. Respawn available." },
  { id:"survival", label:"Survival", icon:"🌲", desc:"Hunger, thirst, and shelter tracked every turn." },
  { id:"ironman", label:"Ironman", icon:"🩸", desc:"Three deaths and you're done. For real." },
  { id:"nightmare", label:"Nightmare", icon:"💀", desc:"One death. No forgiveness. The world is hunting you." },
];

const POVS = [
  { id:"first", label:"First Person", icon:"👁️", desc:"I raise my blade... Intense, personal. SMY grows faster." },
  { id:"second", label:"Second Person", icon:"✨", desc:"You step forward... Balanced default. Good for most." },
  { id:"third", label:"Third Person", icon:"🎭", desc:"[Name] moves through shadows... Dramatic awareness. Great for faction stories." },
];

const STEPS = [
  { id:"basics", label:"Identity", icon:"🧬" },
  { id:"origin", label:"Origin", icon:"🌅" },
  { id:"flaw", label:"Flaw", icon:"💔" },
  { id:"race", label:"Race", icon:"🌿" },
  { id:"stats", label:"Stats", icon:"📊" },
  { id:"abilities", label:"Abilities", icon:"⚡" },
  { id:"alignment", label:"Alignment", icon:"⚖️" },
  { id:"survival", label:"Play Style", icon:"🎮" },
  { id:"review", label:"Review", icon:"📋" },
];

export default function CharacterCreator() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [world, setWorld] = useState(null);
  const [char, setChar] = useState({
    name:"", class:"", backstory:"", current_location:"",
    alignment:"", abilities:"", health:100, level:1, experience:0,
    origin:"", flaw:"", race:"", race_traits:"", pov:"second",
    survival_mode:"standard", progression_mode:"journey",
    stats: Object.fromEntries(STATS.map(s=>[s,BASE_STAT])),
    status:"Active",
  });
  const [customClass, setCustomClass] = useState("");
  const [selectedAbilities, setSelectedAbilities] = useState([]);
  const [abilityInput, setAbilityInput] = useState("");
  const [aiValidating, setAiValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [worldRaces, setWorldRaces] = useState([]);

  useEffect(()=>{
    if (worldId) {
      World.get(worldId).then(w => {
        setWorld(w);
        setChar(c => ({ ...c, current_location: w.landmarks?.split(",")[0]?.trim() || w.name }));
        // Parse races
        try {
          const races = JSON.parse(w.races || "[]");
          setWorldRaces(races.filter(r => r.playable !== false));
        } catch(e) {}
      });
    }
  }, [worldId]);

  const update = (field, val) => setChar(c => ({ ...c, [field]: val }));
  const updateStat = (stat, val) => setChar(c => ({ ...c, stats: { ...c.stats, [stat]: Math.max(10, Math.min(200, parseInt(val)||50)) }}));

  const validateAbility = async () => {
    if (!abilityInput.trim() || !world) return;
    setAiValidating(true); setValidation(null);
    try {
      const res = await InvokeLLM({
        prompt: `You are a lore consistency checker for the world "${world.name}". World setting: ${world.setting}. Magic: ${world.magic_level}. Tech: ${world.technology_level}. World laws: ${world.magic_law||world.rules_of_nature||"standard fantasy"}.\n\nThe player wants the ability: "${abilityInput}"\nCharacter class: "${char.class}"\n\nIs this ability consistent with the world lore? Reply JSON: {"valid":true/false,"reason":"...","suggested_tweak":"(if invalid, suggest a lore-consistent version or null)"}`,
        model: "gpt-4o-mini",
        response_json_schema: { type:"object", properties:{ valid:{type:"boolean"}, reason:{type:"string"}, suggested_tweak:{type:"string"} } }
      });
      setValidation(JSON.parse(res));
    } catch(e) { setValidation({ valid:true, reason:"Validation service unavailable — proceeding.", suggested_tweak:null }); }
    setAiValidating(false);
  };

  const addAbility = () => {
    const a = (validation?.suggested_tweak || abilityInput).trim();
    if (a && !selectedAbilities.includes(a)) {
      setSelectedAbilities(ab => [...ab, a]);
    }
    setAbilityInput(""); setValidation(null);
  };

  const handleSave = async () => {
    if (!char.name.trim() || !worldId) return;
    setSaving(true);
    try {
      const finalClass = char.class === "Custom" ? customClass || "Custom" : char.class;
      // Apply race stat bonus
      let finalStats = { ...char.stats };
      if (char.race_stat_bonus) {
        finalStats[char.race_stat_bonus] = Math.min(200, (finalStats[char.race_stat_bonus]||50) + 10);
      }
      const saved = await PlayerCharacter.create({
        ...char,
        world_id: worldId,
        class: finalClass,
        abilities: selectedAbilities.join(", "),
        stats: finalStats,
        inventoryItems: [],
        craftingSkills: [],
        gold: 10,
        charHP: 100,
        campaignSummary: "",
        npcs: [],
        quests: [],
        campaignTimeline: [],
        keyEvents: [],
        factionRep: {},
        worldTime: { day:1, month:1, year:1, hour:8 },
        survivalStats: { hunger:100, thirst:100, shelter:100 },
      });
      navigate(`/play/narrative/${worldId}/${saved.id}`);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const renderStep = () => {
    switch(STEPS[step]?.id) {

      case "basics": return (
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Character Name</label>
            <input value={char.name} onChange={e=>update("name",e.target.value)}
              placeholder="Who are you?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"/>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Class / Role</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {["Warrior","Mage","Rogue","Ranger","Cleric","Bard","Paladin","Custom"].map(c => (
                <button key={c} onClick={()=>update("class",c)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${char.class===c ? "border-purple-500 bg-purple-500/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-400/40"}`}>
                  {c}
                </button>
              ))}
            </div>
            {char.class === "Custom" && (
              <input value={customClass} onChange={e=>setCustomClass(e.target.value)}
                placeholder="Define your class..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm"/>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Backstory</label>
            <textarea value={char.backstory||""} onChange={e=>update("backstory",e.target.value)}
              rows={3} placeholder="What brought you here? What haunts you?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm resize-none"/>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Starting Location</label>
            <input value={char.current_location||""} onChange={e=>update("current_location",e.target.value)}
              placeholder={world?.landmarks?.split(",")[0]?.trim() || "Where do you begin?"}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm"/>
          </div>
        </div>
      );

      case "origin": return (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Your origin shapes how the world sees you — and how you see yourself. It creates real narrative consequences.</p>
          {ORIGINS.map(o => (
            <button key={o.id} onClick={()=>update("origin",o.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition ${char.origin===o.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-indigo-400/30"}`}>
              <span className="text-2xl mt-0.5">{o.icon}</span>
              <div>
                <p className="font-bold text-white text-sm">{o.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{o.desc}</p>
              </div>
              {char.origin===o.id && <span className="ml-auto text-indigo-400 mt-1">✓</span>}
            </button>
          ))}
          {char.origin && (
            <div className="mt-3">
              <label className="text-xs text-gray-400 mb-1 block">Add detail (optional)</label>
              <input value={char.origin_detail||""} onChange={e=>update("origin_detail",e.target.value)}
                placeholder="What specifically happened?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
          )}
        </div>
      );

      case "flaw": return (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Flaws are real gameplay mechanics — not flavor. The narrator will use yours to create complications, temptations, and consequences.</p>
          {FLAWS.map(f => (
            <button key={f.id} onClick={()=>update("flaw",f.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition ${char.flaw===f.id ? "border-red-500/60 bg-red-500/10" : "border-white/10 bg-white/5 hover:border-red-400/20"}`}>
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <p className="font-bold text-white text-sm">{f.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
              {char.flaw===f.id && <span className="ml-auto text-red-400 mt-1">✓</span>}
            </button>
          ))}
          {char.flaw && (
            <div className="mt-3">
              <label className="text-xs text-gray-400 mb-1 block">Personalize it (optional)</label>
              <input value={char.flaw_detail||""} onChange={e=>update("flaw_detail",e.target.value)}
                placeholder="How does this manifest for you specifically?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/50"/>
            </div>
          )}
        </div>
      );

      case "race": return (
        <div className="space-y-4">
          {worldRaces.length === 0 ? (
            <div>
              <p className="text-gray-400 text-sm mb-4">No races defined for this world. Enter your race manually.</p>
              <input value={char.race||""} onChange={e=>update("race",e.target.value)}
                placeholder="Your race/species..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"/>
              <input value={char.race_traits||""} onChange={e=>update("race_traits",e.target.value)}
                placeholder="Notable traits..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm mt-2"/>
            </div>
          ) : (
            <div className="space-y-3">
              {worldRaces.map((r,i) => (
                <button key={i} onClick={()=>{ update("race",r.name); update("race_traits",r.traits||""); update("race_stat_bonus",r.stat_bonus||""); }}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition ${char.race===r.name ? "border-green-500/60 bg-green-500/10" : "border-white/10 bg-white/5 hover:border-green-400/20"}`}>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{r.name}</p>
                    {r.description && <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>}
                    {r.traits && <p className="text-xs text-green-400 mt-1">Traits: {r.traits}</p>}
                    {r.stat_bonus && <p className="text-xs text-yellow-400 mt-0.5">+10 {r.stat_bonus}</p>}
                    {r.lifespan && <p className="text-xs text-gray-500 mt-0.5">Lifespan: {r.lifespan}</p>}
                  </div>
                  {char.race===r.name && <span className="text-green-400">✓</span>}
                </button>
              ))}
              <button onClick={()=>update("race","Custom")}
                className={`w-full py-3 rounded-xl border-2 text-sm text-gray-400 transition ${char.race==="Custom" ? "border-purple-500 bg-purple-500/10 text-white" : "border-dashed border-white/10 hover:border-white/20"}`}>
                + Enter custom race
              </button>
              {char.race==="Custom" && (
                <input value={char.race_traits||""} onChange={e=>update("race_traits",e.target.value)}
                  placeholder="Custom race name & traits..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"/>
              )}
            </div>
          )}
        </div>
      );

      case "stats": return (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Stats run 10-200. E (10-40) through A (151-200). Starting base is 50 each. Adjust to match your character concept.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">Total stat points: {Object.values(char.stats).reduce((a,b)=>a+b,0)}</p>
            {STATS.map(stat => (
              <div key={stat} className="flex items-center gap-4 mb-3">
                <span className="w-10 text-sm font-bold text-gray-300">{stat}</span>
                <input type="range" min={10} max={200} value={char.stats[stat]||50}
                  onChange={e=>updateStat(stat,e.target.value)}
                  className="flex-1 accent-purple-500"/>
                <span className="w-8 text-right text-sm text-white font-mono">{char.stats[stat]||50}</span>
                <span className={`w-5 text-xs font-bold ${{"A":"text-yellow-400","B":"text-green-400","C":"text-blue-400","D":"text-gray-400","E":"text-red-400"}[STAT_GRADE(char.stats[stat]||50)]}`}>
                  {STAT_GRADE(char.stats[stat]||50)}
                </span>
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Progression Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={()=>update("progression_mode","journey")}
                className={`p-3 rounded-xl border-2 text-sm text-left transition ${char.progression_mode==="journey" ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5 hover:border-purple-400/20"}`}>
                <div className="font-bold text-white">Journey</div>
                <div className="text-xs text-gray-400 mt-0.5">Stats grow through use. Organic mastery.</div>
              </button>
              <button onClick={()=>update("progression_mode","legend")}
                className={`p-3 rounded-xl border-2 text-sm text-left transition ${char.progression_mode==="legend" ? "border-yellow-500 bg-yellow-500/10" : "border-white/10 bg-white/5 hover:border-yellow-400/20"}`}>
                <div className="font-bold text-white">Legend</div>
                <div className="text-xs text-gray-400 mt-0.5">Static stats. No growth. Pure roleplay.</div>
              </button>
            </div>
          </div>
        </div>
      );

      case "abilities": return (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Your abilities will be validated against the world lore before adding.</p>
          <div className="flex gap-2">
            <input value={abilityInput} onChange={e=>{setAbilityInput(e.target.value); setValidation(null);}}
              onKeyDown={e=>e.key==="Enter"&&validateAbility()}
              placeholder="Name an ability..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"/>
            <button onClick={validateAbility} disabled={aiValidating||!abilityInput.trim()}
              className="bg-purple-600/60 border border-purple-500/40 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-500/60 transition disabled:opacity-50">
              {aiValidating?"...":"✦ Check"}
            </button>
          </div>
          {validation && (
            <div className={`rounded-xl p-4 border ${validation.valid ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}>
              <p className={`text-sm font-bold mb-1 ${validation.valid?"text-green-400":"text-red-400"}`}>{validation.valid?"✓ Lore consistent":"✗ Lore conflict"}</p>
              <p className="text-xs text-gray-300">{validation.reason}</p>
              {validation.suggested_tweak && <p className="text-xs text-yellow-300 mt-1">Suggested: <em>{validation.suggested_tweak}</em></p>}
              <button onClick={addAbility} className="mt-3 bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">
                {validation.suggested_tweak ? "Add tweaked version" : "Add anyway"}
              </button>
            </div>
          )}
          {selectedAbilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAbilities.map(a => (
                <span key={a} onClick={()=>setSelectedAbilities(ab=>ab.filter(x=>x!==a))}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm cursor-pointer hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition">
                  {a} <span className="text-xs opacity-60">×</span>
                </span>
              ))}
            </div>
          )}
        </div>
      );

      case "alignment": return (
        <div className="space-y-3">
          {ALIGNMENTS.map(a => (
            <button key={a.id} onClick={()=>update("alignment",a.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${char.alignment===a.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-indigo-400/30"}`}>
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{a.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
              </div>
              {char.alignment===a.id && <span className="text-indigo-400">✓</span>}
            </button>
          ))}
        </div>
      );

      case "survival": return (
        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Survival Mode</label>
            <div className="space-y-2">
              {SURVIVAL_MODES.map(m => (
                <button key={m.id} onClick={()=>update("survival_mode",m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${char.survival_mode===m.id ? "border-orange-500/60 bg-orange-500/10" : "border-white/10 bg-white/5 hover:border-orange-400/20"}`}>
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{m.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                  </div>
                  {char.survival_mode===m.id && <span className="text-orange-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Point of View</label>
            <div className="space-y-2">
              {POVS.map(p => (
                <button key={p.id} onClick={()=>update("pov",p.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${char.pov===p.id ? "border-cyan-500/60 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:border-cyan-400/20"}`}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{p.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                  {char.pov===p.id && <span className="text-cyan-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      case "review": return (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🧙 {char.name || "Unnamed"}</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              {[
                ["Class", char.class==="Custom" ? customClass||"Custom" : char.class],
                ["Race", char.race||"—"],
                ["Origin", char.origin?.replace(/_/g," ")||"—"],
                ["Flaw", char.flaw?.replace(/_/g," ")||"—"],
                ["Alignment", char.alignment||"—"],
                ["Mode", char.survival_mode],
                ["POV", char.pov],
                ["Progression", char.progression_mode],
              ].map(([k,v]) => (
                <div key={k}>
                  <span className="text-gray-500">{k}</span>
                  <p className="text-white font-medium capitalize">{v}</p>
                </div>
              ))}
            </div>
            {selectedAbilities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400 block mb-2">Abilities</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAbilities.map(a=><span key={a} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{a}</span>)}
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-gray-400 block mb-2">Stats</span>
              <div className="grid grid-cols-4 gap-2">
                {STATS.map(s=>(
                  <div key={s} className="text-center">
                    <div className="text-xs text-gray-500">{s}</div>
                    <div className="font-bold text-white">{char.stats[s]}</div>
                    <div className={`text-xs ${{"A":"text-yellow-400","B":"text-green-400","C":"text-blue-400","D":"text-gray-400","E":"text-red-400"}[STAT_GRADE(char.stats[s])]}`}>{STAT_GRADE(char.stats[s])}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  const canProceed = () => {
    switch(STEPS[step]?.id) {
      case "basics": return !!char.name.trim() && !!char.class;
      default: return true;
    }
  };

  if (!world) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 animate-pulse">Loading world...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950 text-white">
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center gap-4">
        <button onClick={()=>navigate(`/worlds/${worldId}`)} className="text-gray-400 hover:text-white transition text-sm">← Back</button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">🧬 Character Origin</h1>
          <p className="text-xs text-gray-400">{world.name} · {STEPS[step]?.icon} {STEPS[step]?.label}</p>
        </div>
      </div>

      <div className="w-full bg-white/5 h-1">
        <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
          style={{ width:`${((step+1)/STEPS.length)*100}%` }}/>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 py-3 border-b border-white/5">
        {STEPS.map((s,i) => (
          <button key={s.id} onClick={()=>i<=step&&setStep(i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${i===step?"bg-indigo-600 text-white":i<step?"bg-white/10 text-gray-300 hover:bg-white/15":"bg-white/5 text-gray-600 cursor-not-allowed"}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {renderStep()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-white/10 px-6 py-4 flex gap-3 max-w-2xl mx-auto">
        {step > 0 && (
          <button onClick={()=>setStep(s=>s-1)}
            className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition font-medium">
            ← Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={()=>setStep(s=>s+1)} disabled={!canProceed()}
            className={`flex-1 py-3 rounded-xl font-bold transition ${canProceed()?"bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500":"bg-white/10 text-gray-500 cursor-not-allowed"}`}>
            Next →
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving||!char.name||!char.class}
            className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition disabled:opacity-50">
            {saving?"Creating character...":"⚡ Enter the World"}
          </button>
        )}
      </div>
      <div className="pb-24"/>
    </div>
  );
}
