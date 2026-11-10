
/* HIVEMIND: Kitchen Harmony
   Main game controller, resources, saving and startup.
*/

(() => {
    "use strict";

    const SAVE_KEY = "hivemindKitchenSave";

    const DEFAULT_STATE = {
        money: 500,
        ingredients: 100,
        reputation: 50,
        day: 1,
        level: 1,
        time: 480,
        staff: 6,
        customersServed: 0,
        ordersCompleted: 0,
        kitchen: {
            stove: 0,
            fridge: 0,
            prep: 0
        }
    };

    window.gameState = { ...DEFAULT_STATE };

    let gameStarted = false;
    let systemsInitialised = false;

    function cloneDefaultState() {
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }

    function updateResources() {
        const state = window.gameState;

        const values = {
            money: state.money,
            ingredients: state.ingredients,
            reputation: state.reputation,
            day: state.day,
            level: state.level,
            staff: state.staff
        };

        const selectors = {
            money: [
                "#money", "#money-display", "#player-money",
                "#cash-display"
            ],
            ingredients: [
                "#ingredients", "#ingredients-display",
                "#ingredient-count"
            ],
            reputation: [
                "#reputation", "#reputation-display"
            ],
            day: ["#day", "#day-display", "#current-day"],
            level: ["#level", "#level-display"],
            staff: ["#staff-count", "#staff-display"]
        };

        Object.entries(values).forEach(([key, value]) => {
            const element = selectors[key]
                .map(selector => document.querySelector(selector))
                .find(Boolean);

            if (element) {
                element.textContent = value;
            }
        });

        window.dispatchEvent(
            new CustomEvent("hivemind:resources-updated", {
                detail: { ...state }
            })
        );
    }

    function saveGame() {
        try {
            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(window.gameState)
            );

            window.dispatchEvent(
                new CustomEvent("hivemind:game-saved")
            );

            return true;
        } catch (error) {
            console.error("HIVEMIND save failed:", error);
            return false;
        }
    }

    function loadGame() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);

            if (!saved) return false;

            const parsed = JSON.parse(saved);

            if (!parsed || typeof parsed !== "object") {
                return false;
            }

            window.gameState = {
                ...cloneDefaultState(),
                ...parsed,
                kitchen: {
                    ...DEFAULT_STATE.kitchen,
                    ...(parsed.kitchen || {})
                }
            };

            updateResources();

            window.dispatchEvent(
                new CustomEvent("hivemind:game-loaded", {
                    detail: { ...window.gameState }
                })
            );

            return true;
        } catch (error) {
            console.error("HIVEMIND load failed:", error);
            window.gameState = cloneDefaultState();
            return false;
        }
    }

    function changeMoney(amount) {
        const value = Number(amount);

        if (!Number.isFinite(value)) return false;

        window.gameState.money = Math.max(
            0,
            window.gameState.money + value
        );

        updateResources();
        saveGame();

        return true;
    }

    function changeIngredients(amount) {
        const value = Number(amount);

        if (!Number.isFinite(value)) return false;

        window.gameState.ingredients = Math.max(
            0,
            window.gameState.ingredients + value
        );

        updateResources();
        saveGame();

        return true;
    }

    function changeReputation(amount) {
        const value = Number(amount);

        if (!Number.isFinite(value)) return false;

        window.gameState.reputation = Math.max(
            0,
            Math.min(100, window.gameState.reputation + value)
        );

        updateResources();
        saveGame();

        return true;
    }

    function initialiseSystems() {
        if (systemsInitialised) return;

        window.initialiseStaff?.();
        window.initialiseStaffActivity?.();
        window.initialiseKitchen?.();
        window.initialiseCustomers?.();
        window.initialiseMiniGames?.();

        systemsInitialised = true;

        console.log("HIVEMIND: Game systems initialised.");
    }

    function showScreen(screenId) {
        const screens = [
            "main-menu",
            "settings-screen",
            "game"
        ];

        screens.forEach(id => {
            const element = document.getElementById(id);

            if (element) {
                element.style.display =
                    id === screenId ? "block" : "none";
            }
        });
    }

    function startHivemindGame() {
        initialiseSystems();

        gameStarted = true;

        showScreen("game");

        const simulation = window.KitchenSimulation;

        if (simulation) {
            simulation.start();
        } else {
            console.error(
                "HIVEMIND: KitchenSimulation is missing."
            );
        }

        window.startCustomerLevel?.(window.gameState.level);

        updateResources();
        saveGame();

        window.dispatchEvent(
            new CustomEvent("hivemind:game-started", {
                detail: { ...window.gameState }
            })
        );

        console.log("HIVEMIND: Kitchen game started.");
    }

    function returnToMainMenu() {
        gameStarted = false;

        window.KitchenSimulation?.stop();

        saveGame();
        showScreen("main-menu");

        window.dispatchEvent(
            new CustomEvent("hivemind:returned-to-menu")
        );
    }

    function resetGame() {
        window.KitchenSimulation?.stop();
        window.stopCustomerLevel?.();

        gameStarted = false;
        window.gameState = cloneDefaultState();

        window.KitchenSimulation?.reset();
        window.StaffSystem?.reset();
        window.KitchenSystem?.reset();

        updateResources();
        saveGame();

        window.dispatchEvent(
            new CustomEvent("hivemind:game-reset")
        );

        startHivemindGame();
    }

    function advanceLevel() {
        window.gameState.level += 1;
        window.gameState.day += 1;
        window.gameState.time = 480;

        updateResources();
        saveGame();

        window.startCustomerLevel?.(window.gameState.level);

        window.dispatchEvent(
            new CustomEvent("hivemind:level-advanced", {
                detail: {
                    level: window.gameState.level,
                    day: window.gameState.day
                }
            })
        );
    }

    function openSettings() {
        showScreen("settings-screen");
    }

    function closeSettings() {
        showScreen(gameStarted ? "game" : "main-menu");
    }

    function initialiseMainMenu() {
        const playButton = document.getElementById("play-game");
        const settingsButton = document.getElementById("open-settings");
        const closeButton = document.getElementById("close-settings");

        playButton?.addEventListener("click", startHivemindGame);
        settingsButton?.addEventListener("click", openSettings);
        closeButton?.addEventListener("click", closeSettings);

        showScreen("main-menu");
    }

    function initialiseGame() {
        const loaded = loadGame();

        if (!loaded) {
            window.gameState = cloneDefaultState();
            saveGame();
        }

        updateResources();
        initialiseMainMenu();

        console.log("HIVEMIND: Main controller ready.");
    }

    // Public game functions used by the other scripts.
    window.updateResources = updateResources;
    window.saveGame = saveGame;
    window.loadGame = loadGame;
    window.resetGame = resetGame;
    window.changeMoney = changeMoney;
    window.changeIngredients = changeIngredients;
    window.changeReputation = changeReputation;
    window.advanceLevel = advanceLevel;
    window.startHivemindGame = startHivemindGame;
    window.returnToMainMenu = returnToMainMenu;
    window.initialiseMainMenu = initialiseMainMenu;
    window.initialiseGame = initialiseGame;

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialiseGame,
            { once: true }
        );
    } else {
        initialiseGame();
    }
})();

