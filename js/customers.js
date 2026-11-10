
// Customer conversation system for HIVEMIND: Kitchen Chaos

const customerTemplates = [
    {
        name: "Karen",
        emoji: "💅",
        personality: "The Professional Complainer",
        dialogue: "EXCUSE ME! I've been waiting for 5 minutes. Do you know who I am?!",
        choices: [
            {
                text: "Apologise and offer a discount.",
                response: "Fine. I shall allow it. 💅",
                reputation: 8,
                money: -10
            },
            {
                text: "Tell her patience is a virtue.",
                response: "I WANT TO SPEAK TO THE MANAGER!",
                reputation: -10,
                money: 0
            },
            {
                text: "Offer her a complimentary dessert.",
                response: "Now THAT is customer service!",
                reputation: 12,
                money: -5
            }
        ]
    },
    {
        name: "Oliver",
        emoji: "🍔",
        personality: "The Hungry Food Critic",
        dialogue: "I ordered a burger. Why does it look like it has been through a divorce?",
        choices: [
            {
                text: "Offer to replace the burger.",
                response: "Excellent. I expect greatness.",
                reputation: 10,
                money: -5
            },
            {
                text: "Explain that it's modern cuisine.",
                response: "Modern? It looks prehistoric.",
                reputation: -8,
                money: 0
            },
            {
                text: "Give him a free side dish.",
                response: "Okay, you've earned another chance.",
                reputation: 6,
                money: -5
            }
        ]
    },
    {
        name: "Grandma Rose",
        emoji: "👵",
        personality: "The Sweet Grandma",
        dialogue: "My dear, this soup is lovely! But it reminds me of my late husband's cooking.",
        choices: [
            {
                text: "Ask her to share the recipe.",
                response: "Oh, bless you! He would have loved this place.",
                reputation: 12,
                money: 5
            },
            {
                text: "Offer her another bowl.",
                response: "You're such a sweetheart!",
                reputation: 10,
                money: -5
            },
            {
                text: "Say nothing and smile.",
                response: "A little shy, are we? Thank you, dear!",
                reputation: 5,
                money: 0
            }
        ]
    },
    {
        name: "Mr. Rich",
        emoji: "🤑",
        personality: "The Wealthy Customer",
        dialogue: "I have money. I have standards. And I have absolutely no idea what I want.",
        choices: [
            {
                text: "Recommend the chef's special.",
                response: "Magnificent! Keep the change.",
                reputation: 10,
                money: 30
            },
            {
                text: "Show him the most expensive meal.",
                response: "FINALLY! Someone who understands me!",
                reputation: 5,
                money: 40
            },
            {
                text: "Ask him to choose something himself.",
                response: "How dare you make me think?!",
                reputation: -5,
                money: 0
            }
        ]
    },
    {
        name: "The Food Influencer",
        emoji: "📱",
        personality: "The Social Media Star",
        dialogue: "Heyyy! I'm recording. Can I get a free meal for my 47 followers?",
        choices: [
            {
                text: "Give a complimentary meal.",
                response: "OMG! This place is ICONIC! FOLLOW THEM!",
                reputation: 15,
                money: -15
            },
            {
                text: "Offer a small influencer discount.",
                response: "Not bad. I'll tag your restaurant!",
                reputation: 8,
                money: -5
            },
            {
                text: "Politely decline.",
                response: "Wow. Cancelled. Absolutely cancelled.",
                reputation: -8,
                money: 0
            }
        ]
    },
    {
        name: "Uncle Chaos",
        emoji: "🤡",
        personality: "The Walking Disaster",
        dialogue: "I accidentally spilled my drink, broke a plate and sat on my own food. Anyway, where's my dessert?",
        choices: [
            {
                text: "Help him clean up.",
                response: "You're a legend! My bad, boss!",
                reputation: 10,
                money: -5
            },
            {
                text: "Charge him for the broken plate.",
                response: "Fair enough. I did sit on it.",
                reputation: 3,
                money: 10
            },
            {
                text: "Ask him to leave.",
                response: "FINE! I'll take my chaos elsewhere!",
                reputation: -12,
                money: 0
            }
        ]
    }
];

// Current customer information.
let currentCustomer = null;
let lastCustomerIndex = -1;
let customerAnswered = false;

// Start the customer system.
function initialiseCustomers() {
    if (typeof gameState === "undefined") {
        console.error("Customer system: gameState has not been initialised.");
        return;
    }

    if (typeof gameState.reputation !== "number") {
        gameState.reputation = 50;
    }

    nextCustomer();
}

// Display a new random customer.
function nextCustomer() {
    let index;

    do {
        index = Math.floor(Math.random() * customerTemplates.length);
    } while (index === lastCustomerIndex && customerTemplates.length > 1);

    lastCustomerIndex = index;
    currentCustomer = customerTemplates[index];
    customerAnswered = false;

    renderCustomer();
}

// Render the customer conversation.
function renderCustomer() {
    const container = document.getElementById("customer-content");

    if (!container || !currentCustomer) return;

    container.innerHTML = `
        <div class="customer-profile">
            <h2>${currentCustomer.emoji} ${currentCustomer.name}</h2>
            <p><strong>${currentCustomer.personality}</strong></p>

            <div class="customer-dialogue">
                <p>"${currentCustomer.dialogue}"</p>
            </div>

            <h3>How will you respond?</h3>

            <div class="customer-choices">
                ${currentCustomer.choices.map((choice, index) => `
                    <button
                        onclick="chooseCustomerResponse(${index})"
                        ${customerAnswered ? "disabled" : ""}
                    >
                        ${choice.text}
                    </button>
                `).join("")}
            </div>

            <p id="customer-result"></p>
        </div>
    `;
}

// Process the player's customer decision.
function chooseCustomerResponse(choiceIndex) {
    if (!currentCustomer || customerAnswered) return;

    const choice = currentCustomer.choices[choiceIndex];

    if (!choice) return;

    customerAnswered = true;

    // Update restaurant reputation.
    gameState.reputation = Math.max(
        0,
        Math.min(100, (gameState.reputation ?? 50) + choice.reputation)
    );

    // Update restaurant money.
    gameState.money = Math.max(
        0,
        gameState.money + choice.money
    );

    // Refresh resources and save progress.
    if (typeof updateResources === "function") {
        updateResources();
    }

    if (typeof saveGame === "function") {
        saveGame();
    }

    // Display the customer's reaction.
    const container = document.getElementById("customer-content");

    const result = container.querySelector("#customer-result");

    if (result) {
        result.innerHTML = `
            <div class="customer-reaction">
                <h3>Customer Reaction 💬</h3>
                <p>${choice.response}</p>
                <p>⭐ Reputation: ${choice.reputation >= 0 ? "+" : ""}${choice.reputation}</p>
                <p>💰 Money: ${choice.money >= 0 ? "+" : ""}${choice.money}</p>
                <h3>Current Reputation: ${gameState.reputation}/100</h3>
                <button onclick="nextCustomer()">
                    Next Customer ➜
                </button>
            </div>
        `;
    }

    // Disable the previous choices.
    container.querySelectorAll(".customer-choices button").forEach(button => {
        button.disabled = true;
    });
}

// Initialise after the main game setup has run.
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initialiseCustomers, 0);
});


