
/* HIVEMIND: Kitchen Harmony
   Customer conversations, automatic arrivals and monitoring
*/

"use strict";

const customerTemplates = [
    {
        name: "Karen",
        emoji: "💅",
        personality: "The Professional Complainer",
        dialogue: "EXCUSE ME! I've been waiting for 5 minutes. Do you know who I am?!",
        choices: [
            { text: "Apologise and offer a discount.", response: "Fine. I shall allow it. 💅", reputation: 8, money: -10 },
            { text: "Tell her patience is a virtue.", response: "I WANT TO SPEAK TO THE MANAGER!", reputation: -10, money: 0 },
            { text: "Offer her a complimentary dessert.", response: "Now THAT is customer service!", reputation: 12, money: -5 }
        ]
    },
    {
        name: "Oliver",
        emoji: "🍔",
        personality: "The Hungry Food Critic",
        dialogue: "I ordered a burger. Why does it look like it has been through a divorce?",
        choices: [
            { text: "Offer to replace the burger.", response: "Excellent. I expect greatness.", reputation: 10, money: -5 },
            { text: "Explain that it's modern cuisine.", response: "Modern? It looks prehistoric.", reputation: -8, money: 0 },
            { text: "Give him a free side dish.", response: "Okay, you've earned another chance.", reputation: 6, money: -5 }
        ]
    },
    {
        name: "Grandma Rose",
        emoji: "👵",
        personality: "The Sweet Grandma",
        dialogue: "My dear, this soup is lovely! But it reminds me of my late husband's cooking.",
        choices: [
            { text: "Ask her to share the recipe.", response: "Oh, bless you! He would have loved this place.", reputation: 12, money: 5 },
            { text: "Offer her another bowl.", response: "You're such a sweetheart!", reputation: 10, money: -5 },
            { text: "Say nothing and smile.", response: "A little shy, are we? Thank you, dear!", reputation: 5, money: 0 }
        ]
    },
    {
        name: "Mr. Rich",
        emoji: "🤑",
        personality: "The Wealthy Customer",
        dialogue: "I have money. I have standards. And I have absolutely no idea what I want.",
        choices: [
            { text: "Recommend the chef's special.", response: "Magnificent! Keep the change.", reputation: 10, money: 30 },
            { text: "Show him the most expensive meal.", response: "FINALLY! Someone who understands me!", reputation: 5, money: 40 },
            { text: "Ask him to choose something himself.", response: "How dare you make me think?!", reputation: -5, money: 0 }
        ]
    },
    {
        name: "The Food Influencer",
        emoji: "📱",
        personality: "The Social Media Star",
        dialogue: "Heyyy! I'm recording. Can I get a free meal for my 47 followers?",
        choices: [
            { text: "Give a complimentary meal.", response: "OMG! This place is ICONIC! FOLLOW THEM!", reputation: 15, money: -15 },
            { text: "Offer a small influencer discount.", response: "Not bad. I'll tag your restaurant!", reputation: 8, money: -5 },
            { text: "Politely decline.", response: "Wow. Cancelled. Absolutely cancelled.", reputation: -8, money: 0 }
        ]
    },
    {
        name: "Uncle Chaos",
        emoji: "🤡",
        personality: "The Walking Disaster",
        dialogue: "I accidentally spilled my drink, broke a plate and sat on my own food. Anyway, where's my dessert?",
        choices: [
            { text: "Help him clean up.", response: "You're a legend! My bad, boss!", reputation: 10, money: -5 },
            { text: "Charge him for the broken plate.", response: "Fair enough. I did sit on it.", reputation: 3, money: 10 },
            { text: "Ask him to leave.", response: "FINE! I'll take my chaos elsewhere!", reputation: -12, money: 0 }
        ]
    }
];

// Arrival settings.
const CUSTOMER_LEVEL_SETTINGS = {
    minimumCustomers: 8,
    maximumCustomers: 14,
    firstArrivalSeconds: 2,
    minimumArrivalSeconds: 8,
    maximumArrivalSeconds: 18
};

