import { useState, useRef, useEffect } from "react";
import { World } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { useNavigate } from "react-router-dom";

// ─── Known Worlds Library ────────────────────────────────────────────────────
const KNOWN_WORLDS = {
  "shadow-slave": {
    name: "Shadow Slave — The Dream Realm",
    magic_level: "High", technology_level: "Modern", danger_level: "Extreme",
    population_density: "Sparse", setting: "Dark Fantasy", climate: "Varies by realm",
    lore: "RANK SYSTEM: Dormant > Awakened > Ascended > Transcendent (Saint) > Sovereign (Master) > Tyrant > God. Shadow beasts grant unique abilities when consumed. The Dream Realm is a dark mirror of reality filled with ruins and monsters.",
    factions: JSON.stringify([
      { name: "The Cohort", goal: "Survive and ascend together", leader: "Sunny", territory: "Varies", allies: "Each other", enemies: "The Spell, corrupted Awakened", secret: "Bound by First Nightmare" },
      { name: "Immortal Flame Clan", goal: "Dominate the Awakened hierarchy", leader: "Unknown Elder", territory: "Waking World enclaves", allies: "Aligned noble families", enemies: "Low-rank interlopers", secret: "Ancient deal with a Sovereign" }
    ]),
    landmarks: "Forgotten Shore, Crimson Spire, The Chained Isles, The Dreamscape Core",
    rules_of_nature: "1. Death in First Nightmare = death in reality. 2. Abilities come only from consuming worthy shadow beasts. 3. Rank gates real-world social power.",
    magic_law: "Power grows only through consuming worthy shadow beasts in the Dream Realm. No shortcuts.",
    death_law: "Death in the Forgotten Shore means death in the waking world. No respawn in First Nightmare.",
    reality_law: "The Dream Realm overlaps reality. Events there have physical consequences here.",
    world_type: "known", setting_detail: "Contemporary dystopian Earth + Dream Realm overlay"
  },
  "middle-earth": {
    name: "Middle-earth",
    magic_level: "Low", technology_level: "Medieval", danger_level: "High",
    population_density: "Moderate", setting: "High Fantasy", climate: "Temperate",
    lore: "A world of deep history — Ainur shaped it, Elves woke first, Men inherited it. The One Ring binds all lesser rings. Dark Lords rise and fall. Ages pass like tides.",
    factions: JSON.stringify([
      { name: "The Free Peoples", goal: "Resist the shadow", leader: "Various — Aragorn, Gandalf, Galadriel", territory: "Gondor, Rohan, Rivendell, Lothlórien", allies: "Each other (uneasy)", enemies: "Sauron, Saruman", secret: "The Rings of Power still exert influence" },
      { name: "Servants of Shadow", goal: "Find and deliver the One Ring", leader: "Sauron (Eye of Mordor)", territory: "Mordor, Isengard", allies: "Orcs, Nazgûl, corrupted men", enemies: "All free peoples", secret: "Sauron's body was destroyed but will returns" }
    ]),
    landmarks: "The Shire, Rivendell, Moria, Lothlórien, Mordor, Helm's Deep, Minas Tirith",
    rules_of_nature: "1. Magic is subtle — it feels like fate, not spectacle. 2. Rings of Power corrupt through desire. 3. The Valar watch but rarely intervene.",
    magic_law: "Magic manifests as wisdom, prophecy, and subtle influence — not fireballs. Overt power is rare and costly.",
    death_law: "Men die and go Beyond. Elves go to Valinor or linger as shadows. Dwarves return to stone.",
    reality_law: "Fate and prophecy are real forces. Some things are meant to happen.",
    world_type: "known"
  },
  "naruto": {
    name: "Naruto — Shinobi World",
    magic_level: "High", technology_level: "Mixed", danger_level: "High",
    population_density: "Dense", setting: "Fantasy", climate: "Varied by nation",
    lore: "Five great nations built on the power of chakra — the life energy that fuels jutsu. Ninja villages wage covert wars for influence. The Akatsuki seeks the Tailed Beasts. Bloodline limits (Kekkei Genkai) grant rare abilities.",
    factions: JSON.stringify([
      { name: "Leaf Village (Konoha)", goal: "Protect the Will of Fire", leader: "Hokage", territory: "Land of Fire", allies: "Allied villages (shifting)", enemies: "Akatsuki, Sound Village", secret: "Root (Danzō's black ops) operates in shadows" },
      { name: "Akatsuki", goal: "Collect all Tailed Beasts", leader: "Pain / Obito (Tobi)", territory: "Nomadic", allies: "S-rank missing-nin", enemies: "All villages", secret: "True goal: cast Infinite Tsukuyomi" }
    ]),
    landmarks: "Konoha, Valley of the End, The Forest of Death, Tanzaku Town, Cave of the Hermit Toads",
    rules_of_nature: "1. All power flows from chakra — physical + spiritual energy. 2. Kekkei Genkai are inherited, not learned. 3. Summoning requires blood contracts.",
    magic_law: "Chakra must be shaped through hand seals for most jutsu. Senjutsu requires stillness and nature energy.",
    death_law: "Death is permanent except through Edo Tensei (forbidden reanimation jutsu) or rare medical ninjutsu.",
    reality_law: "Genjutsu can alter perception of reality. Some Sharingan abilities blur the line.",
    world_type: "known"
  }
};

