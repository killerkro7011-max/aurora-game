# Daily Aurora Research: Dialogue Systems in RPGs
**Date:** May 12, 2026

## Topic: Dialogue Systems & NPC Interaction Design

### Key Findings

#### Two Main Dialogue System Types

**Turn-Based (Best for Aurora)**
- Players pause to select from predefined options
- Allows in-depth conversations and character development
- Easy to follow, gives full player control over pacing
- Works well for text-heavy games (perfect for Narrative Mode)
- Examples: KOTOR, Dragon Age, Mass Effect, Witcher 3
- Can handle complex branching with many variables and outcomes
- Narrative tools: Twine, Inkle, Articy allow designers to map complex trees

**Dynamic (Real-time)**
- Faster-paced, constant NPC responses
- Players react in real-time with limited time windows
- More natural but harder to follow if too much happens
- Risk of player missing dialogue amid complexity
- Example: Oxenfree (casual conversations while exploring)
- NOT ideal for Aurora's text-adventure style

#### Critical Success Factors

1. **Personality & Voice Consistency**
   - Dialogue must be tailored to character personality
   - AI generation requires strong character profiles (tone, accent, values, speech patterns)
   - Voice consistency checks prevent characters from contradicting themselves
   - Characters in hand-written dialogue often sound more authentic

2. **Narrative Design Integration**
   - Narrative designer should be involved EARLY, not after mechanics are done
   - Story shouldn't feel "tacked on" — mechanics and narrative must work together
   - Dialogue conveys plot points AND character motivation simultaneously
   - Overusing cutscenes reduces player agency (keep it in-game)

3. **NPC Relationship Systems**
   - Relationship scores track how NPCs feel about the player (-5 to +5 range common)
   - Different NPCs react differently to different actions/dialogue choices
   - Reputation mechanics show how world perceives player vs. individual relationships
   - Actions have consequences that ripple through NPC attitudes

4. **Quest Integration**
   - Dialogue and quests must work together for immersion
   - Quests should emerge naturally from NPC conversations
   - "Who has the pan?" style memorable moments make world feel alive

### Implications for Aurora

**What Works For Us:**
- Turn-based is RIGHT for Aurora Narrative Mode
- AI can handle dialogue generation if given strong NPC profiles
- Campaign memory (which we have) helps maintain consistency across sessions
- Backstory integration (already implemented) creates personal dialogue hooks

**What We Need to Build:**
1. **NPC Reputation System** — track how each NPC feels about player (attitude tags exist, need scoring)
2. **Dialogue Branching** — character choices should matter; different NPCs react to same choice differently
3. **Consistent NPC Voice** — narrator needs stronger instructions on NPC personality/voice consistency
4. **Consequence Tracking** — dialogue choices affect future NPC interactions

**Risks to Watch:**
- AI can break character if not given clear personality guidelines
- Too many dialogue options = complexity explosion; keep it focused
- Dialogue must advance plot OR relationship, not just exist
- Backstory can be ignored if not explicitly mentioned in every relevant scene

### Next Steps for Aurora

Phase 2 could focus on:
1. Formalize NPC reputation scoring (tie to dialogue trees)
2. Add NPC personality blocks to narrator (speech style, fears, values)
3. Make dialogue choices affect future quest availability
4. Track "memorable moments" players create through dialogue

---

### References
- Konrad Hughes: RPGs and Dialogue Systems (comprehensive design guide)
- Character AI voice consistency (2026 research on AI character generation)
- BioWare trilogy approach (complex dialogue with many variables)
- Oxenfree (real-time dialogue example, different approach from Aurora's needs)
