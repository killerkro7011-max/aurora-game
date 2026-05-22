import { useState, useEffect, useRef, useCallback } from "react";
import { World, PlayerCharacter, WorldEvent } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { useParams, useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATS = ["STR","DEX","CON","INT","WIS","CHA","SMY"];
const STAT_GRADE = (v) => { if(v>=151)return"A";if(v>=111)return"B";if(v>=71)return"C";if(v>=41)return"D";return"E"; };
const GRADE_COLOR = {"A":"text-yellow-400","B":"text-green-400","C":"text-blue-400","D":"text-gray-400","E":"text-red-400"};

const NARRATOR_STYLES = {
  chronicler:  { label:"The Chronicler",  icon:"📜", style:"Write in rich literary prose — descriptive, layered, emotionally resonant. Treat every scene as a chapter in an epic novel." },
  gamemaster:  { label:"The Game Master", icon:"🎲", style:"Balanced DnD-style narration. Clear stakes, fair challenges, tactical depth. Describe outcomes with precision." },
  wildcard:    { label:"The Wildcard",    icon:"🃏", style:"Subvert expectations constantly. Introduce chaos, irony, unexpected consequences. The world has a dark sense of humor." },
  grimdark:    { label:"The Grimdark",    icon:"💀", style:"Brutal honesty. No softening. Every wound counts, every loss matters. Beauty exists only to be broken." },
  companion:   { label:"The Companion",   icon:"🌟", style:"Warm, accessible, encouraging. Celebrate player choices. Good for new players or lighter adventures." },
};

const EXPLORE_ACTIONS = [
  { label:"Look around", icon:"👁️" },{ label:"Talk to someone", icon:"💬" },
  { label:"Search the area", icon:"🔍" },{ label:"Check inventory", icon:"🎒" },
  { label:"Rest", icon:"🌙" },{ label:"Sneak ahead", icon:"🐾" },
];

// ─── Typing Message ───────────────────────────────────────────────────────────
function TypingMessage({ text, speed=12, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    idx.current=0; setDisplayed(""); setDone(false);
    const interval = setInterval(() => {
      if (idx.current < text.length) { setDisplayed(p=>p+text[idx.current]); idx.current++; }
      else { clearInterval(interval); setDone(true); if(onDone) onDone(); }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}{!done&&<span className="animate-pulse text-purple-400">▋</span>}</span>;
}

// ─── Stat Check Pill ──────────────────────────────────────────────────────────
function StatCheckPill({ check }) {
  if (!check) return null;
  const colors = { success:"bg-green-900/40 border-green-500/40 text-green-300", partial:"bg-yellow-900/40 border-yellow-500/40 text-yellow-300", fail:"bg-red-900/40 border-red-500/40 text-red-300" };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-2 ${colors[check.outcome]||colors.partial}`}>
      <span>{check.stat} check</span>
      <span>·</span>
      <span>{check.roll}/{check.dc}</span>
      <span>·</span>
      <span className="capitalize">{check.outcome}</span>
    </div>
  );
}

// ─── Living Codex ─────────────────────────────────────────────────────────────
function LivingCodex({ world, char, npcs, quests, factionRep, keyEvents, onClose }) {
  const [tab, setTab] = useState("world");
  const tabs = [
    { id:"world", label:"World Laws", icon:"⚖️" },
    { id:"npcs", label:"People", icon:"👥" },
    { id:"factions", label:"Factions", icon:"⚔️" },
    { id:"quests", label:"Quests", icon:"📋" },
    { id:"events", label:"History", icon:"📜" },
  ];
  let parsedFactions = [];
  try { parsedFactions = JSON.parse(world?.factions||"[]"); } catch(e) {}

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gray-900 border-l border-white/10 z-40 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <span className="font-bold text-sm">📚 Living Codex</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 py-2 border-b border-white/5">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-medium transition ${tab===t.id?"bg-purple-600 text-white":"bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm space-y-3">
        {tab==="world" && (
          <div className="space-y-3">
            {world?.magic_law && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-purple-400 font-bold mb-1">⚡ Magic Law</p><p className="text-gray-300 text-xs">{world.magic_law}</p></div>}
            {world?.death_law && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-red-400 font-bold mb-1">💀 Death Law</p><p className="text-gray-300 text-xs">{world.death_law}</p></div>}
            {world?.reality_law && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-cyan-400 font-bold mb-1">🌀 Reality Law</p><p className="text-gray-300 text-xs">{world.reality_law}</p></div>}
            {world?.rules_of_nature && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-green-400 font-bold mb-1">🌿 Natural Laws</p><p className="text-gray-300 text-xs">{world.rules_of_nature}</p></div>}
          </div>
        )}
        {tab==="npcs" && (
          <div className="space-y-2">
            {npcs.length===0 && <p className="text-gray-600 text-xs text-center py-4">No NPCs encountered yet.</p>}
            {npcs.map((n,i)=>(
              <div key={i} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">{n.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${n.attitude==="hostile"?"bg-red-500/20 text-red-400":n.attitude==="friendly"?"bg-green-500/20 text-green-400":"bg-gray-500/20 text-gray-400"}`}>{n.attitude}</span>
                </div>
                {n.notes && <p className="text-xs text-gray-400">{n.notes}</p>}
                {n.location && <p className="text-xs text-gray-500 mt-1">📍 {n.location}</p>}
              </div>
            ))}
          </div>
        )}
        {tab==="factions" && (
          <div className="space-y-2">
            {parsedFactions.map((f,i)=>{
              const rep = factionRep[f.name]||0;
              const label = rep>=60?"Allied":rep>=20?"Friendly":rep>=-20?"Neutral":rep>=-60?"Hostile":"Sworn Enemy";
              const color = rep>=20?"text-green-400":rep>=-20?"text-gray-400":"text-red-400";
              return (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{f.name}</span>
                    <span className={`text-xs font-semibold ${color}`}>{label}</span>
                  </div>
                  {f.goal && <p className="text-xs text-gray-400 mt-1">{f.goal}</p>}
                </div>
              );
            })}
          </div>
        )}
        {tab==="quests" && (
          <div className="space-y-2">
            {quests.length===0 && <p className="text-gray-600 text-xs text-center py-4">No active quests.</p>}
            {quests.map((q,i)=>(
              <div key={i} className={`rounded-xl p-3 border ${q.status==="active"?"bg-yellow-900/10 border-yellow-500/20":"bg-white/5 border-white/10"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">{q.title}</span>
                  <span className={`text-xs ${q.status==="active"?"text-yellow-400":q.status==="complete"?"text-green-400":"text-gray-500"}`}>{q.status}</span>
                </div>
                {q.desc && <p className="text-xs text-gray-400">{q.desc}</p>}
              </div>
            ))}
          </div>
        )}
        {tab==="events" && (
          <div className="space-y-2">
            {keyEvents.length===0 && <p className="text-gray-600 text-xs text-center py-4">No key events yet.</p>}
            {[...keyEvents].reverse().map((e,i)=>(
              <div key={i} className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Turn {e.turn}</p>
                <p className="text-xs text-gray-300">{e.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NarrativePlay() {
  const { worldId, characterId } = useParams();
  const navigate = useNavigate();

  // Core state
  const [world, setWorld] = useState(null);
  const [char, setChar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [turn, setTurn] = useState(0);

  // Character state (persisted to DB)
  const [charHP, setCharHP] = useState(100);
  const [stats, setStats] = useState({});
  const [gold, setGold] = useState(10);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [craftingSkills, setCraftingSkills] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [quests, setQuests] = useState([]);
  const [factionRep, setFactionRep] = useState({});
  const [campaignSummary, setCampaignSummary] = useState("");
  const [campaignTimeline, setCampaignTimeline] = useState([]);
  const [keyEvents, setKeyEvents] = useState([]);
  const [recentMemory, setRecentMemory] = useState([]);
  const [worldTime, setWorldTime] = useState({ day:1, month:1, year:1, hour:8 });
  const [survivalStats, setSurvivalStats] = useState({ hunger:100, thirst:100, shelter:100 });

  // UI state
  const [narratorStyle, setNarratorStyle] = useState("gamemaster");
  const [survivalMode, setSurvivalMode] = useState("standard");
  const [pov, setPov] = useState("second");
  const [inputMode, setInputMode] = useState("action");
  const [lastStatCheck, setLastStatCheck] = useState(null);
  const [codexOpen, setCodexOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [deathScreen, setDeathScreen] = useState(false);
  const [deathCount, setDeathCount] = useState(0);
  const [typingDone, setTypingDone] = useState(true);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  // ─── Load world + character ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      World.get(worldId),
      PlayerCharacter.get(characterId),
    ]).then(([w, c]) => {
      setWorld(w);
      setChar(c);
      setStats(c.stats || Object.fromEntries(STATS.map(s=>[s,50])));
      setCharHP(c.charHP ?? 100);
      setGold(c.gold ?? 10);
      setInventoryItems(c.inventoryItems || []);
      setCraftingSkills(c.craftingSkills || []);
      setNpcs(c.npcs || []);
      setQuests(c.quests || []);
      setFactionRep(c.factionRep || {});
      setCampaignSummary(c.campaignSummary || "");
      setCampaignTimeline(c.campaignTimeline || []);
      setKeyEvents(c.keyEvents || []);
      setRecentMemory(c.recentMemory || []);
      setWorldTime(c.worldTime || { day:1, month:1, year:1, hour:8 });
      setSurvivalStats(c.survivalStats || { hunger:100, thirst:100, shelter:100 });
      setDeathCount(c.deathCount || 0);
      setSurvivalMode(c.survival_mode || "standard");
      setPov(c.pov || "second");
      setNarratorStyle(c.narratorStyle || "gamemaster");
      setLoading(false);
    });
  }, [worldId, characterId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  // ─── Save character state to DB ────────────────────────────────────────────
  const saveChar = useCallback(async (updates={}) => {
    if (!characterId) return;
    try {
      await PlayerCharacter.update(characterId, {
        charHP, stats, gold, inventoryItems, craftingSkills,
        npcs, quests, factionRep, campaignSummary, campaignTimeline,
        keyEvents, recentMemory, worldTime, survivalStats, deathCount,
        survival_mode: survivalMode, pov, narratorStyle,
        current_location: char?.current_location,
        level: char?.level || 1,
        experience: char?.experience || 0,
        ...updates,
      });
    } catch(e) { console.error("Save failed:", e); }
  }, [characterId, charHP, stats, gold, inventoryItems, craftingSkills, npcs, quests, factionRep, campaignSummary, campaignTimeline, keyEvents, recentMemory, worldTime, survivalStats, deathCount, survivalMode, pov, narratorStyle, char]);

  // ─── Stat check engine ────────────────────────────────────────────────────
  const performStatCheck = (action, currentStats) => {
    const lower = action.toLowerCase();
    let stat = "SMY", weight = 0.5;
    if (/fight|attack|slash|strike|punch|block|swing|combat/.test(lower)) { stat="STR"; weight=0.7; }
    else if (/dodge|sneak|run|jump|climb|hide|flee|escape/.test(lower)) { stat="DEX"; weight=0.7; }
    else if (/endure|resist|survive|withstand|push through/.test(lower)) { stat="CON"; weight=0.6; }
    else if (/study|examine|read|analyze|understand|research|recall/.test(lower)) { stat="INT"; weight=0.6; }
    else if (/sense|feel|notice|detect|perceive|meditate/.test(lower)) { stat="WIS"; weight=0.6; }
    else if (/persuade|charm|deceive|negotiate|seduce|intimidate|lead/.test(lower)) { stat="CHA"; weight=0.65; }
    else if (/focus|will|endure|push|overcome|believe/.test(lower)) { stat="SMY"; weight=0.55; }

    const statVal = currentStats[stat] || 50;
    const roll = Math.floor(Math.random()*20)+1;
    const dc = Math.floor(30 + (100-statVal)*0.4);
    const effective = roll*weight*2 + statVal*0.3;
    const outcome = effective >= dc ? "success" : effective >= dc*0.7 ? "partial" : "fail";
    return { stat, roll, dc: Math.floor(dc), outcome, statVal };
  };

  // ─── Compress campaign memory ──────────────────────────────────────────────
  const compressMemory = async (memory, existing) => {
    setSummarizing(true);
    try {
      const res = await InvokeLLM({
        prompt: `Compress this campaign memory into a concise chronicle (max 400 words). Preserve key plot beats, character decisions, NPC introductions, and consequences. Existing summary: "${existing||"(none)"}"\n\nNew events:\n${memory.map(m=>(m.role==="player"?"Player: ":"Narrator: ")+m.text).join("\n\n")}`,
        model: "gpt-4o-mini",
      });
      setSummarizing(false);
      return res;
    } catch(e) { setSummarizing(false); return existing; }
  };

  // ─── Build system prompt ──────────────────────────────────────────────────
  const buildSystemPrompt = (w, c, overrides={}) => {
    const ns = NARRATOR_STYLES[narratorStyle] || NARRATOR_STYLES.gamemaster;
    const currentStats = overrides.stats || stats;
    const currentHP = overrides.charHP ?? charHP;
    const currentSurvival = overrides.survivalStats || survivalStats;

    const npcCtx = npcs.length > 0
      ? npcs.map(n=>`- ${n.name} [${n.attitude}]${n.location?" | "+n.location:""}${n.notes?"\n  "+n.notes:""}`).join("\n")
      : "None encountered yet.";

    const factionCtx = Object.keys(factionRep).length > 0
      ? Object.entries(factionRep).map(([f,r])=>{
          const label = r>=60?"Allied":r>=20?"Friendly":r>=-20?"Neutral":r>=-60?"Hostile":"Sworn Enemy";
          return `- ${f}: ${label} (${r})`;
        }).join("\n")
      : "None established.";

    const questCtx = quests.filter(q=>q.status==="active").map(q=>`- ${q.title}: ${q.desc||""}`).join("\n") || "None active.";

    const timeCtx = `Day ${worldTime.day}, Hour ${worldTime.hour}:00 (${worldTime.hour>=20||worldTime.hour<6?"Night":worldTime.hour<12?"Morning":worldTime.hour<18?"Afternoon":"Evening"})`;

    let survivalCtx = "";
    if (survivalMode==="survival"||survivalMode==="ironman") {
      survivalCtx = `\nSURVIVAL — Hunger: ${currentSurvival.hunger}% | Thirst: ${currentSurvival.thirst}% | Shelter: ${currentSurvival.shelter}%. Impose stat penalties naturally if any hit 0.`;
    } else if (survivalMode==="nightmare") {
      survivalCtx = "\nNIGHTMARE MODE: One death ends the run. Describe danger at full weight. No softening.";
    } else if (survivalMode==="story") {
      survivalCtx = "\nSTORY MODE: Death suspended. Focus on narrative richness.";
    }

    // Parse factions for narrator
    let factionsFormatted = w.factions || "Various factions.";
    try {
      const facs = JSON.parse(w.factions||"[]");
      if (facs.length) factionsFormatted = facs.map(f=>`${f.name}${f.goal?" ("+f.goal+")":""}${f.leader?" | Led by: "+f.leader:""}`).join("; ");
    } catch(e) {}

    // Parse races
    let racesFormatted = "";
    try {
      const races = JSON.parse(w.races||"[]");
      if (races.length) racesFormatted = "\n- Races: " + races.map(r=>`${r.name}${r.traits?" ["+r.traits+"]":""}`).join("; ");
    } catch(e) {}

    // GM Guides injection
    let guidesCtx = "";
    try {
      const guides = JSON.parse(w.gmGuides||"[]");
      const active = guides.filter(g=>g.active);
      if (active.length) guidesCtx = "\n\nGM GUIDE CONSTRAINTS (ABSOLUTE RULES — override default narration):\n" + active.map(g=>`[${g.category}] ${g.title}: ${g.rule}`).join("\n");
    } catch(e) {}

    const statStr = STATS.map(s=>`${s}:${currentStats[s]||50}(${STAT_GRADE(currentStats[s]||50)})`).join(" ");

    return `You are the Narrator of "${w.name}" — a cinematic, immersive AI-driven RPG world.
NARRATOR STYLE: ${ns.label} — ${ns.style}
POV: ${pov==="first"?"First person (I raise my blade...)":(pov==="third"?`Third person (${c.name} moves through shadows...)`:(`Second person (You step forward...)`))}

WORLD:
- Setting: ${w.setting||"Fantasy"} | Climate: ${w.climate||"Mixed"} | Magic: ${w.magic_level} | Tech: ${w.technology_level}
- Danger: ${w.danger_level} | Scale: ${w.world_scale||"unknown"} | Genre: ${w.genre_tone||""}
- Description: ${w.description||"A world of untold stories."}
- Lore: ${w.lore||"A world rich with history."}
- Factions: ${factionsFormatted}${racesFormatted}
- Landmarks: ${w.landmarks||"Ancient and forgotten places."}
${w.magic_law?"- MAGIC LAW (BINDING): "+w.magic_law+"\n":""}${w.death_law?"- DEATH LAW (BINDING): "+w.death_law+"\n":""}${w.reality_law?"- REALITY LAW (BINDING): "+w.reality_law+"\n":""}${w.rules_of_nature?"- Natural Laws: "+w.rules_of_nature+"\n":""}${w.power_system_type?"- Power System: "+w.power_system_type+(w.rank_names?" | Ranks: "+w.rank_names:"")+"\n":""}${w.secrets_mysteries?"- World Secrets (reveal slowly): "+w.secrets_mysteries+"\n":""}
- Current Time: ${timeCtx}${survivalCtx}

CHARACTER:
- Name: ${c.name} | Class: ${c.class} | Race: ${c.race||"Unknown"} | Alignment: ${c.alignment}
${c.origin?"- Origin: "+c.origin.replace(/_/g," ")+(c.origin_detail?" — "+c.origin_detail:"")+"\n":""}${c.flaw?"- ACTIVE FLAW: "+c.flaw.replace(/_/g," ")+(c.flaw_detail?" — "+c.flaw_detail:"")+"\n  [This flaw must create real consequences — not cosmetic flavor.]\n":""}
- Backstory: ${c.backstory||"A mysterious past."}
- Abilities: ${c.abilities||"Standard class skills."}
- Stats: ${statStr}
- Health: ${currentHP}/100 | Level: ${c.level||1} | Gold: ${gold}g
- Location: ${c.current_location||w.name}
- Inventory: ${inventoryItems.length>0?inventoryItems.map(i=>i.name+(i.equipped?"[E]":"")).join(", "):"Basic supplies"}

CAMPAIGN CHRONICLE:
${campaignSummary||(campaignTimeline.length===0?"This adventure has just begun.":"")}

ACTIVE QUESTS:
${questCtx}

KNOWN NPCS:
${npcCtx}

FACTION STANDING:
${factionCtx}
${guidesCtx}

NARRATOR RULES:
1. RULE CONSISTENCY ENGINE: Check every event, NPC action, and consequence against the World Laws above. Never violate them.
2. STAT CONSEQUENCE ENGINE: Actions succeed/fail based on character stats. The stat check result you'll receive tells you the outcome — honor it.
3. After each turn, include a JSON block at the very end (do not show to player): {"state":{"hp_change":0,"location":"...","lore_fix":null,"npc":{"name":"...","attitude":"neutral","notes":"..."},"quest":{"title":"...","status":"active","desc":"..."},"faction":{"name":"...","rep_change":0},"time_advance":1,"key_event":null,"xp_gain":0}}
4. Keep responses 2-4 paragraphs. Be vivid but not bloated.
5. Never let the player do something their stats make impossible without consequence.
6. If the player's FLAW is relevant — activate it. Don't save them from their own nature.`;
  };

  // ─── Parse narrator state updates ─────────────────────────────────────────
  const parseStateUpdate = (response) => {
    const match = response.match(/\{"state":([\s\S]*?)\}(?:\s*)$/);
    if (!match) return null;
    try { return JSON.parse('{"state":'+match[1]+"}").state; } catch(e) { return null; }
  };

  const cleanResponse = (response) => {
    return response.replace(/\{"state":[\s\S]*?\}(?:\s*)$/, "").trim();
  };

  // ─── Apply narrator state updates ─────────────────────────────────────────
  const applyStateUpdate = (upd, currentStats) => {
    if (!upd) return;
    let newStats = { ...currentStats };
    let newHP = charHP;
    let newGold = gold;
    let newNPCs = [...npcs];
    let newQuests = [...quests];
    let newFactionRep = { ...factionRep };
    let newWorldTime = { ...worldTime };
    let newKeyEvents = [...keyEvents];
    let newTimeline = [...campaignTimeline];
    let newSurvival = { ...survivalStats };
    let newChar = char ? { ...char } : null;

    if (upd.hp_change) newHP = Math.max(0, Math.min(100, newHP + upd.hp_change));
    if (upd.location && newChar) newChar = { ...newChar, current_location: upd.location };
    if (upd.time_advance) {
      newWorldTime = { ...newWorldTime, hour: (newWorldTime.hour + (upd.time_advance||1)) % 24 };
      if (newWorldTime.hour < worldTime.hour) newWorldTime.day = (newWorldTime.day||1) + 1;
    }

    // Survival degradation
    if (survivalMode==="survival"||survivalMode==="ironman") {
      newSurvival = { hunger:Math.max(0,newSurvival.hunger-2), thirst:Math.max(0,newSurvival.thirst-3), shelter:Math.max(0,newSurvival.shelter-1) };
    }

    // NPC update
    if (upd.npc?.name) {
      const existing = newNPCs.findIndex(n=>n.name.toLowerCase()===upd.npc.name.toLowerCase());
      if (existing>=0) {
        newNPCs[existing] = { ...newNPCs[existing], ...upd.npc, lastSeen: turn };
      } else {
        newNPCs.push({ ...upd.npc, lastSeen: turn, history:[] });
      }
    }

    // Quest update
    if (upd.quest?.title) {
      const qi = newQuests.findIndex(q=>q.title.toLowerCase()===upd.quest.title.toLowerCase());
      if (qi>=0) newQuests[qi] = { ...newQuests[qi], ...upd.quest };
      else newQuests.push({ ...upd.quest, addedTurn: turn });
    }

    // Faction rep
    if (upd.faction?.name && upd.faction.rep_change) {
      newFactionRep[upd.faction.name] = Math.max(-100, Math.min(100, (newFactionRep[upd.faction.name]||0) + upd.faction.rep_change));
    }

    // Key event
    if (upd.key_event) newKeyEvents.push({ turn, text: upd.key_event });

    // XP
    if (upd.xp_gain && newChar) {
      const newXP = (newChar.experience||0) + upd.xp_gain;
      const newLevel = Math.floor(newXP/100)+1;
      newChar = { ...newChar, experience: newXP, level: Math.min(newLevel, 100) };
    }

    // Stat growth (Journey mode)
    if (char?.progression_mode !== "legend" && lastStatCheck) {
      const sc = lastStatCheck;
      if (sc.outcome === "success" || sc.outcome === "partial") {
        const growth = sc.outcome==="success" ? 1 : 0; // small growth
        newStats[sc.stat] = Math.min(200, (newStats[sc.stat]||50) + growth);
      }
    }

    setCharHP(newHP);
    setStats(newStats);
    setGold(newGold);
    setNpcs(newNPCs);
    setQuests(newQuests);
    setFactionRep(newFactionRep);
    setWorldTime(newWorldTime);
    setSurvivalStats(newSurvival);
    setKeyEvents(newKeyEvents);
    setCampaignTimeline(newTimeline);
    if (newChar) setChar(newChar);

    // Check death
    if (newHP <= 0) handleDeath(newStats, newChar);

    // Auto-save
    saveChar({ charHP: newHP, stats: newStats, gold: newGold, npcs: newNPCs, quests: newQuests, factionRep: newFactionRep, worldTime: newWorldTime, survivalStats: newSurvival, keyEvents: newKeyEvents, campaignTimeline: newTimeline, ...(newChar||{}) });

    return newStats;
  };

  // ─── Death handling ────────────────────────────────────────────────────────
  const handleDeath = (currentStats, currentChar) => {
    const newCount = deathCount + 1;
    setDeathCount(newCount);
    setDeathScreen(true);
    if (survivalMode==="nightmare" || (survivalMode==="ironman" && newCount>=3)) {
      // Permanent death
    } else {
      // Standard respawn — penalty
      setTimeout(() => {
        setCharHP(50);
        setDeathScreen(false);
        const respawnMsg = { role:"narrator", text:"You wake. The darkness retreats. You're alive — bruised, diminished, but breathing. The world doesn't forgive easily.", id: Date.now() };
        setMessages(m=>[...m, respawnMsg]);
      }, 3000);
    }
  };

  // ─── Send message ──────────────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || sending || !world || !char) return;
    const userInput = input.trim();
    setInput(""); setSending(true); setTypingDone(false);

    // Stat check
    const sc = performStatCheck(userInput, stats);
    setLastStatCheck(sc);

    // Build prefix based on input mode
    const prefix = inputMode === "speech" ? `[${char.name} says]: ` : "";
    const fullInput = prefix + userInput;

    // Add to messages
    const playerMsg = { role:"player", text: userInput, id: Date.now() };
    setMessages(m => [...m, playerMsg]);

    // Recent memory
    const newMemory = [...recentMemory, { role:"player", text: userInput }];

    try {
      // Build messages for API
      const sysPrompt = buildSystemPrompt(world, char);
      const historyMsgs = recentMemory.slice(-8).map(m => ({
        role: m.role === "player" ? "user" : "assistant",
        content: m.text,
      }));

      const statHint = `[STAT CHECK — ${sc.stat}: ${sc.statVal} | Roll: ${sc.roll}/${sc.dc} | Outcome: ${sc.outcome.toUpperCase()}. Honor this in your response.]`;

      const res = await InvokeLLM({
        prompt: `${statHint}\n\nPlayer action: "${fullInput}"`,
        model: "gpt-4o",
        systemPrompt: sysPrompt,
        messages: historyMsgs,
      });

      const cleanedRes = cleanResponse(res);
      const stateUpd = parseStateUpdate(res);

      const narratorMsg = { role:"narrator", text: cleanedRes, id: Date.now()+1, statCheck: sc };
      setMessages(m => [...m, narratorMsg]);

      // Update memory
      const updatedMemory = [...newMemory, { role:"narrator", text: cleanedRes }];
      setRecentMemory(updatedMemory);

      // Apply state updates
      applyStateUpdate(stateUpd, stats);

      // Compress memory every 10 turns
      if (updatedMemory.length >= 10) {
        const compressed = await compressMemory(updatedMemory, campaignSummary);
        setCampaignSummary(compressed);
        setRecentMemory([]);
        saveChar({ campaignSummary: compressed, recentMemory: [] });
      }

      setTurn(t => t+1);
    } catch(e) {
      setMessages(m => [...m, { role:"narrator", text: "The narrative thread snapped. Something went wrong — try again.", id: Date.now()+1 }]);
    }
    setSending(false);
    setTypingDone(true);
    inputRef.current?.focus();
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 animate-pulse text-sm">
      Entering {world?.name || "the world"}...
    </div>
  );

  if (!world || !char) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 text-sm">
      World or character not found.
    </div>
  );

  // Death screen
  if (deathScreen) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="text-6xl mb-6 animate-pulse">💀</div>
      <h2 className="text-3xl font-bold mb-3">You have died.</h2>
      <p className="text-gray-400 text-sm">
        {survivalMode==="nightmare"?"This run is over. The world remembers nothing.":survivalMode==="ironman"&&deathCount>=3?"Three deaths. Your story ends here.":"Returning to the story..."}
      </p>
      {(survivalMode==="nightmare"||(survivalMode==="ironman"&&deathCount>=3)) && (
        <button onClick={()=>navigate(`/worlds/${worldId}`)} className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition">
          Return to World
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={()=>navigate(`/worlds/${worldId}`)} className="text-gray-400 hover:text-white transition text-sm">←</button>

        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm truncate">{char.name}</h2>
          <p className="text-xs text-gray-500 truncate">{world.name} · Lv.{char.level||1} · {char.current_location}</p>
        </div>

        {/* HP bar */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${charHP>50?"bg-green-500":charHP>25?"bg-yellow-500":"bg-red-500 animate-pulse"}`}
              style={{ width:`${charHP}%` }}/>
          </div>
          <span className="text-xs text-gray-400 font-mono">{charHP}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1">
          <button onClick={()=>setShowInventory(v=>!v)}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition" title="Inventory">
            🎒
          </button>
          <button onClick={()=>setCodexOpen(v=>!v)}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition" title="Living Codex">
            📚
          </button>
          <button onClick={()=>setShowSettings(v=>!v)}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition" title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="border-b border-white/10 bg-gray-900/80 px-4 py-3 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Narrator</span>
            <div className="flex gap-1">
              {Object.entries(NARRATOR_STYLES).map(([k,v])=>(
                <button key={k} onClick={()=>setNarratorStyle(k)}
                  className={`px-2 py-1 rounded-lg border transition ${narratorStyle===k?"border-purple-500 bg-purple-500/20 text-white":"border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}
                  title={v.label}>{v.icon}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Input Mode</span>
            <div className="flex gap-1">
              <button onClick={()=>setInputMode("action")} className={`px-2 py-1 rounded-lg border transition ${inputMode==="action"?"border-blue-500 bg-blue-500/20 text-white":"border-white/10 bg-white/5 text-gray-400"}`}>Action</button>
              <button onClick={()=>setInputMode("speech")} className={`px-2 py-1 rounded-lg border transition ${inputMode==="speech"?"border-green-500 bg-green-500/20 text-white":"border-white/10 bg-white/5 text-gray-400"}`}>Dialogue</button>
            </div>
          </div>
        </div>
      )}

      {/* Survival bars */}
      {(survivalMode==="survival"||survivalMode==="ironman") && (
        <div className="border-b border-white/5 px-4 py-2 flex gap-4 text-xs">
          {[["🍖","Hunger",survivalStats.hunger],["💧","Thirst",survivalStats.thirst],["🏕️","Shelter",survivalStats.shelter]].map(([icon,label,val])=>(
            <div key={label} className="flex items-center gap-2">
              <span>{icon}</span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full ${val>50?"bg-green-500":val>25?"bg-yellow-500":"bg-red-500 animate-pulse"}`} style={{width:`${val}%`}}/>
              </div>
              <span className="text-gray-500">{val}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌌</div>
            <h3 className="text-xl font-bold mb-2">{world.name}</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">{world.description || "Your story begins here."}</p>
            <button onClick={()=>{ setInput("I enter the world and look around."); }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition">
              Begin Your Story →
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id||i} className={`flex ${msg.role==="player"?"justify-end":"justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role==="player" ? "bg-purple-600/20 border border-purple-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-200" : "text-gray-200 text-sm leading-relaxed"}`}>
              {msg.role==="narrator" && msg.statCheck && i===messages.length-1 && (
                <StatCheckPill check={msg.statCheck}/>
              )}
              {msg.role==="narrator" ? (
                i===messages.length-1 && !typingDone ? (
                  <TypingMessage text={msg.text} onDone={()=>setTypingDone(true)}/>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="flex gap-1 items-center text-gray-500 text-sm">
              <span className="animate-bounce" style={{animationDelay:"0ms"}}>●</span>
              <span className="animate-bounce" style={{animationDelay:"150ms"}}>●</span>
              <span className="animate-bounce" style={{animationDelay:"300ms"}}>●</span>
            </div>
          </div>
        )}

        {summarizing && <p className="text-center text-xs text-gray-600 animate-pulse">Compressing campaign memory...</p>}
        <div ref={endRef}/>
      </div>

      {/* Quick actions */}
      {messages.length > 0 && !sending && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto max-w-3xl mx-auto w-full">
          {EXPLORE_ACTIONS.map(a=>(
            <button key={a.label} onClick={()=>{ setInput(a.label); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white hover:bg-white/10 hover:border-purple-500/40 transition">
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/30 backdrop-blur-md px-4 py-3 max-w-3xl mx-auto w-full">
        {inputMode==="speech" && (
          <p className="text-xs text-green-400 mb-2">💬 Dialogue mode — your text will be spoken as {char.name}</p>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); }}}
            placeholder={inputMode==="speech" ? `"What ${char.name} says..."` : "What do you do?"}
            rows={2}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 resize-none"
          />
          <button onClick={send} disabled={sending||!input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-5 py-3 rounded-xl font-bold transition disabled:opacity-50 self-end">
            →
          </button>
        </div>
        <p className="text-xs text-gray-700 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>

      {/* Inventory panel */}
      {showInventory && (
        <div className="fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-white/10 z-40 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="font-bold text-sm">🎒 Inventory</span>
            <button onClick={()=>setShowInventory(false)} className="text-gray-400 hover:text-white">×</button>
          </div>
          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-400">Gold</span>
              <span className="text-yellow-400 font-bold">{gold}g</span>
            </div>
            {inventoryItems.length===0 ? (
              <p className="text-gray-600 text-xs text-center py-4">Your pack is empty.</p>
            ) : inventoryItems.map((item,i)=>(
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.equipped?"border-purple-500/30 bg-purple-900/10":"border-white/10 bg-white/5"}`}>
                <span className="text-sm">{item.name}</span>
                {item.equipped && <span className="text-xs text-purple-400 ml-auto">Equipped</span>}
              </div>
            ))}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-2">Stats</p>
              <div className="grid grid-cols-2 gap-1">
                {STATS.map(s=>(
                  <div key={s} className="flex justify-between text-xs bg-white/5 rounded-lg px-2 py-1">
                    <span className="text-gray-400">{s}</span>
                    <span className={GRADE_COLOR[STAT_GRADE(stats[s]||50)]||"text-gray-400"}>{stats[s]||50}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Living Codex */}
      {codexOpen && (
        <LivingCodex
          world={world} char={char} npcs={npcs} quests={quests}
          factionRep={factionRep} keyEvents={keyEvents}
          onClose={()=>setCodexOpen(false)}
        />
      )}
    </div>
  );
}
