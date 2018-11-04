const abilities = {
  aether: {
    offensive: {
      tester: {
        abilityName: 'The Test Technique',
        requiredAether: [10, 0, 60, 0, 0, 0],
        attackBonus: 1000
      }
    }
  },
  magic: {
    offensive: {
      offensiveTestSpell: {
        basics: {
          abilityName: 'An Offensive Spell',
          requiredMana: 100
        },
        Activation: function(config) {
          this.abilityName = 'An Offensive Spell';
          this.requiredMana = 100;
          this.maximumManaMultiplier = 2;
          this.maximumSpellMana = config.charactersInt * (this.maximumManaMultiplier * 10);
          this.manaUsed = config.manaUsed;
          this.attackType = 3;
          this.range = 3;
          this.predeterminedDamage = 60 + (10 * cleanUps.addedEffectVerify(this.manaUsed, this.requiredMana, this.maximumSpellMana));
        }
      },
      strongTestSpell: {
        basics: {
          abilityName: 'A Strong Offensive Spell',
          requiredMana: 100
        },
        Activation: function(config) {
          this.abilityName = 'A Strong Offensive Spell';
          this.requiredMana = 70;
          this.maximumManaMultiplier = 2;
          this.maximumSpellMana = config.charactersInt * (this.maximumManaMultiplier * 10);
          this.manaUsed = config.manaUsed;
          this.attackType = 4;
          this.range = 3;
          this.predeterminedDamage = 60 + (10 * cleanUps.addedEffectVerify(this.manaUsed, this.requiredMana, this.maximumSpellMana));
        }
      },
      blindingSpell: {
        basics: {
          abilityName: 'Blind',
          requiredMana: 60
        },
        Activation: function(config) {
          this.abilityName = 'Blind';
          this.requiredMana = 60;
          this.maxumumManaMultiplier = 1;
          this.maximumSpellMana = config.charactersInt * (this.maximumManaMultiplier * 10);
          this.manaUsed = config.manaUsed;
          this.range = 3;
          this.resistType = 'Supernatural';
          this.resistanceDifficulty = 60 + (5 * cleanUps.addedEffectVerify(this.manaUsed, this.requiredMana, this.maximumSpellMana));
          this.effect = function(target, failure) {
            let turns = Math.ceil(failure / 10);
            charEdits.blind(target, turns);
          };
        }
      }
    }
  },
  psychic: {
    offensive: {
      testPower: {
        basics: {
          abilityName: 'A Psychic Power'
        },
        Activation: function(config) {
          this.abilityName = 'A Psychic Power';
          this.potentialRoll = config.potentialRoll;
          this.difficulty = checkVsBasicDifficulty(this.potentialRoll);
          this.fatigueArray = [4, 2, 1];
          this.fatigueLoss = combatCalculators.checkPsychicFatigue(config.character, this.difficulty.value, this.fatigueArray);
          this.successful = this.fatigueLoss.success;
          this.attackType = 5;
          this.range = 3;
          this.damageArray = [0, 0, 0, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
          this.predeterminedDamage = this.damageArray[this.difficulty[0]];
        }
      }
    }
  }
};

function resolveEndOfTurn(char) {
  char.activeActions.remaining = char.activeActions.possible;
  char.activeActions.performing = false;
  cleanUps.recalculateAAP(char);
  char.statuses.specialDefense = 'None';
  cleanUps.dropExcessAether(char, false);
  char.statuses.accumulatingAether = false;
  char.statuses.turnsSinceAccumStart++;
  cleanUps.dropExcessMana(char, 'End');
  cleanUps.dropPsychicConcentration(char, false);
  char.statuses.psychicConcentrating;
  char.tempStats.onTheDefensive = false;
  char.tempStats.numberOfDefenses = 0;
  if (char.activeEffects.length > 0) {
    for (let i = 0; i < char.activeEffects.length; i++) {
      char.activeEffects[i].remainingTurns--;
      if (char.activeEffects[i].remainingTurns < 0) {
        char.activeEffects[i].endEffect(char);
        char.activeEffects.splice(i, 1);
      }
    }
  }
}

const activeActions = {
  activatePsychicPower: function(char, power) {
    let powerConfig = {
      potentialRoll: 0,
      character: char,
    };
    powerConfig.potentialRoll = rollOpen(char.fumble) + char.psychicPotential;
    if (char.statuses.roundsOfConcentration > 0) { powerConfig.potentialRoll += combatCalculators.getPsyConcentrationBonus(char.statuses.roundsOfConcentration); }
    cleanUps.dropPsychicConcentration(char, true);
    return new power(powerConfig);
  },
  castSpell: function(char, spell) {
    let spellConfig = {
      charactersInt: char.baseStats[4],
      manaUsed: 0
    };
    if (!char.statuses.npc) {
      spellConfig.manaUsed = parseInt(prompt('How much mana will ' + char.charName + ' use on their spell? They have accumulated ' + char.tempStats.currentManaAccum + '.'));
    } else {
      spellConfig.manaUsed = char.tempStats.currentManaAccum;
    }
    return new spell(spellConfig);
  },
  compileAttack: function(char, weapon, ability) {
    let n = char.charName;
    let attackInfo = {
      attackType: weapon.defaultType,
      range: weapon.range
    };
    if (!char.statuses.npc) {
      attackInfo.attackType = parseInt(prompt('Will ' + n + ' use the primary (' + combatCalculators.nameAttackType(weapon.defaultType) + ') or secondary ' + combatCalculators.nameAttackType(weapon.optionalType) + ') attack type? ' + weapon.defaultType + ' or ' + weapon.optionalType + '?'));
      attackInfo.range = parseInt(prompt('What range is ' + n + ' attacking from? Max of ' + weapon.range + '.'));
      if (attackInfo.range > 1) {
        attackInfo.attackLimit = 240;
      }
      let specialCheck = prompt('Does ' + n + '\'s attack have anything special to it? Only answer Y or N. (Bonus/Penalty, Penetration, Unblockable, Engulfing, Maneuver?)').toLowerCase();
      if (specialCheck === 'y') {
        attackInfo.attackBonus = parseInt(prompt('What is the attack\'s bonus/penalty? Default is 0.'));
        attackInfo.armorPenetration = parseInt(prompt('What is the attack\'s armor penetration? Default is 0.'));
        attackInfo.damageBonus = parseInt(prompt('What is the attack\'s damage bonus? Default is 0.'));
        let blockableCheck = prompt('Is the attack blockable? Y or N.').toLowerCase();
        if (blockableCheck === 'n') { attackInfo.blockable = false; }
        attackInfo.hitZoneType = prompt('Is this attack Targeted or Engulf type? Can leave blank for Targeted.');
        attackInfo.special = [prompt('Is this attack a Grapple, Disarm, or Take Down maneuver? Leave blank for none.')];
        let directedCheck = prompt('Is this attack directed? Y or N.').toLowerCase();
        if (directedCheck === 'y') { attackInfo.directed = combatCalculators.hitLocationReverse(prompt('Where will this attack be directed?')); }
      }
    }
    if (ability) {
      if (ability.attackType) { attackInfo.attackType = ability.attackType; }
      if (ability.range) { attackInfo.range = ability.range; }
    }
    return new Attack(attackInfo);
  },
  useActive: function(char, check) { // This is used to mark down an active action slot, or check for active actions if anything is passed in as check.
    if (check) {
      if (char.statuses.conscious && char.statuses.alive && char.activeActions.remaining > 0) {
        return true;
      }
    } else {
      if (char.statuses.conscious && char.statuses.alive && char.activeActions.remaining > 0) {
        if (!char.activeActions.performing) { char.activeActions.performing = true; }
        char.activeActions.remaining--;
        return true;
      } else {
        console.log(attacker.charName + ' does not have enough active actions left to perform any more.');
      }
    }
  },
};
const passiveActions = {
  accumulateAether: function(char, stats) { // Char is the character accumulating. Stats is an array that can only contain ints 0-3, 5, and 6.
    let actives = char.activeActions.performing;
    if (!char.statuses.accumulatingAether) { char.statuses.accumulatingAether = true; }
    for (let i = 0; i < stats.length; i++) {
      if (actives) {
        char.tempStats.currentAetherAccums[stats[i]] += Math.ceil(char.aetherAccumulations[stats[i]] / 2);
      } else {
        char.tempStats.currentAetherAccums[stats[i]] += char.aetherAccumulations[stats[i]];
      }
    }
    console.log('%c' + char.charName + ' has accumulated aether: ' + char.tempStats.currentAetherAccums, 'color: rgb(6, 119, 0)');
  },
  accumulateMana: function(char, type) {
    let actives = char.activeActions.performing;
    if (!char.statuses.accumulatingMana) { char.statuses.accumulatingMana = type; }
    char.statuses.turnsOfMana++;
    if (actives) {
      char.tempStats.currentManaAccum += Math.ceil(char.manaAccumulation / 2);
    } else {
      char.tempStats.currentManaAccum += char.manaAccumulation;
    }
    console.log('%c' + char.charName + ' has accumulated mana: ' + char.tempStats.currentManaAccum, 'color: rgb(150, 149, 5)');
  },
  concentratePsychic: function(char) {
    char.statuses.psychicConcentrating = true;
    char.tempStats.roundsOfConcentration++;
    let num = char.tempStats.roundsOfConcentration;
    let bonus = combatCalculators.getPsyConcentrationBonus(num);
    console.log('%c' + char.charName + ' has concentrated on their psychic power for ' + num + ' rounds, for a bonus of ' + bonus + '.', 'color: rgb(160, 123, 189)');
  },
  stopAccumulation: function(char, resource) {
    if (resource === 'Aether') {
      char.statuses.accumulatingAether = false;
      cleanUps.dropExcessAether(char, false);
    } else if (resource === 'Mana') {
      char.statuses.accumulatingMana = false;
      cleanUps.dropExcessMana(char, 'Yes');
    } else if (resource === 'Psychic') {
      char.statuses.psychicConcentrating = false;
      cleanUps.dropPsychicConcentration(char, true);
    }
  }
};

let combatParticipants = [
  {
    charName: 'Nathan',
    charArch: 'Mage',
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 2000, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    activeEffects: [],
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      currentFatigueBuffer: 5,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Skye',
    charArch: 'Mage',
    activeEffects: [],
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      currentFatigueBuffer: 5,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Dickface',
    charArch: 'Mage',
    activeEffects: [],
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      currentFatigueBuffer: 5,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Tim',
    charArch: 'Mage',
    activeEffects: [],
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      currentFatigueBuffer: 5,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Garden',
    charArch: 'Mage',
    activeEffects: [],
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      currentFatigueBuffer: 5,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
]
let backUps = [
  {
    charName: 'Nathan',
    charArch: 'Mage',
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 2000, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    currentFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Skye',
    charArch: 'Mage',
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    currentFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Dickface',
    charArch: 'Mage',
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    currentFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Tim',
    charArch: 'Mage',
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    currentFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
  {
    charName: 'Garden',
    charArch: 'Mage',
    archetypeNumber: 1,
    level: 1,
    statsReference: [ 'Str0', 'Agi1', 'Dex2', 'Con3', 'Int4', 'Pow5', 'Wil6', 'Per7' ],
    baseStats: [ 9, 9, 9, 9, 9, 9, 9, 9 ],
    statMods: [ 20, 20, 20, 20, 20, 20, 20, 20 ],
    fumble: 3,
    maxLP: 220,
    maxFatigue: 9,
    initiative: 60,
    presence: 30,
    resistances: [ 50, 50 ],
    attack: 70,
    defense: 50,
    wearArmor: 70,
    maxAetherPool: 87,
    aetherAccumulations: [ 33, 33, 33, 33, 33, 33 ],
    martialKnowledge: 25,
    maxManaPool: 190,
    manaAccumulation: 100,
    spellCostLimit: 90,
    magicProjection: 9,
    spellKnowledge: 40,
    psychicPotential: 60,
    powersKnown: 9,
    psychicPoints: 18,
    psychicProjection: 9,
    maxFatigueBuffer: 5,
    currentFatigueBuffer: 5,
    skillReminder:
    [ 'Acro0', 'Athl1', 'Comp2', 'Craf3', 'Perf4', 'Slei5', 'Stea6', 'Swim7', 'Anim8', 'Appr9', 'Arca10', 'Cult11', 'Dece12', 'Hist13', 'Insi14', 'Medi15', 'Natu16', 'Noti17', 'Pers18', 'Sear19', 'Styl20', 'Theo21'],
    skills:
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ],
    devPointsTotal: 600,
    armorReference:
    [ 'head0', 'shoulderLeft1', 'shoulderRight2', 'armLeft3', 'armRight4', 'chest5', 'stomach6', 'handLeft7', 'handRight8', 'legLeft9', 'legRight10', 'footLeft11', 'footRight12' ],
    armor:
    [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ],
    charBody:
    [ [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {
      equippedWeapon: {
        itemName: 'Sword',
        itemType: 'Sword',
        slotType: 8,
        equipAction: 'Active',
        baseDamage: 50,
        weaponSpeed: 20,
        requiredStr: 5,
        defaultType: 0,
        optionalType: 2,
        blockBonus: 0,
        dodgeBonus: 0,
        fortitude: 8,
        breakage: 8,
        presence: 8,
        quality: 0,
        attackBonus: 0,
        twoHanded: false,
        special: []
      }
    } ], [ true, {} ], [ true, {} ], [ true, {} ], [ true, {} ] ],
    activeActions: { possible: 3, performing: false, remaining: 3 },
    statuses: {
      npc: true,
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
    tempStats: {
      currentDevPoints: 0,
      currentLP: 220,
      currentFatigue: 9,
      defenseCount: 0,
      currentInitiative: 0,
      currentAetherPool: 87,
      currentAetherAccums: [0, 0, 0, 0, 0, 0],
      currentManaPool: 190,
      currentManaAccum: 0,
      roundsOfConcentration: 0,
      allActionPenalty:
        { total: 0,
          endOfTurn: 0,
          tenPerTurn: 0,
          fivePerTurn: 0,
          onePerTurn: 0,
          requiresTreatment: 0,
          unremovable: 0 },
      onTheDefensive: false,
      numberOfDefenses: 0,
    },
    defaults: {
      defaultDefense: 0,
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
    }
  },
]
function selectTarget(name, list) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].charName === name) {
      return list[i];
    }
  }
}
const combatCalculators = {
  applyCritical: function(severity, defender, location, attackStats) {
    if (defender.statuses.conscious) {
      if (severity > 0 && severity < 51) {
        charEdits.giveAAP(defender, severity, 2);
      }
      if (severity > 50 && severity < 101) {
        charEdits.giveAAP(defender, severity, 3);
        if (attackStats.special.includes('Knock Out')) { defender.statuses.conscious = false; }
      }
      if (severity > 100 && severity < 151) {
        charEdits.giveAAP(defender, severity, 4);
        if (location[0] === 0) {
          // deadly head shot
        }
      }
      if (severity > 150 && severity < 201) {
        charEdits.giveAAP(defender, severity, 5);
        if (location[0] === 0 || location[0] === 5) {
          defender.statuses.alive = false;
          console.log('Hey. ' + defender.charName + ' is dead.');
        }
      }
      if (severity > 200) {
        charEdits.giveAAP(defender, severity, 5);
        defender.statuses.alive = false;
        console.log('Hey. ' + defender.charName + ' is dead.');
      }
    } else {
      defender.statuses.alive = false;
      console.log(defender.charName + ' cannot properly defend themselves and is killed.');
    }
  },
  attackModByAbility: function(ability, current) {
    let final = current;
    if (ability.attackBonus) { final += ability.attackBonus; }
    if (ability.predeterminedAttack) { final = ability.predeterminedAttack; }
    return final;
  },
  calculateArmorStrength: function(attackStats, defender, location) {
    let finalArmor = 0;
    if (attackStats.hitZoneType === 'Targeted') {
      finalArmor = defender.charBody[location[0]].armor[attackStats.attackType] - attackStats.armorPenetration;
    } else if (attackStats.hitZoneType === 'Engulf') {
      let wholeNumber = 0;
      let partsHit = 0;
      for (let i = 0; i < defender.armor.length; i++) {
        if (defender.charBody[i][0]) {
          wholeNumber = wholeNumber + defender.armor[i][attackStats.attackType];
          partsHit++;
        }
      }
      wholeNumber = Math.floor(wholeNumber / partsHit) - attackStats.armorPenetration;
      if (wholeNumber < 0) {
        wholeNumber = 0;
      }
      finalArmor = wholeNumber;
    }
    return finalArmor;
  },
  calculateCritSeverity: function(damage, defender) {
    let resist = rollOpen(defender.fumble) + defender.resistances[0] - defender.tempStats.allActionPenalty.total;
    let diff = damage + campaignDetails.deadliness - resist;
    if (diff < 0) { diff = 0; }
    return diff;
  },
  calculateDamage: function(attacker, result, attack, weapon, ability) {
    let final = attack.damageBonus;
    if (weapon) {
      final += weapon.baseDamage;
      if (weapon.twoHanded) { final += Math.floor(attacker.statMods[0] / 2); }
    }
    final += attacker.statMods[0];
    if (ability) { final = this.damageModByAbility(ability, final); }
    let percentage = (Math.floor(result / 10) * 10) / 100;
    final = final * percentage;
    return Math.floor(final);
  },
  checkActiveActions: function(performer) {
    if (performer.activeActions.remaining > 0) {
      return true;
    } else {
      return false;
    }
  },
  checkForActiveEffect: function(char, effect) {
    let response = false;
    for (let i = 0; i < char.activeEffects.length; i++) {
      if (char.activeEffects[i].effectName === effect) {
        response = true;
        break;
      }
    }
    return response;
  },
  checkForManaLoss: function(char, damage) {
    let roll = {};
    if (char.statuses.accumulatingMana === 'Specific') {
      roll = rollForSkill(char, 2, 6, (damage * 2), 40);
    } else {
      roll = rollForSkill(char, 2, 6, (damage * 2));
    }
    if (roll.success) {
      console.log(char.charName + ' does not lose their accumulated mana cuz they are tough.');
    } else {
      if (roll.margin <= damage) {
        cleanUps.dropExcessMana(char, 'Damage');
        console.log(char.charName + ' loses their accumulated mana from the damage, but it does\'t disappear.');
      } else {
        char.tempStats.currentManaPool -= char.tempStats.currentManaAccum;
        cleanUps.dropExcessMana(char, 'Damage');
        console.log(char.charName + ' loses their accumulated mana and it\'s all gone. Ouch.');
      }
      char.statuses.accumulatingMana = false;
    }
  },
  checkHitLocationInfo: function(constraint) {
    let final = [0, '', 0];
    if (!constraint) {
      final[2] = rollNoOpen();
      final = this.nameHitLocation(final[2]);
    } else {
      let randomize = rollNoOpen();
      (randomize < 51) ? final[2] = constraint - 25 : final[2] = constraint + 25;
      if (final[2] < 1) { final[2] = 1; }
      if (final[2] > 100) { final[2] = 100; }
      final = this.nameHitLocation(final[2]);
    }
    return final;
  },
  checkForConcentrationLoss: function(char, damage) {
    let roll = rollForSkill(char, 2, 6, (damage * 2));
    if (roll.success) {
      console.log(char.charName + ' maintains their psychic concentration.');
    } else {
      passiveActions.stopAccumulation(char, 'Psychic');
      console.log(char.charName + ' loses their psychic concentration.');
    }
  },
  checkForConsciousness: function(char) {
    if (char.tempStats.currentLP < 1 && char.statuses.conscious) {
      char.statuses.conscious = false;
      console.log(char.charName + ' has been knocked unconscious by reaching 0 LP.')
    }
  },
  checkForDefenseType: function(defender, surprise, attacker, attackType) {
    let response = defender.defaults.defaultDefense;
    if (!defender.statuses.npc) {
      if (!surprise) {
        response = parseInt(prompt('Will ' + defender.charName + ' Block (0) or Dodge (1) the ' + combatCalculators.nameAttackType(attackType) + ' from ' + attacker + '?'));
      }
    }
    return response;
  },
  checkForSurprise: function(attacker, defender) {
    let final = false;
    (attacker.currentInitiative > (defender.currentInitiative + baseNumbers.surpriseThreshold)) ? defenderSurprised = true : defenderSurprised = false; // Just playing with ternary operators.
    return final;
  },
  checkPsychicFatigue: function(char, difficulty, fatigueArray) {
    let final = {
      loss: 0,
      success: true,
    };
    if ((difficulty + 1) > fatigueArray.length) {
      return final;
    } else {
      final.loss = fatigueArray[difficulty];
      final.success = false;
      charEdits.takeFatigue(char, final.loss, true);
      return final;
    }
  },
  damageModByAbility: function(ability, current) {
    let final = current;
    if (ability.damageBonus) { final += ability.damageBonus; }
    if (ability.predeterminedDamage) { final = ability.predeterminedDamage; }
    return final;
  },
  getPsyConcentrationBonus: function(rounds) {
    if (rounds > 0 && rounds < 3) { return 10; }
    if (rounds > 2 && rounds < 5) { return 20; }
    if (rounds > 4 && rounds < 10) { return 30; }
    if (rounds > 9 && rounds < 600) { return 40; }
    if (rounds > 599) { return 50; }
  },
  hitLocationReverse: function(location) {
    if (location === 'Head') { return [0, 'Head', 1]; }
    else if (location === 'Left Shoulder') { return [1, 'Left Shoulder', 6]; }
    else if (location === 'Right Shoulder') { return [2, 'Right Shoulder', 12]; }
    else if (location === 'Left Arm') { return [3, 'Left Arm', 17]; }
    else if (location === 'Right Arm') { return [4, 'Right Arm', 22]; }
    else if (location === 'Chest') { return [5, 'Chest', 27]; }
    else if (location === 'Stomach') { return [6, 'Stomach', 42]; }
    else if (location === 'Left Hand') { return [7, 'Left Hand', 68]; }
    else if (location === 'Right Hand') { return [8, 'Right Hand', 72]; }
    else if (location === 'Left Leg') { return [9, 'Left Leg', 76]; }
    else if (location === 'Right Leg') { return [10, 'Right Leg', 84]; }
    else if (location === 'Left Foot') { return [11, 'Left Foot', 92]; }
    else if (location === 'Right Foot') { return [12, 'Right Foot', 96]; }
    else { console.log('Error. Targeted body part does not exist.'); }
  },
  modifyDamage: function(damage, attackStats) {
    if (attackStats.special.includes('Disable Limb') || attackStats.special.includes('Take Down') || attackStats.special.includes('Knock Out')) {
      return Math.floor(damage / 2);
    }
    if (attackStats.special.includes('Disarm') || attackStats.special.includes('Grapple')) {
      return 0;
    }
    return damage;
  },
  nameAttackType: function(num) {
    switch (num) {
      case 0:
        return 'Cut';
      case 1:
        return 'Impact';
      case 2:
        return 'Thrust';
      case 3:
        return 'Heat';
      case 4:
        return 'Cold';
      case 5:
        return 'Energy';
    }
  },
  nameHitLocation: function(num) {
    if (num > 0 && num < 6) { return [0, 'Head', num] }
    else if (num > 5 && num < 12) { return [1, 'Left Shoulder', num] }
    else if (num > 11 && num < 17) { return [2, 'Right Shoulder', num] }
    else if (num > 16 && num < 22) { return [3, 'Left Arm', num] }
    else if (num > 21 && num < 27) { return [4, 'Right Arm', num] }
    else if (num > 26 && num < 42) { return [5, 'Chest', num] }
    else if (num > 41 && num < 68) { return [6, 'Stomach', num] }
    else if (num > 67 && num < 72) { return [7, 'Left Hand', num] }
    else if (num > 71 && num < 76) { return [8, 'Right Hand', num] }
    else if (num > 75 && num < 84) { return [9, 'Left Leg', num] }
    else if (num > 83 && num < 92) { return [10, 'Right Leg', num] }
    else if (num > 91 && num < 96) { return [11, 'Left Foot', num] }
    else if (num > 95 && num < 101) { return [12, 'Right Foot', num] }
    else { console.log('Error. Targeted body part does not exist.'); }
  },
  reduceDamageFromArmor: function(comparison, armStr) {
    if (comparison < 50 && armStr === 1) { comparison = comparison - 10; }
    if (comparison < 50 && armStr === 0) { comparison = comparison - 10; if ((comparison + 10) < 30) { comparison = comparison - 10; } }
    comparison = comparison - (armStr * 10);
    if (comparison < 0) { comparison = 0; }
    return comparison;
  },
  rollAttack: function(attacker, attackStats, counter, weapon, defenders, ability) {
    let final = 0;
    let attackRoll = rollOpen(attacker.fumble);
    final = final + attackRoll + attacker.attack + attackStats.attackBonus; // Grouped as these are guaranteed stats to exist.
    if (weapon) { final += weapon.attackBonus; }
    final -= attacker.tempStats.allActionPenalty.total;
    if (attackStats.special.includes('Take Down')) {
      final -= 60;
      if (weapon) {
        if (weapon.special.includes('Take Down')) {
          final += 30;
        }
      }
    }
    if (attackStats.special.includes('Disarm')) { final -= 40; }
    if (attackStats.special.includes('Grapple')) { final -= 40; }
    if (defenders.length > 1) { final -= 50; } // Area attacks have a -50 penalty.
    if (attackStats.attackLimit > 0 && final > attackStats.attackLimit) { final = attackStats.attackLimit; }
    if (ability) { final = this.attackModByAbility(ability, final); }
    return final;
  },
  rollDefense: function(defender, surprise, defendType, weapon) {
    let final = 0;
    let defenseRoll = rollOpen(defender.fumble);
    final = final + defenseRoll + defender.defense - defender.tempStats.allActionPenalty.total;
    if (defendType === 0) { // Applying block specific modifiers.
      final += defender.statMods[2];
      if (weapon) { final = final + weapon.blockBonus }
    } else { // Applying dodge specific modifiers.
      final += defender.statMods[1];
      if (weapon) { final += weapon.dodgeBonus }
    }
    if (defender.statuses.specialDefense != 'Pure Defense') { // Checking number of defenses modifier.
      if (defender.tempStats.numberOfDefenses > 0 && defender.tempStats.numberOfDefenses < 5) {
        final -= (10 + (20 * defender.tempStats.numberOfDefenses));
      } else if (defender.tempStats.numberOfDefenses > 4) {
        final -= 90;
      }
    }
    if (surprise) { final -= 90; }
    if (defender.statuses.specialDefense === 'No Defense') { final = Math.floor(final / 2); }
    if (defender.statuses.specialDefense === 'Pure Defense') { final += 30; }
    if (!defender.statuses.conscious) { final -= 300; }
    return final;
  },
  rollResistance: function(defender, ability) {
    let final = 0;
    let roll = rollOpen(defender.fumble);
    if (ability.resistType === 'Physical') { final += defender.resistances[0]; }
    if (ability.resistType === 'Supernatural') { final += defender.resistances[1]; }
    final -= defender.tempStats.allActionPenalty.total;
    return final;
  },
  takeDown: function(attacker, defender, comparison) {
    let attakersResult = 0;
    let defendersResult = 0;
    if (attacker.statuses.npc) {
      attackersResult = attackersResult + statRoll(attacker, attacker.defaults.defaultTakeDownOffense);
    } else {
      let attackStatChoice = parseInt(prompt('What stat would ' + attacker.charName + ' like to use in their Take Down attempt against ' + defender.charName + '? Stat options are Str0, Dex2.'));
      attackersResult = attackersResult + statRoll(attacker, attackStatChoice);
    }
    if (comparison <= 50) { attackersResult -= 2; }
    if (comparison >= 150) { attackersResult += 2; }
    if (defender.statuses.npc) {
      defendersResult = defendersResult + statRoll(defender, defender.defaults.defaultTakeDownDefense);
    } else {
      let defendStatChoice = parseInt(prompt('What stat would ' + defender.charName + ' like to use in their Take Down defense against ' + attacker.charName + '? Stat options are Str0, Agi1.'));
      defendersResult = defendersResult + statRoll(defender, defendStatChoice);
    }
    let rollOffComparison = attackersResult - defendersResult;
    if (rollOffComparison >= 1) {
      defender.tempStats.prone = true;
      console.log(defender.charName + ' has has been knocked prone by ' + attacker.charName);
    } else {
      console.log(defender.charName + ' has AVOIDED being knocked prone by ' + attacker.charName);
    }
  },
  disarmEnemy: function(attacker, defender, comparison) { // Finish effect.
    let attakersResult = 0;
    let defendersResult = 0;
    if (attacker.statuses.npc) {
      attackersResult = attackersResult + statRoll(attacker, attacker.defaults.defaultDisarmOffense);
    } else {
      let attackStatChoice = parseInt(prompt('What stat would ' + attacker.charName + ' like to use in their Disarm attempt against ' + defender.charName + '? Stats are Agi1, Dex2'));
      attackersResult = attackersResult + statRoll(attacker, attackStatChoice);
    }
    if (comparison <= 50) { attackersResult = attackersResult - 2; }
    if (comparison >= 150) { attackersResult = attackersResult + 2; }
    if (defender.statuses.npc) {
      defendersResult = defendersResult + statRoll(defender, defender.defaults.defaultDisarmDefense);
    } else {
      let defendStatChoice = parseInt(prompt('What stat would ' + defender.charName + ' like to use in their Disarm defense against ' + attacker.charName + '? Stats are Str0, Dex2'));
      defendersResult = defendersResult + statRoll(defender, defendStatChoice);
    }
    let rollOffComparison = attackersResult - defendersResult;
    if (rollOffComparison >= 1) {
      // Success.
    } else {
      // Failure.
    }
  },
  grappleEnemy: function(attacker, defender, comparison) { // Finish effect.
    let attakersResult = 0;
    let defendersResult = 0;
    if (attacker.statuses.npc) {
      attackersResult = attackersResult + statRoll(attacker, attacker.defaults.defaultGrappleOffense);
    } else {
      let attackStatChoice = parseInt(prompt('What stat would ' + attacker.charName + ' like to use in their Grapple attempt against ' + defender.charName + '? Stats are Str0, Agi1'));
      attackersResult = attackersResult + statRoll(attacker, attackStatChoice);
    }
    if (comparison <= 50) { attackersResult = attackersResult - 2; }
    if (comparison >= 150) { attackersResult = attackersResult + 2; }
    if (defender.statuses.npc) {
      defendersResult = defendersResult + statRoll(defender, defender.defaults.defaultGrappleDefense);
    } else {
      let defendStatChoice = parseInt(prompt('What stat would ' + defender.charName + ' like to use in their Grapple defense against ' + attacker.charName + '? Stats are Str0, Agi1'));
      defendersResult = defendersResult + statRoll(defender, defendStatChoice);
    }
    let rollOffComparison = attackersResult - defendersResult;
    if (rollOffComparison >= 1) {
      // Success.
    } else {
      // Failure.
    }
  },
  verifyAetherAccums: function(user, ability) {
    let decision = false;
    let accums = user.tempStats.currentAetherAccums;
    let reqs = ability.requiredAether;
    if (accums[0] >= reqs[0] && accums[1] >= reqs[1] && accums[2] >= reqs[2] && accums[3] >= reqs[3] && accums[4] >= reqs[4] && accums[5] >= reqs[5] ) {
      decision = true;
      user.tempStats.currentAetherAccums[0] -= reqs[0];
      user.tempStats.currentAetherAccums[1] -= reqs[1];
      user.tempStats.currentAetherAccums[2] -= reqs[2];
      user.tempStats.currentAetherAccums[3] -= reqs[3];
      user.tempStats.currentAetherAccums[4] -= reqs[4];
      user.tempStats.currentAetherAccums[5] -= reqs[5];
      user.tempStats.currentAetherPool -= (reqs[0] + reqs[1] + reqs[2] + reqs[3] + reqs[4] + reqs[5]);
      console.log('%c' + user.charName + ' activates ' + ability.abilityName + '!', 'color: rgb(128, 0, 255)');
    }
    return decision;
  },
  verifyManaAccum: function(user, ability) {
    let decision = false;
    if (user.tempStats.currentManaAccum >= ability.requiredMana) {
      console.log('%c' + user.charName + ' casts ' + ability.abilityName + '!', 'color: rgb(2, 62, 93)');
      decision = true;
    }
    return decision;
  }
}
const attackStuff = {
  // Put all of the attack things here.
};
function askForCounter(attacker, defender, counter) {
  if (!defender.statuses.npc) {
    return prompt('Would ' + defender.charName + ' like to counterattack ' + attacker.charName + ' with a bonus of ' + counter.bonus + '? Y or N').toLowerCase();
  } else {
    return 'y';
  }
}
function attackVsResist(attacker, defender, attackStats, ability) {
  for (let i = 0; i < defender.length; i++) {
    let resistanceRoll = combatCalculators.rollResistance(defender[i], ability);
    let comparison = ability.resistanceDifficulty - resistanceRoll;
    let hit = false;
    if (comparison > 0) { hit = true; }
    console.log(attacker.charName + ' targets ' + defender[i].charName + ' with ' + ability.abilityName + '. (Difficulty: ' + ability.resistanceDifficulty + ', Resistance: ' + resistanceRoll + ')');
    if (hit) {
      ability.effect(defender[i], Math.abs(comparison));
    } else {
      console.log(defender[i].charName + ' successfully resisted against ' + ability.abilityName + '!');
    }
  }
}
function attackSimple(attacker, defender, attackStats, counter, weapon, ability) { // In a previous iteration, this was divided up way more. It seemed that every function required every single parameter to be passed back and forth. This looks relatively disorganized, but I follow it easily.
  let previousHitLocation = [0, '', 101];
  for (let i = 0; i < defender.length; i++) {
    let currentCounter = counter;
    let defenderSurprised = combatCalculators.checkForSurprise(attacker, defender[i]);
    let defendType = combatCalculators.checkForDefenseType(defender[i], defenderSurprised, attacker.charName, attackStats.attackType);
    let attackRoll = combatCalculators.rollAttack(attacker, attackStats, counter, weapon, defender, ability);
    let defenseRoll = combatCalculators.rollDefense(defender[i], defenderSurprised, defendType, defender[i].charBody[8].equippedWeapon);
    let attackComparison = attackRoll - defenseRoll;
    if (defender[i].statuses.specialDefense != 'No Defense') {
      defender[i].tempStats.onTheDefensive = true;
      defender[i].tempStats.numberOfDefenses++;
    }
    let hit = false;
    if (attackComparison >= 0) { hit = true; }
    console.log(attacker.charName + ' (Init: ' + attacker.tempStats.currentInitiative + ')' + ' attacks (' + attackRoll + ') - ' + defender[i].charName + ' defends (' + defenseRoll + ') = ' + attackComparison + '. Hit: ' + hit);
    if (hit) {
      let location = [];
      if (attackStats.special.includes('Directed')) { location = attackStats.directed; } // attackStats.directed should be an array that is previously determined with normal location info.
      else { location = combatCalculators.checkHitLocationInfo(previousHitLocation[2]); } // This should just run if the attack isn't directed. Keep an eye on it.
      if (attackStats.blockable && previousHitLocation[2] === 101) { location = combatCalculators.checkHitLocationInfo(0); }
      previousHitLocation = location;
      let armorStrength = combatCalculators.calculateArmorStrength(attackStats, defender[i], location);
      attackComparison = combatCalculators.reduceDamageFromArmor(attackComparison, armorStrength);
      let critThreshold = Math.ceil(defender[i].tempStats.currentLP / 2);
      let damage = combatCalculators.calculateDamage(attacker, attackComparison, attackStats, weapon, ability);
      charEdits.dealDamage(defender[i], combatCalculators.modifyDamage(damage, attackStats));
      console.log(combatCalculators.modifyDamage(damage, attackStats) + ' damage dealt with crit threshold of ' + critThreshold + '. ' + defender[i].charName + ' has ' + defender[i].tempStats.currentLP + ' remaining.');
      if (damage >= critThreshold) { // The modifyDamage function should allow for criticals to continue to be calculated with full damage while the defender does not actually take it all.
        let critSeverity = combatCalculators.calculateCritSeverity(damage, defender[i]);
        console.log('It\'s a CRIT! Severity is ' + critSeverity + ' vs the ' + location[1] + '!');
        if (critSeverity > 0) { combatCalculators.applyCritical(critSeverity, defender[i], location, attackStats); }
      }
      combatCalculators.checkForConsciousness(defender[i]);
      if (attackStats.special.includes('Take Down')) { combatCalculators.takeDown(attacker, defender[i], attackComparison); }
      if (attackStats.special.includes('Disarm')) { combatCalculators.disarmEnemy(attacker, defender[i], attackComparison); }
      if (attackStats.special.includes('Grapple')) { combatCalculators.grappleEnemy(attacker, defender[i], attackComparison); }
    } else {
      if (attackStats.range < 2) {
        if (!currentCounter.status) {
          let counterResponse = askForCounter(attacker, defender[i], currentCounter);
          if (counterResponse === 'y') {
            currentCounter.bonus = Math.floor(attackComparison / -5) * 5;
            currentCounter.status = true;
            attackSimple(defender[i], [attacker], defender[i].defaults.defaultAttack, currentCounter, defender[i].charBody[8].equippedWeapon);
          } else if (counterResponse === 'n') {
            console.log('Kay. No counterattack.');
          }
        } else {
          console.log(defender[i].charName + ' cannot counter a counter!');
        }
      } else {
        console.log('The attack is too far away to counter!');
      }
      if (attackStats.blockable && !defenderSurprised && defender[i + 1]) {
        console.log('There should not be an attack vs ' + defender[i + 1].charName +'.');
        break;
      }
    }
  }
}

