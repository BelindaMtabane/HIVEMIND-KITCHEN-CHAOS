
/* =====================================================
   HIVEMIND: KITCHEN HARMONY
   KITCHEN UPGRADE SYSTEM
   ===================================================== */

"use strict";

const kitchenUpgrades = [
    {
        id: "stove",
        name: "Super Stove",
        emoji: "🔥",
        description: "Cooks food faster. Hopefully nothing catches fire.",
        costs: [
            { money: 100, ingredients: 10 },
            { money: 200, ingredients: 20 },
            { money: 350, ingredients: 30 }
        ],
        benefits: [
            "Cooking speed +10%",
            "Cooking speed +20%",
            "Cooking speed +35%"
        ],
        effects: [0.10, 0.20, 0.35]
    },
    {
        id: "fridge",
        name: "Mega Fridge",
        emoji: "🧊",
        description: "Keeps ingredients fresh. Unlike Chef Oliver.",
        costs: [
            { money: 120, ingredients: 15 },
            { money: 220, ingredients: 25 },
            { money: 380, ingredients: 40 }
        ],
        benefits: [
            "Ingredient storage +10%",
            "Ingredient storage +25%",
            "Ingredient storage +45%"
        ],
        effects: [0.10, 0.25, 0.45]
    },
    {
        id: "prep",
        name: "Prep Station",
        emoji: "🔪",
        description: "A better workspace for your chaotic chefs.",
        costs: [
            { money: 90, ingredients: 10 },
            { money: 180, ingredients: 20 },
            { money: 300, ingredients: 35 }
        ],
        benefits: [
            "Staff efficiency +10%",
            "Staff efficiency +20%",
            "Staff efficiency +35%"
        ],
        effects: [0.10, 0.20, 0.35]
    }
];

/* -----------------------------------------------------
   GAME STATE
   ----------------------------------------------------- */

// *** Always use the shared game state.
function getKitchenGameState() {
    return window.gameState ||
        (typeof gameState !== "undefined" ? gameState : null);
}

// *** Ensure all kitchen upgrade levels exist.
function ensureKitchenState() {
    const state = getKitchenGameState();

    if (!state) {
        console.error("Kitchen Harmony: gameState unavailable.");
        return null;
    }

    if (!state.kitchen || typeof state.kitchen !== "object") {
        state.kitchen = {};
    }

    ["stove", "fridge", "prep"].forEach(id => {
        state.kitchen[id] = Math.max(
            0,
            Math.min(3, Number(state.kitchen[id]) || 0)
        );
    });

    return state;
}

/* -----------------------------------------------------
   UPGRADE EFFECTS
   ----------------------------------------------------- */

// *** Return the actual gameplay benefit of an upgrade.
function getKitchenUpgradeEffect(upgradeId) {
    const state = ensureKitchenState();

    if (!state) return 0;

    const upgrade = kitchenUpgrades.find(
        item => item.id === upgradeId
    );

    if (!upgrade) return 0;

    const level = state.kitchen[upgradeId] || 0;

    return level > 0
        ? upgrade.effects[level - 1]
        : 0;
}

// *** Calculate the cooking speed multiplier.
function getCookingSpeedMultiplier() {
    return 1 + getKitchenUpgradeEffect("stove");
}

// *** Calculate the ingredient storage multiplier.
function getIngredientStorageMultiplier() {
    return 1 + getKitchenUpgradeEffect("fridge");
}

// *** Calculate the staff efficiency multiplier.
function getStaffEfficiencyMultiplier() {
    return 1 + getKitchenUpgradeEffect("prep");
}

// *** Expose effects for the restaurant simulation.
window.KitchenUpgradeEffects = {
    get: getKitchenUpgradeEffect,
    cookingSpeed: getCookingSpeedMultiplier,
    ingredientStorage: getIngredientStorageMultiplier,
    staffEfficiency: getStaffEfficiencyMultiplier
};

/* -----------------------------------------------------
   INITIALISATION
   ----------------------------------------------------- */

function initialiseKitchen() {
    const state = ensureKitchenState();

    if (!state) return;

    renderKitchen();

    console.log(
        "Kitchen upgrades initialised:",
        state.kitchen
    );
}

/* -----------------------------------------------------
   DISPLAY UPGRADES
   ----------------------------------------------------- */

