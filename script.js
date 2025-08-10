let wEnergy = 0;

const baseZeroTwoCost = 10;  // original cost to reset to

let buildings = {
  zeroTwo: {
    count: 0,
    cost: baseZeroTwoCost,
    baseProduction: 1,
    multiplier: 1,
    purchasedOnce: false,
    name: "Zero Two",
    gifFile: "zeroTwo.gif"
  },

  zeroTwo_merged: {
    count: 0,
    cost: 0, // can't buy directly
    baseProduction: 10,
    multiplier: 1,
    purchasedOnce: false,
    name: "Zero Two (Merged)",
    gifFile: "zeroTwo_merge.gif"
  }
};

const mergeCost = 100;
let unlockedBuildings = new Set();

function gatherWEnergy() {
  wEnergy++;
  updateDisplay();
}

function buyBuilding(name) {
  let b = buildings[name];
  if (wEnergy >= b.cost) {
    wEnergy -= b.cost;
    b.count++;
    b.cost = Math.floor(b.cost * 1.5);

    if (!b.purchasedOnce) {
      showGif(`${name}.gif`);
      b.purchasedOnce = true;
      unlockedBuildings.add(name);
      updateWaifuGarden();
    }

    updateDisplay();
    checkMergeAvailability();
  }
}

function buyMergeZeroTwo() {
  let base = buildings.zeroTwo;
  let merged = buildings.zeroTwo_merged;

  if (base.count >= 5 && wEnergy >= mergeCost) {
    base.count -= 5;
    wEnergy -= mergeCost;

    merged.count++;
    if (!merged.purchasedOnce) {
      merged.purchasedOnce = true;
      unlockedBuildings.add("zeroTwo_merged");
    }

    showGif("zeroTwo_merge.gif");

    // Reset cost of base after merge
    base.cost = baseZeroTwoCost;

    updateDisplay();
    updateWaifuGarden();
    checkMergeAvailability();
  } else {
    alert("You need at least 5 Zero Twos and " + mergeCost + " W-Energy to merge.");
  }
}

function checkMergeAvailability() {
  const mergeDiv = document.getElementById("mergeZeroTwoDiv");
  if (buildings.zeroTwo.count >= 5) {
    mergeDiv.style.display = "block";
  } else {
    mergeDiv.style.display = "none";
  }
}

function showGif(gifFile) {
  const gifContainer = document.getElementById("gifContainer");
  gifContainer.innerHTML = `<img src="images/${gifFile}" class="large-gif" />`;
  setTimeout(() => {
    gifContainer.innerHTML = "";
  }, 3000);
}

function updateDisplay() {
  document.getElementById("wEnergy").textContent = wEnergy.toFixed(0);
  document.getElementById("zeroTwoCount").textContent = buildings.zeroTwo.count;
  document.getElementById("zeroTwoCost").textContent = buildings.zeroTwo.cost.toFixed(0);
  document.getElementById("mergeCost").textContent = mergeCost.toFixed(0);
}

function updateWaifuGarden() {
  const gardenDiv = document.getElementById("waifuGarden");
  gardenDiv.innerHTML = "";

  unlockedBuildings.forEach(name => {
    const b = buildings[name];
    const item = document.createElement("div");
    item.className = "garden-item";

    item.innerHTML = `
      <img src="images/${b.gifFile}" alt="${b.name}" />
      <div class="counts">${b.name}</div>
      <div class="counts">Owned: ${b.count}</div>
      <div class="counts">W-Energy/sec: ${(b.baseProduction * b.count * b.multiplier).toFixed(1)}</div>
    `;

    gardenDiv.appendChild(item);
  });
}

// --- Save and Load functions for localStorage ---

function saveGame() {
  const save = {
    wEnergy: wEnergy,
    buildings: {}
  };

  for (const key in buildings) {
    save.buildings[key] = {
      count: buildings[key].count,
      cost: buildings[key].cost,
      multiplier: buildings[key].multiplier,
      purchasedOnce: buildings[key].purchasedOnce
    };
  }

  localStorage.setItem("waifuIdleSave", JSON.stringify(save));
}

function loadGame() {
  const saveStr = localStorage.getItem("waifuIdleSave");
  if (!saveStr) return;

  const save = JSON.parse(saveStr);
  wEnergy = save.wEnergy || 0;

  unlockedBuildings.clear();

  for (const key in save.buildings) {
    if (buildings[key]) {
      buildings[key].count = save.buildings[key].count || 0;
      buildings[key].cost = save.buildings[key].cost || buildings[key].cost;
      buildings[key].multiplier = save.buildings[key].multiplier || 1;
      buildings[key].purchasedOnce = save.buildings[key].purchasedOnce || false;

      if (buildings[key].purchasedOnce) {
        unlockedBuildings.add(key);
      }
    }
  }
}

// --- Save game to a downloadable JSON file
function saveGameToFile() {
  const save = {
    wEnergy: wEnergy,
    buildings: {}
  };

  for (const key in buildings) {
    save.buildings[key] = {
      count: buildings[key].count,
      cost: buildings[key].cost,
      multiplier: buildings[key].multiplier,
      purchasedOnce: buildings[key].purchasedOnce
    };
  }

  const saveStr = JSON.stringify(save, null, 2);
  const blob = new Blob([saveStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "waifu_idle_save.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- Load game from an uploaded JSON file
function loadGameFromFile(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const save = JSON.parse(event.target.result);
      wEnergy = save.wEnergy || 0;

      unlockedBuildings.clear();

      for (const key in save.buildings) {
        if (buildings[key]) {
          buildings[key].count = save.buildings[key].count || 0;
          buildings[key].cost = save.buildings[key].cost || buildings[key].cost;
          buildings[key].multiplier = save.buildings[key].multiplier || 1;
          buildings[key].purchasedOnce = save.buildings[key].purchasedOnce || false;

          if (buildings[key].purchasedOnce) {
            unlockedBuildings.add(key);
          }
        }
      }

      updateDisplay();
      updateWaifuGarden();
      checkMergeAvailability();

      alert("Game loaded successfully!");
    } catch (e) {
      alert("Failed to load save file: Invalid format.");
    }
  };

  reader.readAsText(file);
}

// Hook buttons after page load
document.getElementById("saveBtn").addEventListener("click", saveGameToFile);

document.getElementById("loadBtn").addEventListener("click", () => {
  document.getElementById("loadInput").click();
});

document.getElementById("loadInput").addEventListener("change", function() {
  if (this.files.length > 0) {
    loadGameFromFile(this.files[0]);
  }
  this.value = ""; // Reset input so same file can be loaded again if needed
});

// --- Passive energy gain every second ---

setInterval(() => {
  let totalProduction = 0;
  for (const key in buildings) {
    const b = buildings[key];
    totalProduction += b.baseProduction * b.count * b.multiplier;
  }
  wEnergy += totalProduction;

  updateDisplay();
  updateWaifuGarden();
  checkMergeAvailability();
}, 1000);

// Save game every 5 seconds to localStorage
setInterval(saveGame, 5000);

// Load saved game on start
loadGame();
updateDisplay();
updateWaifuGarden();
checkMergeAvailability();
