let wEnergy = 0;

const baseZeroTwoCost = 10;  // store original base cost

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
    baseProduction: 10, // 10x base output
    multiplier: 1,
    purchasedOnce: false,
    name: "Zero Two (Merged)",
    gifFile: "zeroTwo_merge.gif"
  }
};

// Merge upgrade cost in W-Energy
const mergeCost = 100;

// Track unlocked buildings for Waifu Garden
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

    // Increase cost exponentially with each purchase
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

    // Reset the base Zero Two cost after merging
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

// Passive production loop: add energy every second
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

// Initial update
updateDisplay();
updateWaifuGarden();
checkMergeAvailability();
