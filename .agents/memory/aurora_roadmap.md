# Aurora — Full Feature Roadmap
**Last Updated:** 2026-05-15

---

## ✅ COMPLETED — Phase 1 (Core Loop)
- XP & leveling system
- Structured inventory (20 slots, rarity, types)
- Loot system with contextual drops
- Shop system with gold economy
- Death & respawn (inventory/gold penalties)
- Life path economy (22 paths, non-combat growth)
- Backstory integration into opening scene
- Rolling campaign memory (every 10 turns)
- Campaign journal sidebar (events, NPCs, quests)
- NPC registry with attitude tags
- Quest tracking & turn counter
- Stat sheet (STR, DEX, CON, INT, WIS, CHA, SMY — 10-200 scale, E through A tiers)
- Mastery system (usage-based growth, level-gated ceilings)
- World builder (7 steps: name, setting, climate, magic, tech, danger, culture/faith, tone/secrets)
- Random World generator (15 curated templates)
- Load a Known World (8 worlds: LOTR, Witcher, Dune, Mass Effect, Bloodborne, Ravenloft, AoT, Naruto)
- Build With Vesper co-creation mode (turn-based, review screen)
- Vesper lore consistency checker in character creation
- Crafting & Ability Forge (knowledge-gated, stat-tier quality, E–A scale)
- Reforge mechanic (upgrade items/abilities as stats grow)
- Desperation Breakthrough (life-or-death spell/technique invention)
- Ironman mode (permadeath on 3rd death)
- Dev Mode (Ctrl+Shift+D or tap Turn header 4x)
- AgentInbox entity (dual-agent architecture with background Superagent)
- GitHub Pages deployment (github.com/killerkro7011-max/aurora-game)

---

## 🔨 IN PROGRESS — Phase 2 (World Depth & Polish)

### World Builder Overhaul
- [ ] **Races System** — card sheets per race with:
  - Name, description, appearance
  - Natural traits & stat bonuses
  - Culture & lifespan
  - Relations with other races/factions
  - Playable toggle (feeds into character creation)
- [ ] **Factions** — replace text box with card sheets:
  - Name, goal, leader, territory, enemies, allies
- [ ] **Richer World Generation** — every field is a hard constraint not a suggestion:
  - Climate, magic level, tech level, danger level all enforced
  - Races and factions referenced by name in world doc
  - Lore treated as canon not decoration
- [ ] **Starting Scenario Prompt** — custom scene description before entering world

### Build With Vesper — Full Overhaul
- [ ] Vesper expands player idea FIRST before asking anything
- [ ] One good deep question at a time (not a checklist)
- [ ] Vesper makes bold suggestions, player reacts
- [ ] Vesper connects ideas across the conversation ("that faction sounds like they'd worship your god")
- [ ] Occasional prose world snapshots mid-conversation (evocative paragraph + structured data)
- [ ] Snapshot invites reaction — "anything feel wrong or spark a new idea?"
- [ ] Never rushes to finish — lets the world breathe
- [ ] Review screen at the end before building
- [ ] React-based flow, not form-based

### Time & Calendar System
- [ ] World has a named calendar (seasons, months, years)
- [ ] Character sheet shows current date and age
- [ ] Stat growth ceiling per time period (max 2-3 points/month of dedicated training)
- [ ] Growth only in actively used stats, focus split slows gains
- [ ] Time skips have consequences — world moves without you (faction shifts, NPC deaths, events)
- [ ] Race-based time perception:
  - Short-lived races (humans) — feel every year, narrator tracks urgency
  - Long-lived races (elves etc.) — time is fluid, can lose decades without noticing
  - Stat ceiling scales to lifespan proportionally
  - World reacts differently to time skips per race

### POV System
- [ ] First Person — "I step into the tavern..."
  - ✅ SMY gains faster (deeper emotional connection)
  - ❌ Tunnel vision — only perceive what character directly experiences
- [ ] Second Person — "You step into the tavern..." (default)
  - ✅ Balanced, occasional world zoom-out
  - ❌ No special bonus
