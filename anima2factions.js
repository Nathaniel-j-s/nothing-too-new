class Faction {
  constructor(config) {
    this.factionName = config.factionName || 'Solo';
    this.standing = config.standing;
    this.belief = config.belief;
    this.relations = config.relations; // This should be an array of objects consisting of a factionName and degree (which will range from -100 to 100).
  }
  influence(influencer, targetFaction) {
    // This is where this should go.
  }
}

class Relationship {
  constructor(config) {
    this.char = config.char;
    this.level = config.level;
    this.relationshipType = config.relationshipType;
  }
  increase(amount) {
    this.level += amount;
  }
  decrease(amount) {
    this.level -= amount;
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

function determineInitialRelationshipLevel() {
  // This function will compare visual factions of a character against another character's opinions.
}

class Opinion {
  constructor(config) {
    this.subject = config.subject;
    this.level = config.level;
    this.factors = config.factors; // This was originally going to be in a separate class, Knowledge.
  }
}

// A fellow faction member's relations can be modified by a character with a standing of 25 or higher.
// A character's faction relations may only be modified if their belief is above 25 however.
// The higher an influencer's standing combines with the character's belief to create their modification.
// This can result in the character being affected further than intended by the influencer.

// May require a full rework. Something about this seems like it won't fit in the overall scheme of the game.

// Okay. So what we need is a system for personal relationships, relationships to factions, and a way to be identified by faction.
// Personal relationships will affect: Aggression/peace on sight, relationship to any factions displayed.
// Faction relationships will affect: Aggression/peace upon knowledge of faction, relationship to individual upon knowledge of faction.
// Faction identification will be a function that is run by a character declaring faction or upon sight of identifying factors.
