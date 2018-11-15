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

class Relationship extends Faction {
  constructor(config) {
    super(config);
  }
}

// A fellow faction member's relations can be modified by a character with a standing of 25 or higher.
// A character's faction relations may only be modified if their belief is above 25 however.
// The higher an influencer's standing combines with the character's belief to create their modification.
// This can result in the character being affected further than intended by the influencer.
