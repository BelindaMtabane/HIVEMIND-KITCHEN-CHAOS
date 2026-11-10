
// HIVEMIND: Kitchen Harmony
// Customer conversations and automatic customer arrivals

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

// *** Randomized customer arrival settings.
const CUSTOMER_LEVEL_SETTINGS = {
    minimumCustomers: 8,
    maximumCustomers: 14,
    minimumArrivalSeconds: 8,
    maximumArrivalSeconds: 18,
    firstArrivalSeconds: 2
};

// Current customer information.
let currentCustomer = null;
let lastCustomerIndex = -1;
let customerAnswered = false;

// *** Arrival and queue state.
let customerQueue = [];
let customerArrivalTimer = null;
let customerLevelActive = false;
let customerLevelComplete = false;
let customerLevelNumber = 1;
let customerArrivalCount = 0;
let customerLevelTarget = 0;

// *** Generate a random whole number between two limits.
function randomCustomerNumber(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

// *** Create a customer instance without changing the original template.
function createCustomerInstance() {
    let index;

    do {
        index = Math.floor(Math.random() * customerTemplates.length);
    } while (
        index === lastCustomerIndex &&
        customerTemplates.length > 1
    );

    lastCustomerIndex = index;

    return {
        ...customerTemplates[index],
        id: `customer-${customerLevelNumber}-${customerArrivalCount + 1}`,
        arrivalNumber: customerArrivalCount + 1,
        status: "Waiting"
    };
}

// *** Update customer arrival information in the game state.
function updateCustomerArrivalState() {
    const state = window.gameState;

    if (!state) return;

    state.customersArrived = customerArrivalCount;
    state.customersTarget = customerLevelTarget;
    state.customersRemaining = Math.max(
        0,
        customerLevelTarget - customerArrivalCount
    );

    if (typeof window.updateCustomerProgressDisplay === "function") {
        window.updateCustomerProgressDisplay();
    }

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }
}

// *** Show arrival and queue information in the customer area.
function renderCustomerQueueStatus() {
    const container = document.getElementById("customer-content");

    if (!container) return;

    let status = document.getElementById("customer-arrival-status");

    if (!status) {
        status = document.createElement("div");
        status.id = "customer-arrival-status";
        status.className = "customer-arrival-status";

        container.prepend(status);
    }

    const waitingCount = customerQueue.length;

    status.innerHTML = `
        <p><strong>Level ${customerLevelNumber}</strong></p>
        <p>Customers arrived: ${customerArrivalCount}/${customerLevelTarget}</p>
        <p>Customers waiting: ${waitingCount}</p>
        <p>${customerLevelComplete
            ? "All customers have arrived for this level."
            : "Customers are arriving automatically..."
        }</p>
    `;
}

// *** Schedule the next automatic customer arrival.
function scheduleNextCustomerArrival(delaySeconds) {
    if (!customerLevelActive || customerLevelComplete) return;

    if (customerArrivalTimer) {
        clearTimeout(customerArrivalTimer);
    }

    customerArrivalTimer = setTimeout(() => {
        customerArrivalTimer = null;
        arriveNextCustomer();
    }, delaySeconds * 1000);
}

// *** Add one customer to the restaurant.
function arriveNextCustomer() {
    if (!customerLevelActive || customerLevelComplete) return;

    if (customerArrivalCount >= customerLevelTarget) {
        completeCustomerArrivals();
        return;
    }

    const customer = createCustomerInstance();

    customerArrivalCount++;
    customerQueue.push(customer);

    updateCustomerArrivalState();
    renderCustomerQueueStatus();

    console.log(
        `🚪 Customer arrived: ${customer.name}. ` +
        `Customer ${customerArrivalCount}/${customerLevelTarget} ` +
        `for level ${customerLevelNumber}.`
    );

    // *** Notify other systems that a customer has arrived.
    window.dispatchEvent(new CustomEvent("hivemind:customerArrived", {
        detail: {
            customer: { ...customer },
            level: customerLevelNumber,
            arrived: customerArrivalCount,
            target: customerLevelTarget
        }
    }));

    // *** Display the next waiting customer if nobody is being handled.
    if (!currentCustomer) {
        nextCustomer();
    }

    renderCustomerQueueStatus();

    if (customerArrivalCount >= customerLevelTarget) {
        completeCustomerArrivals();
        return;
    }

    const nextDelay = randomCustomerNumber(
        CUSTOMER_LEVEL_SETTINGS.minimumArrivalSeconds,
        CUSTOMER_LEVEL_SETTINGS.maximumArrivalSeconds
    );

    scheduleNextCustomerArrival(nextDelay);
}

// *** Stop arrivals after the randomized target is reached.
function completeCustomerArrivals() {
    if (customerLevelComplete) return;

    customerLevelComplete = true;
    customerLevelActive = false;

    if (customerArrivalTimer) {
        clearTimeout(customerArrivalTimer);
        customerArrivalTimer = null;
    }

    renderCustomerQueueStatus();

    console.log(
        `✅ All ${customerLevelTarget} customers have arrived ` +
        `for level ${customerLevelNumber}.`
    );

    window.dispatchEvent(new CustomEvent("hivemind:customerArrivalsComplete", {
        detail: {
            level: customerLevelNumber,
            target: customerLevelTarget,
            arrived: customerArrivalCount
        }
    }));

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }
}

