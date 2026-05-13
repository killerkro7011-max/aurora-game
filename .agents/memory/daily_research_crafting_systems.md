# Daily Aurora Research: Crafting & Equipment Progression
**Date:** May 13, 2026

## Topic: Crafting Systems & Equipment Specialization in RPGs

### Key Findings

#### Three Core Crafting Archetypes

**1. Ingredient-Based Crafting (Skyrim, Witcher 3)**
- Collect raw materials (ores, herbs, monster parts) from the world
- Combine at crafting stations (forge, alchemy bench, workbench)
- Recipes unlock through progression or discovery
- Pro: World exploration becomes purposeful (every herb matters)
- Con: Inventory bloat, overwhelming number of recipes
- Aurora fit: MEDIUM — we have inventory system, but text-adventure exploration is different from open-world hunting

**2. Upgrade/Modification Systems (Dark Souls, Elden Ring)**
- Players find a base weapon/item and enhance it through materials
- Leveling doesn't replace gear — gear levels WITH the character
- Encourages weapon attachment ("my first longsword")
- Pro: Reduces loot anxiety, gives direction to farming
- Con: Can trivialize difficulty if upgrades too generous
- Aurora fit: EXCELLENT — complements mastery system. A character with INT should craft better spells; DEX = better bows

**3. Enchantment/Socketing (Diablo 2, Path of Exile)**
- Unique drops with random properties
- Socket systems let players modify loot by adding gems/runes
- Reroll mechanics allow chasing "perfect" stats
- Pro: Makes loot exciting, gives agency over randomness
- Con: Can become obsessive grinding, "gear treadmill" problem
- Aurora fit: GOOD — could support enchanting items with stat modifiers or ability gems

#### Critical Success Patterns

**Progression Balance:**
- Early game: Simple crafting (basic weapons, healing potions). Bottleneck is materials, not recipes.
- Mid game: Specialized crafting unlocks (class-specific gear, transmutations). Cost increases, but reward is significant.
- Late game: Endgame crafting (perfecting builds, exotic transmutations). Can take weeks of farming for 1-2% stat gain.
- Danger: Crafting should never feel mandatory. Players who don't craft should still be viable (just different playstyle).

**Stat Distribution:**
- **Scaling:** Items scale with player level (basic) OR player stats (advanced)
  - Dark Souls: Item damage scales with player STR/DEX/INT/FAI depending on weapon
  - Skyrim: Crafting skill determines weapon quality, so higher-skill smiths make better gear
  - Aurora fit: Weapons could scale with STR, spells with INT, potions with WIS
- **Rarity:** Legendary/epic gear shouldn't be "obviously better" — should have tradeoffs
  - Example: Legendary sword has high damage but slow attack speed (DEX penalty)
  - Encourages build diversity, not gear monoculture

**Bottleneck Design:**
- **Time-gate:** Crafting takes real time (1 minute per item) — prevents instant gear swaps
- **Resource-gate:** Rare materials drop rarely, preventing mass production
- **Level-gate:** Recipes locked to character level or specific stat thresholds
- **Effort-gate:** Crafting stations must be visited (no mobile crafting)

#### The Loot Problem: Gear Obsolescence vs. Attachment

**Bad:** New loot always replaces old loot (Everweave problem — Marion noted this). Player's first sword is instantly trash.

**Good:** Upgradeable gear you care about (Dark Souls). You can make your starter weapon + 15 (max level) and it's competitive with any late-game drop.

**Best:** Mixed approach. Some gear is grindable (upgrade what you love), some is unique drops (exotic playstyles), some is crafted (building towards an ideal).

### Crafting in Narrative vs. Visual Mode

**Narrative Mode (Text Adventure):**
- Crafting is *descriptive*, not mechanical
- "You spend the evening smithing a new longsword from the ore you found."
- Outcome determined by narrator, informed by INT/STR/materials
- Less about min-maxing, more about **what you're telling yourself your character is building**
- Example: "A poor merchant might craft a simple dagger. An alchemist studies rare plants to brew an antidote."

