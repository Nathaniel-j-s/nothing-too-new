let playerList = [];
const archetypeList = [
  { archNameForReference: 'Technician', costs: [1, 1, 2, 3, 60, 30] },
  { archNameForReference: 'Mage', costs: [3, 3, 6, 1, 30, 30] },
  { archNameForReference: 'Mentalist', costs: [3, 3, 6, 3, 60, 10] },
  { archNameForReference: 'Spellblade', costs: [2, 2, 4, 2, 45, 30] },
  { archNameForReference: 'Sorcerer', costs: [3, 3, 6, 2, 45, 20] },
  { archNameForReference: 'Wielder', costs: [2, 2, 4, 3, 60, 20] },
  { costListReference: ['aetherPool0', 'aetherAccums1', 'martialKnowledge2', 'manaPool3', 'manaAccum4', 'psychicPoints5', 'attack6', 'defense7', 'wearArmor8', 'lifePoints9', 'skillGood10', 'skillNeutral11', 'skillBad12'] }
];
const professionList = [
  {
    professionName: 'Simple Warrior',
    stats: [6, 6, 5, 6, 5, 5, 6, 5],
    arch: 0,
    attack: 99,
    defense: 99,
    lP: 80,
    wearArmor: 60,
    skillReminder: ['Acrobatics0', 'Athletics1', 'Composure2', 'Craft3', 'Perform4', 'SleightOfHand5', 'Stealth6', 'Swim7', 'Animals8', 'Appraise9', 'Arcane10', 'Culture11', 'Deception12', 'History13', 'Insight14', 'Medicine15', 'Nature16', 'Notice17', 'Persuasion18', 'Search19', 'Style20', 'Theology21'],
    skills: [1, 75, 58, 1, 1, 1, 20, 20, 1, 1, 1, 1, 1, 1, 1, 1, 1, 30, 1, 20, 1, 1]
  },
  {
    professionName: 'Farmer',
    stats: [6, 5, 4, 6, 4, 4, 5, 5],
    arch: 0,
    attack: 20,
    defense: 35,
    lP: 80,
    wearArmor: 10,
    skillReminder: ['Acrobatics0', 'Athletics1', 'Composure2', 'Craft3', 'Perform4', 'SleightOfHand5', 'Stealth6', 'Swim7', 'Animals8', 'Appraise9', 'Arcane10', 'Culture11', 'Deception12', 'History13', 'Insight14', 'Medicine15', 'Nature16', 'Notice17', 'Persuasion18', 'Search19', 'Style20', 'Theology21'],
    skills: [1, 75, 75, 40, 1, 1, 1, 1, 50, 1, 1, 1, 1, 1, 20, 1, 60, 30, 1, 20, 1, 1]
  }
];
const skillReminder = ['Acrobatics0', 'Athletics1', 'Composure2', 'Craft3', 'Perform4', 'SleightOfHand5', 'Stealth6', 'Swim7', 'Animals8', 'Appraise9', 'Arcane10', 'Culture11', 'Deception12', 'History13', 'Insight14', 'Medicine15', 'Nature16', 'Notice17', 'Persuasion18', 'Search19', 'Style20', 'Theology21'];
class Character {
  constructor(config) {
    this.charName = config.charName || 'Default';
    this.charArch = config.charArch;
    this.archetypeNumber = calculators.determineArchetypeNumber(this.charArch.toLowerCase());
    this.level = config.level || 1;
    this.descriptiveDetails = {
      personality: config.personality || 'Character',
      sex: config.sex || 'None',
      profession: config.profession || 'None',
    }
    this.statsReference = ['Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7'];
    this.baseStats = config.baseStats;
    this.statMods = calculators.allStatMods(this.baseStats);
    this.fumble = config.fumble || 3;
    this.maxLP = 20 + (this.baseStats[3] * 10) + this.statMods[3] + (this.baseStats[3] * config.lifePoints);
    this.maxFatigue = this.baseStats[3];
    this.initiative = 20 + this.statMods[1] + this.statMods[7];
    this.presence = 25 + (this.level * 5);
    this.resistances = [(this.presence + this.statMods[3]), (this.presence + this.statMods[6])];
    this.attack = this.statMods[2] + config.attack;
    this.defense = config.defense;
    this.wearArmor = this.statMods[0] + config.wearArmor;
    this.maxAetherPool = this.baseStats[0] + this.baseStats[1] + this.baseStats[2] + this.baseStats[3] + this.baseStats[5] + this.baseStats[6] + config.aetherPool; // Also add DPE.
    this.aetherAccumulations = calculators.calcAetherAccums(this.baseStats, config.aetherAccumMults);
    this.martialKnowledge = this.baseStats[4] + config.martialKnowledge;
    this.maxManaPool = (this.baseStats[5] * 30) + (this.level * this.statMods[3]) + config.manaPool;
    this.manaAccumulation = calculators.calcManaAccum(this.baseStats[4], this.baseStats[5], config.manaAccumMults);
    this.spellCostLimit = this.baseStats[4] * 10;
    this.magicProjection = calculators.checkMagPsyProjection(this.baseStats[6], this.baseStats[7]);
    this.spellKnowledge = this.statMods[4] * 2;
    this.psychicPotential = (this.statMods[6] * 2) + this.statMods[5];
    this.powersKnown = calculators.calcPsyPowersKnown(this.baseStats[4], this.baseStats[5], this.level);
    this.psychicPoints = this.baseStats[5] * 2;
    this.psychicProjection = calculators.checkMagPsyProjection(this.baseStats[6], this.baseStats[7]);
    this.maxFatigueBuffer = Math.ceil(this.baseStats[0] / 2);
    this.skillReminder = ['Acrobatics0', 'Athletics1', 'Composure2', 'Craft3', 'Perform4', 'SleightOfHand5', 'Stealth6', 'Swim7', 'Animals8', 'Appraise9', 'Arcane10', 'Culture11', 'Deception12', 'History13', 'Insight14', 'Medicine15', 'Nature16', 'Notice17', 'Persuasion18', 'Search19', 'Style20', 'Theology21'];
    this.skills = config.skills;
    this.devPointsTotal = 500 + (this.level * 100);
    this.bodyReference = ['head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12'];
    this.charBody = [
      new builders.Body('Head'),
      new builders.Body('Shoulder Left'),
      new builders.Body('Shoulder Right'),
      new builders.Body('Arm Left'),
      new builders.Body('Arm Right'),
      new builders.Body('Chest'),
      new builders.Body('Stomach'),
      new builders.Body('Hand Left'),
      new builders.Body('Hand Right'),
      new builders.Body('Leg Left'),
      new builders.Body('Leg Right'),
      new builders.Body('Foot Left'),
      new builders.Body('Food Right')
    ];
    this.activeActions = {
      possible: this.baseStats[1],
      performing: false,
      remaining: this.baseStats[1]
    };
    this.activeEffects = [];
    this.statuses = {
      alive: true,
      specialDefense: 'None',
      conscious: true,
      prone: false,
      grappled: 0,
      accumulatingAether: false,
      accumulatingMana: false,
      turnsOfMana: 0,
      turnsSinceAccumStart: 0,
      psychicConcentrating: false
    },
    this.tempStats = {
      currentBaseStats: this.baseStats,
      currentDevPoints: config.remainingDevPoints,
      currentLP: this.maxLP,
      currentFatigue: this.maxFatigue,
      currentFatigueBuffer: this.maxFatigueBuffer,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: this.maxAetherPool,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: this.maxManaPool,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty: {
        total: 0,
        endOfTurn: 0,
        tenPerTurn: 0,
        fivePerTurn: 0,
        onePerTurn: 0,
        requiresTreatment: 0,
        unremovable: 0
      }
    };
    this.defaults = {
      defaultDefense: config.defaultDefense || 0,
      defaultAttack: {
        attackType: 0,
        attackBonus: 0,
        armorPenetration: 0,
        damageBonus: 0,
        blockable: true,
        hitZoneType: 'Targeted',
        range: 0,
        special: ['None'],
        directed: [0, '', 0]
      },
      defaultTakeDownOffense: 0,
      defaultTakeDownDefense: 0,
      defaultDisarmOffense: 0,
      defaultDisarmDefense: 0,
      defaultGrappleOffense: 0,
      defaultGrappleDefense: 0
    };
    this.activeEffects = [];
    this.natural = {
      baseStats: this.baseStats,
      statMods: this.statMods,
      fumble: this.fumble,
      maxLP: this.maxLP,
      maxFatigue: this.maxLP,
      initiative: this.initiative,
      presence: this.presence,
      resistances: this.resistances,
      attack: this.attack,
      defense: this.defense,
      wearArmor: this.wearArmor,
      maxAetherPool: this.maxAetherPool,
      aetherAccumulations: this.aetherAccumulations,
      martialKnowledge: this.martialKnowledge,
      maxManaPool: this.maxManaPool,
      manaAccumulation: this.manaAccumulation,
      spellCostLimit: this.spellCostLimit,
      magicProjection: this.magicProjection,
      spellKnowledge: this.spellKnowledge,
      psychicPotential: this.psychicPotential,
      psychicPoints: this.psychicPoints,
      psychicProjection: this.psychicProjection,
      maxFatigueBuffer: this.maxFatigueBuffer,
      skills: this.skills
    }
  }
  applyAAP() {
    this.tempStats.allActionPenalty.total = this.tempStats.allActionPenalty.endOfTurn + this.tempStats.allActionPenalty.tenPerTurn + this.tempStats.allActionPenalty.fivePerTurn + this.tempStats.allActionPenalty.onePerTurn + this.tempStats.allActionPenalty.requiresTreatment + this.tempStats.allActionPenalty.unremovable;
  }
  dealDamage(amount) {
    this.tempStats.currentLP -= amount;
    if (this.statuses.accumulatingMana && amount > 0) { combatCalculators.checkForManaLoss(char, amount); }
    if (this.statuses.psychicConcentrating) { combatCalculators.checkForConcentrationLoss(char, amount); }
  }
  dropExcessAether(used) { // Used is a boolean, basically only false if this is run at the end of a round or the accumulation is stopped intentionally.
    if (!this.statuses.accumulatingAether) {
      let x = this.tempStats.currentAetherAccums;
      if (x[0] || x[1] || x[2] || x[3] || x[4] || x[5]) {
        if (used) {
          this.tempStats.currentAetherPool -= (x[0] + x[1] + x[2] + x[3] + x[4] + x[5]);
          this.tempStats.currentAetherAccums = [0, 0, 0, 0, 0, 0];
          console.log(`${this.charName} lost ${x[0] + x[1] + x[2] + x[3] + x[4] + x[5]} aether points left over after using their technique, leaving them with ${this.tempStats.currentAetherPool}.`);
        } else {
          this.tempStats.currentAetherAccums = [0, 0, 0, 0, 0, 0];
          console.log(`${this.charName}'s aether returned to their pool because they stopped gathering early.`);
        }
      }
    }
  }
  dropExcessMana(intentional) { // If a character is hit and loses their mana, intentional should be 'Damage'. It is 'End' at the end of each round, and 'Yes' if using stopAccumulation().
    if (intentional === 'End') {
      if (this.statuses.turnsSinceAccumStart > this.statuses.turnsOfMana) {
        // If this is true, it means that the character did not accumulate this turn.
        if (this.statuses.accumulatingMana === 'Pure') {
          this.tempStats.currentManaPool -= 10;
          console.log(`${this.charName} loses 10 mana from their pool for stopping accumulation early.`);
        } else if (this.statuses.accumulatingMana === 'Specific') {
          console.log(`${this.charName} loses no mana from their pool for stopping accumulation early due to specifying a spell.`);
        }
        this.tempStats.currentManaAccum = 0;
      }
    } else if (intentional === 'Damage') {
      if (this.statuses.accumulatingMana === 'Pure') {
        this.tempStats.currentManaPool -= 10;
      }
      this.tempStats.currentManaAccum = 0;
    } else if (intentional === 'Yes') {
      if (this.statuses.accumulatingMana === 'Pure') {
        this.tempStats.currentManaPool -= 10;
        console.log(`${this.charName} loses 10 mana from their pool for stopping accumulation early.`);
      } else if (this.statuses.accumulatingMana === 'Specific') {
        console.log(`${this.charName} loses no mana from their pool for stopping accumulation early due to specifying a spell.`);
      }
      this.tempStats.currentManaAccum = 0;
    }
    if (this.statuses.turnsSinceAccumStart > 0 && this.tempStats.currentManaAccum === 0) {
      this.statuses.turnsSinceAccumStart = 0;
    }
  }
  dropPsychicConcentration(used) {
    if (!this.statuses.psychicConcentrating || used) {
      this.tempStats.roundsOfConcentration = 0;
    }
  }
  giveAAP(amount, type) { // To remove AAP that requires treatment, just run this with a negative amount and type 4.
    let reference = ['End of Turn 0', 'Ten per Turn 1', 'Five per Turn 2', 'One per Turn 3', 'Requires Treatment 4', 'Unremovable 5'];
    if (type === 0) {
      this.tempStats.allActionPenalty.endOfTurn += amount;
    } else if (type === 1) {
      this.tempStats.allActionPenalty.tenPerTurn += amount;
    } else if (type === 2) {
      this.tempStats.allActionPenalty.fivePerTurn += amount;
    } else if (type === 3) {
      this.tempStats.allActionPenalty.onePerTurn += amount;
    } else if (type === 4) {
      this.tempStats.allActionPenalty.requiresTreatment += amount;
    } else if (type === 5) {
      this.tempStats.allActionPenalty.unremovable += amount;
    } else {
      console.log('Error. No such AAP type.');
    }
    this.applyAAP();
  }
  healDamage(amount) {
    this.tempStats.currentLP += amount;
    if (this.tempStats.currentLP > this.maxLP) {
      this.tempStats.currentLP = this.maxLP;
      console.log(`${this.charName} has been fully healed and can't be healed further.`);
    }
  }
  recalculateAAP() {
    this.tempStats.allActionPenalty.endOfTurn = 0;
    this.tempStats.allActionPenalty.tenPerTurn -= 10;
    if (this.tempStats.allActionPenalty.tenPerTurn < 0) { this.tempStats.allActionPenalty.tenPerTurn = 0; }
    this.tempStats.allActionPenalty.fivePerTurn -= 5;
    if (this.tempStats.allActionPenalty.fivePerTurn < 0) { this.tempStats.allActionPenalty.fivePerTurn = 0; }
    this.tempStats.allActionPenalty.onePerTurn -= 1;
    if (this.tempStats.allActionPenalty.onePerTurn < 0) { this.tempStats.allActionPenalty.onePerTurn = 0; }
    this.applyAAP();
  }
  takeFatigue(amount, psychic) {
    if (psychic) {
      if (this.tempStats.currentFatigueBuffer > 0) {
        this.tempStats.currentFatigueBuffer -= amount;
        if (this.tempStats.currentFatigueBuffer < 0) {
          this.tempStats.currentFatigue -= Math.abs(this.tempStats.currentFatigueBuffer);
          this.tempStats.currentFatigueBuffer = 0;
        }
      } else {
        this.tempStats.currentFatigue -= amount;
      }
      console.log(`${this.charName} lost ${amount} fatigue in failing to activate a psychic power.`);
    } else {
      this.tempStats.currentFatigue -= amount;
    }
    if (this.tempStats.currentFatigue < 1) {
      // Go unconscious.
    }
  }
}
class NPC extends Character {
  constructor(config) { // Do I have to pass in... everything?
    super(config);
    this.statuses.npc = true;
  }
}
const builders = {
  rollStats: function() {
    var stats = [];
    for (var i = 0; i < 8; i++) {
      var roll = rollSmall(10);
      if (roll < 4) {
        i--;
      } else {
        stats.push(roll);
      }
    }
    return stats;
  },
  assignStat: function(arr, num) {
    var a = arr;
    for (var i = 0; i < a.length; i++) {
      if (a[i] === num) {
        a.splice(i, 1);
        break;
        console.log(a);
      }
    }
    return a;
  },
  Body: function(name) {
    this.partName = name;
    this.exists = true;
    this.naturalArmor = 0;
    this.equippedWeapon = {};
    this.equipped = [];
    this.armor = [0, 0, 0, 0, 0, 0];
    this.marks = {
      scars: { description: '', effect: '' },
      tattoo: { description: '', effect: '' },
      mystic: { description: '', effect: '' },
    };
  }
}
const calculators = {
  determineArchetypeNumber: function(archetype) {
    switch (archetype) {
      case 'technician':
        return 0;
      case 'mage':
        return 1;
      case 'mentalist':
        return 2;
      case 'spellblade':
        return 3;
      case 'sorcerer':
        return 4;
      case 'wielder':
        return 5;
    }
  },
  reverseArchetypeNumber: function(archetype) {
    switch (archetype) {
      case 0:
        return 'Technician';
      case 1:
        return 'Mage';
      case 2:
        return 'Mentalist';
      case 3:
        return 'Spellblade';
      case 4:
        return 'Sorcerer';
      case 5:
        return 'Wielder';
    }
  },
  determineSkillNumber: function(skill) {
    switch (skill) {
      case 'acrobatics':
        return 0;
      case 'athletics':
        return 1;
      case 'composure':
        return 2;
      case 'craft':
        return 3;
      case 'perform':
        return 4;
      case 'sleight':
        return 5;
      case 'stealth':
        return 6;
      case 'swim':
        return 7;
      case 'animals':
        return 8;
      case 'appraise':
        return 9;
      case 'arcana':
        return 10;
      case 'culture':
        return 11;
      case 'deception':
        return 12;
      case 'history':
        return 13;
      case 'insight':
        return 14;
      case 'medicine':
        return 15;
      case 'nature':
        return 16;
      case 'notice':
        return 17;
      case 'persuasion':
        return 18;
      case 'search':
        return 19;
      case 'style':
        return 20;
      case 'theology':
        return 21;
      default:
        return 22;
    }
  },
  allStatMods: function(arr) {
    let final = [];
    for (let i = 0; i < 8; i++) {
      final.push(calculators.calcStatMod(arr[i]));
    }
    return final;
  },
  calcStatMod: function(stat) {
    return (stat - 5) * 5;
  },
  calcAetherAccums: function(stats, multiples) {
    let accums = [];
    for (let i = 0; i < stats.length; i++) {
      if (i === 4 || i === 7) {
        // This does nothing. We're just not doing something on this iteration.
      } else {
        accums.push(multiples * ((Math.floor(stats[i] / 5)) + (Math.floor((Math.floor(stats[4] / 2)) / 5))));
      }
    }
    return accums;
  },
  calcManaAccum: function(int, pow, multiples) {
    let accum = 0;
    accum = accum + Math.floor(int / 5);
    accum = accum + Math.floor(Math.floor(pow / 5) / 2);
    accum = accum * multiples;
    accum = accum * 10;
    return accum;
  },
  checkMagPsyProjection: function(wil, per) {
    return (wil > per) ? per : wil;
  },
  calcPsyPowersKnown: function(int, pow, level) {
    let final = 0;
    final = final + (int + level);
    if (level === 1 && final > pow) { final = pow; }
    return final;
  }
}

