import { useState, useEffect, useRef } from "react";
import { World, PlayerCharacter, WorldEvent } from "@/api/entities";
import { useParams, useNavigate } from "react-router-dom";
import { InvokeLLM } from "@/api/integrations";

// ─── Dice System ────────────────────────────────────────────────────────────
function rollDice(sides = 20) {
  return Math.floor(Math.random() * sides) + 1;
}

function getCombatOutcome(playerRoll, enemyRoll) {
  const diff = playerRoll - enemyRoll;
  if (playerRoll === 20) return { result: "critical_hit", playerRoll, enemyRoll };
  if (playerRoll === 1)  return { result: "critical_fail", playerRoll, enemyRoll };
  if (diff >= 8)         return { result: "strong_hit", playerRoll, enemyRoll };
  if (diff >= 3)         return { result: "hit", playerRoll, enemyRoll };
  if (diff >= -2)        return { result: "graze", playerRoll, enemyRoll };
  if (diff >= -7)        return { result: "miss", playerRoll, enemyRoll };
  return                        { result: "bad_miss", playerRoll, enemyRoll };
}

function getSkillOutcome(roll) {
  if (roll === 20) return "critical_success";
  if (roll >= 15)  return "success";
  if (roll >= 10)  return "partial";
  if (roll >= 5)   return "fail";
  return "critical_fail";
}

const COMBAT_ACTIONS = [
  { label: "Slash", icon: "⚔️", type: "combat" },
  { label: "Dodge & strike", icon: "🌀", type: "combat" },
  { label: "Heavy blow", icon: "💥", type: "combat" },
  { label: "Quick jab", icon: "👊", type: "combat" },
  { label: "Retreat", icon: "🏃", type: "flee" },
  { label: "Use ability", icon: "✨", type: "ability" },
];

const EXPLORE_ACTIONS = [
  { label: "Look around", icon: "👁️" },
  { label: "Check inventory", icon: "🎒" },
  { label: "Talk to someone", icon: "💬" },
  { label: "Search the area", icon: "🔍" },
  { label: "Rest", icon: "🌙" },
  { label: "Sneak ahead", icon: "🐾" },
];

// ─── Typing animation ────────────────────────────────────────────────────────
function TypingMessage({ text, speed = 16, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed((prev) => prev + text[idx.current]);
        idx.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-purple-400">▋</span>}
    </span>
  );
}

