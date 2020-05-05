// ==UserScript==
// @name         TravianBot
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  A script for auto-constructing farms and buildings
// @author       Yen-Shi Wang
// @match        https://ts3.travian.com/dorf1.php*
// @include      https://ts3.travian.com/dorf2.php*
// @include      https://ts3.travian.com/build.php*
// @grant        none
// ==/UserScript==

let server = 'ts3';

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

// 'tabItem infrastructure'
// 'tabItem resources'
// 'tabItem military'
let buildingInfo = [
  // Infrastructure
  ['Main Building', 3, 'buildingSlot g15', 1, 'tabItem infrastructure'],
  ['Granary', 1, 'buildingSlot g11', 1, 'tabItem infrastructure'],
  ['Warehouse', 1, 'buildingSlot g10', 1, 'tabItem infrastructure'],
  ['Cranny', 1, 'buildingSlot g23', 1, 'tabItem infrastructure'],
  ['2. Cranny', 1, 'buildingSlot g23', 1, 'tabItem infrastructure'],
  ['3. Cranny', 1, 'buildingSlot g23', 1, 'tabItem infrastructure'],
  ['4. Cranny', 1, 'buildingSlot g23', 1, 'tabItem infrastructure'],
  ['5. Cranny', 1, 'buildingSlot g23', 1, 'tabItem infrastructure'],

  ['Marketplace', 1, 'buildingSlot g17', 1, 'tabItem infrastructure'],
  ['Embassy', 1, 'buildingSlot g18', 1, 'tabItem infrastructure'],
  ['Residence', 0, 'buildingSlot g25', 1, 'tabItem infrastructure'],
  ['Palace', 0, 'buildingSlot g26', 1, 'tabItem infrastructure'],
  ['Stonemason\'s Lodge', 0, 'buildingSlot g34', 1, 'tabItem infrastructure'],
  ['Treasury', 0, 'buildingSlot g27', 1, 'tabItem infrastructure'],
  ['Town Hall', 0, 'buildingSlot g24', 1, 'tabItem infrastructure'],
  ['Trade Office', 0, 'buildingSlot g28', 1, 'tabItem infrastructure'],
  ['Great Granary', 0, 'buildingSlot g39', 1, 'tabItem infrastructure'],
  ['Great Warehouse', 0, 'buildingSlot g38', 1, 'tabItem infrastructure'],

  // Military
  ['Rally Point', 1, 'buildingSlot g16', 2, 'tabItem military'],
  ['Palisade', 1, 'buildingSlot g33', 2, 'tabItem military'],
  ['Trapper', 0, 'buildingSlot g36', 2, 'tabItem military'],
  ['Barracks', 1, 'buildingSlot g19', 2, 'tabItem military'],
  ['Hero\'s Mansion', 0, 'buildingSlot g37', 2, 'tabItem military'],
  ['Academy', 0, 'buildingSlot g22', 2, 'tabItem military'],
  ['Smithy', 0, 'buildingSlot g13', 2, 'tabItem military'],
  ['Stable', 0, 'buildingSlot g20', 2, 'tabItem military'],
  ['Workshop', 0, 'buildingSlot g21', 2, 'tabItem military'],
  ['Tournament Square', 0, 'buildingSlot g14', 2, 'tabItem military'],

  // Resources
  ['Grain Mill', 0, 'buildingSlot g8', 3, 'tabItem resources'],
  ['Sawmill', 0, 'buildingSlot g5', 3, 'tabItem resources'],
  ['Brickyard', 0, 'buildingSlot g6', 3, 'tabItem resources'],
  ['Iron Foundry', 0, 'buildingSlot g7', 3, 'tabItem resources'],
  ['Bakery', 0, 'buildingSlot g9', 3, 'tabItem resources'],
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
  // console.log('Level of building', trueName, 'is', level);
  return level;
};

let getLevelFromBuilding = (buliding) => {
  let level = parseInt(buliding.children[0].children[0].innerText);
  return level;
};

let isUnderConstruction = (name) => {
  return getBuilding(name).children[0].className.match(/\bunderConstruction\b/);
};