function letsMakeACharacter() {
  function storeCharacter(config) {
    return new Character(config);
  }
  function makeConfig() {
    let characterInfo = {
      charName: '',
      npc: false,
      charArch: '',
      level: 1,
      baseStats: [5, 5, 5, 5, 5, 5, 5, 5],
      attack: 0,
      defense: 0,
      wearArmor: 0,
      lifePoints: 0,
      aetherPool: 0,
      aetherAccumMults: 1,
      martialKnowledge: 0,
      manaPool: 0,
      manaAccumMults: 1,
      psychicPoints: 0,
      skills: [[0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2]],
      remainingDevPoints: 600
    }
    function selectStats(statOptions) {
      var so = statOptions
      characterInfo.str = parseInt(prompt('Select your Strength, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[0]);
      characterInfo.agi = parseInt(prompt('Select your Agility, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[1]);
      characterInfo.dex = parseInt(prompt('Select your Dexterity, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[2]);
      characterInfo.con = parseInt(prompt('Select your Constitution, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[3]);
      characterInfo.int = parseInt(prompt('Select your Intelligence, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[4]);
      characterInfo.pow = parseInt(prompt('Select your Power, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[5]);
      characterInfo.wil = parseInt(prompt('Select your Will, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[6]);
      characterInfo.per = parseInt(prompt('Select your Perception, from ' + so));
      so = builders.assignStat(so, characterInfo.baseStats[7]);
    }
    function selectClass() {
      var s = prompt('Chose your class from Technician, Mage, Mentalist, Spellblade, Sorcerer, or Wielder.');
      while (s !== 'Technician' && s !== 'Mage' && s !== 'Mentalist' && s !== 'Spellblade' && s !== 'Sorcerer' && s !== 'Wielder') {
        s = prompt('No really, chose from Technician, Mage, Mentalist, Spellblade, Sorcerer, or Wielder.');
      }
      return s;
    }
    function selectBadSkills(goods) {
      let bads = 3;
      switch (goods) {
        case 4:
          bads = 5;
          break;
        case 5:
          bads = 7;
          break;
        case 6:
          bads = 8;
          break;
        default:
          break;
      }
      for (let i = 0; i < bads; i++) {
        let selected = calculators.determineSkillNumber(prompt('Please choose bad skill #' + (i + 1) + '. Total required: ' + bads + '. From Acro0, Athl1, Comp2, Craf3, Perf4, Slei5, Stea6, Swim7, Anim8, Appr9, Arca10, Cult11, Dece12, Hist13, Insi14, Medi15, Natu16, Noti17, Pers18, Sear19, Styl20, Theo21.').toLowerCase());
        if (selected === 22) {
          i--;
        } else {
          characterInfo.skills[selected][1] = 3;
        }
      }
    }
    function selectGoodSkills() {
      let goods = 0;
      for (let i = 0; i < 6; i++) {
        if (i < 3) {
          let selected = calculators.determineSkillNumber(prompt('Please choose good skill #' + (i + 1) + '. From Acro0, Athl1, Comp2, Craf3, Perf4, Slei5, Stea6, Swim7, Anim8, Appr9, Arca10, Cult11, Dece12, Hist13, Insi14, Medi15, Natu16, Noti17, Pers18, Sear19, Styl20, Theo21.').toLowerCase());
          characterInfo.skills[selected][1] = 1;
          goods++;
        } else {
          let selected = calculators.determineSkillNumber(prompt('Please choose good skill #' + (i + 1) + '. This one is optional. If none, type a zero. From Acro0, Athl1, Comp2, Craf3, Perf4, Slei5, Stea6, Swim7, Anim8, Appr9, Arca10, Cult11, Dece12, Hist13, Insi14, Medi15, Natu16, Noti17, Pers18, Sear19, Styl20, Theo21.').toLowerCase());
          if (selected !== 22) {
            characterInfo.skills[selected][1] = 1;
            goods++;
          }
        }
      }
      selectBadSkills(goods);
    }
    function spendDP(statName, stat, arch, remaining) {
      let dp = parseInt(prompt('How much do you spend on ' + statName + '? You have ' + remaining));
      if (stat < 6) {
        return [Math.floor(dp / archetypeList[arch].costs[stat]), dp];
      } else if (stat > 5 && stat < 9) {
        return [Math.floor(dp / 2), dp];
      } else if (stat === 9) {
        return [Math.floor(dp / 10), dp];
      } else {
        console.log('Woah, how did you break this?');
      }
    }
    function skillDP(skillName, skill, remaining) {
      let dp = parseInt(prompt('How much do you spend on ' + skillName + '? You have ' + remaining));
      let increase = dp / characterInfo.skills[skill][1];
      characterInfo.skills[skill][0] = characterInfo.skills[skill][0] + increase; // <-- This is the line that adjusts the skill. SHOULD be returned like the spendDP function but I don't give a fuuuuuuuuuuuuuuuuuuu--
      return dp;
    }
    function createCharacter() {
      characterInfo.charName = prompt('What is your name?');
      characterInfo.charArch = selectClass();
      let arch = calculators.determineArchetypeNumber(characterInfo.charArch.toLowerCase());
      characterInfo.level = parseInt(prompt('What level are you?'));
      let devPoints = 500 + (characterInfo.level * 100);
      let statOptions = builders.rollStats();
      selectStats(statOptions);

      let attack = spendDP('Attack', 6, arch, devPoints);
      characterInfo.attack = attack[0];
      devPoints = devPoints - attack[1];
      let defense = spendDP('Defense', 7, arch, devPoints);
      characterInfo.defense = defense[0];
      devPoints = devPoints - defense[1];
      let wearArmor = spendDP('Wear Armor', 8, arch, devPoints);
      characterInfo.wearArmor = wearArmor[0];
      devPoints = devPoints - wearArmor[1];
      let lifePoints = spendDP('Life Points', 9, arch, devPoints);
      characterInfo.lifePoints = lifePoints[0];
      devPoints = devPoints - lifePoints[1];

      let aetherPool = spendDP('your Aether Pool', 0, arch, devPoints);
      characterInfo.aetherPool = aetherPool[0];
      devPoints = devPoints - aetherPool[1];
      let aetherAccumMults = spendDP('Aether Accumulations', 1, arch, devPoints);
      characterInfo.aetherAccumMults = aetherAccumMults[0];
      devPoints = devPoints - aetherAccumMults[1];
      let martialKnowledge = spendDP('Martial Knowledge', 2, arch, devPoints);
      characterInfo.martialKnowledge = martialKnowledge[0];
      devPoints = devPoints - martialKnowledge[1];

      let manaPool = spendDP('your Mana Pool', 3, arch, devPoints);
      characterInfo.manaPool = manaPool[0];
      devPoints = devPoints - manaPool[1];
      let manaAccumMults = spendDP('Mana Accumulation', 4, arch, devPoints);
      characterInfo.manaAccumMults = manaAccumMults[0];
      devPoints = devPoints - manaAccumMults[1];

      let psychicPoints = spendDP('Psychic Points', 5, arch, devPoints);
      characterInfo.psychicPoints = psychicPoints[0];
      devPoints = devPoints - psychicPoints[1];

      selectGoodSkills();
      let skillSpendNumber = parseInt(prompt('How many skills are you going to spend DP on? You have ' + devPoints));
      if (skillSpendNumber > 0) {
        for (let i = 0; i < skillSpendNumber; i++) {
          let skillName = prompt('What skill would you like to spend some DP on?');
          let skillNumber = calculators.determineSkillNumber(skillName.toLowerCase());
          let spentDP = skillDP(skillName, skillNumber, devPoints);
          devPoints = devPoints - spentDP;
        }
      }
      characterInfo.remainingDevPoints = devPoints;
    }
    createCharacter();
    return characterInfo;
  }
  var defaultCharacterInfo = {
    charName: '',
    charArch: '',
    level: 1,
    baseStats: [5, 5, 5, 5, 5, 5, 5, 5],
    attack: 50,
    defense: 50,
    wearArmor: 50,
    lifePoints: 10,
    aetherPool: 50,
    aetherAccumMults: 3,
    martialKnowledge: 50,
    manaPool: 50,
    manaAccumMults: 3,
    psychicPoints: 10,
    skills: [[50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2], [50, 2]],
    remainingDevPoints: 0,
  };
  function d() {
    const decision = prompt('Is this character default?');
    return (!decision) ? storeCharacter(defaultCharacterInfo) : storeCharacter(makeConfig());
  }
  playerList.push(d());
  console.log(playerList[0])
}

// Random character creation thing. I could probably put this inside the Character class now? We'll check on that option.

function createRandomCharacter(p, n, l) {
  let c = {
    charName: 'Randomized',
    charArch: '',
    level: 1,
    baseStats: [5, 5, 5, 5, 5, 5, 5, 5],
    personality: {},
    sex: '',
    profession: '',
    attack: 0,
    defense: 0,
    wearArmor: 0,
    lifePoints: 0,
    aetherPool: 0,
    aetherAccumMults: 0,
    martialKnowledge: 0,
    manaPool: 0,
    manaAccumMults: 0,
    psychicPoints: 0,
    skills: [[0, 2, 'Acrobatics'], [0, 2, 'Athletics'], [0, 2, 'Composure'], [0, 2, 'Craft'], [0, 2, 'Perform'], [0, 2, 'SleightOfHand'], [0, 2, 'Stealth'], [0, 2, 'Swim'], [0, 2, 'Animals'], [0, 2, 'Appraise'], [0, 2, 'Arcane'], [0, 2, 'Culture'], [0, 2, 'Deception'], [0, 2, 'History'], [0, 2, 'Insight'], [0, 2, 'Medicine'], [0, 2, 'Nature'], [0, 2, 'Notice'], [0, 2, 'Persuasion'], [0, 2, 'Search'], [0, 2, 'Style'], [0, 2, 'Theology']],
    remainingDevPoints: 0,
  };
  const randomCalcs = {
    randomizeStat: function(stat) {
      let roll = rollNoOpen();
      if (roll <= 75) {
        return stat;
      } else if (roll > 75 && roll <= 80) {
        let final = stat - 1;
        if (final < 4) {
          let lastCheck = rollNoOpen();
          if (lastCheck >= 97) {
            return final;
          } else {
            return 4;
          }
        }
        return final;
      } else if (roll > 80 && roll <= 99) {
        let final = stat + 1;
        if (final > 7) {
          let lastCheck = rollNoOpen();
          if (lastCheck >= 90) {
            return final;
          } else {
            return 7;
          }
        }
        return final;
      } else if (roll === 100) {
        let final = stat + 2;
        if (final > 7) {
          let lastCheck = rollNoOpen();
          if (lastCheck >= 70) {
            return final;
          } else {
            return 7;
          }
        }
        return final;
      } else {
        console.log('Returning base number. Something went wrong.');
        return stat;
      }
    },
    getStats: function(prof) {
      return prof.stats.map(x => randomCalcs.randomizeStat(x));
    },
    chooseSimilarArchetype: function(current) {
      let roll = rollSmall(2);
      if (current === 0) {
        if (roll === 1) {
          return 3;
        } else {
          return 5;
        }
      } else if (current === 1) {
        if (roll === 1) {
          return 3;
        } else {
          return 4;
        }
      } else if (current === 2) {
        if (roll === 1) {
          return 4;
        } else {
          return 5;
        }
      }
    },
    randomizeArchetype: function(prof) {
      let final = prof.arch;
      let roll = rollNoOpen();
      if (roll >= 89 && roll < 100) {
        final = randomCalcs.chooseSimilarArchetype(final);
      }
      if (roll === 100) {
        final = rollSmall(6) - 1;
      }
      return final;
    },
    getAverageForPersonality: function() {
      let arr = [];
      for (let i = 0; i < 3; i++) {
        arr.push(rollNoOpen());
      }
      return averageArray(arr);
    },
    Personality: function() {
      this.passiveCombative = randomCalcs.getAverageForPersonality();
      this.cooperativeCompetitive = randomCalcs.getAverageForPersonality();
      this.patientRushed = randomCalcs.getAverageForPersonality();
      this.fearfulBrave = randomCalcs.getAverageForPersonality();
      this.introvertedExtroverted = randomCalcs.getAverageForPersonality();
      this.satisfiedCurious = randomCalcs.getAverageForPersonality();
      this.cleanMessy = randomCalcs.getAverageForPersonality();
    },
    randomizeSex: function() {
      let roll = rollSmall(1000);
      let final = '';
      if (roll <= 500) {
        final = 'Female';
      } else if (roll > 500 && roll <= 999) {
        final = 'Male';
      } else {
        let extra = rollOpen(1);
        if (extra > 150) {
          final = 'Futa ' + extra;
        } else {
          final = 'Close';
        }
      }
      return final;
    },
    createExpenseArray: function(prof, arch) {
      let final = [
        { numlet: prof.attack, perc: 0, expense: 0, divisible: 2, skill: false, statName: 'Attack' },
        { numlet: prof.defense, perc: 0, expense: 0, divisible: 2, skill: false, statName: 'Defense' },
        { numlet: prof.wearArmor, perc: 0, expense: 0, divisible: 2, skill: false, statName: 'Wear Armor' },
        { numlet: prof.lP, perc: 0, expense: 0, divisible: 10, skill: false, statName: 'Life Points' }
      ];
      if (prof.aetherPool) { final.push({ numlet: prof.aetherPool, perc: 0, expense: 0, divisible: archetypeList[arch].costs[0], skill: false, statName: 'Aether Pool' }); }
      if (prof.aetherAccum) { final.push({ numlet: prof.aetherAccum, perc: 0, expense: 0, divisible: archetypeList[arch].costs[1], skill: false, statName: 'Aether Accumulation' }); }
      if (prof.martialKnow) { final.push({ numlet: prof.martialKnow, perc: 0, expense: 0, divisible: archetypeList[arch].costs[2], skill: false, statName: 'Martial Knowledge' }); }
      if (prof.manaPool) { final.push({ numlet: prof.manaPool, perc: 0, expense: 0, divisible: archetypeList[arch].costs[3], skill: false, statName: 'Mana Pool' }); }
      if (prof.manaAccum) { final.push({ numlet: prof.manaAccum, perc: 0, expense: 0, divisible: archetypeList[arch].costs[4], skill: false, statName: 'Mana Accumulation' }); }
      if (prof.psyPoints) { final.push({ numlet: prof.psyPoints, perc: 0, expense: 0, divisible: archetypeList[arch].costs[5], skill: false, statName: 'Psychic Points' }); }
      for (let i = 0; i < prof.skills.length; i++) {
        if (prof.skills[i] > 5) {
          let skillObj = { numlet: prof.skills[i], perc: 0, expense: 0, divisible: 2, skill: i, statName: skillReminder[i] };
          if (skillObj.numlet > 60) { skillObj.divisible = 1 };
          final.push(skillObj);
        }
      }
      return final;
    },
    randomizeSmallAmount: function(dice, size) {
      let arr = [];
      for (let i = 0; i < dice; i++) {
        arr.push(rollSmall(size));
      }
      let final = averageArray(arr);
      return final;
    },
    basicRandomization: function(start) {
      return (start - 10) + randomCalcs.randomizeSmallAmount(3, 20);
    },
    stats: {
      calcRandomAttack: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        final += Math.floor((pers.passiveCombative - 50) / 2);
        if (pers.cooperativeCompetitive > 50) { final += Math.floor((pers.cooperativeCompetitive - 50) / 4); }
        if (pers.fearfulBrave > 50) { final += Math.floor((pers.fearfulBrave - 50) / 5); }
        if (pers.introvertedExtroverted > 50) { final += Math.floor((pers.introvertedExtroverted - 50) / 5); }
        return final;
      },
      calcRandomDefense: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        if (pers.passiveCombative > 75) { final += Math.floor((pers.passiveCombative - 50) / 5); }
        if (pers.passiveCombative < 25) { final += Math.floor(((100 - pers.passiveCombative) - 50) / 5); }
        if (pers.cooperativeCompetitive < 50) { final += Math.floor(((100 - pers.cooperativeCompetitive) - 50) / 2); }
        final += Math.floor(((100 - pers.patientRushed) - 50) / 4);
        if (pers.introvertedExtroverted < 50) { final += Math.floor(((100 - pers.introvertedExtroverted) - 50) / 5); }
        return final;
      },
      calcRandomWearArmor: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        if (pers.passiveCombative < 25) { final += Math.floor(((100 - pers.passiveCombative) - 50) / 5); }
        if (pers.cooperativeCompetitive > 50) { final += Math.floor((pers.cooperativeCompetitive - 50) / 4); }
        final += Math.floor(((100 - pers.patientRushed) - 50) / 4);
        if (pers.fearfulBrave < 50) { final += Math.floor(((100 - pers.fearfulBrave) - 50) / 3); }
        return final;
      },
      calcRandomLP: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        final += Math.floor((pers.patientRushed - 50) / 4);
        if (pers.fearfulBrave > 50) { final += Math.floor((pers.fearfulBrave - 50) / 3); }
        if (pers.introvertedExtroverted > 50) { final += Math.floor((pers.introvertedExtroverted - 50) / 4); }
        return final;
      },
      calcRandomAePo: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      },
      calcRandomAeAc: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      },
      calcRandomMaKn: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      },
      calcRandomMaPo: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      },
      calcRandomMaAc: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      },
      calcRandomPsPo: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      },
      calcRandomSkills: function(obj, pers) {
        let final = randomCalcs.basicRandomization(obj.numlet);
        // Personality stuff.
        return final;
      }
    },
    randomizeExpenseArray: function(list, pers) {
      let final = list;
      final[0].numlet = randomCalcs.stats.calcRandomAttack(list[0], pers);
      final[1].numlet = randomCalcs.stats.calcRandomDefense(list[1], pers);
      final[2].numlet = randomCalcs.stats.calcRandomWearArmor(list[2], pers);
      final[3].numlet = randomCalcs.stats.calcRandomLP(list[3], pers);
      for (let i = 4; i < final.length; i++) {
        if (final[i].statName === 'Aether Pool') { final[i].numlet = randomCalcs.stats.calcRandomAePo(list[i], pers); }
        if (final[i].statName === 'Aether Accumulation') { final[i].numlet = randomCalcs.stats.calcRandomAeAc(list[i], pers); }
        if (final[i].statName === 'Martial Knowledge') { final[i].numlet = randomCalcs.stats.calcRandomMaKn(list[i], pers); }
        if (final[i].statName === 'Mana Pool') { final[i].numlet = randomCalcs.stats.calcRandomMaPo(list[i], pers); }
        if (final[i].statName === 'Mana Accumulation') { final[i].numlet = randomCalcs.stats.calcRandomMaAc(list[i], pers); }
        if (final[i].statName === 'Psychic Points') { final[i].numlet = randomCalcs.stats.calcRandomPsPo(list[i], pers); }
        if (final[i].skill) {
          final[i].numlet = randomCalcs.stats.calcRandomSkills(list[i], pers);
        }
      }
      return final;
    },
    percentize: function(list, level) {
      let final = list;
      let total = 0;
      for (let i = 0; i < final.length; i++) {
        if (final[i].numlet > 5) {
          total += final[i].numlet;
        }
      }
      function modifyToPercents(obj) {
        obj.perc = Math.floor((obj.numlet / total) * 100);
        obj.expense = obj.perc * (level + 5);
      }
      for (let i = 0; i < final.length; i++) {
        modifyToPercents(final[i]);
      }
      return final;
    },
    checkForRemainingDP: function(list, level) {
      let totalExpense = 0;
      for (let i = 0; i < list.length; i++) {
        totalExpense += list[i].expense;
      }
      let totalDP = (level + 5) * 100;
      return totalDP - totalExpense;
    },
    randomizeInterest: function(list, remaining) {
      let final = list;
      let roll = rollSmall(22) - 1;
      let newSkill = true;
      for (let i = 4; i < final.length; i++) {
        if (roll === final[i].skill) {
          roll = rollSmall(22) - 1;
          break;
        }
      }
      for (let i = 4; i < final.length; i++) {
        if (roll === final[i].skill) {
          final[i].expense += remaining;
          final[i].divisible = 1;
          newSkill = false;
          break;
        }
      }
      if (newSkill) {
        final.push({ numlet: 0, perc: 0, expense: remaining, divisible: 1, skill: roll, statName: skillReminder[roll] });
      }
      return final;
    }
  };
  c.charName = n;
  c.baseStats = randomCalcs.getStats(p);
  c.charArch = randomCalcs.randomizeArchetype(p);
  c.level = l;
  c.personality = new randomCalcs.Personality;
  c.sex = randomCalcs.randomizeSex();
  c.profession = p.professionName;
  c.expenseArray = randomCalcs.createExpenseArray(p, c.charArch);
  c.expenseArray = randomCalcs.randomizeExpenseArray(c.expenseArray, c.personality);
  randomCalcs.percentize(c.expenseArray, l);
  let remaining = randomCalcs.checkForRemainingDP(c.expenseArray, l)
  if (remaining > 0) {
    c.expenseArray = randomCalcs.randomizeInterest(c.expenseArray, remaining);
  }
  for (let i = 0; i < c.expenseArray.length; i++) {
    if (c.expenseArray[i].statName === 'Attack') { c.attack = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Defense') { c.defense = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Wear Armor') { c.wearArmor = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Life Points') { c.lifePoints = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Aether Pool') { c.aetherPool = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Aether Accumulation') { c.aetherAccumMults = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Martial Knowledge') { c.martialKnowledge = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Mana Pool') { c.manaPool = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Mana Accumulation') { c.manaAccumMults = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].statName === 'Psychic Points') { c.psychicPoints = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible)}
    if (c.expenseArray[i].skill) {
      c.skills[c.expenseArray[i].skill][0] = Math.floor(c.expenseArray[i].expense / c.expenseArray[i].divisible);
      c.skills[c.expenseArray[i].skill][1] = c.expenseArray[i].divisible;
    }
  }
  c.charArch = calculators.reverseArchetypeNumber(c.charArch);
  playerList.push(new NPC(c));
}

// Example: createRandomCharacter(professionList[0], 'John', 1);

function createRandos() {
  let num = Number(document.getElementById('rando-number').value);
  let a = document.getElementById('profession-pick');
  let prof = Number(a.options[a.selectedIndex].value);
  for (let i = 0; i < num; i++) {
    createRandomCharacter(professionList[prof], 'Rando ' + playerList.length, 10);
    equipWeapon(playerList[playerList.length - 1], 8, items.weaponList[0]);
  }
  console.log(playerList);
}

function testATonOfPersonalities() {
  let container = [{one: 0, two: 0}];
  for (let i = 0; i < 100000; i++) {
    let tester = new Personality();
    let c = false;
    for (let j = 0; j < container.length; j++) {
      if (tester.passiveCombative === container[j].one) {
        container[j].two++;
        c = true;
        break;
      }
    }
    if (!c) {
      container.push({one: tester.passiveCombative, two: 1});
    }
  }
  container.sort(function(a, b) {
    return a.one - b.one;
  });
  console.log(container);
}
// testATonOfPersonalities();
