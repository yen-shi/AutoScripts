// ==UserScript==
// @name         TravianBot
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  A script for auto-constructing farms and buildings
// @author       Yen-Shi Wang
// @match        https://ts3.travian.com/dorf1.php*
// @include      https://ts3.travian.com/dorf2.php*
// @include      https://ts3.travian.com/build.php*
// @grant        none
// ==/UserScript==

let farmInfo = [
  ['crop1', 2, 'buildingSlot2'],
  ['crop2', 2, 'buildingSlot8'],
  ['crop3', 1, 'buildingSlot9'],
  ['crop4', 1, 'buildingSlot12'],
  ['crop5', 1, 'buildingSlot13'],
  ['crop6', 1, 'buildingSlot15'],

  ['clay1', 1, 'buildingSlot5'],
  ['clay2', 1, 'buildingSlot6'],
  ['clay3', 1, 'buildingSlot16'],
  ['clay4', 1, 'buildingSlot18'],

  ['wood1', 1, 'buildingSlot1'],
  ['wood2', 1, 'buildingSlot3'],
  ['wood3', 1, 'buildingSlot14'],
  ['wood4', 1, 'buildingSlot17'],

  ['iron1', 1, 'buildingSlot4'],
  ['iron2', 1, 'buildingSlot7'],
  ['iron3', 1, 'buildingSlot10'],
  ['iron4', 1, 'buildingSlot11'],
];

// base classes: 'buildingSlot a19' ~ 'buildingSlot a40'
//               'buildingSlot <id>'
let buildingInfo = [
  ['Main Building', 3, 'buildingSlot g15', 'tabItem infrastructure'],

  ['Granary', 1, 'buildingSlot g11', 'tabItem infrastructure'],
  ['Warehouse', 1, 'buildingSlot g10', 'tabItem infrastructure'],
  ['Cranny', 1, 'buildingSlot g23', 'tabItem infrastructure'],
  ['Marketplace', 1, 'buildingSlot g17', 'tabItem infrastructure'],
  ['Embassy', 1, 'buildingSlot g18', 'tabItem infrastructure'],
  ['Rally Point', 1, 'buildingSlot g16', 'tabItem infrastructure'],

  // wall of Gaul
  ['Palisade', 0, 'buildingSlot g33', 'tabItem military'],
  ['Trapper', 0, 'buildingSlot g36', 'tabItem military']
];

let checkTime = 3320;

/*
 * methods for building
 */
let getBuilding = (name) => {
  return document.getElementsByClassName(name)[0];
};

let getBuildingLevel = (name, trueName) => {
  let level = parseInt(getBuilding(name).children[0].children[0].innerText);
  console.log('Level of building', trueName, 'is', level);
  return level;
};

let isUnderConstruction = (name) => {
  return getBuilding(name).children[0].className.match(/\bunderConstruction\b/);
};

let clickBuilding = (name) => {
  let building = getBuilding(name);
  building.getElementsByClassName('hoverShape')[0].children[0].onclick();
};

let buildingExists =
    (name) => {
      let result = document.getElementsByClassName(name).length > 0;
      return result;
    }

/*
 * methods for farm
 */
let getFarm = (name) => {
  return document.getElementsByClassName(name)[1];
};

let getFarmLevel = (name, trueName) => {
  let level =
      parseInt(document.getElementsByClassName(name)[0].children[0].innerText);
  if (isNaN(level)) {
    level = 0;
  }
  console.log('Level of building', trueName, 'is', level);
  return level;
};

let farmIsUnderConstruction = (name) => {
  return document.getElementsByClassName(name)[0].className.match(
      /\bunderConstruction\b/);
};

let clickFarm = (name) => {
  let building = getFarm(name);
  building.onclick();
};

let getResourceList = () => {
  let warehouseCap =
      document.getElementsByClassName('warehouse')[0].children[0];
  let lumber = document.getElementsByClassName('warehouse')[0].children[1];
  let clay = document.getElementsByClassName('warehouse')[0].children[2];
  let iron = document.getElementsByClassName('warehouse')[0].children[3];

  let granaryCap = document.getElementsByClassName('granary')[0].children[0];
  let crop = document.getElementsByClassName('granary')[0].children[1];
  let freeCropCap = document.getElementsByClassName('granary')[0].children[2];
  return {
    'warehouseCap': warehouseCap,
    'granaryCap': granaryCap,
    'freeCropCap': freeCropCap,
    'lumber': lumber,
    'clay': clay,
    'iron': iron,
    'crop': crop
  };
};

let handleDorf1 = () => {
  'use strict';
  let resourceTable = document.getElementById('production').children[1];
  for (let i = 0; i < 4; i++) {
    console.log(resourceTable.children[i].innerText);
  }

  setInterval(() => {
    let farmList =
        document.getElementsByClassName('boxes-contents cf')[0].children[2];
    if (farmList === undefined || farmList.childElementCount < 2) {
      for (let i = 0; i < farmInfo.length; i++) {
        let name = farmInfo[i][2];
        if (farmIsUnderConstruction(name)) {
          console.log(name, 'is under construction!');
          continue;
        }
        if (getFarmLevel(name, farmInfo[i][0]) < farmInfo[i][1]) {
          setTimeout(() => {clickFarm(name)}, 1231 * i);
        }
      }
    }
    setTimeout(() => {
      let farmList =
          document.getElementsByClassName('boxes-contents cf')[0].children[2];
      if (farmList === undefined) {
        document.getElementsByClassName('buildingView')[0].click();
      } else {
        console.log('The building list is not empty.');
      }
    }, 25000);
  }, checkTime);
};

let handleDorf2 = () => {
  setInterval(() => {
    let buildingList = document.getElementsByClassName('boxes-contents cf')[0];
    if (buildingList !== undefined) {
      buildingList = buildingList.children[2];
    }
    if (buildingList === undefined || buildingList.childElementCount < 2) {
      for (let i = 0; i < buildingInfo.length; i++) {
        let name = buildingInfo[i][2];
        if (buildingExists(name)) {
          continue;
          if (isUnderConstruction(name)) {
            continue;
          }
          if (getBuildingLevel(name, buildingInfo[i][0]) < buildingInfo[i][1]) {
            setTimeout(() => {clickBuilding(name)}, 2589 * i);
          }
        } else if (buildingInfo[i][1] > 0) {
          for (let i = 19; i <= 40; ++i) {
            let emptySlot = `buildingSlot g0 a${i}`;
            if (buildingExists(emptySlot)) {
              setTimeout(() => {clickBuilding(emptySlot)}, 2589 * i);
            }
          }
        }
      }
    }
  }, checkTime);
};

let handleBuild = () => {
  setInterval(() => {
    if (document.getElementsByClassName('section1')) {
      // the building exists
      let button = document.getElementsByClassName('section1')[0].children[0];
      if (button.value.match(/Upgrade to level \d+/)) {
        button.click();
      }
    } else {
      // go through the building info list
      // buildingInfo
    }
  }, checkTime);
};

(function() {
let url = window.location.href;
if (url.match(/https:\/\/ts3.travian.com\/dorf1.php.*/)) {
  handleDorf1();
} else if (url.match(/https:\/\/ts3.travian.com\/dorf2.php.*/)) {
  handleDorf2();
} else if (url.match(/https:\/\/ts3.travian.com\/build.php.*/)) {
  handleBuild();
}
})();
