# Daily Aurora Research: Faction & Reputation Systems
**Date:** May 16, 2026

## Topic: Faction Mechanics, NPC Standing, and Consequence Systems in RPGs

### Research Overview
Synthesized faction system patterns from Skyrim, Fallout, Dragon's Dogma, Witcher 3, and AI Realm to identify best practices for Aurora's Phase 2 faction system.

---

## Key Findings: How Factions Work in Major Games

### Skyrim's Faction System (Gold Standard)
**Structure:**
- Distinct organizations (Dark Brotherhood, Thieves Guild, Companions, etc.)
- Clear hierarchy, join/leave model
- Each faction has allies and enemies

**Reputation Mechanic:**
- Invisible reputation stat per faction (0-100+)
- Quests give/subtract rep (10 pts for major quest, -5 for failure)
- Faction members' dialogue changes based on standing
- High standing: unique quests, better prices, safe houses
- Low standing: NPCs refuse, attack on sight, bounty hunters

**Consequence:**
- Joining Thieves Guild = civil merchants raise prices
- Joining Dark Brotherhood = guards know your face
- Civil War choice locks out opposite side permanently
- Some questlines mutually exclusive

**Strength:** Clear progression, meaningful choices, world reacts
**Weakness:** Factions feel separate, quest repetition, joining one = missing others

---

### Fallout Series (Dynamic Faction System)
**Structure:**
- Multiple overlapping factions (Brotherhood, Institute, Railroad, Minutemen)
- Factions have conflicting goals
- Player can work multiple factions simultaneously (until endgame)
- Invisible standing per faction

**Reputation Mechanic:**
- Quests directly raise/lower standing
- Negative actions auto-trigger (kill faction member = standing loss spreads)
- "Liked" → "Loved" → "Idolized" tiers with perks
- Perks: Discounts, recruits, unique weapons, safe bases

**Consequence:**
- Playing all sides = eventual betrayal (must choose)
- Faction wars reshape geography (areas controlled by different factions)
- Questline conflicts force choices

**Strength:** Player agency, complex political web, multiple playthrough paths
**Weakness:** Endgame forced choice feels railroaded, some factions underdeveloped

---