// ─── Constants ───────────────────────────────────────────────────────────────
const GENRES = ["Dark Fantasy","High Fantasy","Sci-Fi","Cyberpunk","Post-Apocalyptic","Horror","Mythpunk","Solarpunk","Weird West","Cosmic Horror","Isekai","Wuxia"];
const SCALES = ["A Single City","A Kingdom","A Continent","A Planet","Multiple Worlds","The Cosmos"];
const THEMES = ["Survival","Power & Corruption","Redemption","War & Sacrifice","Discovery","Identity","Fate vs Free Will","Legacy","Revenge","Love & Loss"];
const MAGIC_LEVELS = ["None","Low","Medium","High","Absolute"];
const TECH_LEVELS = ["Primitive","Medieval","Industrial","Modern","Futuristic"];
const DANGER_LEVELS = ["Peaceful","Low","Medium","High","Extreme"];
const POWER_SYSTEMS = [
  { id:"level", label:"Level System", icon:"📈", desc:"Numeric levels gate power. XP-driven progression." },
  { id:"rank", label:"Rank System", icon:"🏆", desc:"Named tiers (E→S, Bronze→Platinum, etc.) define your place." },
  { id:"aspect", label:"Aspect System", icon:"🌀", desc:"Characters embody cosmic concepts that grow with belief." },
  { id:"class", label:"Class System", icon:"⚔️", desc:"Chosen paths with unique skill trees and restrictions." },
  { id:"skill", label:"Skill-Based", icon:"📚", desc:"No classes — pure skill growth through use." },
  { id:"bloodline", label:"Bloodline System", icon:"🩸", desc:"Power inherited through lineage. Awaken dormant gifts." },
  { id:"relic", label:"Relic-Bound", icon:"💎", desc:"Power comes from discovered artifacts, not training." },
  { id:"hybrid", label:"Hybrid System", icon:"⚡", desc:"Mix and match — your world, your rules." },
];
const ORIGINS = ["Orphan","Noble Exile","God-Touched","Cursed Lineage","Wanderer","Fallen Hero","Chosen One","Outcast Scholar","Criminal Survivor","Monster-Kin","Resurrected","The Forgotten"];
const WORLD_STEPS = [
  { id:"genre", label:"Genre & Tone", icon:"🎭" },
  { id:"scale", label:"World Scale", icon:"🌍" },
  { id:"themes", label:"Core Themes", icon:"💡" },
  { id:"vitals", label:"World Vitals", icon:"⚙️" },
  { id:"lore", label:"Lore & Factions", icon:"📜" },
  { id:"races", label:"Races & Peoples", icon:"🧬" },
  { id:"laws", label:"Laws of the World", icon:"⚖️" },
  { id:"power", label:"Power System", icon:"⚡" },
  { id:"gmguides", label:"GM Guides", icon:"📋" },
  { id:"contract", label:"World Contract", icon:"📜" },
];

const freshWorld = () => ({
  name:"", description:"", setting:"", climate:"", magic_level:"Medium",
  technology_level:"Medieval", danger_level:"Medium", population_density:"Moderate",
  lore:"", factions:"[]", races:"[]", landmarks:"", rules_of_nature:"",
  magic_law:"", death_law:"", reality_law:"", power_system_type:"level",
  rank_names:"", genre_tone:"", world_scale:"", core_theme:"",
  tone_themes:"", world_feel:"", secrets_mysteries:"", historical_events:"",
  current_conflicts:"", experience_mode:"Narrative", status:"Active",
  world_type:"private", gmGuides:"[]",
  calendar_name:"", calendar_months:"",
});

