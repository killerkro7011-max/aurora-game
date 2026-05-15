with open('/app/aurora_v3.html', 'r', encoding='utf-8') as f:
    content = f.read()

OLD_ASSESS = '''function cobuildAssessCoverage() {
  // Look at player messages and flag which major areas have been touched
  var transcript = state.cobuildMessages.filter(function(m){ return m.role === 'player'; }).map(function(m){ return m.text.toLowerCase(); }).join(' ');
  var areas = [];
  if (/magic|spell|power|ability|mana|force|energy/.test(transcript)) areas.push('magic system');
  if (/war|empire|kingdom|faction|clan|guild|politi/.test(transcript)) areas.push('factions/power');
  if (/danger|monster|threat|enemy|dark|death|surviv/.test(transcript)) areas.push('danger/conflict');
  if (/secret|hidden|mystery|ancient|forbidden|unknown/.test(transcript)) areas.push('secrets');
  if (/feel|vibe|tone|dark|light|grim|hope|cozy|horror/.test(transcript)) areas.push('tone/vibe');
  return areas.join(', ') || 'none yet';
}'''

NEW_ASSESS = '''function cobuildAssessCoverage() {
  // Look at player messages and flag which major areas have been touched
  var transcript = state.cobuildMessages.filter(function(m){ return m.role === 'player'; }).map(function(m){ return m.text.toLowerCase(); }).join(' ');
  var areas = [];
  if (/magic|spell|power|ability|mana|force|energy|ritual|curse/.test(transcript)) areas.push('magic/power system');
  if (/war|empire|kingdom|faction|clan|guild|politi|ruler|king|queen|leader/.test(transcript)) areas.push('factions/power');
  if (/danger|monster|threat|enemy|dark|death|surviv|predator|creature/.test(transcript)) areas.push('danger/conflict');
  if (/secret|hidden|mystery|ancient|forbidden|unknown|buried|truth/.test(transcript)) areas.push('secrets');
  if (/feel|vibe|tone|dark|light|grim|hope|cozy|horror|brutal|whimsical/.test(transcript)) areas.push('tone/vibe');
  if (/people|culture|race|religion|god|worship|belief|custom|tradition|language/.test(transcript)) areas.push('culture/people');
  if (/land|setting|geography|place|city|forest|mountain|sea|desert|underground/.test(transcript)) areas.push('world setting');
  return areas.join(', ') || 'none yet';
}'''

if OLD_ASSESS in content:
    content = content.replace(OLD_ASSESS, NEW_ASSESS)
    print("✅ Replaced cobuildAssessCoverage")
else:
    print("❌ cobuildAssessCoverage not found")

# Also update the snapshot turn minimum from 10 to 12 in the send function
OLD_TURN = 'After turn 10, if you feel you have covered'
NEW_TURN = 'When you have genuinely rich answers across'

with open('/app/aurora_v3.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Done patching coverage function")
