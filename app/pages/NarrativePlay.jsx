import { useState, useEffect, useRef } from "react";
import { World, PlayerCharacter, WorldEvent } from "@/api/entities";
import { useParams, useNavigate } from "react-router-dom";
import { InvokeLLM } from "@/api/integrations";

const QUICK_ACTIONS = [
  { label: "Look around", icon: "👁️" },
  { label: "Check my inventory", icon: "🎒" },
  { label: "Talk to someone nearby", icon: "💬" },
  { label: "Search the area", icon: "🔍" },
  { label: "Rest and recover", icon: "🌙" },
  { label: "Check my status", icon: "📊" },
];

function TypingMessage({ text, onDone }) {
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
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-purple-400">▋</span>}
    </span>
  );
}

export default function NarrativePlay() {
  const { worldId, characterId } = useParams();
  const navigate = useNavigate();
  const [world, setWorld] = useState(null);
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [typing, setTyping] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const [w, c] = await Promise.all([
          World.get(worldId),
          PlayerCharacter.get(characterId),
        ]);
        setWorld(w);
        setCharacter(c);
        await generateOpening(w, c);
      } catch (e) {
        console.error(e);
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, [worldId, characterId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const buildSystemPrompt = (w, c) => `
You are the Narrator of "${w.name}", an immersive interactive story world.

WORLD DETAILS:
- Setting: ${w.setting}
- Climate: ${w.climate}
- Magic Level: ${w.magic_level}
- Technology Level: ${w.technology_level}
- Danger Level: ${w.danger_level}
- Population: ${w.population_density}
- Lore: ${w.lore || "A world rich with untold history."}
- Factions: ${w.factions || "Various groups vie for power."}
- Landmarks: ${w.landmarks || "Ancient ruins and forgotten places dot the landscape."}
- Rules of Nature: ${w.rules_of_nature || "Standard physics apply, with a touch of the arcane."}

PLAYER CHARACTER:
- Name: ${c.name}
- Class: ${c.class}
- Alignment: ${c.alignment}
- Backstory: ${c.backstory || "A mysterious past shrouded in secrecy."}
- Abilities: ${c.abilities || "Standard skills for their class."}
- Inventory: ${c.inventory}
- Current Location: ${c.current_location}
- Health: ${c.health}/100
- Level: ${c.level}

YOUR ROLE:
You are a masterful storyteller. Describe scenes vividly, react to the player's choices, introduce NPCs, challenges, and discoveries. Keep responses to 2-4 paragraphs. End each response with an implicit or explicit choice/situation that invites the player to act. Make the world feel alive. Never break character. Adjust tone to the world's setting and danger level. If the player does something that would affect their health or inventory, briefly note the change in [brackets] at the end.
`;

  const generateOpening = async (w, c) => {
    setTyping(true);
    try {
      const response = await InvokeLLM({
        prompt: `Begin the story. Set the scene for ${c.name} (a ${c.class}) as they arrive at or near their starting location: "${c.current_location}". Make it atmospheric and draw them into the world immediately. Reference specific details from the world's lore, climate, and setting.`,
        system_prompt: buildSystemPrompt(w, c),
        response_type: "text",
      });
      setMessages([{ role: "narrator", text: response, id: Date.now() }]);
    } catch (e) {
      setMessages([{
        role: "narrator",
        text: `You open your eyes. The world of ${w.name} stretches before you, ${w.climate.toLowerCase()} winds carrying the scent of adventure. As a ${c.class}, you've been here before — in dreams. But this is real. What will you do?`,
        id: Date.now(),
      }]);
    }
    setTyping(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "player", text: text.trim(), id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTyping(true);

    try {
      // Build conversation history for context
      const history = messages.map((m) =>
        m.role === "player" ? `Player: ${m.text}` : `Narrator: ${m.text}`
      ).join("\n\n");

      const response = await InvokeLLM({
        prompt: `${history ? `Previous story so far:\n${history}\n\n` : ""}Player action: ${text.trim()}`,
        system_prompt: buildSystemPrompt(world, character),
        response_type: "text",
      });

      const narratorMsg = { role: "narrator", text: response, id: Date.now() + 1 };
      setMessages((prev) => [...prev, narratorMsg]);

      // Save as a world event occasionally (every 5 player actions)
      const playerMsgCount = messages.filter((m) => m.role === "player").length + 1;
      if (playerMsgCount % 5 === 0) {
        WorldEvent.create({
          world_id: worldId,
          title: `${character.name}'s Journey`,
          description: `${character.name} took action: "${text.trim()}"`,
          event_type: "Story",
          impact: "Medium",
          affected_area: character.current_location,
          narrative: response,
          resolved: false,
        }).catch(() => {});
      }
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: "narrator",
        text: "The world shimmers... something interrupted the flow of time. Try again.",
        id: Date.now() + 1,
      }]);
    }
    setLoading(false);
    setTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📖</div>
          <p className="text-purple-300 text-lg font-medium">Opening the story...</p>
          <p className="text-gray-500 text-sm mt-2">Weaving the threads of {worldId && "your world"}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/worlds/${worldId}`)}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            ← Exit
          </button>
          <div>
            <h1 className="font-bold text-sm leading-tight flex items-center gap-2">
              <span>📖</span> {world?.name}
            </h1>
            <p className="text-xs text-purple-400">{character?.name} • {character?.class}</p>
          </div>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition"
        >
          <span>📊</span> Stats
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && character && (
        <div className="bg-black/60 border-b border-white/10 px-4 py-3 flex-shrink-0">
          <div className="max-w-2xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-3 text-center text-xs">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400">Health</div>
              <div className="text-green-400 font-bold text-sm">{character.health}/100</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400">Level</div>
              <div className="text-yellow-400 font-bold text-sm">{character.level}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400">XP</div>
              <div className="text-blue-400 font-bold text-sm">{character.experience}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400">Class</div>
              <div className="text-purple-400 font-bold text-sm">{character.class}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400">Alignment</div>
              <div className="text-pink-400 font-bold text-sm">{character.alignment?.split(" ")[0]}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400">Location</div>
              <div className="text-orange-400 font-bold text-sm truncate">{character.current_location}</div>
            </div>
          </div>
          {character.inventory && (
            <div className="max-w-2xl mx-auto mt-2 text-xs text-gray-400">
              <span className="text-gray-500">🎒 Inventory:</span> {character.inventory}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`${msg.role === "player" ? "flex justify-end" : ""}`}>
              {msg.role === "narrator" ? (
                <div className="bg-gradient-to-br from-gray-900 to-purple-950/30 border border-purple-900/30 rounded-2xl rounded-tl-sm p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">📖 Narrator</span>
                  </div>
                  <p className="text-gray-100 leading-relaxed text-sm whitespace-pre-line">
                    {i === messages.length - 1 && msg.role === "narrator" && typing === false ? (
                      msg.text
                    ) : i === messages.length - 1 && msg.role === "narrator" ? (
                      <TypingMessage text={msg.text} onDone={() => setTyping(false)} />
                    ) : (
                      msg.text
                    )}
                  </p>
                </div>
              ) : (
                <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow">
                  <p className="text-indigo-100 text-sm">{msg.text}</p>
                </div>
              )}
            </div>
          ))}

          {typing && messages[messages.length - 1]?.role === "player" && (
            <div className="bg-gradient-to-br from-gray-900 to-purple-950/30 border border-purple-900/30 rounded-2xl rounded-tl-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">📖 Narrator</span>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-white/5 px-4 py-2 flex-shrink-0 overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.label)}
              disabled={loading}
              className="flex items-center gap-1.5 whitespace-nowrap text-xs bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 px-3 py-1.5 rounded-full transition disabled:opacity-40"
            >
              <span>{action.icon}</span>
              <span className="text-gray-300">{action.label}</span>
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
            placeholder="What do you do? (Enter to send)"
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
