
/* HIVEMIND: Kitchen Chaos
   CHOP CHOP! Ingredient preparation mini-game
*/

"use strict";

const chopIngredients = [
    { name: "Tomato", emoji: "🍅" },
    { name: "Lettuce", emoji: "🥬" },
    { name: "Cheese", emoji: "🧀" },
    { name: "Meat", emoji: "🥩" },
    { name: "Bread", emoji: "🍞" },
    { name: "Onion", emoji: "🧅" }
];

let chopGame = {
    active: false,
    timeLeft: 15,
    score: 0,
    mistakes: 0,
    target: null,
    timer: null,
    rewarded: false,
    initialised: false
};

/* -----------------------------------------------------
   INITIALISATION
   ----------------------------------------------------- */

function initialiseMiniGames() {
    const container = document.getElementById("minigame-content");

    if (!container) {
        console.warn("Mini-game container not found.");
        return;
    }

    if (chopGame.active) {
        clearInterval(chopGame.timer);
        chopGame.active = false;
    }

    renderChopChop();

    chopGame.initialised = true;

    console.log("CHOP CHOP mini-game is ready!");
}

/* -----------------------------------------------------
   RENDER MINI-GAME
   ----------------------------------------------------- */

function renderChopChop() {
    const container = document.getElementById("minigame-content");

    if (!container) return;

    container.innerHTML = `
        <div class="chop-game">

            <h2>🔪 CHOP CHOP!</h2>

            <p>
                Prepare ingredients before the kitchen timer runs out!
            </p>

            <div class="chop-stats">

                <div>
                    ⏱️ Time:
                    <strong id="chop-time">15</strong>s
                </div>

                <div>
                    ⭐ Score:
                    <strong id="chop-score">0</strong>
                </div>

                <div>
                    ❌ Mistakes:
                    <strong id="chop-mistakes">0</strong>
                </div>

            </div>

            <div
                class="chop-target"
                id="chop-target"
            >
                Ready, chef?
            </div>

            <div
                class="chop-ingredients"
                id="chop-ingredients"
            >

                ${chopIngredients.map((ingredient, index) => `
                    <button
                        class="chop-ingredient"
                        data-chop-index="${index}"
                        onclick="selectChopIngredient(${index})"
                        disabled
                    >
                        <span>${ingredient.emoji}</span>
                        ${ingredient.name}
                    </button>
                `).join("")}

            </div>

            <button
                id="chop-start"
                onclick="startChopChop()"
            >
                START CHOPPING!
            </button>

            <p
                id="chop-result"
                aria-live="polite"
            >
                Can you handle the kitchen chaos?
            </p>

        </div>
    `;

    // *** Reset the mini-game display whenever it is rendered.
    updateChopDisplay();
}

/* -----------------------------------------------------
   START GAME
   ----------------------------------------------------- */

function startChopChop() {
    if (chopGame.active) return;

    clearInterval(chopGame.timer);

    chopGame.active = true;
    chopGame.timeLeft = 15;
    chopGame.score = 0;
    chopGame.mistakes = 0;
    chopGame.target = null;
    chopGame.rewarded = false;

    const startButton = document.getElementById("chop-start");
    const result = document.getElementById("chop-result");

    if (!startButton || !result) {
        chopGame.active = false;
        console.error("CHOP CHOP interface is incomplete.");
        return;
    }

    startButton.disabled = true;

    document.querySelectorAll(".chop-ingredient").forEach(button => {
        button.disabled = false;
    });

    result.textContent =
        "Quick! Follow the ingredient orders!";

    updateChopDisplay();

    chooseChopTarget();

    // *** Keep the timer controlled by one interval only.
    chopGame.timer = setInterval(() => {
        if (!chopGame.active) return;

        chopGame.timeLeft--;

        updateChopDisplay();

        if (chopGame.timeLeft <= 0) {
            finishChopChop();
        }

    }, 1000);
}

/* -----------------------------------------------------
   CHOOSE INGREDIENT TARGET
   ----------------------------------------------------- */

function chooseChopTarget() {
    if (!chopGame.active) return;

    const randomIndex = Math.floor(
        Math.random() * chopIngredients.length
    );

    chopGame.target = chopIngredients[randomIndex];

    const targetElement =
        document.getElementById("chop-target");

    if (!targetElement) return;

    targetElement.innerHTML = `
        <span>PREPARE:</span>
        <strong>
            ${chopGame.target.emoji}
            ${chopGame.target.name}
        </strong>
    `;
}

/* -----------------------------------------------------
   SELECT INGREDIENT
   ----------------------------------------------------- */

function selectChopIngredient(index) {
    if (!chopGame.active) return;

    const selected = chopIngredients[index];

    if (!selected || !chopGame.target) return;

    const result = document.getElementById("chop-result");

    if (selected.name === chopGame.target.name) {

        // *** Correct ingredient: award one point.
        chopGame.score++;

        if (result) {
            result.textContent =
                "Perfect cut! Keep going! ✨";
        }

        chooseChopTarget();

    } else {

        // *** Incorrect ingredient: deduct two seconds.
        chopGame.mistakes++;

        chopGame.timeLeft = Math.max(
            0,
            chopGame.timeLeft - 2
        );

        if (result) {
            result.textContent =
                "Wrong ingredient! You lost 2 seconds! 😵";
        }
    }

    updateChopDisplay();

    if (chopGame.timeLeft <= 0) {
        finishChopChop();
    }
}