function rollInitiativeAndSort(list) {
  for (let i = 0; i < list.length; i++) {
    list[i].tempStats.currentInitiative = rollOpen(list[i].fumble) + list[i].initiative - list[i].charBody[8].equippedWeapon.weaponSpeed - list[i].tempStats.allActionPenalty.total;
  }
  list.sort(function(a, b) {
    return b.tempStats.currentInitiative > a.tempStats.currentInitiative;
  });
}

function mTENoPassives(p, t, a) {
  let w = p.charBody[8].equippedWeapon;
  activeActions.useActive(p);
  attackSimple(p, [t], activeActions.compileAttack(p, w), {status: false, bonus: 0}, w);
  // if (combatCalculators.verifyAetherAccums(p, a)) {
  //   p.statuses.accumulatingAether = false;
  //   attackSimple(p, [t], activeActions.compileAttack(p, w, a), {status: false, bonus: 0}, w, a);
  // } else {
  //   attackSimple(p, [t], activeActions.compileAttack(p, w), {status: false, bonus: 0}, w);
  // }
  // let testPower = activeActions.activatePsychicPower(p, abilities.psychic.offensive.testPower.Activation);
  // if (testPower.successful) {
  //   console.log('%c' + p.charName + ' successfully activated ' + testPower.abilityName + '!', 'color: rgb(99, 33, 33)');
  //   attackSimple(p, [t], activeActions.compileAttack(p, unarmedStats, testPower), {status: false, bonus: 0}, unarmedStats, testPower);
  // }
  // if (combatCalculators.verifyManaAccum(p, abilities.magic.offensive.strongTestSpell.basics)) {
  //   let testSpell = activeActions.castSpell(p, abilities.magic.offensive.strongTestSpell.Activation);
  //   attackSimple(p, [t], activeActions.compileAttack(p, unarmedStats, testSpell), {status: false, bonus: 0}, unarmedStats, testSpell);
  // }
}
function mTEWithPassives(p, t, a) {
  let w = p.charBody[8].equippedWeapon;
  activeActions.useActive(p);
  passiveActions.accumulateAether(p, [0, 1, 2]);
  passiveActions.accumulateMana(p, 'Pure');
  if (combatCalculators.verifyAetherAccums(p, a)) {
    p.statuses.accumulatingAether = false;
    attackSimple(p, [t], activeActions.compileAttack(p, w, a), {status: false, bonus: 0}, w, a);
  } else {
    attackSimple(p, [t], activeActions.compileAttack(p, w), {status: false, bonus: 0}, w);
  }
  if (combatCalculators.verifyManaAccum(p, abilities.magic.offensive.strongTestSpell.basics)) {
    let testSpell = activeActions.castSpell(p, abilities.magic.offensive.strongTestSpell.Activation);
    attackSimple(p, [t], activeActions.compileAttack(p, unarmedStats, testSpell), {status: false, bonus: 0}, unarmedStats, testSpell);
  }
}
function mTEOnlyPassives(p) {
  passiveActions.accumulateAether(p, [0, 1, 2]);
  passiveActions.accumulateMana(p, 'Pure');
  console.log(p.charName + ' is not performing active actions this turn.');
}
function testActions(performer, target, list) {
  if (activeActions.useActive(list[performer], true)) {
    mTENoPassives(list[performer], selectTarget(list[target].charName, list), abilities.aether.offensive.tester);
    // if (performer % 2 === 0) {
    //   mTEWithPassives(list[performer], selectTarget(list[target].charName, list), abilities.aether.offensive.tester);
    // } else {
    //   if (performer === 1) {
    //     mTENoPassives(list[performer], selectTarget(list[target].charName, list), abilities.aether.offensive.tester);
    //   } else {
    //     mTEOnlyPassives(list[performer]);
    //   }
    // }
  } else {
    console.log(list[performer].charName + ' is not capable of performing any action type.');
  }
}
function determineRandomTarget(avoid, num) {
  let final = rollSmall(num) - 1;
  while (final === avoid) {
    final = rollSmall(num) - 1;
  }
  return final;
}
let deathTracker = [
  { charName: 'Nathan', deaths: 0 },
  { charName: 'Skye', deaths: 0 },
  { charName: 'Dickface', deaths: 0 },
  { charName: 'Tim', deaths: 0 },
  { charName: 'Garden', deaths: 0 },
];
function testAttack(list) {
  for (let i = 0; i < 50; i++) {
    console.log('%cTURN COUNTER: ' + (i + 1), 'color: rgb(126, 168, 255)');
    rollInitiativeAndSort(list);
    for (let j = 0; j < list.length; j++) {
      testActions(j, determineRandomTarget(j, list.length), list);
    }
    for (let j = 0; j < list.length; j++) {
      resolveEndOfTurn(list[j]);
    }
    let deadCount = 0;
    for (let k = 0; k < list.length; k++) {
      if (!list[k].statuses.alive) {
        deadCount++;
        for (let x = 0; x < deathTracker.length; x++) {
          if (deathTracker[x].charName === list[k].charName) {
            deathTracker[x].deaths++;
          }
        }
      }
    }
    if (deadCount > 0) {
      console.log('%c  ' + deadCount + ' character(s) killed on turn ' + (i + 1) + '.  ', 'background: #000000; color: rgb(234, 40, 0)');
      break;
    }
  }
}

