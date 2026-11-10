
// HIVEMIND: Kitchen Chaos
// Main game state and resource management

window.gameState = {
    money: 500,
    ingredients: 100,
    reputation: 50,
    day: 1,
    time: 8 * 60,
    staff: 4,
    customersServed: 0,
    ordersCompleted: 0,

    kitchen: {
        stove: 0,
        fridge: 0,
        prep: 0
    }
};

// Update resource displays throughout the game
function updateResources() {
    const values = {
        money: gameState.money,
        ingredients: gameState.ingredients,
        reputation: gameState.reputation,
        staff: gameState.staff,
        day: gameState.day
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

        Object.assign(gameState, savedState);

        console.log("Kitchen Chaos save loaded!");
        return true;

    } catch (error) {
        console.error("Could not load save:", error);
        return false;
    }
}

// Reset the game
function resetGame() {
    localStorage.removeItem("hivemindKitchenSave");

    Object.assign(gameState, {
        money: 500,
        ingredients: 100,
        reputation: 50,
        day: 1,
        time: 8 * 60,
        staff: 4,
        customersServed: 0,
        ordersCompleted: 0,
        kitchen: {
            stove: 0,
            fridge: 0,
            prep: 0
        }
    });

    updateResources();
    saveGame();

    console.log("New Kitchen Chaos game started!");
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

// Initialise the game
function initialiseGame() {
    const loaded = loadGame();

    if (!loaded) {
        saveGame();
    }

    updateResources();

    console.log("🍳 HIVEMIND: Kitchen Chaos is ready!");
    console.log("Current game state:", gameState);
}

document.addEventListener("DOMContentLoaded", initialiseGame);