- [ ] Third Person — "Kira steps into the tavern..."
  - ✅ Dramatic awareness — narrator can describe things character doesn't know
  - ✅ Better for complex political/faction stories
  - ❌ Emotional stat moments hit softer
- [ ] Set in character creation, switchable mid-game

### Survival Modes
- [ ] **Story Mode** — no death penalty, slower stat growth (world isn't pushing back)
- [ ] **Standard Mode** — current system, balanced stakes
- [ ] **Survival Mode** — food/water/shelter tracked, stats degrade if neglected, climate matters
- [ ] **Ironman Mode** — permadeath on 3rd death + survival mechanics
- [ ] **Nightmare Mode** — one death, game over. World actively works against you.

### Narrator Styles (AI Model Selection)
- [ ] **The Chronicler** — rich literary storytelling, deep lore, beautiful prose (GPT-4o)
- [ ] **The Game Master** — classic DnD energy, balanced story/mechanics, rules-aware (GPT-4o mini)
- [ ] **The Wildcard** — unpredictable, chaotic, genuinely surprising
- [ ] **The Grimdark** — brutal, unforgiving, no sugarcoating. Nightmare mode companion.
- [ ] **The Companion** — warm, conversational, accessible. Great for casual/younger players.
- [ ] Player selects narrator at world entry, can switch between sessions

### Audio System (ElevenLabs + Ambient)
- [ ] **Narrator Voice** — curated ElevenLabs voices with personality names
  - e.g. "The Chronicler", "The Wanderer", "The Oracle"
- [ ] **Ambient Audio** — dynamic background sounds matching scene (forest, tavern, dungeon, storm)
  - Auto-switches based on narrator scene description
- [ ] **Dynamic Music** — mood-based score (combat, exploration, rest, danger)
- [ ] **Custom NPC Voices** — different voices for different NPCs (gruff dwarf, ethereal elf etc.)
- [ ] ElevenLabs API key integration (player-owned or Aurora backend)

---

## 🔮 FUTURE — Phase 3 (Expansion)

### World Depth
- [ ] Quest system with branching paths
- [ ] World map (text-based first, visual later)
- [ ] Dynamic world events (faction wars, disasters, opportunities)

### Lore Library Expansion
- [ ] Add more known worlds beyond the initial 8
- [ ] Community-submitted worlds

### 2D Visual Mode
- [ ] Pixel art style (Stardew Valley / Undertale / Omori inspired)
- [ ] Cross-platform: mobile, console, PC
- [ ] AI-generated pixel portrait based on character data, manual customization optional
- [ ] Context-sensitive perspective switching:
  - Overworld + towns = top-down
  - Dungeons + caves = side-scrolling
  - Boss arenas = isometric
- [ ] Controls shift naturally with perspective
- [ ] Zone type maps to perspective automatically, player can override

### Special Modes (Future)
- [ ] **Children's Mode**
  - Warm, encouraging, age-appropriate language
  - Violence is consequence-free and cartoonish
  - No dark themes, death = "knocked out"
  - Parent-safe content filters
  - Cuddly narrator voice
- [ ] **Educational Mode**
  - World set in real historical era (Ancient Rome, Medieval Japan etc.)
  - Players learn by living in the era
  - Real historical facts woven naturally into story
  - Knowledge tracking — quiz mode at end
  - Teacher-assignable worlds, student play-through
  - Subjects: history, science, math, literature

### Public Release
- [ ] Cloud saves (cross-device sync)
- [ ] Multiplayer / shared worlds
- [ ] Community world browser

---

## 📝 Notes
- Aurora is heavily inspired by AI Realm but built to accommodate ALL audiences
- Audio system modeled after AI Realm's ElevenLabs integration
- Build With Vesper is the heart of the app — Marion's personal creative tool
- Educational mode potential: school distribution channel, teacher-assigned worlds
- Children's mode opens Aurora to family market
- All systems must support the 10-200 stat scale (E through A tiers)