function testMultiple(list) {
  for (let j = 0; j < 1; j++) {
    testAttack(list);
    function fixEveryone(c) {
      c.baseStats = [ 9, 9, 9, 9, 9, 9, 9, 9 ];
      c.statMods = [ 20, 20, 20, 20, 20, 20, 2000, 20 ];
      c.fumble = 3;
      c.maxLP = 220;
      c.maxFatigue = 9;
      c.initiative = 60;
      c.presence = 30;
      c.resistances = [ 50, 50 ];
      c.attack = 70;
      c.defense = 50;
      c.wearArmor = 70;
      c.maxAetherPool = 87;
      c.aetherAccumulations = [ 33, 33, 33, 33, 33, 33 ];
      c.martialKnowledge = 25;
      c.maxManaPool = 190;
      c.manaAccumulation = 100;
      c.spellCostLimit = 90;
      c.magicProjection = 9;
      c.spellKnowledge = 40;
      c.psychicPotential = 60;
      c.powersKnown = 9;
      c.psychicPoints = 18;
      c.psychicProjection = 9;
      c.maxFatigueBuffer = 5;
      c.currentFatigueBuffer = 5;
      c.skills =
      [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 3 ], [ 0, 3 ], [ 0, 3 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ], [ 0, 2 ] ];
      c.devPointsTotal = 600;
      c.armor =
      [ [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0 ] ];
      c.activeActions = { possible: 3, performing: false, remaining: 3 };
      c.statuses = {
        npc: true,
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
      };
      c.tempStats = {
        currentDevPoints: 0,
        currentLP: 220,
        currentFatigue: 9,
        defenseCount: 0,
        currentInitiative: 0,
        currentAetherPool: 87,
        currentAetherAccums: [0, 0, 0, 0, 0, 0],
        currentManaPool: 190,
        currentManaAccum: 0,
        roundsOfConcentration: 0,
        allActionPenalty:
          { total: 0,
            endOfTurn: 0,
            tenPerTurn: 0,
            fivePerTurn: 0,
            onePerTurn: 0,
            requiresTreatment: 0,
            unremovable: 0 },
        onTheDefensive: false,
        numberOfDefenses: 0,
      };
      c.defaults = {
        defaultDefense: 0,
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
    }
    for (let i = 0; i < list.length; i++) {
      fixEveryone(list[i]);
    }
  }
}
