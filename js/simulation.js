
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
        running: false,
        reservedIngredients: 0,
        initialised: false
    };

    /* -----------------------------------------------------
       UTILITIES
       ----------------------------------------------------- */

    // *** Escape dynamic text before inserting it into HTML.
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function getGameState() {
        return window.gameState || null;
    }

    function getStaff() {
        return Array.isArray(window.staffMembers)
            ? window.staffMembers
            : [];
    }

    function getStaffName(staff, index) {
        return staff?.name ||
            staff?.fullName ||
            `Staff ${index + 1}`;
    }

    // *** Use stable IDs when available, while retaining index compatibility.
    function getStaffId(staff, index) {
        return staff?.id ??
            staff?.staffId ??
            `staff-index-${index}`;
    }

    function findStaffById(staffId) {
        const members = getStaff();

        return members.findIndex((member, index) =>
            String(getStaffId(member, index)) === String(staffId)
        );
    }

    function isStaffAvailable(staff) {
        if (!staff) return false;

        const status = String(staff.status || "").toLowerCase();

        return status !== "working" &&
            status !== "unavailable" &&
            status !== "resting" &&
            Number(staff.energy ?? 100) > 0;
    }

    function getAvailableIngredients() {
        const state = getGameState();

        if (!state) return 0;

        return Math.max(
            0,
            Number(state.ingredients || 0) -
            simulation.reservedIngredients
        );
    }

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

            <div id="shift-resource-status">
                Available ingredients:
                <strong id="shift-ingredients">0</strong>
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
            staffId: null,
            staffName: "",
            ingredientsReserved: false
        };

        simulation.orders.push(order);

        showMessage(`📥 New order: ${dish.name}!`);

        renderOrders();

        return order;
    }

    function renderOrders() {
        const container = document.getElementById("shift-orders");

        if (!container) return;

        const activeOrders = simulation.orders.filter(
            order => !order.completed
        );

        const countElement =
            document.getElementById("active-order-count");

        if (countElement) {
            countElement.textContent =
                `${activeOrders.length} active`;
        }

        const ingredientsElement =
            document.getElementById("shift-ingredients");

        if (ingredientsElement) {
            ingredientsElement.textContent =
                getAvailableIngredients();
        }

        if (simulation.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-orders">
                    <span>🍽️</span>
                    <strong>No orders yet!</strong>
                    <p>Start your kitchen service by receiving an order.</p>
                </div>
            `;

            updateStationDisplay();
            return;
        }

        container.innerHTML = simulation.orders.map(order => {
            const dish = order.dish;

            return `
                <article class="shift-order">

                    <div class="order-card-heading">
                        <span class="order-food-icon">
                            ${dish.icon}
                        </span>

                        <div>
                            <h4>${escapeHTML(dish.name)}</h4>
                            <small>Order #${order.id}</small>
                        </div>
                    </div>

                    <div class="order-details">
                        <span>🥕 ${dish.ingredients} ingredients</span>
                        <span>💰 $${dish.reward}</span>
                        <span>⏱️ ${dish.time}s</span>
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

                                <small>
                                    ${Math.floor(order.progress)}% prepared
                                </small>
                            </div>

                            ${
                                order.assigned
                                ? `
                                    <div class="order-working">
                                        👨‍🍳 ${escapeHTML(order.staffName)}
                                        is working
                                    </div>

                                    <button
                                        data-cancel-order="${order.id}"
                                        class="cancel-order-btn"
                                    >
                                        Cancel Assignment
                                    </button>
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

        container.querySelectorAll("[data-cancel-order]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    cancelOrder(Number(button.dataset.cancelOrder));
                });
            });

        updateStationDisplay();
    }

    function getStaffOptions() {
        const members = getStaff();

        if (!members.length) {
            return `<option value="">No staff available</option>`;
        }

        return `
            <option value="">Choose staff member</option>

            ${members.map((member, index) => {
                const name = getStaffName(member, index);
                const unavailable = !isStaffAvailable(member);

                return `
                    <option
                        value="${index}"
                        ${unavailable ? "disabled" : ""}
                    >
                        ${escapeHTML(name)}
                        ${unavailable ? " (Unavailable)" : ""}
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

        if (!order || order.assigned || order.completed) return false;

        const select = document.querySelector(
            `[data-order-staff="${orderId}"]`
        );

        if (!select || select.value === "") {
            showMessage("Please choose a staff member.");
            return false;
        }

        const staffIndex = Number(select.value);
        const staff = getStaff()[staffIndex];

        if (!staff) {
            showMessage("Staff member could not be found.");
            return false;
        }

        const staffName = getStaffName(staff, staffIndex);

        if (!isStaffAvailable(staff)) {
            showMessage(`${staffName} is unavailable.`);
            renderOrders();
            return false;
        }

        // *** Check ingredients before allowing work to begin.
        if (getAvailableIngredients() < order.dish.ingredients) {
            showMessage(
                `⚠️ Not enough available ingredients for ${order.dish.name}!`
            );
            return false;
        }

        // *** Preserve compatibility with the existing StaffActivity system.
        if (
            window.StaffActivity &&
            typeof window.StaffActivity.start === "function"
        ) {
            if (!window.StaffActivity.start(staffIndex, order.dish.name)) {
                showMessage(`${staffName} cannot start this task.`);
                return false;
            }
        }

        order.staffIndex = staffIndex;
        order.staffId = getStaffId(staff, staffIndex);
        order.staffName = staffName;
        order.assigned = true;

        // *** Reserve ingredients to prevent multiple orders
        // *** from spending the same ingredients.
        order.ingredientsReserved = true;
        simulation.reservedIngredients += order.dish.ingredients;

        showMessage(`👨‍🍳 ${staffName} started ${order.dish.name}.`);

        renderOrders();
        startSimulation();

        return true;
    }

    // *** Release reserved ingredients and staff when an assignment is cancelled.
    function releaseOrderResources(order) {
        if (order.ingredientsReserved) {
            simulation.reservedIngredients = Math.max(
                0,
                simulation.reservedIngredients - order.dish.ingredients
            );

            order.ingredientsReserved = false;
        }

        if (order.staffIndex !== null) {
            const currentIndex = order.staffId !== null
                ? findStaffById(order.staffId)
                : -1;

            const staffIndex = currentIndex >= 0
                ? currentIndex
                : order.staffIndex;

            window.StaffActivity?.cancel?.(staffIndex);
        }

        order.assigned = false;
        order.staffIndex = null;
        order.staffId = null;
        order.staffName = "";
        order.progress = 0;
    }

    function cancelOrder(orderId) {
        const order = simulation.orders.find(
            item => item.id === orderId
        );

        if (!order || !order.assigned || order.completed) return false;

        releaseOrderResources(order);

        showMessage(`Order #${order.id} assignment cancelled.`);

        renderOrders();

        const hasActiveOrders = simulation.orders.some(
            item => item.assigned && !item.completed
        );

        if (!hasActiveOrders) {
            stopSimulation();
        }

        return true;
    }

    /* -----------------------------------------------------
       KITCHEN SIMULATION
       ----------------------------------------------------- */

    function startSimulation() {
        if (simulation.running) return;

        simulation.running = true;

        simulation.interval = setInterval(() => {
            const state = getGameState();

            if (!state) {
                stopSimulation();
                return;
            }

            simulation.orders.forEach(order => {
                if (!order.assigned || order.completed) return;

                const stationLevel = Math.max(
                    0,
                    Number(state.kitchen?.[order.dish.station] || 0)
                );

                // *** Kitchen station upgrades increase preparation speed.
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

        const state = getGameState();

        if (!state) return;

        // *** Ingredients were reserved when the order was assigned.
        // *** Check again in case another system changed the resources.
        if (Number(state.ingredients || 0) < order.dish.ingredients) {
            releaseOrderResources(order);

            showMessage("⚠️ Not enough ingredients! Order cancelled.");

            return;
        }

        order.completed = true;

        // *** Deduct ingredients and award money.
        state.ingredients -= order.dish.ingredients;
        state.money = (Number(state.money) || 0) + order.dish.reward;

        // *** Release the ingredient reservation without cancelling staff.
        if (order.ingredientsReserved) {
            simulation.reservedIngredients = Math.max(
                0,
                simulation.reservedIngredients - order.dish.ingredients
            );

            order.ingredientsReserved = false;
        }

        state.ordersCompleted =
            (state.ordersCompleted || 0) + 1;

        state.customersServed =
            (state.customersServed || 0) + 1;

        simulation.completed++;

        // *** Release staff using their current position if their array moved.
        if (order.staffIndex !== null) {
            const currentIndex = order.staffId !== null
                ? findStaffById(order.staffId)
                : -1;

            const staffIndex = currentIndex >= 0
                ? currentIndex
                : order.staffIndex;

            window.StaffActivity?.finish?.(staffIndex);
        }

        // *** Reward restaurant reputation.
        if (typeof window.changeReputation === "function") {
            window.changeReputation(2);
        } else {
            state.reputation = Math.min(
                100,
                (Number(state.reputation) || 0) + 2
            );
        }

        // *** Refresh resources and save.
        if (typeof window.updateResources === "function") {
            window.updateResources();
        }

        if (typeof window.saveGame === "function") {
            window.saveGame();
        }

        const completedElement =
            document.getElementById("shift-completed");

        if (completedElement) {
            completedElement.textContent = simulation.completed;
        }

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

            const stationElement = document.querySelector(
                `.shift-station[data-station="${station}"]`
            );

            if (stationElement) {
                stationElement.classList.toggle("station-active", active);
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

    // *** Refresh the interface when staff or resources change elsewhere.
    function refresh() {
        renderOrders();
    }

    /* -----------------------------------------------------
       INITIALISATION
       ----------------------------------------------------- */

    function initialise() {
        if (simulation.initialised) return;

        if (!getGameState()) {
            console.error(
                "Kitchen Harmony: gameState unavailable. " +
                "Call KitchenSimulation.initialise() after game initialisation."
            );
            return;
        }

        createInterface();

        simulation.initialised = true;

        const completedElement =
            document.getElementById("shift-completed");

        if (completedElement) {
            completedElement.textContent = simulation.completed;
        }

        renderOrders();

        console.log("Kitchen Harmony simulation is ready!");
    }

    window.KitchenSimulation = {
        initialise,
        createOrder,
        assignOrder,
        cancelOrder,
        renderOrders,
        refresh,
        getState: () => simulation,
        getAvailableIngredients
    };

    // *** Support scripts loaded before or after DOMContentLoaded.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }

})();