### Dragon's Dogma (Intuitive Faction System)
**Structure:**
- Guilds with specific purposes (Merchant's Guild, Fighter's Guild, Assassin's Guild)
- Player joins ONE guild, progresses through ranks
- NPC questgivers are guild members
- Rank determines NPC treatment, mission complexity, abilities

**Reputation Mechanic:**
- Public reputation (common folk) separate from guild rank
- Accepting bounties raises rep, refusing lowers it
- Certain actions damage public rep (theft, trespassing)
- High public rep = NPCs talk freely, discounts, quests unlock
- Low public rep = NPCs avoid you, guards pursue

**Consequence:**
- Choosing different guilds = different boss fights, gear
- Public rep affects relationships (low rep = marriage refusals)
- Some NPCs only appear for specific guild

**Strength:** Public vs. guild distinction, emotional consequences, earned progression
**Weakness:** Less political depth, fewer faction conflicts

---

### The Witcher 3 (NPC-Centric Reputation)
**Structure:**
- Reputation tied to specific NPCs and organizations
- Factions = organizations (Empire, Northern Kingdoms, Wild Hunt, etc.)
- Player builds standing by helping individuals or siding in conflicts
- Choices affect which NPCs are friendly or hostile

**Reputation Mechanic:**
- Per-NPC attitude (quest outcomes alter relationship)
- Organization standing inferred from NPC attitudes
- Dialogue changes based on past actions with that NPC
- Some quests locked behind relationship thresholds

**Consequence:**
- Helping Triss vs. Yennefer affects endgame romance
- Political choices lock out questlines
- NPC deaths are permanent (consequences cascade)

**Strength:** Emotional weight, all consequences feel personal, choices matter
**Weakness:** Can be obtuse, easy to "lock out" content accidentally

---

## How AI Realm Implements Factions

**AI Realm's approach:**
- Factions are part of world lore (mentioned in narrative)
- NPC reactions vary based on faction knowledge of player
- Quests often involve choosing which faction to help
- Standing affects dialogue options and available quests
- Less granular than Skyrim (no visible rep bar), more organic

**Strength:** Narrative-first, world feels cohesive
**Weakness:** Hard to know where you stand with factions, standing changes feel subtle

---

## Critical Design Decisions for Aurora

### 1. What's a Faction?

**Option A: Organization Factions (Skyrim-style)**
- Examples: The Merchant's Collective, Shadow Syndicate, Church of Light
- Clear hierarchy, join/leave model
- Con: World feels modular

**Option B: Ideological Factions (Fallout-style)**
- Examples: Technocrats vs. Naturalists, Order vs. Chaos
- Overlapping ideologies, player must choose sides
- Con: Less concrete, harder to roleplay "joining"

**Option C: Faction Networks (Witcher 3-style) ← RECOMMENDED**
- Examples: The Blacksmith's Circle, The Merchant's Trust, The Shadow Guild
- Built from NPC relationships, standing emerges organically
- Fits text-adventure format naturally
- Integrates seamlessly with existing NPC registry
- Doesn't require explicit "joining" (reduces friction)
- Easier for AI Realm integration (factions are NPC-driven)

---

### 2. How Should Factions Affect Gameplay?

**Dialogue Changes** (Easy, High Impact)
- "The Blacksmith notices you're friendly with the Merchant's Trust. She gives you a discount."
- "The Shadow Guild has marked you as a traitor. Alley NPCs won't talk to you."

**Quest Availability** (Medium, High Impact)
- "The Church of Light offers you a sidequest only if you've spoken favorably about them 3+ times."
- "The Wilderness Tribe refuses your help if you're aligned with the Technocrats."

**World State Changes** (Hard, Very High Impact)
- "The Merchant's Trust and Shadow Guild are at war. Your district now has guards/thieves."
- "The Naturalists destroyed the Factory. All tech-related quests are now unavailable."

**Resource Access** (Medium, High Impact)
- "As a friend of the Blacksmith's Circle, you can craft legendary items."
- "The Shadow Guild won't fence your stolen goods anymore."

**Combat Encounters** (Hard, Very High Impact)
- "A Merchant's Trust agent enters. She's heard you've been double-crossing them. Combat starts."
- "A group of Shadow Guild assassins confront you."

---

### 3. Faction Reputation Mechanics

**Simple Model (Recommended for Phase 2):**
- Invisible reputation score per faction (-50 to +50 scale)
- Each NPC interaction adds/subtracts 1-5 points
- NPC dialogue reflects standing tier:
  - -50 to -26 = "Hated"
  - -25 to 0 = "Neutral"
  - 1-25 = "Friendly"
  - 26-50 = "Trusted"
- No UI bar (narrator describes it: "The Blacksmith smiles warmly — she clearly values you.")

**Complex Model (Phase 3 future):**
- Visible faction UI (faction logo, standing bar, member list)
- Reputation tiers unlock perks (discounts, unique quests, recruitable members)
- Factions have mutual enemies/allies
- Faction wars (geographic control, quest objectives)

**Recommendation:** Start simple. Let the narrator handle standing description.

---

### 4. How Player Actions Modify Faction Standing

**Direct Actions:**
- Help NPC → +2 standing with their faction
- Refuse NPC quest → -1 standing
- Attack NPC → -10 standing (cascade to whole faction)
- Kill NPC → -20 standing, faction becomes hostile permanently (unless redeemed quest)

**Indirect Actions:**
- Craft item for NPC → +1 standing with their faction
- Defeat enemy of faction → +3 standing
- Steal from faction member → -5 standing

**Automatic Reactions:**
- "You helped the Shadow Guild's rival last week. This Thief eyes you suspiciously."
- "The Merchant's Trust knows you've been stealing. They hired a bounty hunter."

---

### 5. Faction Conflict Loops

**Example Scenario (3 factions):**
- Merchant's Trust: wants to expand trade
- Shadow Guild: wants to control trade routes
- Church of Light: wants to exclude "unholy commerce"

**Possible Outcomes:**
1. Player helps Merchant's Trust → Shadow Guild hostile, Church indifferent
2. Player helps Shadow Guild → Merchant's Trust loses trust, Church doesn't care
3. Player helps Church → Merchant's Trust and Shadow Guild both annoyed
4. Player ignores all → Merchant's Trust and Shadow Guild go to war, Church stays quiet

**Narrative Impact:** The world's political situation changes based on who the player has befriended. Two players in the same world will have different stories.

---

## Implementation Path for Aurora

### Phase 2 (MVP - Next)
**What:** Basic faction standing system
- Add `faction_reputation` field to PlayerCharacter entity (JSON: `{"faction_name": standing, ...}`)
- NPC registry expanded to include faction affiliation
- Narrator prompt updated: "Reference faction standing when describing NPC reactions"
- Narrator can suggest faction-related quests based on standing

**Data Structure:**
```json
{
  "name": "Kira the Wanderer",
  "factions": {
    "merchant_trust": 5,
    "shadow_guild": -3,
    "church_of_light": 0
  }
}
```

**Narrator Prompt Addition:**
> "The player has faction standing with various organizations. When an NPC acts, describe their reaction based on their faction affiliation. If the player's faction standing is relevant to the scene, reference it naturally."

### Phase 2 (Enhancement - Later)
- Faction standing affects NPC dialogue options
- Certain quests require minimum standing with faction
- Killing faction member auto-triggers standing loss

### Phase 3+ (Polish & Expansion)
- Faction UI (visible standing bars, perks unlock)
- Faction wars (world state changes)
- Recruitable faction members
- Faction-exclusive equipment/abilities

---

## Comparison: Aurora vs. AI Realm vs. Everweave

**Aurora (Current):**
- ✅ NPC registry exists
- ✅ Narrator is sophisticated
- ❌ No faction system
- ❌ No standing mechanics

**AI Realm:**
- ✅ Factions are part of lore
- ✅ NPC reactions vary
- ✅ Quests have faction choices
- ⚠️ Standing changes feel subtle (unclear to player)

**Everweave (old):**
- ❌ No faction system
- ❌ No NPC permanence

**Aurora could be better by:**
- Making standing **explicit in narrative** ("The Blacksmith trusts you deeply")
- Having standing **affect quest availability** (not just dialogue)
- Having faction wars **reshape the world** (Fallout-style)
- Tracking standing **publicly visible** (player always knows where they stand)

---

## Key Mechanics for Narrative Mode

Since Aurora is text-first, faction mechanics must work through dialogue and narration:

**Faction Recognition:**
> "As you enter the tavern, the bartender's expression hardens. You've been seen with the Shadow Guild. He slides a mug across the bar without meeting your eyes."

**Quest Gating:**
> Narrator: "The Blacksmith looks you up and down thoughtfully. 'I've heard good things about you from the Merchant's Trust. There's work if you're interested...'"

**Consequence Chains:**
> "Last week, you betrayed the Shadow Guild to help the Merchant's Trust. Tonight, a hooded figure slides a note across your table: 'The Guild remembers. You owe a debt.'"

**Faction Wars as Backdrop:**
> "The district has changed since last you were here. The Merchant's Trust now controls the market square. Shadow Guild runners hide in alleys, watching. The Church of Light has gained ground."

---

## Recommendation for Marion

**Phase 2 MVP:** Add faction standing to the PlayerCharacter entity and update the narrator prompt to reference faction affiliation in NPC reactions. This requires minimal code changes but adds significant depth to world interactions.

**Full implementation:** Faction wars + consequence chains should wait until Phase 2 is feature-complete. For now, let factions feel organic through dialogue.

**Next Research Topics:**
- Permadeath & Ironman mode systems (how to make failure meaningful)
- Procedural quest generation (creating varied mission types from components)
- Time & weather systems (how game time affects world state)

---

**Research Date:** May 16, 2026
**Status:** Ready for Marion review
**Sources:** Skyrim, Fallout 3/4/76, Dragon's Dogma, The Witcher 3, AI Realm player guides