function renderKitchen() {
    const container = document.getElementById("upgrade-list");

    if (!container) return;

    const state = ensureKitchenState();

    if (!state) return;

    container.innerHTML = kitchenUpgrades.map(upgrade => {
        const level = state.kitchen[upgrade.id] || 0;
        const maxed = level >= 3;
        const nextCost = upgrade.costs[level];

        const nextBenefit = maxed
            ? "Fully upgraded!"
            : upgrade.benefits[level];

        return `
            <article class="card kitchen-upgrade-card">

                <div class="upgrade-heading">
                    <span>${upgrade.emoji}</span>
                    <h3>${upgrade.name}</h3>
                </div>

                <p>${upgrade.description}</p>

                <p>
                    <strong>Level:</strong>
                    ${level}/3
                </p>

                <div class="upgrade-levels">
                    ${[1, 2, 3].map(number => `
                        <span class="upgrade-level ${
                            number <= level ? "unlocked" : ""
                        }">
                            ${number <= level ? "✓" : number}
                        </span>
                    `).join("")}
                </div>

                <p>
                    <strong>Next benefit:</strong>
                    ${nextBenefit}
                </p>

                ${
                    maxed
                    ? `
                        <button disabled>
                            MAX LEVEL
                        </button>
                    `
                    : `
                        <p class="upgrade-cost">
                            💰 $${nextCost.money}
                            | 🥕 ${nextCost.ingredients}
                        </p>

                        <button
                            onclick="upgradeKitchen('${upgrade.id}')"
                        >
                            Upgrade
                        </button>
                    `
                }

                <small>
                    Current effect:
                    ${Math.round(getKitchenUpgradeEffect(upgrade.id) * 100)}%
                </small>

            </article>
        `;
    }).join("");
}

/* -----------------------------------------------------
   PURCHASE UPGRADE
   ----------------------------------------------------- */

function upgradeKitchen(upgradeId) {
    const state = ensureKitchenState();

    if (!state) return false;

    const upgrade = kitchenUpgrades.find(
        item => item.id === upgradeId
    );

    if (!upgrade) return false;

    const level = state.kitchen[upgradeId] || 0;

    if (level >= 3) {
        alert("This kitchen station is already fully upgraded!");
        return false;
    }

    const cost = upgrade.costs[level];

    if (
        Number(state.money || 0) < cost.money ||
        Number(state.ingredients || 0) < cost.ingredients
    ) {
        alert(
            "Not enough resources! Your kitchen dreams must wait. 😭"
        );

        return false;
    }

    // *** Deduct the purchase cost.
    state.money -= cost.money;
    state.ingredients -= cost.ingredients;

    // *** Increase the actual upgrade level.
    state.kitchen[upgradeId] = level + 1;

    // *** Refresh the shared interface and save.
    if (typeof window.updateResources === "function") {
        window.updateResources();
    }

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    renderKitchen();

    // *** Notify the simulation of the new upgrade.
    window.KitchenSimulation?.refresh?.();

    const newEffect = getKitchenUpgradeEffect(upgradeId);

    console.log("Kitchen upgrade purchased:", {
        upgrade: upgrade.name,
        level: level + 1,
        effect: newEffect
    });

    alert(
        `${upgrade.name} upgraded to Level ${level + 1}! 🎉\n` +
        `${upgrade.benefits[level]}`
    );

    return true;
}

/* -----------------------------------------------------
   SAVE AND LOAD SUPPORT
   ----------------------------------------------------- */

// *** Return kitchen upgrade levels for saving.
function getKitchenSaveData() {
    const state = ensureKitchenState();

    return state ? { ...state.kitchen } : {};
}

// *** Restore saved upgrade levels.
function loadKitchenSaveData(savedKitchen) {
    if (!savedKitchen || typeof savedKitchen !== "object") {
        return;
    }

    const state = getKitchenGameState();

    if (!state) return;

    state.kitchen = {
        stove: Math.max(0, Math.min(3, Number(savedKitchen.stove) || 0)),
        fridge: Math.max(0, Math.min(3, Number(savedKitchen.fridge) || 0)),
        prep: Math.max(0, Math.min(3, Number(savedKitchen.prep) || 0))
    };

    renderKitchen();

    console.log("Kitchen upgrades restored:", state.kitchen);
}

/* -----------------------------------------------------
   PUBLIC API
   ----------------------------------------------------- */

window.kitchenUpgrades = kitchenUpgrades;
window.initialiseKitchen = initialiseKitchen;
window.renderKitchen = renderKitchen;
window.upgradeKitchen = upgradeKitchen;
window.getKitchenSaveData = getKitchenSaveData;
window.loadKitchenSaveData = loadKitchenSaveData;

/* -----------------------------------------------------
   INITIALISATION
   ----------------------------------------------------- */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseKitchen);
} else {
    initialiseKitchen();
}

