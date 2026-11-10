
// HIVEMIND: Kitchen Harmony
// Main game state and resource management

window.gameState = {
    money: 500,
    ingredients: 100,
    reputation: 50,
    day: 1,
    level: 1,
    time: 8 * 60,

    // *** CHANGED: The game starts with six staff members.
    staff: 6,

    customersServed: 0,
    ordersCompleted: 0,

    customersArrived: 0,
    customersTarget: 0,
    customersRemaining: 0,
    conversationsCompleted: 0,

    kitchen: {
        stove: 0,
        fridge: 0,
        prep: 0
    }
};

const gameState = window.gameState;

// *** NEW: Track whether the player has entered gameplay.
window.gameStarted = false;


// Update all existing resource displays.
function updateResources() {
    const values = {
        money: gameState.money,
        ingredients: gameState.ingredients,
        reputation: gameState.reputation,
        staff: gameState.staff,
        day: gameState.day,
        level: gameState.level
    };

    Object.entries(values).forEach(([key, value]) => {
        document.querySelectorAll(
            `[data-resource="${key}"], #${key}, #${key}-value`
        ).forEach(element => {
            element.textContent = value;
        });
    });

    document.querySelectorAll(
        '[data-resource-bar="reputation"]'
    ).forEach(bar => {
        bar.style.width = `${gameState.reputation}%`;
    });

    updateCustomerProgressDisplay();
}


// Update customer counters wherever they appear.
function updateCustomerProgressDisplay() {
    const arrived = Number(gameState.customersArrived) || 0;
    const target = Number(gameState.customersTarget) || 0;
    const remaining = Math.max(0, target - arrived);

    const displays = {
        "customer-count": arrived,
        "customers-arrived": arrived,
        "customer-target": target,
        "customers-target": target,
        "customers-remaining": remaining,
        "conversations-completed": gameState.conversationsCompleted || 0,
        "orders-completed": gameState.ordersCompleted || 0
    };

    Object.entries(displays).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
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
        element.style.width = `${target > 0
            ? Math.min(100, arrived / target * 100)
            : 0}%`;
    });

    if (typeof window.updateCustomerDashboard === "function") {
        window.updateCustomerDashboard();
    }
}


// Save game.
function saveGame() {
    try {
        localStorage.setItem(
            "hivemindKitchenSave",
            JSON.stringify(gameState)
        );
    } catch (error) {
        console.error("Save failed:", error);
    }
}


// Load game.
function loadGame() {
    try {
        const savedData = localStorage.getItem("hivemindKitchenSave");

        if (!savedData) return false;

        const savedState = JSON.parse(savedData);

        Object.assign(gameState, savedState);

        gameState.level = Math.max(1, Number(gameState.level) || 1);

        // *** CHANGED: Migrate older saves to the six-person starting team.
        gameState.staff = Math.max(6, Number(gameState.staff) || 6);

        gameState.money = Math.max(0, Number(gameState.money) || 0);
        gameState.ingredients = Math.max(0, Number(gameState.ingredients) || 0);
        gameState.reputation = Math.max(0, Math.min(100, Number(gameState.reputation) || 0));

        gameState.customersArrived = Number(gameState.customersArrived) || 0;
        gameState.customersTarget = Number(gameState.customersTarget) || 0;
        gameState.customersRemaining = Number(gameState.customersRemaining) || 0;

        gameState.conversationsCompleted =
            Number(gameState.conversationsCompleted) || 0;

        gameState.kitchen = {
            stove: 0,
            fridge: 0,
            prep: 0,
            ...(savedState.kitchen || {})
        };

        console.log("Game loaded successfully.");
        return true;

    } catch (error) {
        console.error("Load failed:", error);
        return false;
    }
}