// Customer system state.
let currentCustomer = null;
let customerQueue = [];
let customerArrivalTimer = null;

let customerLevelNumber = 1;
let customerArrivalCount = 0;
let customerLevelTarget = 0;
let conversationsCompleted = 0;

let customerLevelActive = false;
let customerLevelComplete = false;
let customerAnswered = false;
let lastCustomerIndex = -1;

// Staff monitoring state.
const customerStaffStatus = {
    bella: "Waiting",
    marcus: "Waiting"
};

let bellaSeated = 0;
let marcusOrdersTaken = 0;

// Random number generator.
function randomCustomerNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create a customer without modifying the original template.
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

// Create the monitoring dashboard.
function createCustomerDashboard() {
    if (document.getElementById("hivemind-customer-dashboard")) return;

    const dashboard = document.createElement("section");

    dashboard.id = "hivemind-customer-dashboard";

    dashboard.innerHTML = `
        <div class="hive-monitor-header">
            <div>
                <h2>📊 Restaurant Operations</h2>
                <p>Live customer monitoring</p>
            </div>
            <span id="hive-monitor-status">STARTING</span>
        </div>

        <div class="hive-monitor-grid">
            <div class="hive-monitor-card">
                <span>Current Level</span>
                <strong id="hive-level">1</strong>
            </div>

            <div class="hive-monitor-card">
                <span>Customers Arrived</span>
                <strong id="hive-arrived">0/0</strong>
            </div>

            <div class="hive-monitor-card">
                <span>Waiting Queue</span>
                <strong id="hive-waiting">0</strong>
            </div>

            <div class="hive-monitor-card">
                <span>Conversations</span>
                <strong id="hive-conversations">0</strong>
            </div>

            <div class="hive-monitor-card">
                <span>Orders Completed</span>
                <strong id="hive-orders">0</strong>
            </div>

            <div class="hive-monitor-card">
                <span>Customers Served</span>
                <strong id="hive-served">0</strong>
            </div>
        </div>

        <div class="hive-monitor-progress">
            <div class="hive-monitor-progress-heading">
                <span>Level Arrival Progress</span>
                <span id="hive-percentage">0%</span>
            </div>
            <div class="hive-monitor-track">
                <div id="hive-progress-bar"></div>
            </div>
        </div>

        <div class="hive-monitor-staff">
            <h3>Staff Activity</h3>
            <div>
                <span>🪑 Bella — Receptionist</span>
                <strong id="hive-bella-status">Waiting</strong>
            </div>
            <div>
                <span>📝 Marcus — Waiter</span>
                <strong id="hive-marcus-status">Waiting</strong>
            </div>
            <p id="hive-staff-note">
                Staff activity will update when their systems are connected.
            </p>
        </div>

        <div class="hive-monitor-current">
            <h3>Current Customer</h3>
            <p id="hive-current-customer">No active customer</p>
        </div>
    `;

    const style = document.createElement("style");

    style.textContent = `
        #hivemind-customer-dashboard {
            margin: 16px 0;
            padding: 18px;
            border-radius: 14px;
            background: #17232b;
            color: #edf7f7;
            font-family: inherit;
        }

        #hivemind-customer-dashboard * {
            box-sizing: border-box;
        }

        .hive-monitor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .hive-monitor-header h2 {
            margin: 0 0 4px;
        }

        .hive-monitor-header p,
        #hive-staff-note {
            color: #aabdc2;
            font-size: 12px;
        }

        #hive-monitor-status {
            padding: 6px 10px;
            border-radius: 20px;
            background: #244a40;
            color: #8ef0bd;
            font-size: 11px;
        }

        .hive-monitor-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
        }

        .hive-monitor-card {
            background: #22333d;
            padding: 13px;
            border-radius: 9px;
            min-width: 0;
        }

        .hive-monitor-card span {
            display: block;
            color: #b2c4ca;
            font-size: 11px;
        }

        .hive-monitor-card strong {
            display: block;
            margin-top: 7px;
            font-size: 22px;
        }

        .hive-monitor-progress {
            margin-top: 18px;
        }

        .hive-monitor-progress-heading {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 8px;
        }

        .hive-monitor-track {
            height: 9px;
            background: #34454c;
            border-radius: 10px;
            overflow: hidden;
        }

        #hive-progress-bar {
            height: 100%;
            width: 0%;
            background: #56d5ae;
            transition: width .3s;
        }

        .hive-monitor-staff,
        .hive-monitor-current {
            margin-top: 18px;
            padding-top: 12px;
            border-top: 1px solid #34454c;
        }

        .hive-monitor-staff h3,
        .hive-monitor-current h3 {
            font-size: 14px;
        }

        .hive-monitor-staff > div {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            padding: 8px 0;
            font-size: 12px;
        }

        .hive-monitor-staff strong {
            color: #8ef0bd;
        }

        @media (max-width: 480px) {
            .hive-monitor-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `;

    document.head.appendChild(style);

    // Put the dashboard above the existing customer area.
    const customerContainer = document.getElementById("customer-content");

    if (customerContainer && customerContainer.parentElement) {
        customerContainer.parentElement.insertBefore(
            dashboard,
            customerContainer
        );
    } else {
        document.body.prepend(dashboard);
    }
}