// ─── Vesper Float Button ──────────────────────────────────────────────────────
function VesperButton({ onClick, active }) {
  return (
    <button onClick={onClick}
      className={`fixed bottom-6 right-24 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
        ${active ? "bg-purple-600 ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-950" : "bg-purple-600/80 hover:bg-purple-600"}`}
      title="Ask Vesper">
      <span className="text-xl">✦</span>
    </button>
  );
}

// ─── Vesper Chat Panel ────────────────────────────────────────────────────────
function VesperPanel({ open, onClose, draft, step, onApply }) {
  const [msgs, setMsgs] = useState([{ role:"vesper", text:"Hey — I'm here. Tell me about your world idea, ask me to fill something in, or request a consistency check. What do you need?" }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { if(open) endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, open]);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim(); setInput(""); setThinking(true);
    setMsgs(m => [...m, { role:"user", text: userMsg }]);
    try {
      const res = await InvokeLLM({
        prompt: `You are Vesper, the AI co-pilot for Aurora world-building. Current step: "${step}". Current world draft: ${JSON.stringify(draft,null,2)}\n\nUser says: "${userMsg}"\n\nRespond helpfully. If the user wants you to fill in fields, respond with a JSON block like: {"apply": {"field_name": "value"}} at the end of your message. Keep your reply warm, concise, and creative. Don't repeat all the world data back.`,
        model: "gpt-4o-mini",
      });
      // Check for apply block
      const applyMatch = res.match(/\{"apply":\s*(\{[\s\S]*?\})\}/);
      if (applyMatch) {
        try { const fields = JSON.parse(applyMatch[1]); onApply(fields); } catch(e) {}
      }
      setMsgs(m => [...m, { role:"vesper", text: res.replace(/\{"apply":\s*\{[\s\S]*?\}\}/g,"").trim() }]);
    } catch(e) {
      setMsgs(m => [...m, { role:"vesper", text:"Something went wrong on my end. Try again?" }]);
    }
    setThinking(false);
  };

  if (!open) return null;
  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 bg-gray-900 border border-purple-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{maxHeight:"60vh"}}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-purple-900/30">
        <span className="font-bold text-purple-300 text-sm">✦ Vesper</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map((m,i) => (
          <div key={i} className={`text-sm rounded-xl px-3 py-2 max-w-[90%] ${m.role==="vesper" ? "bg-purple-900/40 text-purple-100 self-start" : "bg-white/10 text-white ml-auto"}`}>
            {m.text}
          </div>
        ))}
        {thinking && <div className="text-purple-400 text-xs animate-pulse px-3">Vesper is thinking...</div>}
        <div ref={endRef}/>
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask Vesper anything..." className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:border-purple-500"/>
        <button onClick={send} className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-lg text-sm font-bold transition">→</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorldCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [world, setWorld] = useState(freshWorld());
  const [vesperOpen, setVesperOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [contract, setContract] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importQuery, setImportQuery] = useState("");
  const [importResults, setImportResults] = useState([]);
  const [factions, setFactions] = useState([]);
  const [races, setRaces] = useState([]);
  const [gmGuides, setGmGuides] = useState([]);
  const [newGuide, setNewGuide] = useState({ title:"", category:"Tone", rule:"", active:true });
  const [fillingFaction, setFillingFaction] = useState(null);
  const [fillingRace, setFillingRace] = useState(null);

  const update = (field, val) => setWorld(w => ({ ...w, [field]: val }));
  const applyVesper = (fields) => setWorld(w => ({ ...w, ...fields }));

  // ─── Import Known World ──────────────────────────────────────────────────
  const searchImport = async () => {
    const q = importQuery.toLowerCase();
    const matches = Object.entries(KNOWN_WORLDS).filter(([k,v]) =>
      k.includes(q) || v.name.toLowerCase().includes(q)
    );
    if (matches.length > 0) {
      setImportResults(matches.map(([,v]) => v));
    } else {
      setGenerating(true);
      try {
        const res = await InvokeLLM({
          prompt: `Generate a detailed world settings object for the fictional universe: "${importQuery}". Return ONLY valid JSON with these fields: name, magic_level (None/Low/Medium/High/Absolute), technology_level (Primitive/Medieval/Industrial/Modern/Futuristic), danger_level (Peaceful/Low/Medium/High/Extreme), population_density (Empty/Sparse/Moderate/Dense/Overcrowded), setting (one of: Fantasy/Sci-Fi/Modern/Post-Apocalyptic/Ancient/Custom), climate, lore (detailed, 3+ paragraphs), factions (JSON array: [{name,goal,leader,territory,allies,enemies,secret}]), landmarks, rules_of_nature, magic_law, death_law, reality_law, world_type:"known"`,
          model: "gpt-4o",
          response_json_schema: { type:"object", properties:{ name:{type:"string"}, magic_level:{type:"string"}, technology_level:{type:"string"}, danger_level:{type:"string"}, population_density:{type:"string"}, setting:{type:"string"}, climate:{type:"string"}, lore:{type:"string"}, factions:{type:"string"}, landmarks:{type:"string"}, rules_of_nature:{type:"string"}, magic_law:{type:"string"}, death_law:{type:"string"}, reality_law:{type:"string"} } }
        });
        try { setImportResults([JSON.parse(res)]); } catch(e) { setImportResults([]); }
      } catch(e) { setImportResults([]); }
      setGenerating(false);
    }
  };

  const applyImport = (w) => {
    setWorld(prev => ({ ...prev, ...w }));
    if (w.factions) {
      try { setFactions(JSON.parse(w.factions)); } catch(e) {}
    }
    setShowImport(false);
    setStep(3); // jump to vitals
  };

  // ─── Faction helpers ─────────────────────────────────────────────────────
  const addFaction = () => setFactions(f => [...f, { name:"", goal:"", leader:"", territory:"", allies:"", enemies:"", secret:"" }]);
  const updateFaction = (i, field, val) => setFactions(f => f.map((x,j) => j===i ? { ...x, [field]:val } : x));
  const removeFaction = (i) => setFactions(f => f.filter((_,j) => j!==i));

  const aiFillFaction = async (i) => {
    setFillingFaction(i);
    const f = factions[i];
    try {
      const res = await InvokeLLM({
        prompt: `Fill in this faction card for the world "${world.name || "unknown"}". World lore: ${world.lore?.substring(0,500)||"none"}.\nFaction name: "${f.name || "unnamed faction"}"\nReturn ONLY JSON: {"goal":"...","leader":"...","territory":"...","allies":"...","enemies":"...","secret":"..."}`,
        model: "gpt-4o-mini",
        response_json_schema: { type:"object", properties:{ goal:{type:"string"}, leader:{type:"string"}, territory:{type:"string"}, allies:{type:"string"}, enemies:{type:"string"}, secret:{type:"string"} } }
      });
      const filled = JSON.parse(res);
      updateFaction(i, "goal", filled.goal || "");
      updateFaction(i, "leader", filled.leader || "");
      updateFaction(i, "territory", filled.territory || "");
      updateFaction(i, "allies", filled.allies || "");
      updateFaction(i, "enemies", filled.enemies || "");
      updateFaction(i, "secret", filled.secret || "");
    } catch(e) {}
    setFillingFaction(null);
  };

  // ─── Race helpers ─────────────────────────────────────────────────────────
  const addRace = () => setRaces(r => [...r, { name:"", description:"", traits:"", culture:"", lifespan:"", stat_bonus:"", relations:"", playable:true }]);
  const updateRace = (i, field, val) => setRaces(r => r.map((x,j) => j===i ? { ...x, [field]:val } : x));
  const removeRace = (i) => setRaces(r => r.filter((_,j) => j!==i));

  const aiFillRace = async (i) => {
    setFillingRace(i);
    const r = races[i];
    try {
      const res = await InvokeLLM({
        prompt: `Fill in this race card for the world "${world.name || "unknown"}". World lore: ${world.lore?.substring(0,400)||"none"}.\nRace name: "${r.name || "unnamed race"}"\nReturn ONLY JSON: {"description":"...","traits":"...","culture":"...","lifespan":"...","stat_bonus":"STR/DEX/CON/INT/WIS/CHA or empty","relations":"..."}`,
        model: "gpt-4o-mini",
        response_json_schema: { type:"object", properties:{ description:{type:"string"}, traits:{type:"string"}, culture:{type:"string"}, lifespan:{type:"string"}, stat_bonus:{type:"string"}, relations:{type:"string"} } }
      });
      const filled = JSON.parse(res);
      ["description","traits","culture","lifespan","stat_bonus","relations"].forEach(field => {
        if (filled[field]) updateRace(i, field, filled[field]);
      });
    } catch(e) {}
    setFillingRace(null);
  };

  // ─── GM Guide helpers ─────────────────────────────────────────────────────
  const addGuide = () => {
    if (!newGuide.title || !newGuide.rule) return;
    setGmGuides(g => [...g, { ...newGuide, id: Date.now() }]);
    setNewGuide({ title:"", category:"Tone", rule:"", active:true });
  };
  const toggleGuide = (id) => setGmGuides(g => g.map(x => x.id===id ? { ...x, active:!x.active } : x));
  const removeGuide = (id) => setGmGuides(g => g.filter(x => x.id!==id));

  // ─── Generate World Contract ──────────────────────────────────────────────
  const generateContract = async () => {
    setGenerating(true);
    const worldData = { ...world, factions: JSON.stringify(factions), races: JSON.stringify(races), gmGuides: JSON.stringify(gmGuides) };
    try {
      const res = await InvokeLLM({
        prompt: `You are the narrator for the world "${world.name || "Unnamed World"}". Generate a World Contract — a binding declaration of this world's nature. Include: 1) A dramatic 3-sentence world description. 2) Three Story Seeds (opening scenario options). 3) A Stability Score (0-100) with brief analysis. Return JSON: {"description":"...","story_seeds":["...","...","..."],"stability_score":85,"stability_note":"..."}. World data: ${JSON.stringify(worldData).substring(0,2000)}`,
        model: "gpt-4o",
        response_json_schema: { type:"object", properties:{ description:{type:"string"}, story_seeds:{type:"array",items:{type:"string"}}, stability_score:{type:"number"}, stability_note:{type:"string"} } }
      });
      const c = JSON.parse(res);
      setContract(c);
      if (c.description) update("description", c.description);
    } catch(e) {}
    setGenerating(false);
  };

  // ─── Save World ───────────────────────────────────────────────────────────
  const saveWorld = async () => {
    if (!world.name.trim()) return;
    setSaving(true);
    try {
      const saved = await World.create({
        ...world,
        factions: JSON.stringify(factions),
        races: JSON.stringify(races),
        gmGuides: JSON.stringify(gmGuides),
      });
      navigate(`/worlds/${saved.id}`);
    } catch(e) {}
    setSaving(false);
  };

  // ─── Step Content ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch(WORLD_STEPS[step]?.id) {

      case "genre": return (
        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-3 block">World Name</label>
            <input value={world.name} onChange={e=>update("name",e.target.value)}
              placeholder="Give your world a name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"/>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Genre</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GENRES.map(g => (
                <button key={g} onClick={()=>update("genre_tone",g)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${world.genre_tone===g ? "border-purple-500 bg-purple-500/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-400/40 hover:text-white"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Or load a Known World</label>
            <button onClick={()=>setShowImport(true)}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition">
              📚 Load Known Universe
            </button>
          </div>
        </div>
      );

      case "scale": return (
        <div className="space-y-4">
          <label className="text-sm text-gray-400 mb-3 block">How big is your world?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCALES.map(s => (
              <button key={s} onClick={()=>update("world_scale",s)}
                className={`py-3 px-4 rounded-xl text-sm font-medium border transition text-left ${world.world_scale===s ? "border-purple-500 bg-purple-500/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-400/40 hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      );

      case "themes": return (
        <div className="space-y-4">
          <label className="text-sm text-gray-400 mb-3 block">Pick 1-3 core themes</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map(t => {
              const picked = (world.core_theme||"").split(",").map(x=>x.trim()).filter(Boolean);
              const on = picked.includes(t);
              return (
                <button key={t} onClick={()=>{
                  const next = on ? picked.filter(x=>x!==t) : picked.length<3 ? [...picked,t] : picked;
                  update("core_theme", next.join(", "));
                }}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border transition ${on ? "border-pink-500 bg-pink-500/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-pink-400/40 hover:text-white"}`}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      );

      case "vitals": return (
        <div className="space-y-5">
          {[
            { label:"Magic Level", field:"magic_level", opts:MAGIC_LEVELS },
            { label:"Technology Level", field:"technology_level", opts:TECH_LEVELS },
            { label:"Danger Level", field:"danger_level", opts:DANGER_LEVELS },
          ].map(({ label, field, opts }) => (
            <div key={field}>
              <label className="text-sm text-gray-400 mb-2 block">{label}</label>
              <div className="flex gap-2 flex-wrap">
                {opts.map(o => (
                  <button key={o} onClick={()=>update(field,o)}
                    className={`py-1.5 px-4 rounded-lg text-sm font-medium border transition ${world[field]===o ? "border-purple-500 bg-purple-500/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-400/40 hover:text-white"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">World Lore & History</label>
            <textarea value={world.lore} onChange={e=>update("lore",e.target.value)}
              rows={4} placeholder="What happened here? Who built it? What was lost?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm resize-none"/>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Landmarks</label>
            <input value={world.landmarks} onChange={e=>update("landmarks",e.target.value)}
              placeholder="Ruins, sacred sites, dangerous zones..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm"/>
          </div>
        </div>
      );

      case "lore": return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Factions & Powers</label>
            <button onClick={addFaction} className="text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-500/30 transition">+ Add Faction</button>
          </div>
          {factions.length === 0 && <p className="text-gray-600 text-sm text-center py-4">No factions yet. Add one or ask Vesper to fill them in.</p>}
          {factions.map((f,i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <input value={f.name} onChange={e=>updateFaction(i,"name",e.target.value)}
                  placeholder="Faction name" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"/>
                <button onClick={()=>aiFillFaction(i)} disabled={fillingFaction===i}
                  className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition disabled:opacity-50">
                  {fillingFaction===i ? "..." : "✦ Fill"}
                </button>
                <button onClick={()=>removeFaction(i)} className="text-red-400 hover:text-red-300 px-2">×</button>
              </div>
              {["goal","leader","territory","allies","enemies","secret"].map(field => (
                <input key={field} value={f[field]||""} onChange={e=>updateFaction(i,field,e.target.value)}
                  placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-purple-500"/>
              ))}
            </div>
          ))}
        </div>
      );

      case "races": return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Races & Peoples</label>
            <button onClick={addRace} className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-3 py-1 rounded-lg hover:bg-green-500/30 transition">+ Add Race</button>
          </div>
          {races.length === 0 && <p className="text-gray-600 text-sm text-center py-4">No races defined. Add one or skip — races can be added later.</p>}
          {races.map((r,i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <input value={r.name} onChange={e=>updateRace(i,"name",e.target.value)}
                  placeholder="Race name" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"/>
                <button onClick={()=>aiFillRace(i)} disabled={fillingRace===i}
                  className="bg-green-500/20 border border-green-500/40 text-green-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-500/30 transition disabled:opacity-50">
                  {fillingRace===i ? "..." : "✦ Fill"}
                </button>
                <button onClick={()=>removeRace(i)} className="text-red-400 hover:text-red-300 px-2">×</button>
              </div>
              <textarea value={r.description||""} onChange={e=>updateRace(i,"description",e.target.value)}
                rows={2} placeholder="Appearance & description"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-purple-500 resize-none"/>
              {["traits","culture","lifespan","relations"].map(field => (
                <input key={field} value={r[field]||""} onChange={e=>updateRace(i,field,e.target.value)}
                  placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-purple-500"/>
              ))}
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <select value={r.stat_bonus||""} onChange={e=>updateRace(i,"stat_bonus",e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                    <option value="">No stat bonus</option>
                    {["STR","DEX","CON","INT","WIS","CHA","SMY"].map(s => <option key={s} value={s}>+10 {s}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={r.playable} onChange={e=>updateRace(i,"playable",e.target.checked)} className="accent-purple-500"/>
                  Playable
                </label>
              </div>
            </div>
          ))}
        </div>
      );

      case "laws": return (
        <div className="space-y-4">
          <p className="text-gray-500 text-xs">These become BINDING constraints in the narrator. The Rule Consistency Engine will enforce them every turn.</p>
          {[
            { field:"magic_law", label:"Magic Law", placeholder:"How does magic work? What are its limits?" },
            { field:"death_law", label:"Death Law", placeholder:"What happens when someone dies here?" },
            { field:"reality_law", label:"Reality Law", placeholder:"What are the rules of existence — fate, prophecy, gods?" },
            { field:"rules_of_nature", label:"Natural Laws", placeholder:"Physics, time, cause and effect..." },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="text-xs text-gray-400 mb-1 block font-semibold">{label}</label>
              <textarea value={world[field]||""} onChange={e=>update(field,e.target.value)}
                rows={2} placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/50 resize-none"/>
            </div>
          ))}
        </div>
      );

      case "power": return (
        <div className="space-y-5">
          <label className="text-sm text-gray-400 mb-2 block">Power Progression System</label>
          <div className="grid grid-cols-2 gap-3">
            {POWER_SYSTEMS.map(p => (
              <button key={p.id} onClick={()=>update("power_system_type",p.id)}
                className={`p-4 rounded-xl border-2 text-left transition ${world.power_system_type===p.id ? "border-yellow-500 bg-yellow-500/10" : "border-white/10 bg-white/5 hover:border-yellow-400/30"}`}>
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className="font-semibold text-sm text-white">{p.label}</div>
                <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
          {(world.power_system_type === "rank" || world.power_system_type === "hybrid") && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Custom Rank Names (comma-separated)</label>
              <input value={world.rank_names||""} onChange={e=>update("rank_names",e.target.value)}
                placeholder="e.g. F, E, D, C, B, A, S, SS, SSS"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-yellow-500"/>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Power Law (how progression is earned)</label>
            <textarea value={world.power_law||""} onChange={e=>update("power_law",e.target.value)}
              rows={2} placeholder="e.g. Power grows only through surviving worthy challenges..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-yellow-500 resize-none"/>
          </div>
        </div>
      );

      case "gmguides": return (
        <div className="space-y-4">
          <p className="text-gray-500 text-xs">GM Guides are narrator constraints. Active guides inject directly into the system prompt every turn.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <input value={newGuide.title} onChange={e=>setNewGuide(g=>({...g,title:e.target.value}))}
              placeholder="Guide title (e.g. 'No Resurrection')"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"/>
            <select value={newGuide.category} onChange={e=>setNewGuide(g=>({...g,category:e.target.value}))}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
              {["Tone","Combat","Roleplay","Survival","Lore","Custom"].map(c=><option key={c}>{c}</option>)}
            </select>
            <textarea value={newGuide.rule} onChange={e=>setNewGuide(g=>({...g,rule:e.target.value}))}
              rows={2} placeholder="The rule (plain English is fine — Vesper can clean it up)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-purple-500 resize-none"/>
            <button onClick={addGuide} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Add Guide</button>
          </div>
          {gmGuides.length === 0 && <p className="text-gray-600 text-sm text-center py-2">No guides yet. Skip this step or add constraints now.</p>}
          {gmGuides.map(g => (
            <div key={g.id} className={`flex items-start gap-3 p-3 rounded-xl border ${g.active ? "border-purple-500/30 bg-purple-900/10" : "border-white/10 bg-white/5 opacity-50"}`}>
              <button onClick={()=>toggleGuide(g.id)} className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 ${g.active ? "border-purple-500 bg-purple-500" : "border-gray-600"}`}/>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{g.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{g.rule}</div>
              </div>
              <button onClick={()=>removeGuide(g.id)} className="text-red-400 hover:text-red-300 text-sm">×</button>
            </div>
          ))}
        </div>
      );

      case "contract": return (
        <div className="space-y-5">
          {!contract ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-xl font-bold mb-2">Generate World Contract</h3>
              <p className="text-gray-400 text-sm mb-6">The AI will review your world and generate a binding contract, story seeds, and a stability analysis.</p>
              <button onClick={generateContract} disabled={generating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-xl font-bold text-white transition disabled:opacity-50">
                {generating ? "Generating..." : "✦ Generate Contract"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <h4 className="font-bold text-purple-300 mb-2">World Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{contract.description}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="font-bold text-gray-300 mb-3">Story Seeds</h4>
                {contract.story_seeds?.map((s,i) => (
                  <div key={i} className="flex gap-3 mb-2">
                    <span className="text-purple-400 font-bold text-sm mt-0.5">{i+1}.</span>
                    <p className="text-gray-300 text-sm">{s}</p>
                  </div>
                ))}
              </div>
              <div className={`rounded-xl p-4 border ${contract.stability_score>=70 ? "bg-green-900/20 border-green-500/30" : contract.stability_score>=40 ? "bg-yellow-900/20 border-yellow-500/30" : "bg-red-900/20 border-red-500/30"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm">World Stability</h4>
                  <span className={`font-bold text-lg ${contract.stability_score>=70?"text-green-400":contract.stability_score>=40?"text-yellow-400":"text-red-400"}`}>{contract.stability_score}/100</span>
                </div>
                <p className="text-gray-400 text-xs">{contract.stability_note}</p>
              </div>
              <button onClick={saveWorld} disabled={saving||!world.name}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-white text-lg transition disabled:opacity-50 shadow-lg shadow-purple-500/30">
                {saving ? "Sealing world..." : "⚡ Seal the Contract — Enter " + (world.name || "Your World")}
              </button>
            </div>
          )}
        </div>
      );

      default: return null;
    }
  };

  const canProceed = () => {
    switch(WORLD_STEPS[step]?.id) {
      case "genre": return !!world.name.trim();
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Load a Known Universe</h2>
            <p className="text-gray-400 text-sm mb-4">Search for a fictional world to use as your starting point.</p>
            <div className="flex gap-2 mb-4">
              <input value={importQuery} onChange={e=>setImportQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchImport()}
                placeholder="e.g. Shadow Slave, Naruto, Middle-earth..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"/>
              <button onClick={searchImport} disabled={generating} className="bg-purple-600 px-4 py-3 rounded-xl font-bold hover:bg-purple-500 transition disabled:opacity-50">
                {generating?"...":"Search"}
              </button>
            </div>
            {/* Quick picks */}
            <div className="flex gap-2 flex-wrap mb-4">
              {Object.values(KNOWN_WORLDS).map(w => (
                <button key={w.name} onClick={()=>applyImport(w)}
                  className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-400 hover:text-white hover:border-purple-400/40 transition">
                  {w.name}
                </button>
              ))}
            </div>
            {importResults.map((r,i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
                <h3 className="font-bold text-white mb-1">{r.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{r.lore?.substring(0,150)}...</p>
                <button onClick={()=>applyImport(r)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Use This World</button>
              </div>
            ))}
            <button onClick={()=>setShowImport(false)} className="mt-2 text-gray-500 hover:text-white text-sm transition w-full text-center">Cancel</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center gap-4">
        <button onClick={()=>navigate("/worlds")} className="text-gray-400 hover:text-white transition text-sm">← Back</button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">🌌 World Genesis</h1>
          <p className="text-xs text-gray-400">{WORLD_STEPS[step]?.icon} {WORLD_STEPS[step]?.label}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 h-1">
        <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
          style={{ width: `${((step+1)/WORLD_STEPS.length)*100}%` }}/>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 overflow-x-auto px-4 py-3 border-b border-white/5">
        {WORLD_STEPS.map((s,i) => (
          <button key={s.id} onClick={()=>i<=step&&setStep(i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${i===step ? "bg-purple-600 text-white" : i<step ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-white/5 text-gray-600 cursor-not-allowed"}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {renderStep()}
      </div>

      {/* Nav buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-white/10 px-6 py-4 flex gap-3 max-w-2xl mx-auto">
        {step > 0 && (
          <button onClick={()=>setStep(s=>s-1)}
            className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition font-medium">
            ← Back
          </button>
        )}
        {step < WORLD_STEPS.length - 1 ? (
          <button onClick={()=>setStep(s=>s+1)} disabled={!canProceed()}
            className={`flex-1 py-3 rounded-xl font-bold transition ${canProceed() ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500" : "bg-white/10 text-gray-500 cursor-not-allowed"}`}>
            Next →
          </button>
        ) : (
          <button onClick={saveWorld} disabled={saving||!world.name}
            className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50">
            {saving ? "Creating..." : "⚡ Create World"}
          </button>
        )}
      </div>

      <VesperButton onClick={()=>setVesperOpen(v=>!v)} active={vesperOpen}/>
      <VesperPanel open={vesperOpen} onClose={()=>setVesperOpen(false)} draft={world} step={WORLD_STEPS[step]?.label} onApply={applyVesper}/>

      <div className="pb-24"/>
    </div>
  );
}