/* -----------------------------------------------------
   UPDATE DISPLAY
   ----------------------------------------------------- */

function updateChopDisplay() {
    const timeElement =
        document.getElementById("chop-time");

    const scoreElement =
        document.getElementById("chop-score");

    const mistakesElement =
        document.getElementById("chop-mistakes");

    if (timeElement) {
        timeElement.textContent = chopGame.timeLeft;
    }

    if (scoreElement) {
        scoreElement.textContent = chopGame.score;
    }

    if (mistakesElement) {
        mistakesElement.textContent = chopGame.mistakes;
    }
}

/* -----------------------------------------------------
   REWARD MANAGEMENT
   ----------------------------------------------------- */

// *** Update resources using the existing game functions.
function awardChopRewards(money, ingredients) {
    const state = window.gameState;

    if (money > 0) {
        if (typeof window.changeMoney === "function") {
            window.changeMoney(money);

        } else if (state) {
            state.money =
                (Number(state.money) || 0) + money;
        }
    }

    if (ingredients > 0) {
        if (typeof window.changeIngredients === "function") {
            window.changeIngredients(ingredients);

        } else if (state) {
            state.ingredients =
                (Number(state.ingredients) || 0) + ingredients;
        }
    }

    // *** Refresh the existing resource HUD.
    if (typeof window.updateResources === "function") {
        window.updateResources();
    }

    // *** Save the updated resources.
    if (typeof window.saveGame === "function") {
        window.saveGame();
    }
}

/* -----------------------------------------------------
   FINISH GAME
   ----------------------------------------------------- */

function finishChopChop() {
    if (!chopGame.active || chopGame.rewarded) return;

    // *** Stop the game before processing rewards.
    chopGame.active = false;
    chopGame.rewarded = true;

    clearInterval(chopGame.timer);
    chopGame.timer = null;

    document.querySelectorAll(".chop-ingredient").forEach(button => {
        button.disabled = true;
    });

    const startButton =
        document.getElementById("chop-start");

    if (startButton) {
        startButton.disabled = false;
        startButton.textContent = "PLAY AGAIN";
    }

    let reward = 0;
    let ingredientReward = 0;
    let resultMessage = "";

    // *** Preserve the original reward tiers.
    if (chopGame.score >= 10) {

        reward = 150;
        ingredientReward = 25;

        resultMessage =
            "🏆 MASTER CHEF! Incredible work!";

    } else if (chopGame.score >= 6) {

        reward = 90;
        ingredientReward = 15;

        resultMessage =
            "⭐ GREAT JOB! The kitchen is impressed!";

    } else if (chopGame.score >= 3) {

        reward = 40;
        ingredientReward = 8;

        resultMessage =
            "👏 Not bad, chef! Keep practising!";

    } else {

        resultMessage =
            "😅 The kitchen survived... barely!";
    }

    // *** Award rewards once only.
    if (reward > 0 || ingredientReward > 0) {
        awardChopRewards(reward, ingredientReward);
    }

    const targetElement =
        document.getElementById("chop-target");

    if (targetElement) {
        targetElement.textContent =
            "SHIFT COMPLETE!";
    }

    const resultElement =
        document.getElementById("chop-result");

    if (resultElement) {
        resultElement.textContent =
            `${resultMessage} Score: ${chopGame.score}. ` +
            `Reward: $${reward} and ${ingredientReward} ingredients.`;
    }

    console.log("CHOP CHOP completed:", {
        score: chopGame.score,
        mistakes: chopGame.mistakes,
        moneyReward: reward,
        ingredientReward
    });
}

/* -----------------------------------------------------
   CLEANUP
   ----------------------------------------------------- */

// *** Allow other game systems to stop the mini-game safely.
function stopChopChop() {
    if (chopGame.active) {
        chopGame.active = false;
    }

    clearInterval(chopGame.timer);
    chopGame.timer = null;

    document.querySelectorAll(".chop-ingredient").forEach(button => {
        button.disabled = true;
    });

    const startButton =
        document.getElementById("chop-start");

    if (startButton) {
        startButton.disabled = false;
    }
}

/* -----------------------------------------------------
   INITIALISATION
   ----------------------------------------------------- */

// *** Keep functions accessible to existing HTML onclick handlers.
window.initialiseMiniGames = initialiseMiniGames;
window.renderChopChop = renderChopChop;
window.startChopChop = startChopChop;
window.selectChopIngredient = selectChopIngredient;
window.finishChopChop = finishChopChop;
window.stopChopChop = stopChopChop;

// *** Support both normal and dynamically loaded scripts.
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiseMiniGames
    );
} else {
    initialiseMiniGames();
}