// Update the monitoring dashboard.
function updateCustomerDashboard() {
    const state = window.gameState || {};

    const percentage = customerLevelTarget > 0
        ? Math.round(customerArrivalCount / customerLevelTarget * 100)
        : 0;

    const values = {
        "hive-level": customerLevelNumber,
        "hive-arrived": `${customerArrivalCount}/${customerLevelTarget}`,
        "hive-waiting": customerQueue.length,
        "hive-conversations": conversationsCompleted,
        "hive-orders": state.ordersCompleted || 0,
        "hive-served": state.customersServed || 0,
        "hive-percentage": `${percentage}%`,
        "hive-bella-status": customerStaffStatus.bella,
        "hive-marcus-status": customerStaffStatus.marcus,
        "hive-current-customer": currentCustomer
            ? `${currentCustomer.emoji} ${currentCustomer.name}`
            : "No active customer"
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    const progress = document.getElementById("hive-progress-bar");

    if (progress) {
        progress.style.width = `${percentage}%`;
    }

    const status = document.getElementById("hive-monitor-status");

    if (status) {
        status.textContent = customerLevelComplete
            ? "ARRIVALS COMPLETE"
            : customerLevelActive
                ? "LIVE"
                : "STOPPED";
    }
}

// Update shared game state.
function updateCustomerArrivalState() {
    const state = window.gameState;

    if (!state) return;

    state.customersArrived = customerArrivalCount;
    state.customersTarget = customerLevelTarget;
    state.customersRemaining = Math.max(
        0,
        customerLevelTarget - customerArrivalCount
    );
    state.conversationsCompleted = conversationsCompleted;

    if (typeof window.updateCustomerProgressDisplay === "function") {
        window.updateCustomerProgressDisplay();
    }

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    updateCustomerDashboard();
}

// Display queue information in the existing customer section.
function renderCustomerQueueStatus() {
    const container = document.getElementById("customer-content");

    if (!container) return;

    let status = document.getElementById("customer-arrival-status");

    if (!status) {
        status = document.createElement("div");
        status.id = "customer-arrival-status";
        container.prepend(status);
    }

    status.innerHTML = `
        <p><strong>Level ${customerLevelNumber}</strong></p>
        <p>Customers arrived: ${customerArrivalCount}/${customerLevelTarget}</p>
        <p>Customers waiting: ${customerQueue.length}</p>
    `;

    updateCustomerDashboard();
}

// Schedule the next customer.
function scheduleNextCustomerArrival(seconds) {
    if (!customerLevelActive || customerLevelComplete) return;

    clearTimeout(customerArrivalTimer);

    customerArrivalTimer = setTimeout(() => {
        customerArrivalTimer = null;
        arriveNextCustomer();
    }, seconds * 1000);
}

// Customer arrival.
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

    window.dispatchEvent(new CustomEvent("hivemind:customerArrived", {
        detail: {
            customer: { ...customer },
            level: customerLevelNumber,
            arrived: customerArrivalCount,
            target: customerLevelTarget
        }
    }));

    console.log(
        `Customer arrived: ${customer.name} (${customerArrivalCount}/${customerLevelTarget})`
    );

    if (!currentCustomer) {
        nextCustomer();
    }

    renderCustomerQueueStatus();

    if (customerArrivalCount >= customerLevelTarget) {
        completeCustomerArrivals();
        return;
    }

    scheduleNextCustomerArrival(
        randomCustomerNumber(
            CUSTOMER_LEVEL_SETTINGS.minimumArrivalSeconds,
            CUSTOMER_LEVEL_SETTINGS.maximumArrivalSeconds
        )
    );
}

