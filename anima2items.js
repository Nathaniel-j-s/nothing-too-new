const items = {
  weaponList: [],
  armorList: [],
  otherItemList: []
};
function Weapon(config) {
  this.itemName = config.weaponName;
  this.itemType = config.weaponType;
  this.slotType = config.slotType;
  this.equipAction = config.equipAction;
  this.attackBonus = config.attackBonus;
  this.baseDamage = config.baseDamage;
  this.weaponSpeed = config.weaponSpeed;
  this.requiredStr = config.requiredStr;
  this.defaultType = config.defaultType;
  this.optionalType = config.optionalType;
  this.blockBonus = config.blockBonus;
  this.dodgeBonus = config.dodgeBonus;
  this.fortitude = config.fortitude;
  this.breakage = config.breakage;
  this.presence = config.presence;
  this.quality = config.quality;
  this.twoHanded = false;
  this.range = config.range;
}
function makeWeap() {
  function makeWeaponConfig() {
    let weaponInfo = {
      weaponName: 'Too Default',
      weaponType: '',
      slotType: 8,
      equipAction: 'Passive'
    }
    function buildWeaponInfo() {
      weaponInfo.weaponName = prompt('What is this weapon called?');
      weaponInfo.weaponType = prompt('What weapon type does this fall into?');
      weaponInfo.slotType = parseInt(prompt('Select what slot this item goes into: Head 0, Shoulder Left 1, Shoulder Right 2, Arm Left 3, Arm Right 4, Chest 5, Stomach 6, Hand Left 7, Hand Right 8, Leg Left 9, Leg Right 10, Foot Left 11, Foot Right 12'));
      weaponInfo.equipAction = prompt('What action does this require to equip? Active, Passive, Noncombat');
      weaponInfo.attackBonus = parseInt(prompt('If this weapon has an attack bonus, what is it?'));
      weaponInfo.baseDamage = parseInt(prompt('What is this weapon\'s base damage?'));
      weaponInfo.weaponSpeed = parseInt(prompt('What is this weapon\'s speed?'));
      weaponInfo.requiredStr = parseInt(prompt('What STR score does this weapon require to avoid a penalty?'));
      weaponInfo.defaultType = parseInt(prompt('What primary attack type does this weapon have?'));
      weaponInfo.optionalType = parseInt(prompt('What secondary attack type does this weapon have?'));
      weaponInfo.blockBonus = parseInt(prompt('If this weapon has an block bonus, what is it?'));
      weaponInfo.dodgeBonus = parseInt(prompt('If this weapon has an dodge bonus, what is it?'));
      weaponInfo.fortitude = parseInt(prompt('What is this weapon\'s fortitude?'));
      weaponInfo.breakage = parseInt(prompt('What is this weapon\'s breakage?'));
      weaponInfo.presence = parseInt(prompt('What is this weapon\'s presence?'));
      weaponInfo.quality = parseInt(prompt('What is this weapon\'s quality?'));
      weaponInfo.range = parseInt(prompt('What is this weapon\'s range?'));
    }
    buildWeaponInfo();
    return weaponInfo;
  }
  let config = makeWeaponConfig();
  items.weaponList.push(new Weapon(config));
}
function makeArmor() { // Unfinished.
  function Armor(config) {
    this.itemName = config.armorName;
    this.itemType = config.armorType;
    this.slotType = config.slotType;
    this.equipAction = config.equipAction;
    this.armorValues = config.armorValues;
    this.armorSpeed = config.armorSpeed;
    this.requiredWA = config.requiredWA;
    this.presence = config.presence;
    this.quality = config.quality;
  }
  function makeArmorConfig() {
    let armorInfo = {
      armorName: 'Too Default',
      armorType: '',
      slotType: [],
      equipAction: 'Active',
      armorValues: [],

    }
    function buildArmorInfo() {
      armorInfo.armorName = prompt('What is this armor called?');
      armorInfo.armorType = prompt('Is this armor Hard or Soft?');

      let slots = [];
      let slotNumber = parseInt(prompt('How many body slots does this armor cover? (We\'ll get which ones next.)'));
      for (let i = 0; i < slotNumber; i++) { slots.push(parseInt(prompt('Select what slot this item goes into: Head 0, Shoulder Left 1, Shoulder Right 2, Arm Left 3, Arm Right 4, Chest 5, Stomach 6, Hand Left 7, Hand Right 8, Leg Left 9, Leg Right 10, Foot Left 11, Foot Right 12'))); }
      armorInfo.slotType = slots;

      armorInfo.equipAction = prompt('What action does this require to equip? Active, Passive, Noncombat');

      let values = [];
      for (let i = 0; i < 6; i++) { values.push(parseInt(prompt('What is the' + i + 'value of this armor?'))); }
      armorInfo.armorValues = values;

      armorInfo.armorSpeed = parseInt(prompt('What is this armor\'s speed?'));
      armorInfo.requiredWA = parseInt(prompt('What wear armor score does this armor require to avoid a penalty?'));
      armorInfo.presence = parseInt(prompt('what is this armor\'s presence?'));
      armorInfo.quality = parseInt(prompt('what is this armor\'s quality?'));
    }
    buildArmorInfo();
    return armorInfo;
  }
  let config = makeArmorConfig();
  armorList.push(new Armor(config));
}
function equipItem(char, bodySlot, item) { // Unfinished.
  let slot = char.charBody[bodySlot];
  let possible = true;
  if (item.equipAction === 'Noncombat' && campaignDetails.combatStatus) {
    possible = false;
  }
  if (item.equipAction === 'Active' && char.activeActions[1] < 1) {
    possible = false;
  }
  if (possible) {
    if (slot[0]) {
      if (slot[1]) {
        char.inventory.push(slot[1]);
        slot[1] = {};
      }
      slot[1] = item;
      char.charBody[bodySlot] = slot;
      // remove the item from the inventory I hate splicing arrays
      if (bodySlot === 7 || bodySlot === 8) {
        char.tempStats.allActionPenalty.singleTurn = char.tempStats.allActionPenalty.singleTurn + 25;
      }
      if (item.equipAction === 'Active') {
        char.activeActions[1]--;
      }
    } else {
      console.log('Can\'t equip this. The body part needed is destroyed.');
    }
  }
}
function unequipItem(char, bodySlot) { // Unfinished.
  char.inventory.push(char.charBody[bodySlot][1]);
  char.charBody[bodySlot][1] = {};
}
function equipWeapon(char, bodySlot, item) {
  let hand = char.charBody[bodySlot];
  if (hand.equippedWeapon.itemName) {
    // unequip the weapon
  } else {
    hand.equippedWeapon = item;
  }
}

items.weaponList.push(new Weapon(
  {
    weaponName: 'Longsword',
    weaponType: 'Weapon',
    slotType: 8,
    equipAction: 'Passive',
    attackBonus: 0,
    baseDamage: 50,
    weaponSpeed: -20,
    requiredStr: 5,
    defaultType: 0,
    optionalType: 2,
    blockBonus: 0,
    dodgeBonus: 0,
    fortitude: 8,
    breakage: 8,
    presence: 8,
    quality: 0,
    range: 1
  }
))