let buildingIsUnderConstruction = (buliding) => {
  return buliding.children[0].className.match(/\bunderConstruction\b/);
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
  // console.log('Level of building', trueName, 'is', level);
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
          setTimeout(() => { clickFarm(name) }, 1231 * i);
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

let navigate = (url) => {
  window.location.href = url;
};

let clickEmptySlot = (cate, wait) => {
  for (let j = 19; j <= 40; j++) {
    let emptySlot = `buildingSlot g0 a${j}`;

    if (buildingExists(emptySlot)) {
      setTimeout(
        () => {
          navigate(`https://${server}.travian.com/build.php?id=${j}&category=${cate}`)
        },
        wait);
      break;
    }
  }
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
        let trueName = buildingInfo[i][0];
        if (trueName.match(/[2-9]. Cranny/)) {
          let crannies = Array.from(document.getElementsByClassName('buildingSlot g23'));
          let numCranny = crannies.length;
          let targetNum = parseInt(trueName[0]);
          if (targetNum > numCranny && buildingInfo[i][1] > 0) {
            let cate = buildingInfo[i][3];
            clickEmptySlot(cate, 2589 * i);
          } else if (targetNum <= numCranny && buildingInfo[i][1] > 0) {
            crannies.sort((lhs, rhs) => {
              return getLevelFromBuilding(lhs) > getLevelFromBuilding(rhs);
            });
            if (buildingInfo[i][1] > getLevelFromBuilding(crannies[targetNum - 1]) &&
              !buildingIsUnderConstruction(crannies[targetNum - 1])) {
              crannies[targetNum - 1].getElementsByClassName('hoverShape')[0].children[0].onclick();
            }
          }
        } else if (buildingExists(name)) {
          if (isUnderConstruction(name)) {
            continue;
          }
          if (getBuildingLevel(name, buildingInfo[i][0]) < buildingInfo[i][1]) {
            setTimeout(() => { clickBuilding(name) }, 2589 * i);
          }
        } else if (buildingInfo[i][1] > 0) {
          let cate = buildingInfo[i][3];
          clickEmptySlot(cate, 2589 * i);
        }
      }
    }
  }, checkTime);
};

let isActive = (type) => {
  if (document.getElementsByClassName(type + ' active')) {
    return true;
  }
  return false;
};

let clickType = (type) => {
  document.getElementsByClassName(type)[0].click();
};

let getBuildingList = () => {
  let results = [];
  let allElements = document.getElementById('build').children;
  for (let i = 0; i < allElements.length; i++) {
    if (allElements[i].classList.contains('buildingWrapper')) {
      results.push(allElements[i]);
    }
  }
  return results;
};

if (typeof (String.prototype.trim) === 'undefined') {
  String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, '');
  };
}

let getBuildingName = (wrapper) => {
  return wrapper.children[0].innerText.trim();
};

let constructBuilding =
  (wrapper) => {
    let button = wrapper.getElementsByTagName('button')[0];
    if (button.value == 'Construct building') {
      button.click();
    }
  }

let handleBuild = () => {
  setInterval(() => {
    if (document.getElementsByClassName('section1').length > 0) {
      let title = document.getElementsByClassName('titleInHeader')[0].innerText;
      console.log('Get title', title);

      // the building exists
      let button = document.getElementsByClassName('section1')[0].children[0];
      if (button.value.match(/Upgrade to level \d+/)) {
        button.click();
      }
    } else {
      // go through the building info list
      for (let i = 0; i < buildingInfo.length; i++) {
        let type = buildingInfo[i][4];
        if (isActive(type)) {
          let name = buildingInfo[i][0];
          let targetLevel = buildingInfo[i][1];
          let buildingList = getBuildingList();
          for (let i = 0; i < buildingList.length; i++) {
            let buildingName = getBuildingName(buildingList[i]);
            if (name == buildingName && targetLevel > 0) {
              setTimeout(() => constructBuilding(buildingList[i]), 1248 * i);
            }
          }
        }
      }
    }
  }, checkTime);
};

(function () {
  let url = window.location.href;
  if (url.match(/https:\/\/ts[0-9].travian.com\/dorf1.php.*/)) {
    handleDorf1();
  } else if (url.match(/https:\/\/ts[0-9].travian.com\/dorf2.php.*/)) {
    handleDorf2();
  } else if (url.match(/https:\/\/ts[0-9].travian.com\/build.php.*/)) {
    handleBuild();
  }
})();