# Daily Aurora Research: NPC Dialogue & Conversation Systems
**Date:** 2026-05-10

## What I Researched
How top RPGs handle NPC dialogue, memory, and conversation mechanics — looking at traditional dialogue trees vs. AI-driven approaches.

## Key Findings

### Traditional RPG Dialogue (Baldur's Gate 3, Skyrim)
- **Dialogue Trees**: Menu-based choices that branch based on player input
- **Pro**: Fully scripted, predictable, controlled narrative flow
- **Con**: Massive writing/scripting overhead. BG3 has 200k+ lines of dialogue. Not scalable for dynamic worlds.

### AI Realm's Approach (Most Relevant to Aurora)
AI Realm v2 just launched a brilliant **NPC Cards system**:

1. **Rich NPC Profiles**: Up to 30,000 chars per NPC (appearance, personality, motivations, secrets, relationships, quest hooks)
2. **Smart Context Management**: Only *enabled* NPCs count toward AI context budget
   - You can have 100+ NPCs created but only active 10-15 at a time
   - Disable NPCs when leaving an area (no wasted context)
   - Re-enable instantly when returning
3. **Labels & Filtering**: Organize NPCs by location, faction, importance, relationships
   - Bulk actions: "Disable all Festival NPCs" after an event
   - Filter: "Show all Capital City NPCs" 
4. **AI Assistant Updates**: After story events, AI updates relevant NPCs in batch
   - "Update all Riverwood NPCs — they now see me as a hero"
   - Keeps consistency without manual rewrites

### The Big Insight
AI Realm solves the memory problem differently than we did:
- We compress conversation history into summaries (rolling memory)
- They compress NPC profiles into toggleable cards

**Both work, but together they're powerful:** persistent character data + smart context = NPCs that remember you AND don't break the AI's token budget.

## How This Applies to Aurora

### What We Already Have
✅ Campaign memory that remembers all past events
✅ NPC registry that tracks names & attitudes
✅ Quest tracking

### What We Could Add (Priority Order)

**Phase 1 (Near term):** NPC Conversation System
- When player talks to an NPC, open a mini-dialogue interface
- AI responds as that NPC (pulling their personality from the registry)
- Each conversation auto-updates the NPC's "attitude" and "notes"
- Example: Talk to blacksmith → attitude stays "friendly" but notes update to "knows you need a sword"

**Phase 2:** NPC Memory Persistence
- NPC cards include conversation history snippets
- When re-encountering an NPC, inject recent convos into prompt
- "You've talked to Marcus 3 times. In your last chat he mentioned..."

**Phase 3:** NPC Schedules & Routines
- NPCs have locations and times they're there
- "Find the blacksmith at the forge during daylight, tavern at night"
- Adds world-building without extra effort

**Phase 4:** Multi-NPC Interactions
- NPCs have relationships with each other
- Conversations can branch on "Who do you want to side with?" decisions
- Creates social graph complexity

## Technical Notes
- NPC conversation could work as a modal/sidebar that pops up during play
- Store conversation snippets in the NPC card for future reference
- Use AI to auto-generate attitude shifts ("Marcus now sees you as: trusted")
- Keep enabled NPC count low (10-15) to preserve context budget

## Recommendation for Marion
**Start with Phase 1.** Adding a simple "Talk to [NPC name]" button during play would make the world feel alive instantly. NPCs would respond contextually and their attitudes would evolve. No complex dialogue trees needed — just freeform conversation like the main gameplay, but focused on that character.

This is the missing piece between "campaign remembers events" and "NPCs remember YOU."

---

**Next research topic to consider:** World event chains (how to string together quests/events over time) or Reputation/Faction Standing systems.
