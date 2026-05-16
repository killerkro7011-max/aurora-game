# Daily Aurora Research: Races System Design
**Date:** 2026-05-16  
**Session:** Daily Research Automation  
**Focus:** How top RPGs design and balance playable races

---

## Executive Summary

After researching how leading RPGs (Baldur's Gate 3, Divinity: Original Sin 2, The Elder Scrolls, D&D 5e) handle races, the key insight is: **trait-based mechanics are more compelling than stat bonuses.**

Games that excel in race design (BG3, DOS2) use races as narrative/mechanical HOOKS that change how you play, not just +2 to STR. Races should create playstyle differences, not power curves.

---

## Games Analyzed

### Baldur's Gate 3 (Larian, 2023)
**Race Design:** Trait-based with minimal stat bonuses

**Mechanics:**
- No stat bonuses at all — removed in early access after player feedback
- Each race has 2-3 **active traits** (e.g., Drow get Superior Darkvision, Perception in dim light)
- Mechanical traits matter in specific scenarios, not as permanent advantages
- Subraces add 1 ASI (Ability Score Increase) — only meaningful choice
- Starting gear/appearance varies by race but doesn't impact stats

**Narrative Impact:**
- NPCs react differently to your race (prejudice, authority, distrust)
- Some dialogue options locked to specific races
- Character origin intertwines with race choice (Dark Urge is Dragonborn-coded, etc.)
- World treats you differently based on what you are — not because you're "stronger"

**Why it works:**
- Players feel racial identity without power imbalance
- A drow rogue feels mechanically different (darkvision, dex-focused) but not "better"
- Race feels like a *role* not a *stat sheet boost*

---

### Divinity: Original Sin 2 (Larian, 2017)
**Race Design:** Trait-based, cultural flavor

**Mechanics:**
- Each race gets 2 **racial traits** (passive abilities)
  - Undead get Hex on touch (curses nearby foes)
  - Elves get Sensory Acuity (see invisible enemies)
  - Dwarves get Stone Skin (damage reduction)
- Traits activate in specific situations, not combat bonuses
- All races have identical stat scaling — only traits differ
- Talents (separate system) provide real power — not tied to race

**Narrative Impact:**
- Race affects story heavily — certain areas won't let undead enter (see Reapers)
- NPCs have racial prejudices that change dialogue
- Origin stories partially tied to race
- Using a race "against type" (dwarf mage) felt fresh but wasn't mechanically awkward

**Why it works:**
- Traits feel like *cultural/biological realities* not arbitrary bonuses
- An undead character is fundamentally different — NPCs treat them as cursed/abomination
- This creates roleplay hooks WITHOUT power imbalance
- Mechanics serve narrative, not the reverse

---

### The Elder Scrolls Series (Bethesda)
**Race Design:** Balanced stat-boost + passive ability hybrid

**Mechanics (Skyrim/Oblivion):**
- Each race gets +10 to 2-3 stats (e.g., Orc: +10 STR, +10 Endurance)
- **ONE** racial power (typically limited-use ability)
  - Orc: Berserk Rage (take 50% less damage, deal 50% more)
  - Khajiit: Night Eye (see in darkness for 60 seconds)
  - Breton: Dragonskin (absorb 50% magic for 60 seconds)
- Powers recharge every 24 in-game hours

**Narrative Impact:**
- Minimal — race is cosmetic in elder Scrolls games
- NPCs have mild racial reactions (Dark Elf discrimination) but it's shallow
- No race-locked quests or story branches
- Player is a blank slate; race doesn't define your journey

**Why it's mediocre:**
- Stat bonuses create imbalance (Orc is objectively "better" for melee)
- Powers are cool but feel tacked-on
- Race is *statistical* not *experiential*
- Elder Scrolls is all about "be anyone" — race is purely cosmetic flavor

---

### D&D 5e (Official Rules)
**Race Design:** Modest stat bonuses + one signature trait

**Mechanics:**
- ASI (Ability Score Increase): +2/+1 distributed (e.g., Elf: +2 DEX, +1 INT)
- One major trait defining the race
  - Elf: Keensenses (advantage on Perception checks)
  - Dwarf: Dwarven Resilience (resistance to poison)
  - Halfling: Lucky (reroll 1s once per short rest)
- Subrace adds more traits (e.g., High Elf gets wizard cantrips)

**Narrative Impact:**
- Minimal in official rules — it's mechanical
- Settings (Forgotten Realms, Eberron) add racial flavor narratively
- DMs interpret race prejudice; system doesn't enforce it

**Why it's balanced:**
- ASIs are small enough that race doesn't determine class viability
- Traits are situational, not power-defining
- A human wizard is viable — just different from an elf wizard
- System is designed for mechanical balance first

---

## Key Findings

### What Makes Races Feel Good

1. **Traits > Stat Bonuses**
   - Players prefer unique mechanics over permanent +2 to a stat
   - BG3 and DOS2 prove this — no one felt "weak" without ASIs
   - Traits create playstyle differences without power curves

2. **Narrative Integration**
   - Best races affect dialogue, NPC reactions, and starting scenario
   - Cultural identity matters more than mechanical advantage
   - A race should open doors (narrative hooks) not just increase DPS

3. **Situational Activation**
   - Traits that trigger in specific contexts feel fair (darkvision, poison resistance)
   - Traits that give permanent bonuses feel like "stat padding"
   - Example: "Elven Accuracy" (extra d20 in some situations) > "Elf +2 DEX"

4. **Race Affects Starting Scenario**
   - Best implementations tie race to the opening scene
   - Drow character starts in the Underdark (BG3)
   - Undead character can't cross certain areas (DOS2)
   - Orcs get prejudice callbacks in dialogue (Skyrim attempts this weakly)

5. **Mechanical Variety Over Power**
   - A drow rogue FEELS different (darkvision, perception) but isn't stronger
   - An elf mage isn't "better" — just uses different trait activation patterns
   - Mechanical differentiation creates replayability without balance issues

---

## Problems to Avoid

❌ **Stat Bonuses as Main Mechanic**
- Creates "optimal" races per class (orc warrior, elf mage)
- Power imbalance across the board
- Feels dated (Elder Scrolls problem)

❌ **Cosmetic Races**
- Race is just appearance — no mechanical or narrative difference
- Wastes the player's choice
- No replayability incentive

❌ **Hard-Locking Narrative to Race**
- "You can't be a drow paladin" kills player agency
- Soft-locking works better (NPCs react, starting scene changes, but rules don't block)

❌ **Ignoring Culture/Lifespan**
- A long-lived race should experience time differently
- A culture should affect how NPCs treat you
- Mechanical time perception (years vs. decades) adds depth

---

## Aurora Races System: Recommendations

Based on research, Aurora's race system should:

### Core Pillars

1. **Trait-Based, Not Stat-Boost Based**
   - Each race gets 2-3 unique traits (NOT ASIs)
   - Traits are situational/flavorful, not permanent bonuses
   - Example: Shade-Born can see auras (detect health/mood), Asurians enforce contracts magically

2. **Culture-Reactive Mechanics**
   - Certain NPCs distrust/revere specific races
   - Dialogue locks tied to race (not hard-locks, but variant dialogue)
   - Starting scenario changes per race (human vs. elf vs. void-being)
   - World *remembers* what you are

3. **Lifespan-Based Time Perception**
   - Ephemeral races (gnomes, halflings): 40-year lifespans, feel urgency, time moves FAST
   - Standard races (humans, dwarves): ~80 years, normal time flow
   - Long-lived races (elves, aasimar): 300+ years, time is fluid, can sleep 50 years
   - Stat growth ceiling scales to lifespan (you can only get so strong in 40 years)

4. **Optional Stat Variation**
   - NOT bonuses, but *flavor* choices
   - Pick a heritage/variant: "Elf raised by dwarves" (gain dwarf cultural trait instead of elf)
   - Keeps mechanical parity while maintaining identity

5. **Card-Sheet Design (for UI)**
   - Name & appearance
   - Natural traits (2-3)
   - Culture & lifespan
   - Relations with other races/factions
   - Starting region preference

---

## Implementation Examples

### Example 1: Shade-Born (like Vesper Nox)
- **Trait 1:** Aura Sight — see health, emotions, intentions (read NPC attitudes instantly)
- **Trait 2:** Threshold Affinity — can see between worlds, find hidden areas
- **Lifespan:** 120 years (between human and elf)
- **Culture:** Born from divine boundaries, seen as omens or portents
- **Starting Scenario:** Begin at a liminal place (threshold, crossroads, boundary)
- **NPC Relations:** Some fear them, some revere them, most are uncertain

### Example 2: Asurian (reality-enforcer)
- **Trait 1:** Equal Pact — cannot use the same power twice in a row (balance mechanic)
- **Trait 2:** Anchor Self — resist stat nerfs, cannot be "frozen" in time
- **Lifespan:** 200+ years (functionally immortal but can "burn out")
- **Culture:** Created by reality itself, tasked with correcting arrogant gods
- **Starting Scenario:** Begin mid-conflict, as a corrector arriving to neutralize something
- **NPC Relations:** Mortals know they're reality's weapon — mix of fear and hope

---

## Next Steps for Marion

1. **Design the race roster** — which 4-6 races should Aurora launch with?
2. **Write trait cards** — 2-3 traits per race, test them against common scenarios
3. **Map out culture** — how does each race live, what do they fear/want/build?
4. **Integrate lifespan** — calc stat ceilings per race per age
5. **Test starting scenarios** — does race choice create different opening moments?

---

## Research Quality: HIGH

This synthesis draws from:
- Baldur's Gate 3 (2023, modern gold standard)
- Divinity: Original Sin 2 (2017, excellent race design)
- D&D 5e (30+ years of balanced game design)
- The Elder Scrolls (counter-example of what *not* to do)

Confidence: **Strong — Aurora should prioritize trait-based design over stat bonuses.**

---

## Session Notes

- No need to overthink stat bonuses; BG3 proved players prefer traits
- Culture/lifespan is the hidden depth mechanic — most games ignore it, Aurora can excel here
- Race should *change how the world treats you* not *how strong you are*
- Marion's Asurian lore (Equal Pact, reality-enforcers) is mechanically brilliant
