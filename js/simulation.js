
/* =====================================================
   HIVEMIND: KITCHEN HARMONY
   RESTAURANT SIMULATION ENGINE
   ===================================================== */

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

    /* -----------------------------------------------------
       INTERFACE
       ----------------------------------------------------- */

    function createInterface() {
        if (document.getElementById("shift-simulation")) return;

        const section = document.createElement("section");
        section.id = "shift-simulation";

        section.innerHTML = `
            <div class="shift-heading">
                <div>
                    <span class="shift-eyebrow">RESTAURANT OPERATIONS</span>
                    <h2>Kitchen Service 🍳</h2>
                    <p>Prepare meals and keep your customers happy.</p>
                </div>

                <div id="shift-status" class="shift-status">
                    KITCHEN CLOSED
                </div>
            </div>

            <div class="shift-controls">
                <button id="create-order-btn">
                    + New Customer Order
                </button>

                <div class="shift-counter">
                    Completed Orders
                    <strong id="shift-completed">0</strong>
                </div>
            </div>

            <div class="shift-stations">
                <div class="shift-station" data-station="prep">
                    <span class="station-icon">🥬</span>
                    <div>
                        <strong>Preparation Counter</strong>
                        <small id="prep-status">Available</small>
                    </div>
                </div>

                <div class="shift-station" data-station="stove">
                    <span class="station-icon">🔥</span>
                    <div>
                        <strong>Cooking Station</strong>
                        <small id="stove-status">Available</small>
                    </div>
                </div>
            </div>

            <div class="shift-orders-heading">
                <h3>Customer Orders</h3>
                <span id="active-order-count">0 active</span>
            </div>

            <div id="shift-orders">
                <div class="empty-orders">
                    <span>🍽️</span>
                    <strong>No orders yet!</strong>
                    <p>Start your kitchen service by receiving an order.</p>
                </div>
            </div>

            <div id="shift-message" role="status">
                Your kitchen is ready for service.
            </div>
        `;

        const customers = document.getElementById("customers");

        if (customers?.parentNode) {
            customers.parentNode.insertBefore(section, customers);
        } else {
            document.body.appendChild(section);
        }

        document.getElementById("create-order-btn")
            .addEventListener("click", createOrder);

        document.getElementById("shift-status").textContent =
            "KITCHEN OPEN";
    }

    /* -----------------------------------------------------
       ORDERS
       ----------------------------------------------------- */

    function createOrder() {
        const dish = dishes[
            Math.floor(Math.random() * dishes.length)
        ];

        const order = {
            id: simulation.nextOrderId++,
            dish,
            progress: 0,
            assigned: false,
            completed: false,
            staffIndex: null,
            staffName: ""
        };

        simulation.orders.push(order);

        showMessage(`📥 New order: ${dish.name}!`);

        renderOrders();
    }

    function renderOrders() {
        const container = document.getElementById("shift-orders");

        if (!container) return;

        const activeOrders = simulation.orders.filter(
            order => !order.completed
        );

        document.getElementById("active-order-count").textContent =
            `${activeOrders.length} active`;

        if (simulation.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-orders">
                    <span>🍽️</span>
                    <strong>No orders yet!</strong>
                    <p>Start your kitchen service by receiving an order.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = simulation.orders.map(order => {
            const dish = order.dish;

            return `
                <article class="shift-order">
                    <div class="order-card-heading">
                        <span class="order-food-icon">${dish.icon}</span>
                        <div>
                            <h4>${dish.name}</h4>
                            <small>Order #${order.id}</small>
                        </div>
                    </div>

                    <div class="order-details">
                        <span>🥕 ${dish.ingredients} ingredients</span>
                        <span>💰 $${dish.reward}</span>
                    </div>

                    ${
                        order.completed
                        ? `
                            <div class="order-completed">
                                ✓ Order completed
                            </div>
                        `
                        : `
                            <label class="staff-assignment">
                                Assign staff member

                                <select
                                    data-order-staff="${order.id}"
                                    ${order.assigned ? "disabled" : ""}
                                >
                                    ${getStaffOptions()}
                                </select>
                            </label>

                            <div class="order-progress">
                                <div class="order-progress-track">
                                    <div
                                        class="order-progress-fill"
                                        style="width:${order.progress}%"
                                    ></div>
                                </div>

                                <small>${Math.floor(order.progress)}% prepared</small>
                            </div>

                            ${
                                order.assigned
                                ? `
                                    <div class="order-working">
                                        👨‍🍳 ${order.staffName} is working
                                    </div>
                                `
                                : `
                                    <button
                                        data-assign-order="${order.id}"
                                        class="assign-order-btn"
                                    >
                                        Assign Order
                                    </button>
                                `
                            }
                        `
                    }
                </article>
            `;
        }).join("");

        container.querySelectorAll("[data-assign-order]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    assignOrder(Number(button.dataset.assignOrder));
                });
            });

        updateStationDisplay();
    }

    function getStaffOptions() {
        const members = window.staffMembers || [];

        if (!members.length) {
            return `<option value="">No staff available</option>`;
        }

        return `
            <option value="">Choose staff member</option>

            ${members.map((member, index) => {
                const name =
                    member.name ||
                    member.fullName ||
                    `Staff ${index + 1}`;

                const unavailable =
                    member.status === "Working" ||
                    member.energy <= 0;

                return `
                    <option
                        value="${index}"
                        ${unavailable ? "disabled" : ""}
                    >
                        ${name}${unavailable ? " (Unavailable)" : ""}
                    </option>
                `;
            }).join("")}
        `;
    }

    /* -----------------------------------------------------
       STAFF ASSIGNMENT
       ----------------------------------------------------- */

    function assignOrder(orderId) {
        const order = simulation.orders.find(
            item => item.id === orderId
        );

        if (!order || order.assigned || order.completed) return;

        const select = document.querySelector(
            `[data-order-staff="${orderId}"]`
        );

        if (!select || select.value === "") {
            showMessage("Please choose a staff member.");
            return;
        }

        const staffIndex = Number(select.value);
        const staff = window.staffMembers?.[staffIndex];

        if (!staff) {
            showMessage("Staff member could not be found.");
            return;
        }

        const staffName =
            staff.name ||
            staff.fullName ||
            `Staff ${staffIndex + 1}`;

        if (staff.status === "Working" || staff.energy <= 0) {
            showMessage(`${staffName} is unavailable.`);
            return;
        }

        if (
            window.StaffActivity &&
            !window.StaffActivity.start(staffIndex, order.dish.name)
        ) {
            showMessage(`${staffName} cannot start this task.`);
            return;
        }

        order.staffIndex = staffIndex;
        order.staffName = staffName;
        order.assigned = true;

        showMessage(`👨‍🍳 ${staffName} started ${order.dish.name}.`);

        renderOrders();
        startSimulation();
    }

    /* -----------------------------------------------------
       KITCHEN SIMULATION
       ----------------------------------------------------- */

    function startSimulation() {
        if (simulation.running) return;

        simulation.running = true;

        simulation.interval = setInterval(() => {
            const state = window.gameState;

            simulation.orders.forEach(order => {
                if (!order.assigned || order.completed) return;

                if (!state) return;

                const stationLevel =
                    state.kitchen?.[order.dish.station] || 0;

                const speed = 1 + stationLevel * 0.15;

                order.progress +=
                    (100 / order.dish.time) * speed;

                if (order.progress >= 100) {
                    order.progress = 100;
                    completeOrder(order);
                }
            });

            renderOrders();

            const hasActiveOrders = simulation.orders.some(
                order => order.assigned && !order.completed
            );

            if (!hasActiveOrders) {
                stopSimulation();
            }

        }, 1000);
    }

    /* -----------------------------------------------------
       COMPLETING ORDERS
       ----------------------------------------------------- */

    function completeOrder(order) {
        if (order.completed) return;

        const state = window.gameState;

        if (!state) return;

        if (state.ingredients < order.dish.ingredients) {
            order.assigned = false;
            order.progress = 0;

            window.StaffActivity?.cancel(order.staffIndex);

            order.staffIndex = null;
            order.staffName = "";

            showMessage("⚠️ Not enough ingredients!");

            return;
        }

        order.completed = true;

        /* *** Deduct ingredients and award money. */
        state.ingredients -= order.dish.ingredients;
        state.money += order.dish.reward;

        state.ordersCompleted =
            (state.ordersCompleted || 0) + 1;

        state.customersServed =
            (state.customersServed || 0) + 1;

        simulation.completed++;

        /* *** Release staff and award experience. */
        window.StaffActivity?.finish(order.staffIndex);

        /* *** Reward restaurant reputation. */
        if (typeof window.changeReputation === "function") {
            window.changeReputation(2);
        } else {
            state.reputation = Math.min(
                100,
                (state.reputation || 0) + 2
            );
        }

        /* *** Refresh resources and save. */
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

        updateStationDisplay();
    }

    /* -----------------------------------------------------
       STATION DISPLAY
       ----------------------------------------------------- */

    function updateStationDisplay() {
        ["prep", "stove"].forEach(station => {
            const active = simulation.orders.some(
                order =>
                    order.dish.station === station &&
                    order.assigned &&
                    !order.completed
            );

            const element = document.getElementById(
                `${station}-status`
            );

            if (element) {
                element.textContent = active
                    ? "👨‍🍳 In operation"
                    : "Available";
            }
        });
    }

    /* -----------------------------------------------------
       UTILITIES
       ----------------------------------------------------- */

    function stopSimulation() {
        if (simulation.interval) {
            clearInterval(simulation.interval);
        }

        simulation.interval = null;
        simulation.running = false;
    }

    function showMessage(message) {
        const element = document.getElementById("shift-message");

        if (element) {
            element.textContent = message;
        }
    }

    /* -----------------------------------------------------
       INITIALISATION
       ----------------------------------------------------- */

    function initialise() {
        if (!window.gameState) {
            console.error("Kitchen Harmony: gameState unavailable.");
            return;
        }

        createInterface();
        renderOrders();

        console.log("Kitchen Harmony simulation is ready!");
    }

    window.KitchenSimulation = {
        initialise,
        createOrder,
        assignOrder,
        renderOrders,
        getState: () => simulation
    };

    document.addEventListener("DOMContentLoaded", initialise);

})();