// Reset the game.
function resetGame() {
    if (typeof window.stopCustomerLevel === "function") {
        window.stopCustomerLevel();
    }

    localStorage.removeItem("hivemindKitchenSave");

    Object.assign(gameState, {
        money: 500,
        ingredients: 100,
        reputation: 50,
        day: 1,
        level: 1,
        time: 8 * 60,

        // *** CHANGED: Fresh games begin with six staff.
        staff: 6,

        customersServed: 0,
        ordersCompleted: 0,
        customersArrived: 0,
        customersTarget: 0,
        customersRemaining: 0,
        conversationsCompleted: 0,

        kitchen: {
            stove: 0,
            fridge: 0,
            prep: 0
        }
    });

    updateResources();
    saveGame();

    if (typeof window.startCustomerLevel === "function") {
        window.startCustomerLevel(1);
    }

    console.log("New game started!");
}


// Resource functions.
function changeMoney(amount) {
    gameState.money = Math.max(0, gameState.money + amount);
    updateResources();
    saveGame();
}


function changeIngredients(amount) {
    gameState.ingredients = Math.max(
        0,
        gameState.ingredients + amount
    );

    updateResources();
    saveGame();
}


function changeReputation(amount) {
    gameState.reputation = Math.max(
        0,
        Math.min(100, gameState.reputation + amount)
    );

    updateResources();
    saveGame();
}


// Advance to the next level.
function advanceLevel() {
    gameState.level++;
    gameState.customersArrived = 0;
    gameState.customersTarget = 0;
    gameState.customersRemaining = 0;
    gameState.conversationsCompleted = 0;

    updateResources();
    saveGame();

    if (typeof window.startCustomerLevel === "function") {
        window.startCustomerLevel(gameState.level);
    }
}


// *** NEW: Enter the game from the main menu.
function startHivemindGame() {
    if (window.gameStarted) return;

    window.gameStarted = true;

    const menu = document.getElementById("main-menu");
    const game = document.getElementById("game");

    if (menu) menu.hidden = true;
    if (game) game.hidden = false;

    updateResources();

    if (typeof window.startCustomerLevel === "function") {
        window.startCustomerLevel(gameState.level);
    }

    console.log("HIVEMIND: Kitchen Harmony gameplay started.");
}


// *** NEW: Return to the main menu.
function returnToMainMenu() {
    if (typeof window.stopCustomerLevel === "function") {
        window.stopCustomerLevel();
    }

    window.gameStarted = false;

    const menu = document.getElementById("main-menu");
    const game = document.getElementById("game");

    if (menu) menu.hidden = false;
    if (game) game.hidden = true;

    saveGame();

    console.log("Returned to main menu.");
}


// *** NEW: Main menu and settings controls.
function initialiseMainMenu() {
    const playButton = document.getElementById("play-game");
    const settingsButton = document.getElementById("open-settings");
    const closeSettingsButton = document.getElementById("close-settings");

    const menu = document.getElementById("main-menu");
    const settings = document.getElementById("settings-screen");

    if (playButton) {
        playButton.addEventListener("click", startHivemindGame);
    }

    if (settingsButton) {
        settingsButton.addEventListener("click", () => {
            if (menu) menu.hidden = true;
            if (settings) settings.hidden = false;
        });
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener("click", () => {
            if (settings) settings.hidden = true;
            if (menu) menu.hidden = false;
        });
    }
}


// Expose functions.
window.updateResources = updateResources;
window.updateCustomerProgressDisplay = updateCustomerProgressDisplay;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.changeMoney = changeMoney;
window.changeIngredients = changeIngredients;
window.changeReputation = changeReputation;
window.advanceLevel = advanceLevel;

// *** NEW: Expose main menu functions.
window.startHivemindGame = startHivemindGame;
window.returnToMainMenu = returnToMainMenu;


// Initialise after the HTML is ready.
document.addEventListener("DOMContentLoaded", () => {

    const loaded = loadGame();

    updateResources();

    if (!loaded) saveGame();

    // *** NEW: Initialise the main menu.
    initialiseMainMenu();

    console.log("HIVEMIND: Kitchen Harmony ready.");
});
