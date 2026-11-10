
/* HIVEMIND: Kitchen Chaos
   CHOP CHOP! Ingredient preparation mini-game
*/

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
    timer: null
};

function initialiseMiniGames() {
    const container = document.getElementById("minigame-content");

    if (!container) {
        console.warn("Mini-game container not found.");
        return;
    }

    renderChopChop();
}

function renderChopChop() {
    const container = document.getElementById("minigame-content");
    if (!container) return;

    container.innerHTML = `
        <div class="chop-game">
            <h2>🔪 CHOP CHOP!</h2>
            <p>Prepare ingredients before the kitchen timer runs out!</p>

            <div class="chop-stats">
                <div>⏱️ Time: <strong id="chop-time">15</strong>s</div>
                <div>⭐ Score: <strong id="chop-score">0</strong></div>
                <div>❌ Mistakes: <strong id="chop-mistakes">0</strong></div>
            </div>

            <div class="chop-target" id="chop-target">
                Ready, chef?
            </div>

            <div class="chop-ingredients" id="chop-ingredients">
                ${chopIngredients.map((ingredient, index) => `
                    <button
                        class="chop-ingredient"
                        onclick="selectChopIngredient(${index})"
                        disabled
                    >
                        <span>${ingredient.emoji}</span>
                        ${ingredient.name}
                    </button>
                `).join("")}
            </div>

            <button id="chop-start" onclick="startChopChop()">
                START CHOPPING!
            </button>

            <p id="chop-result" aria-live="polite">
                Can you handle the kitchen chaos?
            </p>
        </div>
    `;
}

function startChopChop() {
    if (chopGame.active) return;

    clearInterval(chopGame.timer);

    chopGame.active = true;
    chopGame.timeLeft = 15;
    chopGame.score = 0;
    chopGame.mistakes = 0;

    document.getElementById("chop-start").disabled = true;

    document.querySelectorAll(".chop-ingredient").forEach(button => {
        button.disabled = false;
    });

    document.getElementById("chop-result").textContent =
        "Quick! Follow the ingredient orders!";

    updateChopDisplay();
    chooseChopTarget();

    chopGame.timer = setInterval(() => {
        chopGame.timeLeft--;
        updateChopDisplay();

        if (chopGame.timeLeft <= 0) {
            finishChopChop();
        }
    }, 1000);
}

function chooseChopTarget() {
    const randomIndex = Math.floor(
        Math.random() * chopIngredients.length
    );

    chopGame.target = chopIngredients[randomIndex];

    document.getElementById("chop-target").innerHTML = `
        <span>PREPARE:</span>
        <strong>${chopGame.target.emoji} ${chopGame.target.name}</strong>
    `;
}

function selectChopIngredient(index) {
    if (!chopGame.active) return;

    const selected = chopIngredients[index];

    if (selected.name === chopGame.target.name) {
        chopGame.score++;
        document.getElementById("chop-result").textContent =
            "Perfect cut! Keep going! ✨";

        chooseChopTarget();
    } else {
        chopGame.mistakes++;
        chopGame.timeLeft = Math.max(0, chopGame.timeLeft - 2);

        document.getElementById("chop-result").textContent =
            "Wrong ingredient! You lost 2 seconds! 😵";
    }

    updateChopDisplay();

    if (chopGame.timeLeft <= 0) {
        finishChopChop();
    }
}

function updateChopDisplay() {
    document.getElementById("chop-time").textContent =
        chopGame.timeLeft;

    document.getElementById("chop-score").textContent =
        chopGame.score;

    document.getElementById("chop-mistakes").textContent =
        chopGame.mistakes;
}

function finishChopChop() {
    if (!chopGame.active) return;

    chopGame.active = false;
    clearInterval(chopGame.timer);

    document.querySelectorAll(".chop-ingredient").forEach(button => {
        button.disabled = true;
    });

    document.getElementById("chop-start").disabled = false;
    document.getElementById("chop-start").textContent = "PLAY AGAIN";

    let reward = 0;
    let ingredientReward = 0;
    let resultMessage = "";

    if (chopGame.score >= 10) {
        reward = 150;
        ingredientReward = 25;
        resultMessage = "🏆 MASTER CHEF! Incredible work!";
    } else if (chopGame.score >= 6) {
        reward = 90;
        ingredientReward = 15;
        resultMessage = "⭐ GREAT JOB! The kitchen is impressed!";
    } else if (chopGame.score >= 3) {
        reward = 40;
        ingredientReward = 8;
        resultMessage = "👏 Not bad, chef! Keep practising!";
    } else {
        resultMessage = "😅 The kitchen survived... barely!";
    }

    if (reward > 0 && typeof changeMoney === "function") {
        changeMoney(reward);
    }

    if (
        ingredientReward > 0 &&
        typeof changeIngredients === "function"
    ) {
        changeIngredients(ingredientReward);
    }

    document.getElementById("chop-target").textContent =
        "SHIFT COMPLETE!";

    document.getElementById("chop-result").textContent =
        `${resultMessage} Score: ${chopGame.score}. ` +
        `Reward: $${reward} and ${ingredientReward} ingredients.`;
}

document.addEventListener("DOMContentLoaded", initialiseMiniGames);

