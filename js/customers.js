
/* HIVEMIND: Kitchen Harmony
   Customer queue and order ticket management.
   Customer arrivals are controlled by KitchenSimulation.
*/

(() => {
    "use strict";

    let customers = [];
    let orders = [];
    let selectedOrderId = null;

    function notify(type, detail = {}) {
        window.dispatchEvent(
            new CustomEvent("hivemind:customers-" + type, {
                detail
            })
        );
    }

    function refresh() {
        const simulation = window.KitchenSimulation;

        if (!simulation) return;

        const state = simulation.getState();

        customers = state.customers;
        orders = state.orders;

        notify("updated", {
            customers: getCustomers(),
            orders: getOrders()
        });
    }

    function getCustomers() {
        return customers.map(customer => ({ ...customer }));
    }

    function getOrders() {
        return orders.map(order => ({ ...order }));
    }

    function getWaitingCustomers() {
        return customers.filter(customer =>
            ["waiting", "ordered", "impatient"].includes(customer.status)
        );
    }

    function getWaitingOrders() {
        return orders.filter(order =>
            ["waiting", "assigned", "preparing"].includes(order.status)
        );
    }

    function getCompletedOrders() {
        return orders.filter(order =>
            order.status === "completed"
        );
    }

    function getCustomer(customerId) {
        const customer = customers.find(item =>
            item.id === Number(customerId)
        );

        return customer ? { ...customer } : null;
    }

    function getOrder(orderId) {
        const order = orders.find(item =>
            item.id === Number(orderId)
        );

        return order ? { ...order } : null;
    }

    function selectOrder(orderId) {
        const order = getOrder(orderId);

        if (!order) {
            return {
                success: false,
                message: "Order ticket not found."
            };
        }

        selectedOrderId = Number(orderId);

        notify("order-selected", {
            order
        });

        return {
            success: true,
            order
        };
    }

    function getSelectedOrder() {
        return selectedOrderId === null
            ? null
            : getOrder(selectedOrderId);
    }

    function getOrderTicket(orderId) {
        const order = getOrder(orderId);

        if (!order) return null;

        const customer = getCustomer(order.customerId);

        return {
            orderId: order.id,
            customerName: customer?.name || "Customer",
            recipeName: order.recipeName,
            price: order.price,
            status: order.status,
            assignedStaff: order.assignedStaff,
            createdAt: order.createdAt
        };
    }

    function getCustomerPatience(customerId) {
        const customer = getCustomer(customerId);

        if (!customer) return 0;

        const elapsed = Date.now() - customer.arrivedAt;
        const remaining = Math.max(0, customer.patience - elapsed);

        return Math.round(
            (remaining / customer.patience) * 100
        );
    }

    function getStatistics() {
        return {
            total: customers.length,
            waiting: customers.filter(
                customer => customer.status === "waiting" ||
                    customer.status === "ordered"
            ).length,
            served: customers.filter(
                customer => customer.status === "served" ||
                    customer.status === "left"
            ).length,
            impatient: customers.filter(
                customer => customer.status === "impatient"
            ).length,
            totalOrders: orders.length,
            completed: orders.filter(
                order => order.status === "completed" ||
                    order.status === "served"
            ).length,
            missed: orders.filter(
                order => order.status === "missed"
            ).length
        };
    }

    function initialiseCustomers() {
        customers = [];
        orders = [];
        selectedOrderId = null;

        refresh();

        console.log(
            "HIVEMIND: Customer queue connected to automatic simulation."
        );

        return true;
    }

    // Listen to the single authoritative simulation.
    window.addEventListener("hivemind:customer-arrived", refresh);
    window.addEventListener("hivemind:order-created", refresh);
    window.addEventListener("hivemind:order-assigned", refresh);
    window.addEventListener("hivemind:order-completed", refresh);
    window.addEventListener("hivemind:payment-received", refresh);
    window.addEventListener("hivemind:customer-left", refresh);
    window.addEventListener("hivemind:customer-left-impatient", refresh);
    window.addEventListener("hivemind:simulation-updated", refresh);
    window.addEventListener("hivemind:simulation-reset", initialiseCustomers);

    window.CustomerSystem = {
        initialiseCustomers,
        refresh,
        getCustomers,
        getOrders,
        getWaitingCustomers,
        getWaitingOrders,
        getCompletedOrders,
        getCustomer,
        getOrder,
        selectOrder,
        getSelectedOrder,
        getOrderTicket,
        getCustomerPatience,
        getStatistics
    };

    // Compatibility with the existing game startup.
    window.initialiseCustomers = initialiseCustomers;

    console.log("HIVEMIND Customer System loaded.");
})();
