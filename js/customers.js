// Initialise customer system after game state.
function initialiseCustomers() {
    if (!window.gameState) {
        console.error("Cannot initialise customers: game state is missing.");
        return;
    }

    // *** Create the monitoring dashboard without starting customer arrivals.
    createCustomerDashboard();

    // *** Display the initial state while the player is still on the main menu.
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
