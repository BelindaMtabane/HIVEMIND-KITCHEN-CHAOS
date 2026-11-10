
(() => {
    "use strict";

    // =========================================================
    // HIVEMIND: KITCHEN HARMONY
    // Main game controller and isometric kitchen renderer
    // =========================================================

    const $ = (id) => document.getElementById(id);

    const CONFIG = {
        openingHour: 8,
        closingHour: 20,
        typingSeconds: 15,
        customerArrivalSeconds: 18,
        gameMinuteSeconds: 3,
        startingMoney: 500,
        startingIngredients: 100,
        startingQuality: 100,
        startingUtensils: 100,
        dayDurationSeconds: 360
    };

    const DEPARTMENTS = {
        reception: "Reception",
        service: "Service",
        preparation: "Preparation",
        cooking: "Cooking",
        support: "Kitchen Support"
    };

    const STAFF_START = [
        {
            id: "bella",
            name: "Bella",
            role: "Receptionist",
            department: "reception",
            x: 0.18,
            y: 0.38,
            color: "#d7a5a0",
            station: "Reception desk"
        },
        {
            id: "marcus",
            name: "Marcus",
            role: "Waiter",
            department: "service",
            x: 0.78,
            y: 0.30,
            color: "#8fb3d9",
            station: "Service counter"
        },
        {
            id: "olivia",
            name: "Olivia",
            role: "Main Chef",
            department: "cooking",
            x: 0.58,
            y: 0.48,
            color: "#d6b16d",
            station: "Cooking station"
        },
        {
            id: "tina",
            name: "Tina",
            role: "Food Preparation",
            department: "preparation",
            x: 0.36,
            y: 0.59,
            color: "#9dc5a1",
            station: "Preparation station"
        },
        {
            id: "sam",
            name: "Sam",
            role: "Kitchen Support",
            department: "support",
            x: 0.73,
            y: 0.67,
            color: "#b49bd5",
            station: "Plating station"
        },
        {
            id: "kevin",
            name: "Kevin",
            role: "Kitchen Support",
            department: "support",
            x: 0.24,
            y: 0.75,
            color: "#d39d72",
            station: "Cleaning and supply"
        }
    ];

    // These recipes are temporary examples.
    // Replace them with the user's real recipes when supplied.
    const RECIPES = [
        {
            id: "house-meal",
            name: "House Chicken Meal",
            description: "A sample chicken meal.",
            price: 85,
            ingredients: 12,
            stages: [
                {
                    department: "reception",
                    staff: "bella",
                    title: "Confirm the order",
                    instruction: "Confirm the customer's chicken meal order and send the ticket to food preparation."
                },
                {
                    department: "preparation",
                    staff: "tina",
                    title: "Prepare ingredients",
                    instruction: "Wash the ingredients, prepare the chicken, and organise the vegetables for cooking."
                },
                {
                    department: "cooking",
                    staff: "olivia",
                    title: "Cook the meal",
                    instruction: "Cook the chicken thoroughly, prepare the side dish, and check that the meal is ready."
                },
                {
                    department: "support",
                    staff: "sam",
                    title: "Plate the meal",
                    instruction: "Place the chicken and side dish neatly on a clean plate and check the presentation."
                },
                {
                    department: "service",
                    staff: "marcus",
                    title: "Deliver the meal",
                    instruction: "Check the completed order and deliver the chicken meal to the correct customer."
                }
            ]
        },
        {
            id: "daily-special",
            name: "Daily Special",
            description: "A sample restaurant special.",
            price: 100,
            ingredients: 15,
            stages: [
                {
                    department: "reception",
                    staff: "bella",
                    title: "Confirm the order",
                    instruction: "Confirm the daily special order and send the order ticket to food preparation."
                },
                {
                    department: "preparation",
                    staff: "tina",
                    title: "Prepare ingredients",
                    instruction: "Prepare the vegetables and organise all ingredients required for the daily special."
                },
                {
                    department: "cooking",
                    staff: "olivia",
                    title: "Cook the meal",
                    instruction: "Cook the daily special using the prepared ingredients and check that everything is ready."
                },
                {
                    department: "support",
                    staff: "kevin",
                    title: "Check and plate",
                    instruction: "Check the meal, use a clean plate, and arrange the daily special neatly for service."
                },
                {
                    department: "service",
                    staff: "marcus",
                    title: "Deliver the meal",
                    instruction: "Verify the daily special order and deliver the completed meal to the customer."
                }
            ]
        },
        {
            id: "chefs-choice",
            name: "Chef's Choice",
            description: "A sample chef-selected meal.",
            price: 120,
            ingredients: 18,
            stages: [
                {
                    department: "reception",
                    staff: "bella",
                    title: "Confirm the order",
                    instruction: "Confirm the chef's choice order and forward the ticket to the preparation department."
                },
                {
                    department: "preparation",
                    staff: "tina",
                    title: "Prepare ingredients",
                    instruction: "Measure and prepare the ingredients required for the chef's choice meal."
                },
                {
                    department: "cooking",
                    staff: "olivia",
                    title: "Cook the meal",
                    instruction: "Prepare the chef's choice meal, cook all ingredients correctly, and check the final result."
                },
                {
                    department: "support",
                    staff: "sam",
                    title: "Plate the meal",
                    instruction: "Arrange the chef's choice meal carefully and check the plate before service."
                },
                {
                    department: "service",
                    staff: "marcus",
                    title: "Deliver the meal",
                    instruction: "Confirm the chef's choice order and serve the completed meal to the correct customer."
                }
            ]
        },
        {
            id: "fresh-drink",
            name: "Fresh Drink",
            description: "A sample drink order.",
            price: 35,
            ingredients: 5,
            stages: [
                {
                    department: "reception",
                    staff: "bella",
                    title: "Confirm the order",
                    instruction: "Confirm the fresh drink order and forward the drink ticket to preparation."
                },
                {
                    department: "preparation",
                    staff: "tina",
                    title: "Prepare ingredients",
                    instruction: "Prepare the fresh ingredients and clean the equipment needed for the drink."
                },
                {
                    department: "cooking",
                    staff: "olivia",
                    title: "Prepare the drink",
                    instruction: "Prepare the fresh drink using the correct ingredients and check its quality."
                },
                {
                    department: "support",
                    staff: "kevin",
                    title: "Prepare for service",
                    instruction: "Place the finished drink in a clean serving glass and check its presentation."
                },
                {
                    department: "service",
                    staff: "marcus",
                    title: "Deliver the order",
                    instruction: "Check the fresh drink order and deliver it to the correct customer."
                }
            ]
        }
    ];

    const UPGRADES = [
        {
            id: "prep",
            name: "Preparation Equipment",
            description: "Increase ingredient efficiency.",
            cost: 150,
            effect: "ingredientEfficiency"
        },
        {
            id: "cooking",
            name: "Cooking Equipment",
            description: "Improve food quality.",
            cost: 200,
            effect: "qualityBonus"
        },
        {
            id: "utensils",
            name: "Professional Utensils",
            description: "Improve utensil condition.",
            cost: 125,
            effect: "utensilBonus"
        },
        {
            id: "team",
            name: "Team Coordination",
            description: "Improve overall kitchen harmony.",
            cost: 250,
            effect: "harmonyBonus"
        }
    ];

    const state = {
        day: 1,
        clockMinutes: CONFIG.openingHour * 60,
        money: CONFIG.startingMoney,
        quality: CONFIG.startingQuality,
        ingredients: CONFIG.startingIngredients,
        utensils: CONFIG.startingUtensils,
        efficiency: 100,
        harmony: 100,

        customersArrived: 0,
        customersServed: 0,
        customersLost: 0,
        ordersCompleted: 0,
        ordersMissed: 0,
        instructionsCorrect: 0,
        instructionsIncorrect: 0,

        running: false,
        paused: false,
        gameOver: false,
        tutorialSeen: false,

        selectedStaff: null,
        selectedOrder: null,
        selectedRecipe: null,
        typingStage: null,
        typingRemaining: 0,
        typingStartedAt: 0,
        typingInterval: null,

        lastCustomerAt: 0,
        lastGameTick: 0,
        elapsedSeconds: 0,
        nextOrderId: 1,

        staff: STAFF_START.map(member => ({
            ...member,
            status: "Available",
            busyUntil: 0,
            completedTasks: 0
        })),

        orders: [],
        unlockedUpgrades: [],
        settings: {
            music: 50,
            sound: 70,
            speed: 1
        }
    };

    const canvas = $("kitchenCanvas");
    const ctx = canvas.getContext("2d");

    let currentScreen = "mainMenu";
    let returnToPause = false;

    // =========================================================
    // GENERAL HELPERS
    // =========================================================

    function money(value) {
        return "R" + Math.floor(value).toLocaleString("en-ZA");
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        $("toastContainer").appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
    }

    function showScreen(id) {
        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.remove("active");
        });

        $(id).classList.add("active");
        currentScreen = id;
    }

    function showModal(id) {
        $(id).classList.remove("hidden");
    }

    function hideModal(id) {
        $(id).classList.add("hidden");
    }

    function hideAllModals() {
        document.querySelectorAll(".overlay").forEach(modal => {
            modal.classList.add("hidden");
        });
    }

    function saveGame() {
        const saveData = {
            day: state.day,
            clockMinutes: state.clockMinutes,
            money: state.money,
            quality: state.quality,
            ingredients: state.ingredients,
            utensils: state.utensils,
            efficiency: state.efficiency,
            harmony: state.harmony,
            customersArrived: state.customersArrived,
            customersServed: state.customersServed,
            customersLost: state.customersLost,
            ordersCompleted: state.ordersCompleted,
            ordersMissed: state.ordersMissed,
            instructionsCorrect: state.instructionsCorrect,
            instructionsIncorrect: state.instructionsIncorrect,
            elapsedSeconds: state.elapsedSeconds,
            nextOrderId: state.nextOrderId,
            staff: state.staff,
            orders: state.orders,
            unlockedUpgrades: state.unlockedUpgrades,
            tutorialSeen: state.tutorialSeen
        };

        localStorage.setItem("hivemindKitchenSave", JSON.stringify(saveData));
        showToast("Restaurant progress saved.");
    }

    function loadSavedRestaurant() {
        const raw = localStorage.getItem("hivemindKitchenSave");

        if (!raw) {
            showToast("No saved restaurant found.");
            return;
        }

        try {
            const data = JSON.parse(raw);

            Object.keys(data).forEach(key => {
                if (key in state && key !== "running" && key !== "paused") {
                    state[key] = data[key];
                }
            });

            state.running = false;
            state.paused = false;
            state.gameOver = false;

            startDayLoop();
            showScreen("gameScreen");
            renderAll();
            showToast("Your restaurant has been restored.");
        } catch (error) {
            console.error("HIVEMIND save loading failed:", error);
            showToast("The saved game could not be loaded.");
        }
    }

    function getStaff(id) {
        return state.staff.find(member => member.id === id);
    }

    function getOrder(id) {
        return state.orders.find(order => order.id === id);
    }

    function getCurrentStage(order) {
        if (!order || order.status === "completed") return null;
        const recipe = RECIPES.find(item => item.id === order.recipeId);
        return recipe ? recipe.stages[order.progress] || null : null;
    }

    function getRecipe(id) {
        return RECIPES.find(recipe => recipe.id === id);
    }

    function getNextStageStaff(order) {
        const stage = getCurrentStage(order);
        return stage ? getStaff(stage.staff) : null;
    }

    function getActiveOrders() {
        return state.orders.filter(order => order.status !== "completed" && order.status !== "missed");
    }

    // =========================================================
    // DAY AND CUSTOMER SYSTEM
    // =========================================================

    function resetDailyStats() {
        state.customersArrived = 0;
        state.customersServed = 0;
        state.customersLost = 0;
        state.ordersCompleted = 0;
        state.ordersMissed = 0;
        state.instructionsCorrect = 0;
        state.instructionsIncorrect = 0;
    }

    function startNewGame() {
        state.day = 1;
        state.clockMinutes = CONFIG.openingHour * 60;
        state.money = CONFIG.startingMoney;
        state.quality = CONFIG.startingQuality;
        state.ingredients = CONFIG.startingIngredients;
        state.utensils = CONFIG.startingUtensils;
        state.efficiency = 100;
        state.harmony = 100;
        state.elapsedSeconds = 0;
        state.nextOrderId = 1;
        state.orders = [];
        state.unlockedUpgrades = [];
        state.staff = STAFF_START.map(member => ({
            ...member,
            status: "Available",
            busyUntil: 0,
            completedTasks: 0
        }));

        resetDailyStats();

        state.tutorialSeen = false;
        state.running = false;
        state.paused = false;
        state.gameOver = false;

        localStorage.removeItem("hivemindKitchenSave");

        showScreen("gameScreen");
        renderAll();
        showModal("tutorialModal");
    }

    function beginNextDay() {
        hideAllModals();

        state.day += 1;
        state.clockMinutes = CONFIG.openingHour * 60;
        state.elapsedSeconds = 0;
        state.orders = [];
        state.running = false;
        state.paused = false;
        state.gameOver = false;

        state.staff.forEach(member => {
            member.status = "Available";
            member.busyUntil = 0;
        });

        resetDailyStats();
        startDayLoop();
        renderAll();
        showToast("Day " + state.day + " has started.");
    }

    function startDayLoop() {
        state.running = true;
        state.paused = false;
        state.gameOver = false;
        state.lastGameTick = Date.now();
        state.lastCustomerAt = state.elapsedSeconds;
        showScreen("gameScreen");
        renderAll();
    }

    function pauseGame() {
        if (!state.running || state.paused) return;

        state.paused = true;
        state.running = false;
        stopTypingTimer();
        showModal("pauseModal");
    }

    function continueGame() {
        hideAllModals();
        state.paused = false;
        state.running = true;
        state.lastGameTick = Date.now();
        renderAll();
    }

    function createCustomerOrder() {
        if (!state.running || state.paused || state.gameOver) return;

        const active = getActiveOrders();

        // Limit the queue to keep the kitchen manageable.
        if (active.length >= 8) {
            state.customersLost += 1;
            state.quality = clamp(state.quality - 2, 0, 100);
            state.harmony = clamp(state.harmony - 2, 0, 100);
            showToast("The customer queue is full. A customer left.");
            renderAll();
            return;
        }

        const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
        const order = {
            id: state.nextOrderId++,
            customer: "Customer " + (state.customersArrived + 1),
            recipeId: recipe.id,
            status: "waiting",
            progress: 0,
            patience: 100,
            createdAt: state.elapsedSeconds,
            qualityScore: 100
        };

        state.orders.push(order);
        state.customersArrived += 1;

        showToast("New order: " + recipe.name);
        renderAll();
    }

    function updateOrders(deltaSeconds) {
        state.orders.forEach(order => {
            if (order.status === "completed" || order.status === "missed") return;

            // Customers gradually lose patience while waiting.
            order.patience = clamp(order.patience - deltaSeconds * 0.42, 0, 100);

            if (order.patience <= 0) {
                order.status = "missed";
                state.customersLost += 1;
                state.ordersMissed += 1;
                state.quality = clamp(state.quality - 4, 0, 100);
                state.harmony = clamp(state.harmony - 3, 0, 100);
                showToast(order.customer + " left without their order.");
            }
        });

        state.orders = state.orders.filter(order => {
            return order.status !== "missed" ||
                state.elapsedSeconds - order.createdAt < 8;
        });
    }

    function finishOrder(order) {
        const recipe = getRecipe(order.recipeId);

        if (!recipe) return;

        order.status = "completed";
        state.ordersCompleted += 1;
        state.customersServed += 1;

        const qualityMultiplier = order.qualityScore / 100;
        const reward = Math.round(recipe.price * qualityMultiplier);

        state.money += reward;
        state.quality = clamp(
            state.quality * 0.7 + order.qualityScore * 0.3,
            0,
            100
        );

        state.harmony = clamp(state.harmony + 2, 0, 100);

        showToast(
            "Order completed! +" + money(reward) +
            " | Food quality: " + Math.round(order.qualityScore) + "%"
        );

        renderAll();
    }

    function completeOrderStage(order, staff, instructionAccuracy) {
        const stage = getCurrentStage(order);
        if (!stage) return;

        const recipe = getRecipe(order.recipeId);

        order.qualityScore = clamp(
            order.qualityScore + (instructionAccuracy - 0.8) * 12,
            0,
            100
        );

        if (instructionAccuracy >= 0.95) {
            state.instructionsCorrect += 1;
            state.harmony = clamp(state.harmony + 1, 0, 100);
        } else {
            state.instructionsIncorrect += 1;
            state.quality = clamp(state.quality - 1, 0, 100);
        }

        state.ingredients = Math.max(0, state.ingredients - Math.ceil(recipe.ingredients / 5));
        state.utensils = clamp(state.utensils - 0.3, 0, 100);

        staff.completedTasks += 1;
        staff.status = "Available";
        staff.busyUntil = 0;

        order.progress += 1;

        if (order.progress >= recipe.stages.length) {
            finishOrder(order);
        } else {
            order.status = "in-progress";
            const next = getCurrentStage(order);
            const nextStaff = getStaff(next.staff);

            showToast(
                stage.title + " completed. Next: " +
                nextStaff.name + " (" + nextStaff.role + ")."
            );
        }

        renderAll();
    }

    // =========================================================
    // GAME LOOP
    // =========================================================

    function gameLoop() {
        if (!state.running || state.paused || state.gameOver) return;

        const now = Date.now();
        const delta = Math.min((now - state.lastGameTick) / 1000, 1);
        state.lastGameTick = now;

        state.elapsedSeconds += delta * state.settings.speed;

        // Convert real elapsed seconds into the restaurant clock.
        const minutesPassed =
            (delta * state.settings.speed * 60) /
            CONFIG.gameMinuteSeconds;

        state.clockMinutes += minutesPassed;

        updateOrders(delta * state.settings.speed);

        // Automatically create customer orders.
        if (
            state.elapsedSeconds - state.lastCustomerAt >=
            CONFIG.customerArrivalSeconds
        ) {
            state.lastCustomerAt = state.elapsedSeconds;
            createCustomerOrder();
        }

        // Staff who are carrying out a task become available again.
        state.staff.forEach(member => {
            if (
                member.status === "Working" &&
                state.elapsedSeconds >= member.busyUntil
            ) {
                member.status = "Available";
            }
        });

        // Slowly reduce utensil condition over time.
        if (Math.floor(state.elapsedSeconds) % 20 === 0) {
            state.utensils = clamp(state.utensils - 0.02, 0, 100);
        }

        if (state.clockMinutes >= CONFIG.closingHour * 60) {
            endDay();
            return;
        }

        if (state.elapsedSeconds >= CONFIG.dayDurationSeconds) {
            endDay();
            return;
        }

        renderHUD();
        renderOrders();
        renderStaff();
        drawKitchen();
    }

    // =========================================================
    // STAFF SELECTION AND INSTRUCTION SYSTEM
    // =========================================================

    function selectStaff(staffId) {
        if (!state.running || state.paused) return;

        const staff = getStaff(staffId);
        if (!staff) return;

        if (staff.status === "Working") {
            showToast(staff.name + " is currently working.");
            return;
        }

        state.selectedStaff = staffId;
        state.selectedOrder = null;
        state.selectedRecipe = null;

        openStaffInstruction(staff);
        renderStaff();
        drawKitchen();
    }

    function openStaffInstruction(staff) {
        $("instructionTitle").textContent = staff.name + " — " + staff.role;
        $("instructionDescription").textContent =
            "Department: " + DEPARTMENTS[staff.department] +
            " | Workstation: " + staff.station;

        $("instructionFeedback").textContent = "";
        $("instructionFeedback").className = "feedback-message";
        $("instructionInput").value = "";
        $("instructionInput").disabled = true;
        $("instructionSubmitButton").disabled = true;

        renderStaffRecipeChoices(staff);
        updateTypingDisplay(CONFIG.typingSeconds);

        showModal("instructionModal");
    }

    function renderStaffRecipeChoices(staff) {
        const container = $("recipeList");
        container.innerHTML = "";

        const availableOrders = getActiveOrders().filter(order => {
            const stage = getCurrentStage(order);
            return stage && stage.staff === staff.id;
        });

        if (availableOrders.length === 0) {
            container.innerHTML =
                '<p class="muted-text">There are no orders currently waiting for this staff member. New customer orders arrive automatically.</p>';
            return;
        }

        availableOrders.forEach(order => {
            const recipe = getRecipe(order.recipeId);
            const stage = getCurrentStage(order);

            const button = document.createElement("button");
            button.className = "recipe-choice";
            button.innerHTML =
                "<strong>" + recipe.name + "</strong>" +
                "<small>" + order.customer + " · " + stage.title + "</small>";

            button.addEventListener("click", () => {
                selectOrderForStaff(order.id);
            });

            container.appendChild(button);
        });
    }

    function selectOrderForStaff(orderId) {
        const order = getOrder(orderId);
        const staff = getStaff(state.selectedStaff);

        if (!order || !staff) return;

        const stage = getCurrentStage(order);

        if (!stage || stage.staff !== staff.id) {
            showToast("This order is not assigned to this staff member.");
            return;
        }

        state.selectedOrder = order.id;
        state.selectedRecipe = order.recipeId;
        state.typingStage = stage;

        $("recipeReferenceTitle").textContent = getRecipe(order.recipeId).name;
        $("instructionPrompt").textContent = stage.instruction;
        $("instructionInput").value = "";
        $("instructionInput").disabled = false;
        $("instructionSubmitButton").disabled = false;

        document.querySelectorAll(".recipe-choice").forEach(button => {
            button.classList.remove("active");
            if (button.textContent.includes(getRecipe(order.recipeId).name)) {
                button.classList.add("active");
            }
        });

        startTypingTimer();
        $("instructionInput").focus();
    }

    function startTypingTimer() {
        stopTypingTimer();

        state.typingRemaining = CONFIG.typingSeconds;
        state.typingStartedAt = Date.now();

        updateTypingDisplay(state.typingRemaining);

        state.typingInterval = window.setInterval(() => {
            if (state.paused) return;

            const elapsed = (Date.now() - state.typingStartedAt) / 1000;
            state.typingRemaining = Math.max(
                0,
                CONFIG.typingSeconds - elapsed
            );

            updateTypingDisplay(state.typingRemaining);

            if (state.typingRemaining <= 0) {
                handleTypingTimeout();
            }
        }, 100);
    }

    function stopTypingTimer() {
        if (state.typingInterval) {
            clearInterval(state.typingInterval);
            state.typingInterval = null;
        }
    }

    function updateTypingDisplay(seconds) {
        const rounded = Math.ceil(seconds);
        $("typingTimer").textContent = rounded + "s";

        const percentage = clamp(
            (seconds / CONFIG.typingSeconds) * 100,
            0,
            100
        );

        $("typingTimerBar").style.width = percentage + "%";

        $("typingTimerBar").style.background =
            percentage > 50 ? "#70b78a" :
            percentage > 25 ? "#e5b96b" : "#dc7770";
    }

    function handleTypingTimeout() {
        stopTypingTimer();

        const order = getOrder(state.selectedOrder);
        const staff = getStaff(state.selectedStaff);

        if (!order || !staff) {
            hideModal("instructionModal");
            return;
        }

        state.instructionsIncorrect += 1;
        order.qualityScore = clamp(order.qualityScore - 12, 0, 100);
        state.quality = clamp(state.quality - 3, 0, 100);
        state.harmony = clamp(state.harmony - 2, 0, 100);

        $("instructionFeedback").textContent =
            "Time expired! The instruction was not completed. Food quality has been affected.";

        $("instructionFeedback").className = "feedback-message error";

        staff.status = "Available";
        showToast("Instruction time expired. Try again.");

        renderAll();

        window.setTimeout(() => {
            hideModal("instructionModal");
            state.selectedOrder = null;
            state.selectedRecipe = null;
            state.typingStage = null;
        }, 1400);
    }

    function submitInstruction(event) {
        event.preventDefault();

        const order = getOrder(state.selectedOrder);
        const staff = getStaff(state.selectedStaff);
        const stage = state.typingStage;

        if (!order || !staff || !stage) {
            showToast("Select an order before sending instructions.");
            return;
        }

        const typed = $("instructionInput").value.trim();
        const expected = stage.instruction.trim();

        if (!typed) {
            $("instructionFeedback").textContent =
                "Please type the instruction before submitting.";
            $("instructionFeedback").className = "feedback-message error";
            return;
        }

        stopTypingTimer();

        // Score accuracy by comparing the instruction with the recipe.
        const accuracy = calculateInstructionAccuracy(typed, expected);
        const timeRemaining = state.typingRemaining;

        const timeBonus = clamp(
            timeRemaining / CONFIG.typingSeconds,
            0,
            1
        );

        const finalAccuracy = clamp(
            accuracy * 0.85 + timeBonus * 0.15,
            0,
            1
        );

        const quality = Math.round(finalAccuracy * 100);

        staff.status = "Working";
        staff.busyUntil = state.elapsedSeconds + 4;

        if (accuracy < 0.65) {
            order.qualityScore = clamp(order.qualityScore - 10, 0, 100);
            state.instructionsIncorrect += 1;
            state.quality = clamp(state.quality - 2, 0, 100);

            $("instructionFeedback").textContent =
                "The instruction was unclear (" + quality +
                "% accuracy). The staff member may misunderstand the task.";

            $("instructionFeedback").className = "feedback-message error";

            showToast(staff.name + " needs clearer instructions.");

            renderAll();

            window.setTimeout(() => {
                staff.status = "Available";
                hideModal("instructionModal");
                renderAll();
            }, 1300);

            return;
        }

        const feedback = quality >= 95
            ? "Excellent! Your instruction was clear and accurate."
            : quality >= 80
                ? "Good instruction! The staff member understands the task."
                : "The instruction was understood, but some details were unclear.";

        $("instructionFeedback").textContent =
            feedback + " Accuracy: " + quality + "%";

        $("instructionFeedback").className = "feedback-message success";

        staff.status = "Working";
        state.instructionsCorrect += 1;

        window.setTimeout(() => {
            hideModal("instructionModal");
            state.selectedOrder = null;
            state.selectedRecipe = null;
            state.typingStage = null;

            completeOrderStage(order, staff, finalAccuracy);
        }, 1000);
    }

    function calculateInstructionAccuracy(typed, expected) {
        const normalise = value => value
            .toLowerCase()
            .replace(/[.,!?;:]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const a = normalise(typed);
        const b = normalise(expected);

        if (a === b) return 1;

        // Word-based similarity allows minor typing mistakes.
        const typedWords = a.split(" ").filter(Boolean);
        const expectedWords = b.split(" ").filter(Boolean);

        if (typedWords.length === 0) return 0;

        const expectedSet = new Set(expectedWords);
        let matches = 0;

        typedWords.forEach(word => {
            if (expectedSet.has(word)) matches += 1;
        });

        const coverage = matches / expectedWords.length;
        const lengthPenalty = Math.min(
            typedWords.length / expectedWords.length,
            1
        );

        return clamp(coverage * 0.85 + lengthPenalty * 0.15, 0, 1);
    }

    // =========================================================
    // ISOMETRIC KITCHEN DRAWING
    // =========================================================

    function isoPoint(x, y) {
        const width = canvas.width;
        const height = canvas.height;

        const centreX = width * 0.5;
        const topY = height * 0.17;
        const scaleX = width * 0.36;
        const scaleY = height * 0.31;

        return {
            x: centreX + (x - y) * scaleX,
            y: topY + (x + y) * scaleY
        };
    }

    function polygon(points, fill, stroke = null) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        points.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
        });

        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function drawIsoTile(x, y, color) {
        const p = isoPoint(x, y);
        const tileWidth = canvas.width * 0.09;
        const tileHeight = canvas.height * 0.075;

        polygon([
            { x: p.x, y: p.y },
            { x: p.x + tileWidth, y: p.y + tileHeight / 2 },
            { x: p.x, y: p.y + tileHeight },
            { x: p.x - tileWidth, y: p.y + tileHeight / 2 }
        ], color, "rgba(255,255,255,.035)");
    }

    function drawFloor() {
        const width = canvas.width;
        const height = canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#38513f");
        gradient.addColorStop(1, "#1c3027");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const color = (x + y) % 2 === 0
                    ? "#3d5946"
                    : "#36513f";

                drawIsoTile(x, y, color);
            }
        }

        // Kitchen perimeter walls.
        polygon([
            { x: width * .12, y: height * .26 },
            { x: width * .50, y: height * .05 },
            { x: width * .88, y: height * .26 },
            { x: width * .88, y: height * .33 },
            { x: width * .50, y: height * .12 },
            { x: width * .12, y: height * .33 }
        ], "#253b30");

        // Wall decoration and lighting.
        ctx.fillStyle = "rgba(230,190,112,.12)";
        ctx.fillRect(width * .20, height * .18, width * .60, 3);

        ctx.fillStyle = "rgba(245,230,190,.12)";
        ctx.fillRect(width * .25, height * .11, width * .50, 5);
    }

    function drawStation(x, y, label, type, color) {
        const p = isoPoint(x, y);
        const w = canvas.width * .105;
        const h = canvas.height * .065;

        // Counter top.
        polygon([
            { x: p.x, y: p.y - h },
            { x: p.x + w, y: p.y - h / 2 },
            { x: p.x, y: p.y },
            { x: p.x - w, y: p.y - h / 2 }
        ], color, "rgba(255,255,255,.2)");

        // Counter front.
        polygon([
            { x: p.x - w, y: p.y - h / 2 },
            { x: p.x, y: p.y },
            { x: p.x, y: p.y + h * .55 },
            { x: p.x - w, y: p.y + h * .05 }
        ], "#293c32");

        polygon([
            { x: p.x + w, y: p.y - h / 2 },
            { x: p.x, y: p.y },
            { x: p.x, y: p.y + h * .55 },
            { x: p.x + w, y: p.y + h * .05 }
        ], "#20332a");

        // Equipment icon.
        ctx.fillStyle = "#f0d49b";
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(type, p.x, p.y - h * .38);

        ctx.fillStyle = "#f4eee0";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(label, p.x, p.y + h * .9);
    }

    function drawStaffMember(member) {
        const p = isoPoint(member.x * 6, member.y * 6);
        const selected = state.selectedStaff === member.id;

        // Selection circle.
        ctx.beginPath();
        ctx.ellipse(
            p.x,
            p.y + 14,
            selected ? 29 : 23,
            selected ? 12 : 9,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = selected
            ? "rgba(229,185,107,.38)"
            : "rgba(0,0,0,.25)";

        ctx.fill();

        // Body.
        ctx.fillStyle = member.color;
        ctx.beginPath();
        ctx.roundRect(p.x - 12, p.y - 9, 24, 29, 7);
        ctx.fill();

        // Head.
        ctx.fillStyle = "#d9ae8b";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 18, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hair.
        ctx.fillStyle = "#3b3028";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 23, 10, Math.PI, Math.PI * 2);
        ctx.fill();

        // Face details.
        ctx.fillStyle = "#29231e";
        ctx.fillRect(p.x - 4, p.y - 19, 2, 2);
        ctx.fillRect(p.x + 3, p.y - 19, 2, 2);

        // Name label.
        ctx.fillStyle = selected ? "#f5d58c" : "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(member.name, p.x, p.y + 39);

        ctx.font = "10px sans-serif";
        ctx.fillStyle = member.status === "Working" ? "#f0c36e" : "#c3d4c7";
        ctx.fillText(member.status, p.x, p.y + 52);

        // Department ring.
        if (selected) {
            ctx.strokeStyle = "#f0c46e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y - 8, 17, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function drawKitchen() {
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFloor();

        // Department areas.
        drawStation(1.1, 1.0, "RECEPTION", "▤", "#806b50");
        drawStation(5.0, 1.0, "SERVICE", "▣", "#776b50");
        drawStation(2.0, 3.1, "PREPARATION", "✂", "#55765a");
        drawStation(4.1, 2.7, "COOKING", "♨", "#865a45");
        drawStation(4.8, 4.6, "PLATING", "◉", "#667b65");
        drawStation(1.4, 5.1, "SUPPORT", "▦", "#536c70");

        // Equipment behind the staff.
        drawStation(3.4, 1.2, "STORAGE", "▣", "#596c60");
        drawStation(5.4, 3.5, "OVENS", "♨", "#805b4b");

        // Staff.
        state.staff.forEach(drawStaffMember);

        // A small order indicator.
        const activeCount = getActiveOrders().length;
        ctx.fillStyle = "#f3d08c";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("ACTIVE KITCHEN ORDERS: " + activeCount, 20, 30);
    }

    function canvasStaffAt(x, y) {
        let closest = null;
        let closestDistance = Infinity;

        state.staff.forEach(member => {
            const p = isoPoint(member.x * 6, member.y * 6);
            const distance = Math.hypot(x - p.x, y - (p.y - 8));

            if (distance < closestDistance) {
                closestDistance = distance;
                closest = member;
            }
        });

        return closestDistance < 48 ? closest : null;
    }

    function handleCanvasClick(event) {
        if (!state.running || state.paused) return;

        const rect = canvas.getBoundingClientRect();

        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);

        const staff = canvasStaffAt(x, y);

        if (staff) {
            selectStaff(staff.id);
        }
    }

    // =========================================================
    // RENDERING
    // =========================================================

    function renderHUD() {
        $("dayLabel").textContent = "DAY " + state.day;

        const hours = Math.floor(state.clockMinutes / 60);
        const minutes = Math.floor(state.clockMinutes % 60);

        $("clockDisplay").textContent =
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0");

        $("moneyDisplay").textContent = money(state.money);
        $("qualityDisplay").textContent = Math.round(state.quality) + "%";
        $("customerCount").textContent = state.customersArrived;
        $("harmonyDisplay").textContent = Math.round(state.harmony) + "%";

        $("waitingCount").textContent = getActiveOrders().length;
        $("ingredientDisplay").textContent = Math.floor(state.ingredients) + " units";
        $("utensilDisplay").textContent = Math.round(state.utensils) + "%";
        $("efficiencyDisplay").textContent = Math.round(state.efficiency) + "%";
        $("staffCount").textContent = state.staff.length;
    }

    function renderOrders() {
        const container = $("ordersList");
        container.innerHTML = "";

        const activeOrders = getActiveOrders();

        if (activeOrders.length === 0) {
            container.innerHTML =
                '<p class="muted-text">No active orders. New customers will arrive automatically.</p>';
        }

        activeOrders.forEach(order => {
            const recipe = getRecipe(order.recipeId);
            const stage = getCurrentStage(order);

            const card = document.createElement("div");
            card.className = "order-card " +
                (order.status === "in-progress" ? "in-progress" : "");

            if (order.progress >= recipe.stages.length - 1) {
                card.classList.add("ready");
            }

            const progress = Math.round(
                (order.progress / recipe.stages.length) * 100
            );

            card.innerHTML = `
                <h3>${recipe.name}</h3>
                <p>${order.customer}</p>
                <p>Next: ${stage ? stage.title : "Ready"}</p>
                <div class="order-meta">
                    <span>Progress ${progress}%</span>
                    <span>Patience ${Math.round(order.patience)}%</span>
                </div>
                <div class="timer-track">
                    <div class="timer-fill" style="width:${order.patience}%"></div>
                </div>
            `;

            const staff = stage ? getStaff(stage.staff) : null;

            if (staff) {
                const button = document.createElement("button");
                button.textContent = "Assign: " + staff.name;
                button.addEventListener("click", () => selectStaff(staff.id));
                card.appendChild(button);
            }

            container.appendChild(card);
        });
    }

    function renderStaff() {
        const container = $("staffList");
        container.innerHTML = "";

        state.staff.forEach(member => {
            const card = document.createElement("button");
            card.className = "staff-card" +
                (state.selectedStaff === member.id ? " selected" : "");

            card.innerHTML = `
                <span class="staff-avatar">${member.name.charAt(0)}</span>
                <strong>${member.name}</strong>
                <small>${member.role}</small>
                <small>${member.station}</small>
                <span class="staff-status">${member.status}</span>
            `;

            card.addEventListener("click", () => selectStaff(member.id));
            container.appendChild(card);
        });

        if (state.selectedStaff) {
            const staff = getStaff(state.selectedStaff);
            $("activityMessage").textContent =
                staff.name + " selected — " + DEPARTMENTS[staff.department];
        } else {
            $("activityMessage").textContent =
                "Select a staff member to give instructions.";
        }
    }

    function renderRecipeBook() {
        const container = $("recipeBookContent");
        container.innerHTML = "";

        RECIPES.forEach(recipe => {
            const card = document.createElement("div");
            card.className = "info-card";

            const stages = recipe.stages.map((stage, index) => {
                return `
                    <p><strong>${index + 1}. ${stage.title}</strong><br>
                    ${stage.instruction}</p>
                `;
            }).join("");

            card.innerHTML = `
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
                <p>Price: ${money(recipe.price)} · Ingredients: ${recipe.ingredients}</p>
                ${stages}
            `;

            container.appendChild(card);
        });
    }

    function renderInventory() {
        $("inventoryContent").innerHTML = `
            <div class="info-card">
                <h3>Ingredients</h3>
                <p>${Math.floor(state.ingredients)} units available</p>
            </div>
            <div class="info-card">
                <h3>Utensil condition</h3>
                <p>${Math.round(state.utensils)}% condition</p>
            </div>
            <div class="info-card">
                <h3>Food quality</h3>
                <p>${Math.round(state.quality)}% average quality</p>
            </div>
            <div class="info-card">
                <h3>Kitchen efficiency</h3>
                <p>${Math.round(state.efficiency)}% efficiency</p>
            </div>
        `;
    }

    function renderUpgrades() {
        const container = $("upgradeList");
        container.innerHTML = "";

        UPGRADES.forEach(upgrade => {
            const bought = state.unlockedUpgrades.includes(upgrade.id);
            const card = document.createElement("div");
            card.className = "upgrade-card";

            card.innerHTML = `
                <h3>${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <p>Cost: ${money(upgrade.cost)}</p>
            `;

            const button = document.createElement("button");
            button.textContent = bought ? "PURCHASED" : "BUY UPGRADE";
            button.disabled = bought || state.money < upgrade.cost;

            button.addEventListener("click", () => purchaseUpgrade(upgrade));

            card.appendChild(button);
            container.appendChild(card);
        });
    }

    function renderAll() {
        renderHUD();
        renderOrders();
        renderStaff();
        renderRecipeBook();
        renderInventory();
        renderUpgrades();
        drawKitchen();
    }

    // =========================================================
    // INVENTORY AND UPGRADES
    // =========================================================

    function buyIngredients() {
        const cost = 100;

        if (state.money < cost) {
            showToast("Not enough money to buy ingredients.");
            return;
        }

        state.money -= cost;
        state.ingredients += 50;

        showToast("50 ingredient units purchased.");
        renderAll();
    }

    function purchaseUpgrade(upgrade) {
        if (state.unlockedUpgrades.includes(upgrade.id)) return;

        if (state.money < upgrade.cost) {
            showToast("Not enough money for this upgrade.");
            return;
        }

        state.money -= upgrade.cost;
        state.unlockedUpgrades.push(upgrade.id);

        switch (upgrade.effect) {
            case "ingredientEfficiency":
                state.efficiency = clamp(state.efficiency + 10, 0, 150);
                break;

            case "qualityBonus":
                state.quality = clamp(state.quality + 8, 0, 100);
                break;

            case "utensilBonus":
                state.utensils = clamp(state.utensils + 30, 0, 100);
                break;

            case "harmonyBonus":
                state.harmony = clamp(state.harmony + 15, 0, 100);
                break;
        }

        showToast(upgrade.name + " purchased.");
        renderAll();
    }

    // =========================================================
    // END OF DAY REPORT
    // =========================================================

    function endDay() {
        if (state.gameOver) return;

        state.running = false;
        state.paused = false;
        state.gameOver = true;

        stopTypingTimer();

        const completed = state.ordersCompleted;
        const missed = state.ordersMissed;
        const served = state.customersServed;
        const lost = state.customersLost;

        $("reportTitle").textContent = "Day " + state.day + " Complete";
        $("reportSubtitle").textContent =
            "Your restaurant has closed. Here is your daily performance.";

        $("reportContent").innerHTML = `
            <div class="report-card">
                <strong>${served}</strong>
                <span>Customers served</span>
            </div>
            <div class="report-card">
                <strong>${lost}</strong>
                <span>Customers lost</span>
            </div>
            <div class="report-card">
                <strong>${completed}</strong>
                <span>Orders completed</span>
            </div>
            <div class="report-card">
                <strong>${missed}</strong>
                <span>Orders missed</span>
            </div>
            <div class="report-card">
                <strong>${Math.round(state.quality)}%</strong>
                <span>Kitchen quality</span>
            </div>
            <div class="report-card">
                <strong>${Math.round(state.harmony)}%</strong>
                <span>Team harmony</span>
            </div>
            <div class="report-card">
                <strong>${state.instructionsCorrect}</strong>
                <span>Correct instructions</span>
            </div>
            <div class="report-card">
                <strong>${state.instructionsIncorrect}</strong>
                <span>Incorrect instructions</span>
            </div>
            <div class="report-card">
                <strong>${money(state.money)}</strong>
                <span>Restaurant balance</span>
            </div>
            <div class="report-card">
                <strong>${Math.floor(state.ingredients)}</strong>
                <span>Ingredient units remaining</span>
            </div>
        `;

        showModal("reportModal");
        saveGame();
    }

    // =========================================================
    // SETTINGS
    // =========================================================

    function updateSettingsDisplay() {
        $("musicValue").textContent = state.settings.music + "%";
        $("soundValue").textContent = state.settings.sound + "%";
    }

    function openSettings(fromPause) {
        returnToPause = Boolean(fromPause);
        hideAllModals();
        showScreen("settingsScreen");

        $("musicVolume").value = state.settings.music;
        $("soundVolume").value = state.settings.sound;
        $("gameSpeed").value = state.settings.speed;

        updateSettingsDisplay();
    }

    function closeSettings() {
        state.settings.music = Number($("musicVolume").value);
        state.settings.sound = Number($("soundVolume").value);
        state.settings.speed = Number($("gameSpeed").value);

        updateSettingsDisplay();

        if (returnToPause && !state.gameOver) {
            showScreen("gameScreen");
            showModal("pauseModal");
        } else {
            showScreen("mainMenu");
        }
    }

    // =========================================================
    // MAIN MENU AND BUTTON EVENTS
    // =========================================================

    function openRecipeBook() {
        renderRecipeBook();
        showModal("recipeModal");
    }

    function openInventory() {
        renderInventory();
        showModal("inventoryModal");
    }

    function openUpgrades() {
        renderUpgrades();
        showModal("upgradeModal");
    }

    function closeOverlay(event) {
        const targetId = event.currentTarget.dataset.close;
        hideModal(targetId);
    }

    function bindEvents() {
        $("playButton").addEventListener("click", startNewGame);
        $("resumeButton").addEventListener("click", loadSavedRestaurant);
        $("settingsButton").addEventListener("click", () => openSettings(false));

        $("saveSettingsButton").addEventListener("click", closeSettings);
        $("closeSettingsButton").addEventListener("click", closeSettings);

        $("musicVolume").addEventListener("input", updateSettingsDisplay);
        $("soundVolume").addEventListener("input", updateSettingsDisplay);

        $("tutorialStartButton").addEventListener("click", () => {
            hideModal("tutorialModal");
            state.tutorialSeen = true;
            startDayLoop();
            createCustomerOrder();
        });

        $("pauseButton").addEventListener("click", pauseGame);
        $("continueButton").addEventListener("click", continueGame);

        $("pauseSaveButton").addEventListener("click", saveGame);

        $("pauseSettingsButton").addEventListener("click", () => {
            openSettings(true);
        });

        $("returnMenuButton").addEventListener("click", () => {
            saveGame();
            state.running = false;
            state.paused = false;
            hideAllModals();
            showScreen("mainMenu");
        });

        $("pauseInventoryButton").addEventListener("click", openInventory);
        $("pauseUpgradeButton").addEventListener("click", openUpgrades);
        $("pauseRecipeButton").addEventListener("click", openRecipeBook);

        $("recipeButton").addEventListener("click", openRecipeBook);
        $("inventoryButton").addEventListener("click", openInventory);
        $("upgradeButton").addEventListener("click", openUpgrades);

        $("buyIngredientsButton").addEventListener("click", buyIngredients);
        $("inventoryBuyButton").addEventListener("click", buyIngredients);

        $("menuButton").addEventListener("click", pauseGame);

        $("instructionForm").addEventListener("submit", submitInstruction);
        canvas.addEventListener("click", handleCanvasClick);

        $("nextDayButton").addEventListener("click", beginNextDay);

        $("reportMenuButton").addEventListener("click", () => {
            hideAllModals();
            showScreen("mainMenu");
        });

        document.querySelectorAll("[data-close]").forEach(button => {
            button.addEventListener("click", closeOverlay);
        });

        // Escape pauses gameplay or closes an open information window.
        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;

            if (!$("instructionModal").classList.contains("hidden")) {
                stopTypingTimer();
                hideModal("instructionModal");
                return;
            }

            if (state.running && !state.paused) {
                pauseGame();
            }
        });
    }

    // =========================================================
    // INITIALISATION
    // =========================================================

    function initialise() {
        bindEvents();

        const saved = localStorage.getItem("hivemindKitchenSave");
        $("resumeButton").disabled = !saved;

        showScreen("mainMenu");
        renderAll();
        updateSettingsDisplay();

        window.setInterval(gameLoop, 100);
        window.setInterval(() => {
            $("resumeButton").disabled =
                !localStorage.getItem("hivemindKitchenSave");
        }, 1500);

        console.log("HIVEMIND: Kitchen Harmony initialised.");
        console.log("Kitchen departments:", DEPARTMENTS);
        console.log("Starting staff:", state.staff.length);
        console.log("Temporary sample recipes:", RECIPES.length);
    }

    initialise();

})();

