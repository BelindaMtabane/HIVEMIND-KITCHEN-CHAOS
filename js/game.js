
// HIVEMIND: Kitchen Harmony
// Main game state and resource management

// *** The level and customer-arrival fields are shared with customers.js.
window.gameState = {
    money: 500,
    ingredients: 100,
    reputation: 50,
    day: 1,
    level: 1, // ***
    time: 8 * 60,
    staff: 4,
    customersServed: 0,
    ordersCompleted: 0,

    // *** Customer arrival progress for the current level.
    customersArrived: 0,
    customersTarget: 0,
    customersRemaining: 0,

    kitchen: {
        stove: 0,
        fridge: 0,
        prep: 0
    }
};

// *** Keep a local reference to the shared game state.
const gameState = window.gameState;

// Update resource displays throughout the game
function updateResources() {
    const values = {
        money: gameState.money,
        ingredients: gameState.ingredients,
        reputation: gameState.reputation,
        staff: gameState.staff,
        day: gameState.day,
        level: gameState.level // ***
    };

    Object.entries(values).forEach(([key, value]) => {
        const elements = document.querySelectorAll(
            `[data-resource="${key}"], #${key}, #${key}-value`
        );

        elements.forEach(element => {
            element.textContent = value;
        });
    });

    // Update any reputation progress bars
    document.querySelectorAll(
        '[data-resource-bar="reputation"]'
    ).forEach(bar => {
        bar.style.width = `${gameState.reputation}%`;
    });

    // *** Update customer arrival progress displays if they exist.
    updateCustomerProgressDisplay();
}

// *** Display the current level's customer arrival progress.
function updateCustomerProgressDisplay() {
    const arrived = Number(gameState.customersArrived) || 0;
    const target = Number(gameState.customersTarget) || 0;
    const remaining = Math.max(0, target - arrived);

    const displays = {
        "customer-count": arrived,
        "customers-arrived": arrived,
        "customer-target": target,
        "customers-target": target,
        "customers-remaining": remaining
    };

    Object.entries(displays).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });

    document.querySelectorAll("[data-customer-count]").forEach(element => {
        element.textContent = arrived;
    });

    document.querySelectorAll("[data-customer-target]").forEach(element => {
        element.textContent = target;
    });

    document.querySelectorAll("[data-customer-remaining]").forEach(element => {
        element.textContent = remaining;
    });

    document.querySelectorAll("[data-customer-progress]").forEach(element => {
        const percentage = target > 0
            ? Math.min(100, (arrived / target) * 100)
            : 0;

        element.style.width = `${percentage}%`;
    });
}

// Save the game to the player's browser
function saveGame() {
    try {
        localStorage.setItem(
            "hivemindKitchenSave",
            JSON.stringify(gameState)
        );
    } catch (error) {
        console.error("Could not save game:", error);
    }
}

// Load a previous save
function loadGame() {
    try {
        const savedData = localStorage.getItem(
            "hivemindKitchenSave"
        );

        if (!savedData) {
            console.log("No previous save found. Starting fresh!");
            return false;
        }

        const savedState = JSON.parse(savedData);

        // *** Preserve default fields when loading older save files.
        Object.assign(gameState, savedState);

        // *** Ensure newer level fields exist in older saves.
        gameState.level = Math.max(1, Number(gameState.level) || 1);
        gameState.customersArrived = Number(gameState.customersArrived) || 0;
        gameState.customersTarget = Number(gameState.customersTarget) || 0;
        gameState.customersRemaining = Number(gameState.customersRemaining) || 0;

        // *** Keep kitchen upgrades intact when loading.
        gameState.kitchen = {
            stove: 0,
            fridge: 0,
            prep: 0,
            ...(savedState.kitchen || {})
        };

        console.log("Kitchen Harmony save loaded!");
        return true;

    } catch (error) {
        console.error("Could not load game:", error);
        return false;
    }
}

// Reset the game
function resetGame() {
    // *** Stop any customer arrival timer before resetting.
    if (typeof window.stopCustomerLevel === "function") {
        window.stopCustomerLevel();
    }

    localStorage.removeItem("hivemindKitchenSave");

    Object.assign(gameState, {
        money: 500,
        ingredients: 100,
        reputation: 50,
        day: 1,
        level: 1, // ***
        time: 8 * 60,
        staff: 4,
        customersServed: 0,
        ordersCompleted: 0,

        // *** Reset customer progress for a new game.
        customersArrived: 0,
        customersTarget: 0,
        customersRemaining: 0,

        kitchen: {
            stove: 0,
            fridge: 0,
            prep: 0
        }
    });

    updateResources();
    saveGame();

    // *** Start a fresh randomized customer level.
    if (typeof window.startCustomerLevel === "function") {
        window.startCustomerLevel(1);
    }

    console.log("New Kitchen Harmony game started!");
}

// Add or remove money safely
function changeMoney(amount) {
    gameState.money = Math.max(0, gameState.money + amount);
    updateResources();
    saveGame();
}

// Add or remove ingredients safely
function changeIngredients(amount) {
    gameState.ingredients = Math.max(
        0,
        gameState.ingredients + amount
    );

    updateResources();
    saveGame();
}

// Change reputation safely
function changeReputation(amount) {
    gameState.reputation = Math.max(
        0,
        Math.min(100, gameState.reputation + amount)
    );

    updateResources();
    saveGame();
}

// *** Start the next level and its randomized customer target.
function advanceLevel() {
    gameState.level = Math.max(1, Number(gameState.level) || 1) + 1;
    gameState.customersArrived = 0;
    gameState.customersTarget = 0;
    gameState.customersRemaining = 0;

    updateResources();
    saveGame();

    if (typeof window.startCustomerLevel === "function") {
        window.startCustomerLevel(gameState.level);
    } else {
        console.warn("Customer system is not ready yet.");
    }

    console.log(`Level ${gameState.level} started!`);
}

// Initialise the game
function initialiseGame() {
    const loaded = loadGame();

    if (!loaded) {
        saveGame();
    }

    updateResources();

    console.log("🍳 HIVEMIND: Kitchen Harmony is ready!");
    console.log("Current game state:", gameState);
}

// *** Expose functions for the other game scripts.
window.updateResources = updateResources;
window.updateCustomerProgressDisplay = updateCustomerProgressDisplay;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.changeMoney = changeMoney;
window.changeIngredients = changeIngredients;
window.changeReputation = changeReputation;
window.advanceLevel = advanceLevel;

document.addEventListener("DOMContentLoaded", initialiseGame);