// Complete automatic arrivals.
function completeCustomerArrivals() {
    if (customerLevelComplete) return;

    customerLevelComplete = true;
    customerLevelActive = false;

    clearTimeout(customerArrivalTimer);
    customerArrivalTimer = null;

    renderCustomerQueueStatus();
    updateCustomerDashboard();

    window.dispatchEvent(new CustomEvent(
        "hivemind:customerArrivalsComplete",
        {
            detail: {
                level: customerLevelNumber,
                target: customerLevelTarget,
                arrived: customerArrivalCount
            }
        }
    ));

    console.log("All customers have arrived for this level.");

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }
}

// Start a level.
function startCustomerLevel(levelNumber) {
    if (!window.gameState) {
        console.error("Game state is not ready.");
        return;
    }

    clearTimeout(customerArrivalTimer);

    customerLevelNumber = Math.max(1, Number(levelNumber) || 1);

    customerArrivalCount = 0;
    customerLevelTarget = randomCustomerNumber(
        CUSTOMER_LEVEL_SETTINGS.minimumCustomers,
        CUSTOMER_LEVEL_SETTINGS.maximumCustomers
    );

    customerQueue = [];
    currentCustomer = null;
    conversationsCompleted = 0;

    customerAnswered = false;
    customerLevelComplete = false;
    customerLevelActive = true;
    lastCustomerIndex = -1;

    bellaSeated = 0;
    marcusOrdersTaken = 0;

    customerStaffStatus.bella = "Waiting";
    customerStaffStatus.marcus = "Waiting";

    window.gameState.level = customerLevelNumber;

    updateCustomerArrivalState();

    const container = document.getElementById("customer-content");

    if (container) {
        container.innerHTML = `
            <div class="customer-level-start">
                <h2>🍽️ Level ${customerLevelNumber}</h2>
                <p>Your restaurant is opening!</p>
                <p>Today's customer target: <strong>${customerLevelTarget}</strong></p>
            </div>
        `;
    }

    createCustomerDashboard();
    updateCustomerDashboard();
    renderCustomerQueueStatus();

    console.log(
        `Level ${customerLevelNumber} started. Target: ${customerLevelTarget}`
    );

    scheduleNextCustomerArrival(
        CUSTOMER_LEVEL_SETTINGS.firstArrivalSeconds
    );
}

// Stop arrivals.
function stopCustomerLevel() {
    customerLevelActive = false;

    clearTimeout(customerArrivalTimer);
    customerArrivalTimer = null;

    updateCustomerDashboard();
}

// Display next customer.
function nextCustomer() {
    if (currentCustomer && !customerAnswered) return;

    currentCustomer = customerQueue.shift() || null;
    customerAnswered = false;

    if (!currentCustomer) {
        const container = document.getElementById("customer-content");

        if (container) {
            container.innerHTML = `
                <h2>${customerLevelComplete
                    ? "✅ All customers have arrived!"
                    : "🚪 Waiting for customers..."
                }</h2>
                <p>${customerLevelComplete
                    ? "Finish serving the remaining customers."
                    : "New customers will arrive automatically."
                }</p>
            `;
        }

        renderCustomerQueueStatus();
        return;
    }

    currentCustomer.status = "Being handled";

    renderCustomer();
    updateCustomerDashboard();
}

// Render conversation.
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

    renderCustomerQueueStatus();
}

