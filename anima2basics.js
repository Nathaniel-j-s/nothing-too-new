function rollSmall(num) {
  return 1 + Math.floor(Math.random() * num);
}
function rollNoOpen() {
  return 1 + Math.floor(Math.random() * 100);
}
function rollOpen(fr) {
  var total = 0;
  var current = 0;
  var threshold = 90;
  var openCount = 1;
  for (var i = 0; i < openCount; i++) {
    current = rollNoOpen();
    total += current;
    if (current >= threshold) {
      threshold++;
      openCount++;
    }
    if (current <= fr && openCount === 1) {
      total -= 50 + (25 * ((fr + 1) - current)); // Example: FR is 3 (standard), so a roll of 3 means 4 - 3 = 1 (25). Annoying calculation, but it's gotta go backwards and account for lots of numbers.
    }
  }
  return total;
}
function averageArray(arr) {
  let num1 = 0;
  let num2 = 0;
  for (let i = 0; i < arr.length; i++) {
    num1++;
    num2 += arr[i];
  }
  return Math.floor(num2 / num1);
}
function checkSkillActionType() { // Unfinished.
  let response = prompt('Is this an Active or Passive action?');
  if (response === 'Active') {
    // Do something about it.
  } else {
    // It's passive.
  }
}
function rollForSkill(char, type, statistic, difficulty, bonus) {
  let skill = 0;
  if (type) {
    skill = type;
  } else {
    skill = parseInt(prompt('What skill are we checking? Acro0, Athl1, Comp2, Craf3, Perf4, Slei5, Stea6, Swim7, Anim8, Appr9, Arca10, Cult11, Dece12, Hist13, Insi14, Medi15, Natu16, Noti17, Pers18, Sear19, Styl20, Theo21'));
  }
  let stat = 0;
  if (statistic) {
    stat = statistic;
  } else {
    stat = parseInt(prompt('What stat are you using? Str0, Agi1, Dex2, Con3, Int4, Pow5, Wil6, Per7'));
  }
  let target = 0;
  if (difficulty) {
    target = difficulty;
  } else {
    target = parseInt(prompt('What is the target number for the check?'));
  }
  let roll = rollOpen(char.fumble) + char.skills[skill][0] + char.statMods[stat];
  if (bonus) { roll += bonus; }
  let result = { result: false, margin: 0 };
  if (roll >= target) {
    result.success = true;
    result.margin = Math.floor(roll - target);
    console.log('Success! Margin is ' + result.margin);
  } else {
    result.success = false;
    result.margin = Math.floor(Math.abs(roll - target));
    console.log('Failure. Margin is ' + result.margin);
  }
  return result;
}
function checkVsBasicDifficulty(num) {
  let final = {
    value: 0,
    valueName: 'Failure',
    roll: num
  };
  if (num >= 20 && num < 50) { final = { value: 1, valueName: 'Routine', roll: num }; }
  else if (num >= 50 && num < 80) { final = { value: 2, valueName: 'Simple', roll: num }; }
  else if (num >= 80 && num < 110) { final = { value: 3, valueName: 'Moderate', roll: num }; }
  else if (num >= 110 && num < 140) { final = { value: 4, valueName: 'Difficult', roll: num }; }
  else if (num >= 140 && num < 170) { final = { value: 5, valueName: 'Proffesional', roll: num }; }
  else if (num >= 170 && num < 200) { final = { value: 6, valueName: 'Adept', roll: num }; }
  else if (num >= 200 && num < 230) { final = { value: 7, valueName: 'Absurd', roll: num }; }
  else if (num >= 230 && num < 260) { final = { value: 8, valueName: 'Extreme', roll: num }; }
  else if (num >= 260 && num < 300) { final = { value: 9, valueName: 'Near Impossible', roll: num }; }
  else if (num >= 300 && num < 350) { final = { value: 10, valueName: 'Maximum', roll: num }; }
  else if (num >= 350 && num < 450) { final = { value: 11, valueName: 'Inhuman', roll: num }; }
  else if (num >= 450) { final = { value: 12, valueName: 'Godly', roll: num }; }
  return final;
}
function inputPhysicalRoll(reason) {
  var result = parseInt(prompt(`Please enter a roll for @{reason}`));
}

