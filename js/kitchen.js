
// Kitchen upgrade system for HIVEMIND: Kitchen Chaos

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
        ]
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
        ]
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
        ]
    }
];

// Make sure the upgrade data exists.
function initialiseKitchen() {
    if (!gameState.kitchen) {
        gameState.kitchen = {
            stove: 0,
            fridge: 0,
            prep: 0
        };
    }

    renderKitchen();
}

// Display all kitchen upgrades.
function renderKitchen() {
    const container = document.getElementById("upgrade-list");

    if (!container) return;

    if (!gameState.kitchen) {
        initialiseKitchen();
        return;
    }

    container.innerHTML = kitchenUpgrades.map(upgrade => {
        const level = gameState.kitchen[upgrade.id] || 0;
        const maxed = level >= 3;
        const nextCost = upgrade.costs[level];

        return `
            <article class="card">
                <h3>${upgrade.emoji} ${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <p><strong>Level:</strong> ${level}/3</p>
                <p><strong>Next benefit:</strong>
                    ${maxed ? "Fully upgraded!" : upgrade.benefits[level]}
                </p>
                ${
                    maxed
                    ? `<button disabled>MAX LEVEL</button>`
                    : `
                        <p>💰 ${nextCost.money} | 🥕 ${nextCost.ingredients}</p>
                        <button onclick="upgradeKitchen('${upgrade.id}')">
                            Upgrade
                        </button>
                    `
                }
            </article>
        `;
    }).join("");
}

// Purchase the next level of a kitchen upgrade.
function upgradeKitchen(upgradeId) {
    const upgrade = kitchenUpgrades.find(item => item.id === upgradeId);

    if (!upgrade) return;

    const level = gameState.kitchen[upgradeId] || 0;

    if (level >= 3) {
        alert("This kitchen station is already fully upgraded!");
        return;
    }

    const cost = upgrade.costs[level];

    if (gameState.money < cost.money ||
        gameState.ingredients < cost.ingredients) {
        alert("Not enough resources! Your kitchen dreams must wait. 😭");
        return;
    }

    gameState.money -= cost.money;
    gameState.ingredients -= cost.ingredients;
    gameState.kitchen[upgradeId] = level + 1;

    updateResources();
    renderKitchen();
    saveGame();

    alert(`${upgrade.name} upgraded to Level ${level + 1}! 🎉`);
}