// Process response.
function chooseCustomerResponse(choiceIndex) {
    if (!currentCustomer || customerAnswered) return;

    const choice = currentCustomer.choices[choiceIndex];

    if (!choice) return;

    customerAnswered = true;
    currentCustomer.status = "Conversation completed";

    const state = window.gameState;

    state.reputation = Math.max(
        0,
        Math.min(100, state.reputation + choice.reputation)
    );

    state.money = Math.max(0, state.money + choice.money);

    conversationsCompleted++;
    state.conversationsCompleted = conversationsCompleted;

    if (typeof window.updateResources === "function") {
        window.updateResources();
    }

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    const container = document.getElementById("customer-content");
    const result = container?.querySelector("#customer-result");

    if (result) {
        result.innerHTML = `
            <div class="customer-reaction">
                <h3>Customer Reaction 💬</h3>
                <p>${choice.response}</p>
                <p>⭐ Reputation: ${choice.reputation >= 0 ? "+" : ""}${choice.reputation}</p>
                <p>💰 Money: ${choice.money >= 0 ? "+" : ""}${choice.money}</p>
                <h3>Current Reputation: ${state.reputation}/100</h3>
                <button onclick="nextCustomer()">Next Customer ➜</button>
            </div>
        `;
    }

    container?.querySelectorAll(".customer-choices button").forEach(button => {
        button.disabled = true;
    });

    window.dispatchEvent(new CustomEvent(
        "hivemind:customerConversationCompleted",
        {
            detail: {
                customer: { ...currentCustomer },
                choice: { ...choice },
                level: customerLevelNumber
            }
        }
    ));

    updateCustomerDashboard();
}

// Staff integration hooks.
// These update the dashboard when Bella and Marcus are connected.
function updateBellaActivity(status, seatedCount) {
    customerStaffStatus.bella = status;
    if (Number.isFinite(seatedCount)) bellaSeated = seatedCount;

    updateCustomerDashboard();
}

function updateMarcusActivity(status, ordersTaken) {
    customerStaffStatus.marcus = status;
    if (Number.isFinite(ordersTaken)) marcusOrdersTaken = ordersTaken;

    updateCustomerDashboard();
}

// Read-only customer status.
function getCustomerLevelStatus() {
    return {
        level: customerLevelNumber,
        target: customerLevelTarget,
        arrived: customerArrivalCount,
        waiting: customerQueue.length,
        conversationsCompleted,
        remaining: Math.max(0, customerLevelTarget - customerArrivalCount),
        active: customerLevelActive,
        arrivalsComplete: customerLevelComplete,
        currentCustomer: currentCustomer
            ? { ...currentCustomer }
            : null,
        bella: {
            status: customerStaffStatus.bella,
            seated: bellaSeated
        },
        marcus: {
            status: customerStaffStatus.marcus,
            ordersTaken: marcusOrdersTaken
        }
    };
}

// Expose functions.
window.customerTemplates = customerTemplates;
window.startCustomerLevel = startCustomerLevel;
window.stopCustomerLevel = stopCustomerLevel;
window.nextCustomer = nextCustomer;
window.chooseCustomerResponse = chooseCustomerResponse;
window.getCustomerLevelStatus = getCustomerLevelStatus;
window.updateCustomerDashboard = updateCustomerDashboard;
window.updateBellaActivity = updateBellaActivity;
window.updateMarcusActivity = updateMarcusActivity;

// *** Initialise the customer system without automatically starting arrivals.
function initialiseCustomers() {
    if (!window.gameState) {
        console.error("Cannot initialise customers: game state is missing.");
        return;
    }

    // *** Create the dashboard while the player is on the main menu.
    createCustomerDashboard();

    // *** Show the initial customer state.
    updateCustomerDashboard();
    renderCustomerQueueStatus();

    // *** Only start arrivals if gameplay has already started.
    if (window.gameStarted === true) {
        startCustomerLevel(window.gameState.level || 1);
    }

    console.log("Customer system initialised and waiting for Play Game.");
}

// *** Initialise after the other game scripts have loaded.
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initialiseCustomers, 0);
});