const charEdits = {
  blind: function(char, turns) {
    charEdits.giveAAP(char, 200, 5);
    console.log(char.charName + ' has been blinded!');
    char.activeEffects.push(
      {
        effectName: 'Blinded',
        remainingTurns: turns,
        endEffect: function(self) {
          charEdits.giveAAP(self, -200, 5);
          console.log(char.charName + ' is no longer blinded!');
        }
      }
    );
  },
};
const errorChecks = {
  addedEffectVerify: function(used, min, max) {
    let manaUsed = used;
    if (manaUsed < min) { console.log('Character shouldn\'t be able to cast this spell because they haven\'t accumulated enough mana. Something went wrong.'); }
    if (manaUsed > max) { manaUsed = max; }
    return Math.floor((manaUsed - min) / 10);
  },
};

class Attack {
  constructor(config) {
    this.attackType = config.attackType;
    this.range = config.range || 0;
    this.attackBonus = config.attackBonus || 0;
    this.attackLimit = config.attackLimit || 0;
    this.armorPenetration = config.armorPenetration || 0;
    this.damageBonus = config.damageBonus || 0;
    this.blockable = config.blockable || true;
    this.hitZoneType = config.hitZoneType || 'Targeted';
    this.special = config.special || [];
    this.directed = config.directed || [0, '', 0];
  }
}
const campaignDetails = {
  deadliness: 50,
  combatStatus: true
}
const unarmedStats = {
  itemName: 'Unarmed',
  itemType: 'Weapon',
  slotType: 8,
  equipAction: 'Passive',
  attackBonus: 0,
  baseDamage: 20,
  weaponSpeed: 20,
  requiredStr: 3,
  defaultType: 1,
  optionalType: 1,
  blockBonus: 0,
  dodgeBonus: 0,
  fortitude: 5,
  breakage: 5,
  presence: 5,
  quality: 0,
  twoHanded: false,
  range: 0
}
const baseNumbers = {
  surpriseThreshold: 150
}
const basicAttacks = {
  basicAttack: new Attack({
    attackType: 0,
    attackBonus: 0,
    attackLimit: 0,
    armorPenetration: 0,
    damageBonus: 0,
    range: 0,
    blockable: true,
    hitZoneType: 'Targeted',
    special: ['None'],
    directed: [0, '', 0]
  }),
  basicRangedAttack: new Attack({
    attackType: 2,
    attackBonus: 0,
    attackLimit: 240,
    armorPenetration: 0,
    damageBonus: 0,
    range: 5,
    blockable: true,
    hitZoneType: 'Targeted',
    special: ['None'],
    directed: [0, '', 0]
  }),
  basicDirected: new Attack({
    attackType: 0,
    attackBonus: -10,
    attackLimit: 0,
    armorPenetration: 0,
    damageBonus: 0,
    range: 0,
    blockable: true,
    hitZoneType: 'Targeted',
    special: ['Directed'],
    directed: [0, 'Head', 1]
  }),
  basicTakeDown: new Attack({
    attackType: 1,
    attackBonus: 0,
    attackLimit: 0,
    armorPenetration: 0,
    damageBonus: 0,
    range: 0,
    blockable: true,
    hitZoneType: 'Targeted',
    special: ['Take Down'],
    directed: [0, '', 0]
  }),
  basicDisarm: new Attack({
    attackType: 0,
    attackBonus: 0,
    attackLimit: 0,
    armorPenetration: 0,
    damageBonus: 0,
    range: 0,
    blockable: true,
    hitZoneType: 'Targeted',
    special: ['Disarm'],
    directed: [0, '', 0]
  }),
  basicGrapple: new Attack({
    attackType: 1,
    attackBonus: 0,
    attackLimit: 0,
    armorPenetration: 0,
    damageBonus: 0,
    range: 0,
    blockable: true,
    hitZoneType: 'Targeted',
    special: ['Grapple'],
    directed: [0, '', 0]
  })
};
