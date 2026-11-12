// Classes e specs do WoW (Midnight). Fica em string no banco de propósito:
// quando a Blizzard adiciona uma spec, você só atualiza esta lista, sem migration.
export const SPECS_BY_CLASS = {
  "Death Knight": ["Blood", "Frost", "Unholy"],
  "Demon Hunter": ["Havoc", "Vengeance", "Devourer"],
  Druid: ["Balance", "Feral", "Guardian", "Restoration"],
  Evoker: ["Devastation", "Preservation", "Augmentation"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Mage: ["Arcane", "Fire", "Frost"],
  Monk: ["Brewmaster", "Mistweaver", "Windwalker"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Rogue: ["Assassination", "Outlaw", "Subtlety"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Warrior: ["Arms", "Fury", "Protection"],
} as const;

export type WowClass = keyof typeof SPECS_BY_CLASS;

export const WOW_CLASSES = Object.keys(SPECS_BY_CLASS) as [WowClass, ...WowClass[]];

export function isValidSpec(wowClass: WowClass, spec: string) {
  return (SPECS_BY_CLASS[wowClass] as readonly string[]).includes(spec);
}
