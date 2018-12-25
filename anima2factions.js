class Opinion {
  constructor(config) {
    this.opinionName = config.opinionName
    this.level = config.level;
    this.factors = config.factors; // This is an array of objects which include a time/date, a modifier, and a string with the reason.
  }
  influence(amount) {
    this.level += amount;
  }
}

class Relationship {
  constructor(config) {
    this.char = config.char;
    this.level = config.level;
    this.relationshipType = config.relationshipType;
  }
  changeType(type) {
    this.relationshipType = type;
  }
}

function generateRelationship(charName, level, special) {
  let c = {
    char: charName,
    level: level,
    relationshipType: ''
  }
  if (c.level >= 0 && c.level <= 25) { c.relationshipType = 'Acquaintance'; }
  if (c.level >= 26 && c.level <= 50) { c.relationshipType = 'Ally'; }
  if (c.level >= 51 && c.level <= 75) { c.relationshipType = 'Friend'; }
  if (c.level >= 76) { c.relationshipType = 'Close Friend'; }
  if (c.level < 0 && c.level >= -33) { c.relationshipType = 'Annoyance'; }
  if (c.level < 33 && c.level >= -66) { c.relationshipType = 'Hostile'; }
  if (c.level < 66 && c.level >= -98) { c.relationshipType = 'Enemy'; }
  if (c.level < 98) { c.relationshipType = 'Pure Hatred'; }
  return new Relationship(c);
}

function compareOpinions() {
  
}

function determineInitialRelationshipLevel() {
  // This function will compare visual factions of a character against another character's opinions.
}

// Okay. So what we need is a system for personal relationships, relationships to factions, and a way to be identified by faction.
// Personal relationships will affect: Aggression/peace on sight, relationship to any factions displayed.
// Faction relationships will affect: Aggression/peace upon knowledge of faction, relationship to individual upon knowledge of faction.
// Faction identification will be a function that is run by a character declaring faction or upon sight of identifying factors.