// *** Start or restart automatic customer arrivals for a level.
function startCustomerLevel(levelNumber) {
    const state = window.gameState;

    if (!state) {
        console.error("Customer system: gameState has not been initialised.");
        return;
    }

    // *** Stop any previous level's arrival timer.
    if (customerArrivalTimer) {
        clearTimeout(customerArrivalTimer);
        customerArrivalTimer = null;
    }

    customerLevelNumber = Math.max(1, Number(levelNumber) || 1);

    customerArrivalCount = 0;
    customerLevelTarget = randomCustomerNumber(
        CUSTOMER_LEVEL_SETTINGS.minimumCustomers,
        CUSTOMER_LEVEL_SETTINGS.maximumCustomers
    );

    customerQueue = [];
    currentCustomer = null;
    customerAnswered = false;
    customerLevelComplete = false;
    customerLevelActive = true;
    lastCustomerIndex = -1;

    state.level = customerLevelNumber;

    updateCustomerArrivalState();

    const container = document.getElementById("customer-content");

    if (container) {
        container.innerHTML = `
            <div class="customer-level-start">
                <h2>🍽️ Level ${customerLevelNumber}</h2>
                <p>Your restaurant is opening!</p>
                <p>Today's customer target: <strong>${customerLevelTarget}</strong></p>
                <p>Customers will begin arriving shortly.</p>
            </div>
        `;
    }

    renderCustomerQueueStatus();

    console.log(
        `🍽️ Level ${customerLevelNumber} started. ` +
        `Random customer target: ${customerLevelTarget}.`
    );

    // *** The first customer arrives shortly after the level begins.
    scheduleNextCustomerArrival(
        CUSTOMER_LEVEL_SETTINGS.firstArrivalSeconds
    );
}

// *** Stop the arrival timer. Used when resetting or leaving a level.
function stopCustomerLevel() {
    customerLevelActive = false;

    if (customerArrivalTimer) {
        clearTimeout(customerArrivalTimer);
        customerArrivalTimer = null;
    }

    console.log("Customer arrivals stopped.");
}

// Display the next waiting customer.
function nextCustomer() {
    // *** Do not replace a customer who is still being handled.
    if (currentCustomer && !customerAnswered) {
        return;
    }

    currentCustomer = customerQueue.shift() || null;
    customerAnswered = false;

    if (!currentCustomer) {
        renderCustomerQueueStatus();

        const container = document.getElementById("customer-content");

        if (container && !customerLevelComplete) {
            container.innerHTML = `
                <div class="customer-waiting">
                    <h2>🚪 Waiting for customers...</h2>
                    <p>The restaurant is open. New customers will arrive automatically.</p>
                </div>
            `;

            renderCustomerQueueStatus();
        } else if (container && customerLevelComplete) {
            container.innerHTML = `
                <div class="customer-level-arrivals-complete">
                    <h2>✅ All customers have arrived!</h2>
                    <p>Finish serving the remaining customers.</p>
                </div>
            `;

            renderCustomerQueueStatus();
        }

        return;
    }

    currentCustomer.status = "Being handled";

    renderCustomer();
    renderCustomerQueueStatus();

    console.log(`💬 Now handling ${currentCustomer.name}.`);
}

// Render the customer conversation.
function renderCustomer() {
    const container = document.getElementById("customer-content");

    if (!container || !currentCustomer) return;

    container.innerHTML = `
        <div class="customer-profile">
            <h2>${currentCustomer.emoji} ${currentCustomer.name}</h2>
            <p><strong>${currentCustomer.personality}</strong></p>
            <p>Customer ${currentCustomer.arrivalNumber} of ${customerLevelTarget}</p>

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

    // *** Keep arrival information visible after rendering a conversation.
    renderCustomerQueueStatus();
}

// Process the player's customer decision.
function chooseCustomerResponse(choiceIndex) {
    if (!currentCustomer || customerAnswered) return;

    const choice = currentCustomer.choices[choiceIndex];

    if (!choice) return;

    customerAnswered = true;
    currentCustomer.status = "Conversation completed";

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
    if (typeof window.updateResources === "function") {
        window.updateResources();
    }

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    // Display the customer's reaction.
    const container = document.getElementById("customer-content");

    const result = container?.querySelector("#customer-result");

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
    container?.querySelectorAll(".customer-choices button").forEach(button => {
        button.disabled = true;
    });

    // *** Tell other systems that the conversation has finished.
    window.dispatchEvent(new CustomEvent("hivemind:customerConversationCompleted", {
        detail: {
            customer: { ...currentCustomer },
            choice: { ...choice },
            level: customerLevelNumber
        }
    }));

    renderCustomerQueueStatus();
}

// *** Get a read-only snapshot of customer arrival progress.
function getCustomerLevelStatus() {
    return {
        level: customerLevelNumber,
        target: customerLevelTarget,
        arrived: customerArrivalCount,
        waiting: customerQueue.length,
        remaining: Math.max(0, customerLevelTarget - customerArrivalCount),
        active: customerLevelActive,
        arrivalsComplete: customerLevelComplete,
        currentCustomer: currentCustomer
            ? { ...currentCustomer }
            : null
    };
}

// *** Expose functions so game.js and other systems can use them.
window.customerTemplates = customerTemplates;
window.initialiseCustomers = initialiseCustomers;
window.startCustomerLevel = startCustomerLevel;
window.stopCustomerLevel = stopCustomerLevel;
window.nextCustomer = nextCustomer;
window.chooseCustomerResponse = chooseCustomerResponse;
window.getCustomerLevelStatus = getCustomerLevelStatus;

// Start the customer system after the main game setup has run.
function initialiseCustomers() {
    if (!window.gameState) {
        console.error("Customer system: gameState has not been initialised.");
        return;
    }

    if (typeof window.gameState.reputation !== "number") {
        window.gameState.reputation = 50;
    }

    // *** Begin the current level with a newly randomized customer target.
    startCustomerLevel(window.gameState.level || 1);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initialiseCustomers, 0);
});

