
/* ============================================
   HIVEMIND: KITCHEN HARMONY
   RESTAURANT SHIFT SIMULATION
   ============================================ */

(() => {
    "use strict";

    const dishes = [
        {
            id: "garden-bowl",
            name: "Garden Bowl",
            icon: "🥗",
            ingredients: 8,
            reward: 45,
            time: 8,
            station: "prep"
        },
        {
            id: "golden-burger",
            name: "Golden Burger",
            icon: "🍔",
            ingredients: 14,
            reward: 75,
            time: 12,
            station: "stove"
        },
        {
            id: "pancakes",
            name: "Golden Pancakes",
            icon: "🥞",
            ingredients: 10,
            reward: 60,
            time: 10,
            station: "stove"
        },
        {
            id: "fruit-dessert",
            name: "Fruit Dessert",
            icon: "🍓",
            ingredients: 6,
            reward: 40,
            time: 7,
            station: "prep"
        }
    ];

    const simulation = {
        orders: [],
        nextOrderId: 1,
        completed: 0,
        interval: null,
        running: false
    };

    /* Create the simulation interface */
    function createSimulationInterface() {
        if (document.getElementById("shift-simulation")) return;

        const section = document.createElement("section");
        section.id = "shift-simulation";

        section.innerHTML = `
            <div class="shift-heading">
                <div>
                    <h2>🍳 Kitchen Shift</h2>
                    <p>Keep your kitchen moving and complete customer orders.</p>
                </div>
                <div class="shift-status" id="shift-status">
                    SHIFT READY
                </div>
            </div>

            <div class="shift-controls">
                <button id="create-order-btn">
                    + New Customer Order
                </button>
                <span>
                    Completed:
                    <strong id="shift-completed">0</strong>
                </span>
            </div>

            <div class="shift-stations">
                <div class="shift-station">
                    <span>🥬</span>
                    <strong>Preparation</strong>
                    <small id="prep-status">Available</small>
                </div>

                <div class="shift-station">
                    <span>🔥</span>
                    <strong>Cooking</strong>
                    <small id="stove-status">Available</small>
                </div>
            </div>

            <h3>📋 Incoming Orders</h3>
            <div id="shift-orders">
                <p class="empty-orders">
                    No active orders. Create your first order!
                </p>
            </div>

            <div id="shift-message" role="status">
                Your kitchen is ready.
            </div>
        `;

        const style = document.createElement("style");
        style.id = "shift-simulation-style";
        style.textContent = `
            #shift-simulation {
                margin: 24px 0;
                padding: 22px;
                border-radius: 18px;
                background: #182b35;
                color: #f5f7f5;
                box-shadow: 0 8px 25px rgba(0,0,0,.18);
            }

            #shift-simulation h2,
            #shift-simulation h3 {
                margin-top: 0;
            }

            .shift-heading,
            .shift-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .shift-heading p {
                color: #b7c9c8;
                margin-bottom: 0;
            }

            .shift-status {
                background: #24594d;
                padding: 9px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }

            .shift-controls {
                margin: 20px 0;
            }

            #shift-simulation button {
                border: 0;
                border-radius: 10px;
                padding: 11px 16px;
                background: #e8b85b;
                color: #243039;
                font-weight: bold;
                cursor: pointer;
            }

            #shift-simulation button:disabled {
                opacity: .45;
                cursor: not-allowed;
            }

            .shift-stations {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin: 20px 0;
            }

            .shift-station {
                display: flex;
                flex-direction: column;
                gap: 7px;
                padding: 16px;
                border-radius: 13px;
                background: #263f49;
            }

            .shift-station span {
                font-size: 27px;
            }

            .shift-station small {
                color: #a9d9c5;
            }

            #shift-orders {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 12px;
            }

            .shift-order {
                padding: 15px;
                background: #263f49;
                border: 1px solid #47616a;
                border-radius: 13px;
            }

            .shift-order h4 {
                margin: 0 0 8px;
            }

            .shift-order p {
                color: #c4d2d0;
                font-size: 13px;
            }

            .shift-order progress {
                width: 100%;
                accent-color: #e8b85b;
            }

            .shift-order select {
                width: 100%;
                margin: 8px 0;
                padding: 9px;
                border-radius: 8px;
            }

            .empty-orders {
                color: #b7c9c8;
            }

            #shift-message {
                margin-top: 18px;
                padding: 12px;
                background: #263f49;
                border-radius: 9px;
                color: #bce8d0;
            }

            @media (max-width: 520px) {
                .shift-stations {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);

        const customerSection = document.getElementById("customers");

        if (customerSection && customerSection.parentNode) {
            customerSection.parentNode.insertBefore(
                section,
                customerSection
            );
        } else {
            document.body.appendChild(section);
        }

        section.appendChild(style);
        
        document.getElementById("create-order-btn")
            .addEventListener("click", createOrder);
    }

    /* Generate a new customer order */
    function createOrder() {
        const dish = dishes[
            Math.floor(Math.random() * dishes.length)
        ];

        const order = {
            id: simulation.nextOrderId++,
            dish: dish,
            progress: 0,
            assigned: false,
            completed: false,
            staffName: ""
        };

        simulation.orders.push(order);

        showMessage(`${dish.icon} New order received: ${dish.name}!`);

        renderOrders();
        startSimulation();
    }

    /* Display the active orders */
    function renderOrders() {
        const container = document.getElementById("shift-orders");

        if (!container) return;

        if (simulation.orders.length === 0) {
            container.innerHTML = `
                <p class="empty-orders">
                    No active orders. Create your first order!
                </p>
            `;
            return;
        }

        container.innerHTML = simulation.orders.map(order => {
            const dish = order.dish;

            return `
                <div class="shift-order">
                    <h4>${dish.icon} ${dish.name}</h4>

                    <p>
                        Ingredients: ${dish.ingredients}
                        <br>
                        Reward: $${dish.reward}
                        <br>
                        Station: ${dish.station}
                    </p>

                    <label>
                        Assign staff member
                        <select
                            data-order-staff="${order.id}"
                            ${order.assigned || order.completed ? "disabled" : ""}
                        >
                            ${getStaffOptions()}
                        </select>
                    </label>

                    <progress
                        value="${order.progress}"
                        max="100"
                    ></progress>

                    <p>
                        ${
                            order.completed
                                ? "✅ Order completed!"
                                : order.assigned
                                    ? `Preparing: ${Math.floor(order.progress)}%`
                                    : "Waiting for staff assignment"
                        }
                    </p>

                    ${
                        !order.assigned && !order.completed
                            ? `<button data-assign-order="${order.id}">
                                Assign Order
                               </button>`
                            : ""
                    }
                </div>
            `;
        }).join("");

        container.querySelectorAll("[data-assign-order]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const id = Number(button.dataset.assignOrder);
                    assignOrder(id);
                });
            });

        updateStationDisplay();
    }

    /* Get staff names from the existing staff system */
    function getStaffOptions() {
        if (!Array.isArray(window.staffMembers)) {
            return `<option value="">Staff system loading...</option>`;
        }

        return `
            <option value="">Choose staff member</option>
            ${window.staffMembers.map((member, index) => {
                const name = member.name || member.fullName || `Staff ${index + 1}`;

                return `
                    <option value="${index}">
                        ${name}
                    </option>
                `;
            }).join("")}
        `;
    }

    /* Assign a staff member to an order */
    function assignOrder(orderId) {
        const order = simulation.orders.find(
            item => item.id === orderId
        );

        if (!order || order.assigned || order.completed) return;

        const select = document.querySelector(
            `[data-order-staff="${orderId}"]`
        );

        if (!select || select.value === "") {
            showMessage("Please select a staff member first.");
            return;
        }

        const staffIndex = Number(select.value);
        const staff = window.staffMembers?.[staffIndex];

        if (!staff) {
            showMessage("That staff member could not be found.");
            return;
        }

        const staffName =
            staff.name || staff.fullName || `Staff ${staffIndex + 1}`;

        const alreadyWorking = simulation.orders.some(
            item =>
                item.staffIndex === staffIndex &&
                item.assigned &&
                !item.completed
        );

        if (alreadyWorking) {
            showMessage(`${staffName} is already working on an order.`);
            return;
        }

        order.staffIndex = staffIndex;
        order.staffName = staffName;
        order.assigned = true;

        showMessage(`${staffName} is now preparing ${order.dish.name}.`);

        renderOrders();
        startSimulation();
    }

    /* Run the kitchen preparation loop */
    function startSimulation() {
        if (simulation.running) return;

        simulation.running = true;

        simulation.interval = setInterval(() => {
            let hasActiveOrders = false;

            simulation.orders.forEach(order => {
                if (!order.assigned || order.completed) return;

                hasActiveOrders = true;

                const stationLevel =
                    window.gameState?.kitchen?.[order.dish.station] || 0;

                const preparationSpeed = 1 + (stationLevel * 0.15);

                order.progress += preparationSpeed * 2;

                if (order.progress >= 100) {
                    order.progress = 100;
                    completeOrder(order);
                }
            });

            renderOrders();

            if (!hasActiveOrders) {
                stopSimulation();
            }
        }, 1000);
    }

    /* Complete an order and update the existing economy */
    function completeOrder(order) {
        if (order.completed) return;

        const state = window.gameState;

        if (!state) {
            showMessage("Game state is not available.");
            return;
        }

        if (state.ingredients < order.dish.ingredients) {
            order.assigned = false;
            order.progress = 0;

            showMessage(
                `Not enough ingredients for ${order.dish.name}!`
            );

            return;
        }

        order.completed = true;

        state.ingredients -= order.dish.ingredients;
        state.money += order.dish.reward;
        state.ordersCompleted = (state.ordersCompleted || 0) + 1;
        state.customersServed = (state.customersServed || 0) + 1;

        simulation.completed++;

        if (typeof window.changeReputation === "function") {
            window.changeReputation(2);
        }

        if (typeof window.updateResources === "function") {
            window.updateResources();
        }

        if (typeof window.saveGame === "function") {
            window.saveGame();
        }

        document.getElementById("shift-completed").textContent =
            simulation.completed;

        showMessage(
            `🎉 ${order.staffName} completed ${order.dish.name}! +$${order.dish.reward}`
        );

        renderOrders();
    }

    /* Update station availability */
    function updateStationDisplay() {
        ["prep", "stove"].forEach(station => {
            const active = simulation.orders.some(
                order =>
                    order.dish.station === station &&
                    order.assigned &&
                    !order.completed
            );

            const element = document.getElementById(`${station}-status`);

            if (element) {
                element.textContent = active ? "In operation" : "Available";
            }
        });
    }

    function stopSimulation() {
        clearInterval(simulation.interval);
        simulation.interval = null;
        simulation.running = false;
    }

    function showMessage(message) {
        const element = document.getElementById("shift-message");

        if (element) {
            element.textContent = message;
        }
    }

    /* Start after the existing game systems load */
    function initialiseSimulation() {
        if (!window.gameState) {
            console.error("Kitchen Harmony: gameState was not found.");
            return;
        }

        createSimulationInterface();
        renderOrders();

        const status = document.getElementById("shift-status");

        if (status) {
            status.textContent = "KITCHEN OPEN";
        }

        console.log("Kitchen Harmony: Shift simulation initialised.");
    }

    window.KitchenSimulation = {
        initialise: initialiseSimulation,
        createOrder,
        assignOrder,
        renderOrders,
        getState: () => simulation
    };

    document.addEventListener("DOMContentLoaded", () => {
        initialiseSimulation();
    });

})();