// ─── Dice Roll Visual ────────────────────────────────────────────────────────
function DiceRollDisplay({ playerRoll, enemyRoll, result }) {
  const resultStyles = {
    critical_hit: "text-yellow-300 border-yellow-400/50 bg-yellow-500/10",
    critical_fail: "text-red-400 border-red-500/50 bg-red-500/10",
    strong_hit: "text-green-400 border-green-500/40 bg-green-500/10",
    hit: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    graze: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    miss: "text-red-400 border-red-500/30 bg-red-500/10",
    bad_miss: "text-red-500 border-red-600/40 bg-red-600/10",
  };
  const resultLabels = {
    critical_hit: "⚡ CRITICAL HIT",
    critical_fail: "💀 CRITICAL FAIL",
    strong_hit: "💪 STRONG HIT",
    hit: "✅ HIT",
    graze: "〰️ GRAZE",
    miss: "❌ MISS",
    bad_miss: "😵 BADLY MISSED",
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-xs font-bold my-1 ${resultStyles[result] || "text-gray-400 border-white/10"}`}>
      <span>🎲 You: {playerRoll}</span>
      <span className="text-white/30">vs</span>
      <span>🎲 Enemy: {enemyRoll}</span>
      <span className="ml-auto">{resultLabels[result] || result}</span>
    </div>
  );
}

// ─── Health Bar ──────────────────────────────────────────────────────────────
function HealthBar({ current, max = 100, label, color = "bg-green-500" }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = pct > 50 ? "bg-green-500" : pct > 25 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{label}</span><span>{current}/{max}</span></div>}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Chapter Save Toast ──────────────────────────────────────────────────────
function SaveToast({ visible }) {
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
      <div className="bg-purple-700 text-white text-sm px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2">
        <span>📖</span> Chapter saved!
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function NarrativePlay() {
  const { worldId, characterId } = useParams();
  const navigate = useNavigate();

  const [world, setWorld]           = useState(null);
  const [character, setCharacter]   = useState(null);
  const [charHP, setCharHP]         = useState(100);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [initializing, setInit]     = useState(true);
  const [isTyping, setIsTyping]     = useState(false);
  const [showStats, setShowStats]   = useState(false);
  const [inCombat, setInCombat]     = useState(false);
  const [enemy, setEnemy]           = useState(null); // { name, hp, maxHp }
  const [chapters, setChapters]     = useState([]);
  const [showChapters, setShowChapters] = useState(false);
  const [saveToast, setSaveToast]   = useState(false);
  const [lastRoll, setLastRoll]     = useState(null);
  const [actionCount, setActionCount] = useState(0);

  // Rolling memory — keep last 12 exchanges to pass as context
  const memoryRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const [w, c] = await Promise.all([World.get(worldId), PlayerCharacter.get(characterId)]);
        setWorld(w);
        setCharacter(c);
        setCharHP(c.health || 100);
        await generateOpening(w, c);
      } catch (e) {
        console.error(e);
      } finally {
        setInit(false);
      }
    }
    init();
  }, [worldId, characterId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── System Prompt ──────────────────────────────────────────────────────────
  const buildSystemPrompt = (w, c, hp = null) => `
You are the Narrator of "${w.name}" — a cinematic, immersive interactive story.

WORLD:
- Setting: ${w.setting} | Climate: ${w.climate} | Magic: ${w.magic_level} | Tech: ${w.technology_level}
- Danger: ${w.danger_level} | Population: ${w.population_density}
- Lore: ${w.lore || "A world rich with untold history."}
- Factions: ${w.factions || "Various groups vie for power."}
- Landmarks: ${w.landmarks || "Ancient ruins and forgotten places."}
- Nature Rules: ${w.rules_of_nature || "Standard physics with hints of the arcane."}

CHARACTER:
- Name: ${c.name} | Class: ${c.class} | Alignment: ${c.alignment}
- Backstory: ${c.backstory || "A mysterious past."}
- Abilities: ${c.abilities || "Standard class skills."}
- Inventory: ${c.inventory}
- Location: ${c.current_location}
- Health: ${hp !== null ? hp : c.health}/100 | Level: ${c.level}

NARRATIVE RULES:
- Write in present tense, second person ("You step forward...").
- Keep responses to 2-4 punchy paragraphs. Make every word count.
- End each non-combat response with an implicit decision point or tension.
- Adapt tone to world danger level and current situation.

COMBAT RULES (CRITICAL — follow exactly):
- When combat starts, introduce the enemy vividly. Format: [COMBAT_START:EnemyName:HP] e.g. [COMBAT_START:City Guard:60]
- During combat, you receive a dice roll result. Write the combat beat AS IF IT'S HAPPENING IN REAL TIME — no turn language, no "it is your turn". Describe the action cinematically based on the roll outcome:
  * critical_hit → devastating, adrenaline-pumping victory moment
  * strong_hit → clean, satisfying strike
  * hit → solid contact, enemy staggers
  * graze → near miss, both sides scramble, close call
  * miss → the enemy dodges at the last second, counter-attacks
  * bad_miss → humiliating miss, enemy gains the upper hand
  * critical_fail → disaster — something goes very wrong
- After describing the player's action, describe the enemy's counter-move based on ENEMY_ROLL.
- Deal damage based on roll: critical_hit=25-30, strong_hit=15-20, hit=10-14, graze=5-9, miss=0, bad_miss=0 (enemy hits player for 10-20)
- Format damage at end: [PDMG:15] for player damage dealt, [EDMG:12] for enemy damage to player.
- When enemy HP hits 0: [COMBAT_END:victory]
- When player HP hits 0: [COMBAT_END:defeat]
- If player flees successfully: [COMBAT_END:fled]

MEMORY SYSTEM:
Use the story history provided to maintain continuity. Remember NPCs, locations visited, choices made.
`;

  // ── Opening Scene ──────────────────────────────────────────────────────────
  const generateOpening = async (w, c) => {
    setIsTyping(true);
    try {
      const response = await InvokeLLM({
        prompt: `Begin the story. Set the opening scene for ${c.name} (${c.class}, ${c.alignment}) arriving at "${c.current_location}". Make it cinematic and atmospheric. Draw from the world's lore, climate, and danger level. Hook them immediately.`,
        system_prompt: buildSystemPrompt(w, c),
        response_type: "text",
      });
      const msg = { role: "narrator", text: response, id: Date.now(), isNew: true };
      setMessages([msg]);
      memoryRef.current = [{ role: "narrator", text: response }];
    } catch (e) {
      const fallback = `You open your eyes. The world of ${w.name} surrounds you — ${w.climate.toLowerCase()} air, the distant sounds of ${w.setting.toLowerCase()} life. As a ${c.class}, you've trained for this. Now it begins. What do you do?`;
      setMessages([{ role: "narrator", text: fallback, id: Date.now(), isNew: true }]);
      memoryRef.current = [{ role: "narrator", text: fallback }];
    }
    setIsTyping(false);
  };

  // ── Parse narrator response for combat tags ────────────────────────────────
  const parseResponse = (text, currentHP, currentEnemy) => {
    let cleanText = text;
    let newHP = currentHP;
    let newEnemy = currentEnemy ? { ...currentEnemy } : null;
    let combatStarted = false;
    let combatEnded = null;

    // Combat start
    const startMatch = cleanText.match(/\[COMBAT_START:([^:]+):(\d+)\]/);
    if (startMatch) {
      const eName = startMatch[1];
      const eHP = parseInt(startMatch[2]);
      newEnemy = { name: eName, hp: eHP, maxHp: eHP };
      combatStarted = true;
      cleanText = cleanText.replace(startMatch[0], "").trim();
    }

    // Player damage dealt
    const pdmgMatch = cleanText.match(/\[PDMG:(\d+)\]/);
    if (pdmgMatch && newEnemy) {
      const dmg = parseInt(pdmgMatch[1]);
      newEnemy.hp = Math.max(0, newEnemy.hp - dmg);
      cleanText = cleanText.replace(pdmgMatch[0], "").trim();
    }

    // Enemy damage to player
    const edmgMatch = cleanText.match(/\[EDMG:(\d+)\]/);
    if (edmgMatch) {
      const dmg = parseInt(edmgMatch[1]);
      newHP = Math.max(0, newHP - dmg);
      cleanText = cleanText.replace(edmgMatch[0], "").trim();
    }

    // Combat end
    const endMatch = cleanText.match(/\[COMBAT_END:(victory|defeat|fled)\]/);
    if (endMatch) {
      combatEnded = endMatch[1];
      cleanText = cleanText.replace(endMatch[0], "").trim();
    }

    return { cleanText, newHP, newEnemy, combatStarted, combatEnded };
  };

  // ── Add message helper ─────────────────────────────────────────────────────
  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
    if (msg.role === "narrator" || msg.role === "player") {
      memoryRef.current = [...memoryRef.current, { role: msg.role, text: msg.text }].slice(-24);
    }
  };

  // ── Build memory context string ────────────────────────────────────────────
  const getMemoryContext = () => {
    return memoryRef.current
      .map((m) => (m.role === "player" ? `Player: ${m.text}` : `Narrator: ${m.text}`))
      .join("\n\n");
  };

  // ── Combat action ──────────────────────────────────────────────────────────
  const handleCombatAction = async (action) => {
    if (loading) return;

    if (action.type === "flee") {
      const roll = rollDice(20);
      const fled = roll >= 12;
      const rollMsg = { role: "roll", playerRoll: roll, enemyRoll: 0, result: fled ? "hit" : "miss", id: Date.now() };
      addMessage(rollMsg);
      addMessage({ role: "player", text: `I try to retreat!`, id: Date.now() + 1 });
      setLoading(true);
      setIsTyping(true);
      try {
        const response = await InvokeLLM({
          prompt: `${getMemoryContext()}\n\nPlayer attempts to flee combat. Dice roll: ${roll}/20. ${fled ? "They escape!" : "They fail to escape."} ${fled ? "[COMBAT_END:fled]" : "The enemy cuts off their retreat."} Write this as a cinematic moment.`,
          system_prompt: buildSystemPrompt(world, character, charHP),
          response_type: "text",
        });
        const { cleanText, combatEnded } = parseResponse(response, charHP, enemy);
        addMessage({ role: "narrator", text: cleanText, id: Date.now() + 2, isNew: true });
        if (fled || combatEnded === "fled") { setInCombat(false); setEnemy(null); }
      } catch (e) {}
      setLoading(false);
      setIsTyping(false);
      return;
    }

    // Roll dice for both player and enemy
    const pRoll = rollDice(20);
    const eRoll = rollDice(20);
    const outcome = getCombatOutcome(pRoll, eRoll);
    setLastRoll(outcome);

    const rollMsg = { role: "roll", playerRoll: pRoll, enemyRoll: eRoll, result: outcome.result, id: Date.now() };
    addMessage(rollMsg);
    addMessage({ role: "player", text: `${action.icon} ${action.label}`, id: Date.now() + 1 });

    setLoading(true);
    setIsTyping(true);

    try {
      const prompt = `${getMemoryContext()}

COMBAT ACTION: Player chose to "${action.label}" against ${enemy?.name || "the enemy"}.
PLAYER ROLL: ${pRoll}/20 | ENEMY ROLL: ${eRoll}/20 | OUTCOME: ${outcome.result}
CURRENT STATE: Player HP: ${charHP}/100, Enemy HP: ${enemy?.hp || "?"}/${enemy?.maxHp || "?"}

Write this combat beat cinematically in real time — no turn language. Describe the player's attack attempt, then the enemy's reaction and counter-move based on the rolls. Use [PDMG:X] and [EDMG:X] tags for damage. If the enemy is defeated, use [COMBAT_END:victory]. Make the reader feel the adrenaline.`;

      const response = await InvokeLLM({
        prompt,
        system_prompt: buildSystemPrompt(world, character, charHP),
        response_type: "text",
      });

      const { cleanText, newHP, newEnemy, combatEnded } = parseResponse(response, charHP, enemy);
      setCharHP(newHP);
      if (newEnemy) setEnemy(newEnemy);
      addMessage({ role: "narrator", text: cleanText, id: Date.now() + 2, isNew: true });

      if (combatEnded === "victory") {
        setInCombat(false);
        setEnemy(null);
        // Give XP
        setCharacter((prev) => prev ? { ...prev, experience: (prev.experience || 0) + 50 } : prev);
        // Log as world event
        WorldEvent.create({
          world_id: worldId,
          title: `${character.name} defeated ${enemy?.name}`,
          description: `In combat near ${character.current_location}, ${character.name} emerged victorious.`,
          event_type: "Combat",
          impact: "Medium",
          affected_area: character.current_location,
          narrative: cleanText,
          resolved: true,
        }).catch(() => {});
      } else if (combatEnded === "defeat") {
        setInCombat(false);
        setEnemy(null);
        addMessage({ role: "system", text: "⚰️ You have fallen. Your story ends here... for now.", id: Date.now() + 3 });
      }
    } catch (e) {
      addMessage({ role: "narrator", text: "The battle rages on...", id: Date.now() + 2, isNew: true });
    }
    setLoading(false);
    setIsTyping(false);
  };

  // ── Regular action / message ───────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    addMessage({ role: "player", text: text.trim(), id: Date.now() });
    setInput("");
    setLoading(true);
    setIsTyping(true);

    // Roll dice for skill checks on action words
    const actionWords = ["sneak", "climb", "jump", "pick", "persuade", "intimidate", "search", "hack", "cast", "steal", "run", "dodge", "hide"];
    const needsRoll = actionWords.some((w) => text.toLowerCase().includes(w));
    let rollInfo = "";
    if (needsRoll) {
      const roll = rollDice(20);
      const outcome = getSkillOutcome(roll);
      const rollMsg = { role: "roll", playerRoll: roll, enemyRoll: null, result: outcome, id: Date.now() + 1 };
      addMessage(rollMsg);
      rollInfo = `\nSKILL CHECK ROLL: ${roll}/20 — outcome: ${outcome}. Let this influence the result of their action naturally.`;
    }

    const newCount = actionCount + 1;
    setActionCount(newCount);

    try {
      const prompt = `${getMemoryContext()}

Player action: ${text.trim()}${rollInfo}`;

      const response = await InvokeLLM({
        prompt,
        system_prompt: buildSystemPrompt(world, character, charHP),
        response_type: "text",
      });

      const { cleanText, newHP, newEnemy, combatStarted } = parseResponse(response, charHP, enemy);
      setCharHP(newHP);
      if (newEnemy) { setEnemy(newEnemy); setInCombat(true); }
      addMessage({ role: "narrator", text: cleanText, id: Date.now() + 2, isNew: true });

      // Auto-save chapter every 8 actions
      if (newCount % 8 === 0) {
        saveChapter(cleanText);
      }
    } catch (e) {
      addMessage({ role: "narrator", text: "The world shimmers... something interrupted the flow of time. Try again.", id: Date.now() + 2, isNew: true });
    }
    setLoading(false);
    setIsTyping(false);
  };

  // ── Save Chapter ──────────────────────────────────────────────────────────
  const saveChapter = (lastNarration = "") => {
    const chapterNum = chapters.length + 1;
    const snapshot = {
      id: Date.now(),
      num: chapterNum,
      title: `Chapter ${chapterNum}`,
      timestamp: new Date().toLocaleString(),
      hp: charHP,
      location: character?.current_location || "Unknown",
      preview: lastNarration.slice(0, 120) + "...",
      messageCount: messages.length,
    };
    setChapters((prev) => [...prev, snapshot]);
    WorldEvent.create({
      world_id: worldId,
      title: `📖 Chapter ${chapterNum} — ${character?.name}'s Journey`,
      description: snapshot.preview,
      event_type: "Chapter",
      impact: "Low",
      affected_area: character?.current_location || "Unknown",
      narrative: lastNarration,
      resolved: true,
    }).catch(() => {});
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📖</div>
          <p className="text-purple-300 text-lg font-medium">Opening the story...</p>
          <p className="text-gray-500 text-sm mt-2">Weaving the threads of your world...</p>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SaveToast visible={saveToast} />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/worlds/${worldId}`)} className="text-gray-400 hover:text-white transition text-sm">
            ← Exit
          </button>
          <div>
            <h1 className="font-bold text-sm leading-tight flex items-center gap-2">
              <span>📖</span> {world?.name}
              {inCombat && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">⚔️ COMBAT</span>}
            </h1>
            <p className="text-xs text-purple-400">{character?.name} · {character?.class}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => saveChapter(messages[messages.length - 1]?.text || "")} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition">
            💾 Save
          </button>
          <button onClick={() => setShowChapters(!showChapters)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition">
            📖 {chapters.length}
          </button>
          <button onClick={() => setShowStats(!showStats)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition">
            📊
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && character && (
        <div className="bg-black/70 border-b border-white/10 px-4 py-3 flex-shrink-0">
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-400">Level</div>
                <div className="text-yellow-400 font-bold">{character.level}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-400">XP</div>
                <div className="text-blue-400 font-bold">{character.experience}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-400">Class</div>
                <div className="text-purple-400 font-bold">{character.class}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-400">Location</div>
                <div className="text-orange-400 font-bold truncate text-xs">{character.current_location}</div>
              </div>
            </div>
            <HealthBar current={charHP} label={`${character.name}'s Health`} />
            {inCombat && enemy && <HealthBar current={enemy.hp} max={enemy.maxHp} label={enemy.name} />}
            {character.inventory && (
              <p className="text-xs text-gray-400">🎒 {character.inventory}</p>
            )}
          </div>
        </div>
      )}

      {/* Combat HP bar (always visible in combat) */}
      {inCombat && enemy && !showStats && (
        <div className="bg-black/60 border-b border-red-900/30 px-4 py-2 flex-shrink-0">
          <div className="max-w-2xl mx-auto flex gap-4 items-center">
            <div className="flex-1">
              <HealthBar current={charHP} label={character?.name} />
            </div>
            <span className="text-red-400 font-bold text-lg">⚔️</span>
            <div className="flex-1">
              <HealthBar current={enemy.hp} max={enemy.maxHp} label={enemy.name} />
            </div>
          </div>
        </div>
      )}

      {/* Chapters Sidebar */}
      {showChapters && (
        <div className="bg-black/80 border-b border-white/10 px-4 py-3 flex-shrink-0 max-h-48 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-400 mb-2 font-semibold">📖 Saved Chapters</p>
            {chapters.length === 0 ? (
              <p className="text-xs text-gray-600">No chapters saved yet. They auto-save every 8 actions, or hit 💾 anytime.</p>
            ) : (
              <div className="space-y-2">
                {chapters.map((ch) => (
                  <div key={ch.id} className="bg-white/5 rounded-lg p-3 text-xs">
                    <div className="flex justify-between text-gray-300 font-medium mb-0.5">
                      <span>{ch.title}</span>
                      <span className="text-gray-500">{ch.timestamp}</span>
                    </div>
                    <p className="text-gray-500 line-clamp-1">{ch.preview}</p>
                    <div className="flex gap-3 mt-1 text-gray-500">
                      <span>❤️ {ch.hp}/100</span>
                      <span>📍 {ch.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => {
            const isLastNarrator = msg.role === "narrator" && i === messages.length - 1;

            if (msg.role === "roll") {
              return (
                <div key={msg.id} className="max-w-sm mx-auto">
                  {msg.enemyRoll !== null ? (
                    <DiceRollDisplay playerRoll={msg.playerRoll} enemyRoll={msg.enemyRoll} result={msg.result} />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-400 font-medium">
                      <span>🎲 Skill Check: {msg.playerRoll}/20</span>
                      <span className="ml-auto capitalize text-purple-300">{msg.result?.replace("_", " ")}</span>
                    </div>
                  )}
                </div>
              );
            }

            if (msg.role === "system") {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">{msg.text}</span>
                </div>
              );
            }

            if (msg.role === "player") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                    <p className="text-indigo-100 text-sm">{msg.text}</p>
                  </div>
                </div>
              );
            }

            if (msg.role === "narrator") {
              return (
                <div key={msg.id} className="bg-gradient-to-br from-gray-900 to-purple-950/20 border border-purple-900/30 rounded-2xl rounded-tl-sm p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">📖 Narrator</span>
                  </div>
                  <p className="text-gray-100 leading-relaxed text-sm whitespace-pre-line">
                    {isLastNarrator && msg.isNew && isTyping ? (
                      <TypingMessage text={msg.text} onDone={() => setIsTyping(false)} />
                    ) : (
                      msg.text
                    )}
                  </p>
                </div>
              );
            }
            return null;
          })}

          {/* Narrator typing indicator */}
          {isTyping && (messages.length === 0 || messages[messages.length - 1]?.role !== "narrator") && (
            <div className="bg-gradient-to-br from-gray-900 to-purple-950/20 border border-purple-900/30 rounded-2xl rounded-tl-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">📖 Narrator</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-white/5 px-4 py-2 flex-shrink-0 overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-2">
          {(inCombat ? COMBAT_ACTIONS : EXPLORE_ACTIONS).map((action) => (
            <button
              key={action.label}
              onClick={() => inCombat ? handleCombatAction(action) : sendMessage(action.label)}
              disabled={loading}
              className={`flex items-center gap-1.5 whitespace-nowrap text-xs border px-3 py-1.5 rounded-full transition disabled:opacity-40 ${
                inCombat
                  ? action.type === "flee"
                    ? "bg-orange-900/20 border-orange-500/30 hover:bg-orange-600/20 text-orange-300"
                    : "bg-red-900/20 border-red-500/30 hover:bg-red-600/20 text-red-300"
                  : "bg-white/5 hover:bg-purple-600/20 border-white/10 hover:border-purple-500/40 text-gray-300"
              }`}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-md px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inCombat ? "Describe your attack, dodge, or use an ability..." : "What do you do? (Enter to send)"}
            rows={2}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none text-sm disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="self-end bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 rounded-xl font-semibold transition shadow-lg shadow-purple-500/20 text-sm"
          >
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