**Visual Mode (2D Exploration):**
- Crafting UI with actual stations (forge, alchemy bench, enchanter's table)
- Drag-and-drop ingredient combination
- Real-time or turn-based crafting animations
- More mechanical, stat-heavy

### Implications for Aurora (Phase 2 candidate)

**What We Already Have:**
✅ Inventory with 20 slots, item rarity tiers, item types
✅ Gold economy
✅ Stat system (STR, DEX, CON, INT, WIS, CHA, SMY)
✅ Narrative AI that can describe outcomes

**What We Could Add:**

**1. Stat-Scaled Crafting** (Phase 2, high priority)
- When player gathers materials (hunt, forage, explore), narrator can offer:
  - "You could smith this ore into a basic sword (no requirement) or a finely crafted blade (STR 80+)"
  - "You found rare herbs — brew a basic potion (no requirement) or an enhanced draught (INT 70+)"
- Higher stat = better item quality, lower failure chance, faster crafting time
- Scales with mastery levels

**2. Transmutation/Upgrade System** (Phase 2, medium priority)
- Players can combine 3 common items into 1 rare item
- Example: 3x rough ore + 10g → 1x quality ore (used for better weapons)
- Or: 1x epic sword + rare gems + 50g → 1x legendary sword (same base, enhanced)
- Creates a path for players who found mediocre loot to rebuild it into something personal

**3. Class-Specific Recipes** (Phase 2, medium priority)
- Warrior finds "Heavy Armor Smith" NPC — unlocks plate armor recipes (STR scaling)
- Rogue finds "Poison Alchemist" — unlocks toxin recipes (DEX + INT scaling)
- Mage finds "Spellsmith" — unlocks enchanted staff recipes (INT scaling)
- Healer finds "Herbalist" — unlocks potion recipes (WIS scaling)

**4. Crafting as Quest Hook** (Phase 2, low priority)
- NPC: "Bring me 10 moonflowers and I'll teach you their alchemy secrets."
- Turns exploration/gathering into quests naturally
- Narrator can reference these ongoing projects in scenes

**Risks to Watch:**
- Crafting can become a time sink that overshadows adventure (mitigation: cap crafting to 2-3 actions per session)
- Too many recipe branches break the narrative (mitigation: keep recipes simple, 5-10 per class max)
- Inventory bloat from materials (mitigation: use material consolidation — "ores" not "copper ore, iron ore, gold ore")
- Narrators might ignore crafting (mitigation: explicit prompt instruction: "If player wants to craft, describe the process and outcome")

### Comparison: Aurora vs. AI Realm vs. Everweave

**Aurora (current):**
- ✅ Has inventory, gold, item rarity
- ❌ No crafting system
- ❌ No equipment scaling

**AI Realm:**
- ✅ Has crafting systems (alchemy, smithing, cooking)
- ✅ Recipes scale with player level
- ❌ Players report recipes feel disconnected from adventure
- ❌ Loot still replaces old gear constantly

**Everweave (old Colossal Cave Adventure spiritual successor):**
- ✅ Had crafting (basic)
- ❌ Broken inventory, no stat scaling
- ❌ Crafted items worse than found items (loot treadmill)

**Aurora could be better by:**
- Tying crafting to stat scaling (your INT affects potion quality)
- Making crafted items **upgradeable**, not replaceable
- Narrating the crafting experience (not just "loot gained")
- Using crafting as natural quest hooks

### Recommendation for Marion

**Phase 2 should open with stat-scaled crafting.** When the player's narrator offers "You could craft a basic sword or a masterwork sword", the decision opens a whole new layer: do I have the stats? Will trying and failing lose materials? Should I level up STR first?

This makes leveling meaningful *now* (can't craft the good stuff yet), makes exploring for materials feel purposeful, and gives the mastery system actual mechanical hooks.

Start simple: 3-5 recipes per life path. Let players discover they can craft. Don't overwhelm with complexity.

---

**Researched:** Crafting system design, stat scaling, equipment progression, loot vs. upgrade balance.

**Next research topic suggestions:** 
- Reputation/faction standing systems (how quests affect NPC attitudes at scale)
- Procedural quest generation (creating varied mission types from components)
- Permadeath & ironman modes (how to make failure meaningful without frustration)
