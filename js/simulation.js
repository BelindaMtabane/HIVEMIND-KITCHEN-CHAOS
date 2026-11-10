
/* HIVEMIND: Kitchen Harmony
   Core customer and order simulation.
   Automatic arrivals — no manual order-generation button.
*/

(() => {
    "use strict";

    const CONFIG = {
        firstArrivalDelay: 4000,
        minimumArrivalInterval: 12000,
        maximumArrivalInterval: 18000,
        maximumWaitingCustomers: 5,
        customerPatience: 90000,
        orderPreparationTime: 12000,
        paymentPerOrder: 50
    };

    const STAFF = [
        { id: "bella", name: "Bella", role: "Reception" },
        { id: "marcus", name: "Marcus", role: "Service" },
        { id: "olivia", name: "Chef Olivia", role: "Cooking" },
        { id: "tina", name: "Tina", role: "Preparation" },
        { id: "sam", name: "Sam", role: "Kitchen Support" },
        { id: "kevin", name: "Kevin", role: "Kitchen Support" }
    ];

    let customers = [];
    let orders = [];
    let nextCustomerId = 1;
    let nextOrderId = 1;
    let running = false;
    let arrivalTimer = null;
    let updateTimer = null;
    let currentDay = 1;

    const listeners = new Set();

    function notify(type, data = {}) {
        const event = { type, data, state: getState() };

        listeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error("Simulation listener error:", error);
            }
        });

        window.dispatchEvent(
            new CustomEvent("hivemind:" + type, { detail: event })
        );
    }

    function getRecipes() {
        return (
            window.KitchenRecipes ||
            window.RECIPE_BOOK ||
            window.recipes ||
            []
        );
    }

    function chooseRecipe() {
        const recipes = getRecipes();

        if (Array.isArray(recipes) && recipes.length) {
            return recipes[Math.floor(Math.random() * recipes.length)];
        }

        if (recipes && typeof recipes === "object") {
            const values = Object.values(recipes);
            if (values.length) {
                return values[Math.floor(Math.random() * values.length)];
            }
        }

        return {
            id: "house-special",
            name: "House Special",
            price: CONFIG.paymentPerOrder,
            instructions: []
        };
    }

    function getArrivalInterval() {
        const reduction = Math.min((currentDay - 1) * 500, 3000);

        const minimum = Math.max(
            8000,
            CONFIG.minimumArrivalInterval - reduction
        );

        const maximum = Math.max(
            minimum + 2000,
            CONFIG.maximumArrivalInterval - reduction
        );

        return minimum + Math.random() * (maximum - minimum);
    }

    function createCustomer() {
        if (!running) return null;

        const waiting = customers.filter(
            customer => customer.status === "waiting"
        ).length;

        if (waiting >= CONFIG.maximumWaitingCustomers) {
            notify("customer-arrival-skipped", {
                reason: "Waiting area is full."
            });
            return null;
        }

        const customer = {
            id: nextCustomerId++,
            name: "Customer " + (nextCustomerId - 1),
            status: "waiting",
            arrivedAt: Date.now(),
            patience: CONFIG.customerPatience,
            orderId: null
        };

        customers.push(customer);

        notify("customer-arrived", customer);

        // Customers create their own orders automatically.
        createOrder(customer.id);

        return customer;
    }

    function createOrder(customerId) {
        const customer = customers.find(
            item => item.id === customerId
        );

        if (!customer || !running) return null;

        const recipe = chooseRecipe();

        const order = {
            id: nextOrderId++,
            customerId,
            recipeId: recipe.id || "unknown",
            recipeName: recipe.name || recipe.title || "House Special",
            instructions: Array.isArray(recipe.instructions)
                ? [...recipe.instructions]
                : [],
            price: Number(recipe.price) || CONFIG.paymentPerOrder,
            status: "waiting",
            assignedStaff: null,
            createdAt: Date.now(),
            completedAt: null
        };

        customer.orderId = order.id;
        customer.status = "ordered";

        orders.push(order);

        notify("order-created", order);

        return order;
    }

    function assignOrder(orderId, staffId) {
        const order = orders.find(item => item.id === orderId);
        const staff = STAFF.find(item => item.id === staffId);

        if (!order || !staff || order.status !== "waiting") {
            return false;
        }

        order.assignedStaff = staffId;
        order.status = "assigned";

        notify("order-assigned", {
            order,
            staff
        });

        return true;
    }

    function completeOrder(orderId) {
        const order = orders.find(item => item.id === orderId);

        if (!order || !["assigned", "preparing"].includes(order.status)) {
            return false;
        }

        order.status = "completed";
        order.completedAt = Date.now();

        notify("order-completed", order);

        return true;
    }

    function serveOrder(orderId) {
        const order = orders.find(item => item.id === orderId);

        if (!order || order.status !== "completed") {
            return false;
        }

        const customer = customers.find(
            item => item.id === order.customerId
        );

        if (!customer) return false;

        order.status = "served";
        customer.status = "served";

        const payment = order.price;

        // Integrate with the existing economy where available.
        if (typeof window.changeMoney === "function") {
            window.changeMoney(payment);
        } else if (
            window.gameState &&
            typeof window.gameState.money === "number"
        ) {
            window.gameState.money += payment;
        }

        notify("payment-received", {
            customer,
            order,
            amount: payment
        });

        customer.status = "left";
        customer.leftAt = Date.now();

        notify("customer-left", customer);

        return true;
    }

    function updateCustomers() {
        if (!running) return;

        const now = Date.now();

        customers.forEach(customer => {
            if (
                customer.status === "waiting" ||
                customer.status === "ordered"
            ) {
                const elapsed = now - customer.arrivedAt;

                if (elapsed >= customer.patience) {
                    customer.status = "impatient";

                    const order = orders.find(
                        item => item.id === customer.orderId
                    );

                    if (
                        order &&
                        !["served", "completed"].includes(order.status)
                    ) {
                        order.status = "missed";
                    }

                    notify("customer-left-impatient", customer);
                }
            }
        });

        notify("simulation-updated");
    }

    function scheduleNextArrival() {
        if (!running) return;

        clearTimeout(arrivalTimer);

        arrivalTimer = setTimeout(() => {
            if (!running) return;

            createCustomer();
            scheduleNextArrival();
        }, getArrivalInterval());
    }

    function start() {
        if (running) return;

        running = true;

        notify("simulation-started", {
            day: currentDay
        });

        // First customer arrives after a short introduction delay.
        arrivalTimer = setTimeout(() => {
            if (!running) return;

            createCustomer();
            scheduleNextArrival();
        }, CONFIG.firstArrivalDelay);

        updateTimer = setInterval(updateCustomers, 1000);
    }

    function stop() {
        running = false;

        clearTimeout(arrivalTimer);
        clearInterval(updateTimer);

        arrivalTimer = null;
        updateTimer = null;

        notify("simulation-stopped");
    }

    function setDay(day) {
        currentDay = Math.max(1, Number(day) || 1);

        notify("day-changed", {
            day: currentDay
        });
    }

    function reset() {
        stop();

        customers = [];
        orders = [];
        nextCustomerId = 1;
        nextOrderId = 1;
        currentDay = 1;

        notify("simulation-reset");
    }

    function getState() {
        return {
            running,
            day: currentDay,
            customers: customers.map(item => ({ ...item })),
            orders: orders.map(item => ({ ...item })),
            staff: STAFF.map(item => ({ ...item })),
            totalCustomers: customers.length,
            completedOrders: orders.filter(
                item => item.status === "served"
            ).length
        };
    }

    function subscribe(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }

    window.KitchenSimulation = {
        start,
        stop,
        reset,
        setDay,
        createCustomer,
        createOrder,
        assignOrder,
        completeOrder,
        serveOrder,
        getState,
        subscribe,
        get running() {
            return running;
        }
    };

})();
