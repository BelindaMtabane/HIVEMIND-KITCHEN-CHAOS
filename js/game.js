
/* =========================================================
   HIVEMIND: KITCHEN HARMONY
   Complete main gameplay controller
   File: js/game.js
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       1. GAME CONFIGURATION
    ===================================================== */

    const SAVE_KEY = "hivemindKitchenHarmonySave";

    const MAX_DAYS = 30;
    const EXTRA_CUSTOMERS = 2;
    const STARTING_MONEY = 500;
    const STARTING_INGREDIENTS = 100;
    const STARTING_REPUTATION = 50;

    const DAY_START_MINUTES = 8 * 60;
    const DAY_LENGTH_MINUTES = 12 * 60;

    const DEFAULT_SETTINGS = {
        gameSpeed: 1,
        sound: true
    };

    /* =====================================================
       2. RECIPES
       Difficulty controls instruction complexity.
       It does NOT control the daily success target.
    ===================================================== */

    const RECIPES = [
        {
            name: "Classic Garden Salad",
            difficulty: 1,
            description: "Fresh vegetables with a light dressing.",
            ingredients: ["Lettuce", "Tomato", "Cucumber"],
            station: "Preparation Station",
            instruction: "Wash the lettuce chop the tomato and cucumber then mix everything in a bowl.",
            time: 8,
            cost: 8,
            reward: 35
        },
        {
            name: "Golden French Fries",
            difficulty: 1,
            description: "Crispy golden potato fries.",
            ingredients: ["Potatoes", "Cooking Oil", "Salt"],
            station: "Frying Station",
            instruction: "Peel the potatoes cut them into strips and fry until golden then season with salt.",
            time: 9,
            cost: 7,
            reward: 30
        },
        {
            name: "Cheese Toastie",
            difficulty: 1,
            description: "A warm toasted cheese sandwich.",
            ingredients: ["Bread", "Cheese", "Butter"],
            station: "Grill Station",
            instruction: "Spread butter on the bread add cheese and grill both sides until golden.",
            time: 9,
            cost: 9,
            reward: 40
        },
        {
            name: "Tomato Soup",
            difficulty: 1,
            description: "A comforting tomato soup.",
            ingredients: ["Tomatoes", "Onion", "Cream"],
            station: "Cooking Station",
            instruction: "Chop the onion and tomatoes simmer them together and stir in the cream.",
            time: 11,
            cost: 12,
            reward: 45
        },
        {
            name: "Chicken Wrap",
            difficulty: 1,
            description: "A simple grilled chicken wrap.",
            ingredients: ["Chicken", "Lettuce", "Wrap"],
            station: "Grill Station",
            instruction: "Grill the chicken slice it and place it inside the wrap with fresh lettuce.",
            time: 12,
            cost: 14,
            reward: 50
        },
        {
            name: "Creamy Mushroom Pasta",
            difficulty: 2,
            description: "Pasta with creamy mushroom sauce.",
            ingredients: ["Pasta", "Mushrooms", "Cream", "Garlic"],
            station: "Cooking Station",
            instruction: "Boil the pasta saute the mushrooms and garlic then add cream and combine the sauce with the pasta.",
            time: 15,
            cost: 18,
            reward: 65
        },
        {
            name: "Classic Beef Burger",
            difficulty: 2,
            description: "A juicy beef burger with fresh toppings.",
            ingredients: ["Beef", "Bun", "Lettuce", "Tomato"],
            station: "Grill Station",
            instruction: "Shape the beef into a patty grill both sides toast the bun and assemble with lettuce and tomato.",
            time: 16,
            cost: 20,
            reward: 75
        },
        {
            name: "Chicken Alfredo",
            difficulty: 2,
            description: "Creamy chicken pasta.",
            ingredients: ["Chicken", "Pasta", "Cream", "Cheese"],
            station: "Cooking Station",
            instruction: "Boil the pasta grill the chicken prepare a creamy cheese sauce and combine everything before plating.",
            time: 17,
            cost: 22,
            reward: 85
        },
        {
            name: "Loaded Nachos",
            difficulty: 2,
            description: "Crispy nachos with toppings.",
            ingredients: ["Nachos", "Cheese", "Tomato", "Beans"],
            station: "Preparation Station",
            instruction: "Arrange the nachos add beans and chopped tomato cover with cheese and heat until melted.",
            time: 14,
            cost: 17,
            reward: 70
        },
        {
            name: "Grilled Chicken Salad",
            difficulty: 2,
            description: "A healthy grilled chicken salad.",
            ingredients: ["Chicken", "Lettuce", "Tomato", "Dressing"],
            station: "Grill Station",
            instruction: "Season and grill the chicken slice it and arrange it over washed lettuce and chopped tomato with dressing.",
            time: 16,
            cost: 19,
            reward: 75
        },
        {
            name: "Spicy Beef Tacos",
            difficulty: 2,
            description: "Seasoned beef tacos.",
            ingredients: ["Beef", "Taco Shells", "Tomato", "Lettuce"],
            station: "Cooking Station",
            instruction: "Brown the beef with spices warm the taco shells and fill them with beef lettuce and chopped tomato.",
            time: 17,
            cost: 21,
            reward: 85
        },
        {
            name: "BBQ Chicken Pizza",
            difficulty: 2,
            description: "A smoky barbecue chicken pizza.",
            ingredients: ["Pizza Dough", "Chicken", "Cheese", "BBQ Sauce"],
            station: "Oven Station",
            instruction: "Spread barbecue sauce over the dough add cooked chicken and cheese then bake until the crust is crisp.",
            time: 18,
            cost: 24,
            reward: 95
        },
        {
            name: "Fish and Chips",
            difficulty: 2,
            description: "Crispy battered fish with fries.",
            ingredients: ["Fish", "Potatoes", "Flour", "Oil"],
            station: "Frying Station",
            instruction: "Cut the potatoes into fries prepare a light flour batter coat the fish and fry both until golden.",
            time: 19,
            cost: 25,
            reward: 100
        },
        {
            name: "Chicken Stir Fry",
            difficulty: 2,
            description: "Chicken and vegetables in a savoury sauce.",
            ingredients: ["Chicken", "Carrots", "Peppers", "Soy Sauce"],
            station: "Cooking Station",
            instruction: "Slice the chicken and vegetables stir fry the chicken first add the vegetables and finish with soy sauce.",
            time: 18,
            cost: 23,
            reward: 95
        },
        {
            name: "Beef Lasagne",
            difficulty: 3,
            description: "Layered beef lasagne with cheese.",
            ingredients: ["Beef", "Pasta Sheets", "Tomato Sauce", "Cheese"],
            station: "Oven Station",
            instruction: "Cook the beef in tomato sauce layer the meat sauce with pasta sheets and cheese then bake until bubbling.",
            time: 22,
            cost: 30,
            reward: 120
        },
        {
            name: "Grilled Salmon",
            difficulty: 3,
            description: "Salmon with vegetables and lemon.",
            ingredients: ["Salmon", "Lemon", "Broccoli", "Butter"],
            station: "Grill Station",
            instruction: "Season the salmon grill it skin side down prepare steamed broccoli and finish the fish with lemon butter.",
            time: 22,
            cost: 32,
            reward: 130
        },
        {
            name: "Chicken Parmesan",
            difficulty: 3,
            description: "Breaded chicken with tomato sauce and cheese.",
            ingredients: ["Chicken", "Breadcrumbs", "Tomato Sauce", "Cheese"],
            station: "Oven Station",
            instruction: "Coat the chicken in breadcrumbs pan fry until golden add tomato sauce and cheese then bake until fully cooked.",
            time: 23,
            cost: 31,
            reward: 135
        },
        {
            name: "Seafood Pasta",
            difficulty: 3,
            description: "Pasta with mixed seafood.",
            ingredients: ["Pasta", "Prawns", "Mussels", "Garlic", "Cream"],
            station: "Cooking Station",
            instruction: "Boil the pasta saute garlic and seafood add cream and combine the sauce with the cooked pasta before plating.",
            time: 24,
            cost: 35,
            reward: 145
        },
        {
            name: "Stuffed Chicken Breast",
            difficulty: 3,
            description: "Chicken filled with spinach and cheese.",
            ingredients: ["Chicken", "Spinach", "Cheese", "Herbs"],
            station: "Oven Station",
            instruction: "Slice a pocket into the chicken fill it with spinach and cheese season with herbs then bake until cooked through.",
            time: 25,
            cost: 34,
            reward: 150
        },
        {
            name: "Beef Steak Dinner",
            difficulty: 3,
            description: "Steak with vegetables and sauce.",
            ingredients: ["Beef Steak", "Potatoes", "Green Beans", "Butter"],
            station: "Grill Station",
            instruction: "Season the steak sear both sides to the requested doneness roast the potatoes and saute green beans in butter.",
            time: 25,
            cost: 37,
            reward: 160
        },
        {
            name: "Lemon Butter Prawns",
            difficulty: 3,
            description: "Prawns with garlic lemon butter.",
            ingredients: ["Prawns", "Garlic", "Lemon", "Butter"],
            station: "Cooking Station",
            instruction: "Clean the prawns saute garlic in butter add the prawns and finish with fresh lemon juice.",
            time: 23,
            cost: 36,
            reward: 155
        },
        {
            name: "Roast Chicken Platter",
            difficulty: 3,
            description: "Roasted chicken with seasonal sides.",
            ingredients: ["Chicken", "Potatoes", "Carrots", "Herbs"],
            station: "Oven Station",
            instruction: "Season the chicken with herbs roast until fully cooked prepare the vegetables and arrange everything on a serving platter.",
            time: 27,
            cost: 40,
            reward: 170
        },
        {
            name: "Gourmet Mushroom Risotto",
            difficulty: 4,
            description: "Slow-cooked creamy mushroom risotto.",
            ingredients: ["Rice", "Mushrooms", "Stock", "Parmesan", "Butter"],
            station: "Cooking Station",
            instruction: "Saute mushrooms toast the rice add warm stock gradually while stirring continuously then finish with butter and parmesan.",
            time: 29,
            cost: 43,
            reward: 185
        },
        {
            name: "Lamb Chops",
            difficulty: 4,
            description: "Herb-crusted lamb chops.",
            ingredients: ["Lamb", "Rosemary", "Garlic", "Potatoes"],
            station: "Grill Station",
            instruction: "Season the lamb with rosemary and garlic sear each side to the requested doneness roast the potatoes and rest the meat before plating.",
            time: 30,
            cost: 46,
            reward: 195
        },
        {
            name: "Seafood Paella",
            difficulty: 4,
            description: "A rich seafood rice dish.",
            ingredients: ["Rice", "Prawns", "Mussels", "Peppers", "Stock"],
            station: "Cooking Station",
            instruction: "Saute peppers toast the rice add stock and arrange the seafood on top then simmer without stirring until the rice is tender.",
            time: 32,
            cost: 48,
            reward: 210
        },
        {
            name: "Premium Beef Wellington",
            difficulty: 4,
            description: "Beef wrapped in pastry.",
            ingredients: ["Beef Fillet", "Mushrooms", "Pastry", "Egg"],
            station: "Oven Station",
            instruction: "Sear the beef prepare a mushroom filling wrap the beef in pastry brush with egg and bake until the pastry is golden.",
            time: 35,
            cost: 55,
            reward: 240
        },
        {
            name: "Truffle Chicken Pasta",
            difficulty: 4,
            description: "Premium chicken pasta with truffle.",
            ingredients: ["Chicken", "Pasta", "Cream", "Truffle Oil", "Parmesan"],
            station: "Cooking Station",
            instruction: "Grill the seasoned chicken boil the pasta prepare a cream and parmesan sauce add truffle oil and combine before slicing the chicken over the dish.",
            time: 33,
            cost: 52,
            reward: 225
        },
        {
            name: "Herb Crusted Salmon",
            difficulty: 4,
            description: "Salmon with a crisp herb crust.",
            ingredients: ["Salmon", "Herbs", "Breadcrumbs", "Lemon"],
            station: "Oven Station",
            instruction: "Mix herbs with breadcrumbs coat the salmon roast until the crust is golden steam the vegetables and finish with lemon.",
            time: 34,
            cost: 50,
            reward: 220
        },
        {
            name: "Royal Seafood Platter",
            difficulty: 5,
            description: "A premium selection of seafood.",
            ingredients: ["Lobster", "Prawns", "Mussels", "Lemon", "Butter"],
            station: "Cooking Station",
            instruction: "Prepare the lobster and clean the seafood steam the mussels grill the lobster and prawns prepare garlic lemon butter and arrange all seafood on a chilled serving platter.",
            time: 39,
            cost: 65,
            reward: 280
        },
        {
            name: "Chef's Signature Feast",
            difficulty: 5,
            description: "A complex signature restaurant dish.",
            ingredients: ["Beef", "Prawns", "Potatoes", "Vegetables", "Cream", "Herbs"],
            station: "Main Kitchen",
            instruction: "Season and sear the beef prepare the prawns in garlic butter roast the potatoes steam the vegetables prepare the herb cream sauce and plate every component together while keeping the meat rested.",
            time: 42,
            cost: 75,
            reward: 320
        }
    ];

    /* =====================================================
       3. STAFF
    ===================================================== */

    const STAFF_TEMPLATE = [
        {
            id: "bella",
            name: "Bella",
            role: "Receptionist",
            shortRole: "Reception",
            color: "#e9a0b1",
            task: "Welcoming customers",
            x: 0.12,
            y: 0.26,
            frontHouse: true
        },
        {
            id: "marcus",
            name: "Marcus",
            role: "Waiter",
            shortRole: "Service",
            color: "#7eabd9",
            task: "Serving customers",
            x: 0.85,
            y: 0.27,
            frontHouse: true
        },
        {
            id: "olivia",
            name: "Olivia",
            role: "Head Chef",
            shortRole: "Chef",
            color: "#e9b76b",
            task: "Cooking",
            x: 0.48,
            y: 0.42
        },
        {
            id: "tina",
            name: "Tina",
            role: "Preparation",
            shortRole: "Prep",
            color: "#8ac5a2",
            task: "Preparing ingredients",
            x: 0.28,
            y: 0.72
        },
        {
            id: "sam",
            name: "Sam",
            role: "Kitchen Support",
            shortRole: "Support",
            color: "#ad9bda",
            task: "Kitchen support",
            x: 0.63,
            y: 0.73
        },
        {
            id: "kevin",
            name: "Kevin",
            role: "Kitchen Support",
            shortRole: "Support",
            color: "#d4a36e",
            task: "Kitchen support",
            x: 0.83,
            y: 0.70
        }
    ];

    /* =====================================================
       4. GAME STATE
    ===================================================== */

    let gameState = null;

    let selectedStaffId = null;
    let selectedOrderId = null;
    let currentInstructionOrder = null;
    let currentFrontHouseAction = null;
    let currentRecipeIndex = 0;
    let currentLibraryIndex = 0;

    let gameInterval = null;
    let typingInterval = null;
    let frontHouseInterval = null;
    let toastTimeout = null;

    let paused = true;
    let lastCanvasStaffPositions = [];

    /* =====================================================
       5. DOM HELPERS
    ===================================================== */

    const $ = id => document.getElementById(id);

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = value;
    }

    function show(id) {
        const element = $(id);
        if (element) element.classList.remove("hidden");
    }

    function hide(id) {
        const element = $(id);
        if (element) element.classList.add("hidden");
    }

    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function getStaff(id) {
        return gameState.staff.find(member => member.id === id);
    }

    function getOrder(id) {
        return gameState.orders.find(order => order.id === id);
    }

    function getRecipe(index) {
        return RECIPES[index % RECIPES.length];
    }

    function formatClock(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = Math.floor(totalMinutes % 60);

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    function toast(message) {
        const element = $("toast");
        if (!element) return;

        element.textContent = message;
        element.classList.remove("hidden");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            element.classList.add("hidden");
        }, 3200);
    }

    function updateStaffTask(staff, task) {
        staff.task = task;
        updateSelectedStaff();
    }

    /* =====================================================
       6. NEW GAME
    ===================================================== */

    function createNewGame() {
        const target = randomNumber(1, 10);

        gameState = {
            day: 1,
            money: STARTING_MONEY,
            ingredients: STARTING_INGREDIENTS,
            reputation: STARTING_REPUTATION,
            quality: 100,
            harmony: 100,

            target: target,
            totalCustomers: target + EXTRA_CUSTOMERS,

            successfulOrders: 0,
            served: 0,
            lost: 0,
            customersCreated: 0,

            orders: [],
            staff: STAFF_TEMPLATE.map(member => ({
                ...member,
                busy: false,
                task: "Waiting",
                currentOrder: null,
                cooldown: 0
            })),

            clockMinutes: DAY_START_MINUTES,
            settings: { ...DEFAULT_SETTINGS },

            upgrades: {
                betterEquipment: false,
                fasterKitchen: false,
                betterTraining: false
            },

            dailyRevenue: 0,
            dailyExpenses: 0,
            completedDays: 0,
            gameCompleted: false,
            customerArrivalAccumulator: 0,
            nextCustomerId: 1
        };

        selectedStaffId = null;
        selectedOrderId = null;

        startDay();
    }

    /* =====================================================
       7. START DAY
    ===================================================== */

    function startDay() {
        if (!gameState) return;

        paused = false;

        gameState.target = randomNumber(1, 10);
        gameState.totalCustomers = gameState.target + EXTRA_CUSTOMERS;

        gameState.successfulOrders = 0;
        gameState.served = 0;
        gameState.lost = 0;
        gameState.customersCreated = 0;

        gameState.orders = [];

        gameState.clockMinutes = DAY_START_MINUTES;
        gameState.dailyRevenue = 0;
        gameState.dailyExpenses = 0;
        gameState.customerArrivalAccumulator = 0;

        gameState.staff.forEach(staff => {
            staff.busy = false;
            staff.currentOrder = null;
            staff.task = "Waiting";
            staff.cooldown = 0;
        });

        selectedStaffId = null;
        selectedOrderId = null;

        hide("mainMenu");
        hide("reportModal");
        hide("pauseModal");
        show("gameScreen");

        setText("targetExplanation",
            `Complete ${gameState.target} successful orders. ${EXTRA_CUSTOMERS} extra customers will arrive.`);

        updateAllUI();
        drawKitchen();

        /* First customer arrives immediately. */
        createCustomer();

        startGameLoop();

        toast(`Day ${gameState.day} has started! Today's target: ${gameState.target}.`);
    }

    /* =====================================================
       8. CUSTOMER GENERATION
    ===================================================== */

    const CUSTOMER_NAMES = [
        "Alex", "Jamie", "Taylor", "Jordan", "Morgan",
        "Casey", "Riley", "Avery", "Cameron", "Drew",
        "Sky", "Charlie", "Robin", "Sam", "Ellis"
    ];

    const CUSTOMER_ICONS = ["🙂", "😎", "😊", "🤓", "😋", "🧐"];

    function createCustomer() {
        if (!gameState || paused) return;

        if (gameState.customersCreated >= gameState.totalCustomers) {
            return;
        }

        const recipeIndex = (gameState.day - 1) % RECIPES.length;
        const recipe = getRecipe(recipeIndex);

        const order = {
            id: gameState.nextCustomerId++,
            customer: CUSTOMER_NAMES[randomNumber(0, CUSTOMER_NAMES.length - 1)],
            icon: CUSTOMER_ICONS[randomNumber(0, CUSTOMER_ICONS.length - 1)],
            recipeIndex: recipeIndex,
            recipe: recipe.name,

            status: "waiting",
            assignedStaff: null,

            patience: 100,
            createdAt: gameState.clockMinutes,

            cookingRemaining: 0,
            quality: 100,
            greetingComplete: false,
            cookingComplete: false,
            served: false
        };

        gameState.orders.push(order);
        gameState.customersCreated++;

        updateAllUI();

        toast(`${order.customer} has arrived! Order: ${order.recipe}`);

        /* Bella is responsible for reception. */
        const bella = getStaff("bella");

        if (bella && !bella.busy) {
            setText("bellaStatus", "CUSTOMER");
        }

        drawKitchen();
    }

    /* =====================================================
       9. GAME LOOP
    ===================================================== */

    function startGameLoop() {
        clearInterval(gameInterval);

        gameInterval = setInterval(() => {
            if (paused || !gameState || gameState.gameCompleted) return;

            updateGameTime();
            updateCustomerPatience();
            updateCooking();
            updateStaffCooldowns();
            updateCustomerArrivals();

            updateAllUI();
            drawKitchen();

            checkDayCompletion();

        }, 1000);
    }

    function updateGameTime() {
        const speed = Number(gameState.settings.gameSpeed) || 1;

        /* One real second represents speed/60 game minutes.
           A full 12-hour restaurant day takes 12 real hours
           at normal speed. */

        gameState.clockMinutes += speed / 60;

        if (gameState.clockMinutes >= DAY_START_MINUTES + DAY_LENGTH_MINUTES) {
            gameState.clockMinutes = DAY_START_MINUTES + DAY_LENGTH_MINUTES;
        }
    }

    function updateCustomerArrivals() {
        if (gameState.customersCreated >= gameState.totalCustomers) return;

        gameState.customerArrivalAccumulator +=
            Number(gameState.settings.gameSpeed) / 60;

        if (gameState.customerArrivalAccumulator >= 60) {
            gameState.customerArrivalAccumulator = 0;
            createCustomer();
        }
    }

    function updateCustomerPatience() {
        gameState.orders.forEach(order => {
            if (
                order.status === "waiting" ||
                order.status === "greeted" ||
                order.status === "cooking" ||
                order.status === "ready"
            ) {
                const speed = Number(gameState.settings.gameSpeed) || 1;

                let patienceLoss = 0.015 * speed;

                if (order.status === "cooking") {
                    patienceLoss *= 0.4;
                }

                order.patience = Math.max(0, order.patience - patienceLoss);

                if (order.patience <= 0) {
                    loseCustomer(order);
                }
            }
        });
    }

    function updateCooking() {
        gameState.orders.forEach(order => {
            if (order.status !== "cooking") return;

            const speed = Number(gameState.settings.gameSpeed) || 1;

            order.cookingRemaining -= speed;

            if (order.cookingRemaining <= 0) {
                order.status = "ready";
                order.cookingComplete = true;

                const staff = getStaff(order.assignedStaff);

                if (staff) {
                    staff.busy = false;
                    staff.currentOrder = null;
                    staff.task = "Waiting";
                }

                toast(`${order.recipe} is ready! Marcus can serve it.`);
            }
        });
    }

    function updateStaffCooldowns() {
        gameState.staff.forEach(staff => {
            if (staff.cooldown > 0) {
                staff.cooldown = Math.max(
                    0,
                    staff.cooldown - Number(gameState.settings.gameSpeed)
                );
            }
        });
    }

    /* =====================================================
       10. STAFF SELECTION
    ===================================================== */

    function selectStaff(staffId) {
        const staff = getStaff(staffId);
        if (!staff) return;

        selectedStaffId = staffId;

        updateSelectedStaff();
        drawKitchen();

        toast(`${staff.name} selected. Now select an order.`);
    }

    function updateSelectedStaff() {
        const staff = getStaff(selectedStaffId);

        if (!staff) {
            setText("selectedStaffLabel", "No staff selected");
            setText("selectedStaffName", "Select a staff member");
            setText("selectedStaffRole", "Click an NPC in the kitchen to begin.");
            setText("selectedStaffTask", "Waiting");
            setText("selectedAvatar", "?");
            return;
        }

        setText("selectedStaffLabel", `${staff.name} selected`);
        setText("selectedStaffName", staff.name);
        setText("selectedStaffRole", staff.role);
        setText("selectedStaffTask", staff.task);
        setText("selectedAvatar", staff.name.charAt(0));

        setText(
            "bellaStatus",
            getStaff("bella").busy ? "BUSY" : "READY"
        );

        setText(
            "marcusStatus",
            getStaff("marcus").busy ? "BUSY" : "READY"
        );
    }

    /* =====================================================
       11. ORDER SELECTION AND ASSIGNMENT
    ===================================================== */

    function selectOrder(orderId) {
        const order = getOrder(orderId);
        if (!order) return;

        selectedOrderId = orderId;

        if (!selectedStaffId) {
            toast("Select a staff member in the kitchen first.");
            renderOrders();
            return;
        }

        const staff = getStaff(selectedStaffId);

        if (!staff) return;

        if (staff.busy || staff.cooldown > 0) {
            toast(`${staff.name} is currently unavailable.`);
            return;
        }

        if (order.status === "lost" || order.status === "served") {
            toast("This customer order is already complete.");
            return;
        }

        assignStaffToOrder(staff, order);
    }

    function assignStaffToOrder(staff, order) {
        if (staff.id === "bella") {
            handleReceptionist(staff, order);
            return;
        }

        if (staff.id === "marcus") {
            handleWaiter(staff, order);
            return;
        }

        if (order.status === "waiting") {
            toast("Bella must welcome the customer first.");
            return;
        }

        if (order.status === "greeted" || order.status === "preparing") {
            startCookingInstruction(staff, order);
            return;
        }

        if (order.status === "ready") {
            toast("The meal is ready. Select Marcus to deliver it.");
            return;
        }

        if (order.status === "cooking") {
            toast("This meal is already being prepared.");
        }
    }

    /* =====================================================
       12. RECEPTIONIST
    ===================================================== */

    function handleReceptionist(staff, order) {
        if (order.status !== "waiting") {
            toast("This customer has already been welcomed.");
            return;
        }

        openFrontHouseInstruction(
            staff,
            order,
            "Welcome the customer",
            "Welcome the customer and confirm their table.",
            "Welcome the customer and confirm their table."
        );
    }

    /* =====================================================
       13. WAITER
    ===================================================== */

    function handleWaiter(staff, order) {
        if (order.status !== "ready") {
            toast("Marcus can only deliver completed meals.");
            return;
        }

        openFrontHouseInstruction(
            staff,
            order,
            "Deliver the meal",
            "Take the completed meal to the customer.",
            "Deliver the completed meal to the customer."
        );
    }

    /* =====================================================
       14. FRONT-OF-HOUSE INSTRUCTIONS
    ===================================================== */

    function openFrontHouseInstruction(staff, order, title, description, expected) {
        currentFrontHouseAction = {
            staff,
            order,
            expected,
            remaining: 15
        };

        staff.busy = true;
        staff.currentOrder = order.id;
        staff.task = title;

        setText("frontHouseTitle", title);
        setText("frontHouseDescription", description);
        setText("frontHousePerson", `${staff.name} — ${staff.role}`);
        setText("frontHouseExpected", expected);
        setText("frontHouseTimer", "15.0s");
        setText("frontHouseProgress", "");

        $("frontHouseInput").value = "";

        show("frontHouseModal");

        startFrontHouseTimer();
        updateAllUI();
    }

    function startFrontHouseTimer() {
        clearInterval(frontHouseInterval);

        frontHouseInterval = setInterval(() => {
            if (paused || !currentFrontHouseAction) return;

            currentFrontHouseAction.remaining -= 0.1;

            const remaining = Math.max(0, currentFrontHouseAction.remaining);

            setText("frontHouseTimer", `${remaining.toFixed(1)}s`);

            const percentage = (remaining / 15) * 100;

            $("frontHouseProgress").style.width = `${percentage}%`;

            if (remaining <= 0) {
                finishFrontHouseInstruction(false);
            }
        }, 100);
    }

    function submitFrontHouseInstruction() {
        if (!currentFrontHouseAction) return;

        const typed = $("frontHouseInput").value.trim();
        const expected = currentFrontHouseAction.expected;

        if (!instructionsMatch(typed, expected)) {
            toast("The instruction is not correct. Check the wording.");
            return;
        }

        finishFrontHouseInstruction(true);
    }

    function finishFrontHouseInstruction(success) {
        if (!currentFrontHouseAction) return;

        clearInterval(frontHouseInterval);

        const action = currentFrontHouseAction;
        const { staff, order } = action;

        currentFrontHouseAction = null;

        hide("frontHouseModal");

        staff.busy = false;
        staff.currentOrder = null;
        staff.cooldown = 3;

        if (success) {
            if (staff.id === "bella") {
                order.status = "greeted";
                order.greetingComplete = true;
                staff.task = "Welcoming customers";
                toast(`${staff.name} welcomed ${order.customer}.`);
            } else {
                serveCustomer(order);
                staff.task = "Serving customers";
                toast(`${staff.name} delivered the meal successfully!`);
            }
        } else {
            staff.task = "Waiting";
            staff.cooldown = 5;
            toast("Instruction timed out. The customer is still waiting.");
        }

        updateAllUI();
        drawKitchen();
    }

    /* =====================================================
       15. COOKING INSTRUCTIONS
    ===================================================== */

    function startCookingInstruction(staff, order) {
        const recipe = getRecipe(order.recipeIndex);

        currentInstructionOrder = {
            staff,
            order,
            recipe,
            remaining: instructionTime(recipe.difficulty)
        };

        staff.busy = true;
        staff.currentOrder = order.id;
        staff.task = `Preparing ${recipe.name}`;

        currentRecipeIndex = order.recipeIndex;

        setText("instructionTitle", `Prepare ${recipe.name}`);

        $("instructionInput").value = "";

        renderRecipeInstruction();
        setText("typingOrderName", order.recipe);
        setText("typingStaffName", `${staff.name} — ${staff.role}`);

        setText(
            "typingFeedback",
            "Type the complete recipe instruction before the timer expires."
        );

        show("instructionModal");

        startTypingTimer();

        updateAllUI();
    }

    function instructionTime(difficulty) {
        const times = {
            1: 25,
            2: 30,
            3: 35,
            4: 40,
            5: 45
        };

        return times[difficulty] || 30;
    }

    function startTypingTimer() {
        clearInterval(typingInterval);

        const total = currentInstructionOrder.remaining;

        typingInterval = setInterval(() => {
            if (paused || !currentInstructionOrder) return;

            currentInstructionOrder.remaining -= 0.1;

            const remaining = Math.max(
                0,
                currentInstructionOrder.remaining
            );

            setText("typingTimer", `${remaining.toFixed(1)}s`);

            const percentage = (remaining / total) * 100;

            $("typingProgress").style.width = `${percentage}%`;

            if (remaining <= 0) {
                finishCookingInstruction(false);
            }
        }, 100);
    }

    function instructionsMatch(typed, expected) {
        const clean = value => value
            .toLowerCase()
            .replace(/[.,!?;:'"]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        return clean(typed) === clean(expected);
    }

    function submitCookingInstruction() {
        if (!currentInstructionOrder) return;

        const typed = $("instructionInput").value.trim();

        const expected = currentInstructionOrder.recipe.instruction;

        if (!instructionsMatch(typed, expected)) {
            setText(
                "typingFeedback",
                "Not quite! Read the recipe again and check your wording."
            );

            return;
        }

        finishCookingInstruction(true);
    }

    function finishCookingInstruction(success) {
        if (!currentInstructionOrder) return;

        clearInterval(typingInterval);

        const action = currentInstructionOrder;
        const { staff, order, recipe } = action;

        currentInstructionOrder = null;

        hide("instructionModal");

        if (!success) {
            staff.busy = false;
            staff.currentOrder = null;
            staff.cooldown = 5;
            staff.task = "Waiting";

            order.status = "greeted";

            order.patience = Math.max(0, order.patience - 10);

            toast("Cooking instruction failed. Try assigning the order again.");

            updateAllUI();
            return;
        }

        if (gameState.ingredients < recipe.cost) {
            staff.busy = false;
            staff.currentOrder = null;
            staff.task = "Waiting";

            toast("Not enough ingredients. Check your inventory.");

            updateAllUI();
            return;
        }

        gameState.ingredients -= recipe.cost;
        gameState.dailyExpenses += recipe.cost;

        order.status = "cooking";
        order.assignedStaff = staff.id;
        order.cookingRemaining = recipe.time;

        order.quality = calculateCookingQuality(recipe, staff);

        staff.task = `Cooking ${recipe.name}`;

        setText(
            "typingFeedback",
            "Instruction accepted. Cooking has started!"
        );

        toast(`${staff.name} is now cooking ${recipe.name}.`);

        updateAllUI();
        drawKitchen();
    }

    function calculateCookingQuality(recipe, staff) {
        let quality = 100;

        quality += gameState.upgrades.betterTraining ? 5 : 0;
        quality += staff.id === "olivia" ? 5 : 0;

        if (recipe.difficulty >= 4 && staff.id !== "olivia") {
            quality -= 8;
        }

        return Math.min(100, quality);
    }

    /* =====================================================
       16. SERVING CUSTOMERS
    ===================================================== */

    function serveCustomer(order) {
        if (order.served || order.status === "lost") return;

        const recipe = getRecipe(order.recipeIndex);

        order.status = "served";
        order.served = true;

        gameState.served++;
        gameState.successfulOrders++;

        const qualityBonus = Math.round(order.quality * 0.2);
        const satisfactionBonus = Math.round(order.patience * 0.1);

        const earnings = recipe.reward + qualityBonus + satisfactionBonus;

        gameState.money += earnings;
        gameState.dailyRevenue += earnings;

        gameState.reputation = Math.min(
            100,
            gameState.reputation + 1
        );

        gameState.quality = Math.round(
            (gameState.quality + order.quality) / 2
        );

        gameState.harmony = Math.min(100, gameState.harmony + 1);

        gameState.staff.forEach(staff => {
            if (staff.currentOrder === order.id) {
                staff.busy = false;
                staff.currentOrder = null;
                staff.task = "Waiting";
            }
        });

        updateAllUI();

        toast(`Order completed! +R${earnings}`);

        checkDayCompletion();
    }

    /* =====================================================
       17. CUSTOMER LEAVING
    ===================================================== */

    function loseCustomer(order) {
        if (
            order.status === "served" ||
            order.status === "lost"
        ) return;

        order.status = "lost";

        gameState.lost++;

        gameState.reputation = Math.max(
            0,
            gameState.reputation - 2
        );

        gameState.quality = Math.max(
            0,
            gameState.quality - 2
        );

        gameState.harmony = Math.max(
            0,
            gameState.harmony - 3
        );

        gameState.staff.forEach(staff => {
            if (staff.currentOrder === order.id) {
                staff.busy = false;
                staff.currentOrder = null;
                staff.task = "Waiting";
            }
        });

        if (
            currentInstructionOrder &&
            currentInstructionOrder.order.id === order.id
        ) {
            clearInterval(typingInterval);
            currentInstructionOrder = null;
            hide("instructionModal");
        }

        if (
            currentFrontHouseAction &&
            currentFrontHouseAction.order.id === order.id
        ) {
            clearInterval(frontHouseInterval);
            currentFrontHouseAction = null;
            hide("frontHouseModal");
        }

        toast(`${order.customer} has left without being served.`);

        updateAllUI();
        checkDayCompletion();
    }

    /* =====================================================
       18. DAILY COMPLETION
    ===================================================== */

    function checkDayCompletion() {
        if (!gameState || gameState.gameCompleted || paused) return;

        const allCustomersArrived =
            gameState.customersCreated >= gameState.totalCustomers;

        const allCustomersResolved =
            gameState.orders.length === gameState.totalCustomers &&
            gameState.orders.every(order =>
                order.status === "served" ||
                order.status === "lost"
            );

        if (allCustomersArrived && allCustomersResolved) {
            endDay();
        }
    }

    function endDay() {
        if (!gameState || gameState.gameCompleted) return;

        paused = true;

        clearInterval(gameInterval);
        clearInterval(typingInterval);
        clearInterval(frontHouseInterval);

        currentInstructionOrder = null;
        currentFrontHouseAction = null;

        const successful = gameState.successfulOrders;
        const target = gameState.target;

        const targetReached = successful >= target;

        let rating = "Needs Improvement";
        let message = "Your restaurant needs more coordination.";

        if (successful >= target + 2) {
            rating = "Excellent Service!";
            message = "Outstanding! Your kitchen delivered fantastic service.";
        } else if (targetReached) {
            rating = "Target Achieved!";
            message = "Well done! You reached your daily target.";
        } else if (successful > 0) {
            rating = "Keep Improving";
            message = "You made progress, but missed today's target.";
        } else {
            rating = "Difficult Day";
            message = "Your customers were not satisfied. Improve your teamwork.";
        }

        gameState.completedDays++;

        gameState.money = Math.max(0, gameState.money);

        setText("reportTitle", `Day ${gameState.day} Performance`);
        setText("reportScore", `${successful} / ${target}`);
        setText("reportRating", rating);
        setText("reportServed", gameState.served);
        setText("reportLost", gameState.lost);
        setText("reportTarget", target);
        setText("reportExtras", EXTRA_CUSTOMERS);
        setText("reportMessage", message);

        const nextButton = $("nextDayButton");

        if (gameState.day >= MAX_DAYS) {
            gameState.gameCompleted = true;
            setText("reportTitle", "30-Day Restaurant Journey Complete");
            setText("reportMessage",
                `You completed your 30-day restaurant journey with ${gameState.money} coins and ${gameState.reputation}% reputation.`);

            nextButton.textContent = "RETURN TO MAIN MENU";
        } else {
            nextButton.textContent = "CONTINUE TO NEXT DAY";
        }

        saveGame(false);

        show("reportModal");

        updateAllUI();
    }

    /* =====================================================
       19. NEXT DAY
    ===================================================== */

    function nextDay() {
        if (!gameState) return;

        if (gameState.day >= MAX_DAYS) {
            gameState.gameCompleted = true;
            saveGame(false);
            returnToMenu();
            return;
        }

        gameState.day++;

        /* The next day's target is randomly generated
           independently of the recipe difficulty. */

        gameState.staff.forEach(staff => {
            staff.busy = false;
            staff.currentOrder = null;
            staff.task = "Waiting";
        });

        const recipe = getRecipe(gameState.day - 1);

        toast(`Welcome to Day ${gameState.day}! New featured recipe: ${recipe.name}`);

        startDay();
        saveGame(false);
    }

    /* =====================================================
       20. RECIPE BOOK
    ===================================================== */

    function renderRecipeInstruction() {
        const recipe = getRecipe(currentRecipeIndex);

        setText("recipePageDisplay",
            `PAGE ${currentRecipeIndex + 1} / ${RECIPES.length}`);

        setText("recipeDifficulty",
            `${"★".repeat(recipe.difficulty)} ${recipe.difficulty === 1 ? "EASY" : recipe.difficulty <= 3 ? "MEDIUM" : "ADVANCED"} RECIPE`);

        setText("recipeName", recipe.name);
        setText("recipeDescription", recipe.description);
        setText("recipeIngredients", recipe.ingredients.join(", "));
        setText("recipeStation", recipe.station);
        setText("recipeExpected", recipe.instruction);
    }

    function changeRecipe(direction) {
        currentRecipeIndex += direction;

        if (currentRecipeIndex < 0) {
            currentRecipeIndex = RECIPES.length - 1;
        }

        if (currentRecipeIndex >= RECIPES.length) {
            currentRecipeIndex = 0;
        }

        renderRecipeInstruction();
    }

    function renderRecipeLibrary() {
        const recipe = getRecipe(currentLibraryIndex);

        setText(
            "libraryPageDisplay",
            `${currentLibraryIndex + 1} / ${RECIPES.length}`
        );

        $("recipeLibraryContent").innerHTML = `
            <div class="recipe-page">
                <p class="eyebrow">
                    ${"★".repeat(recipe.difficulty)}
                    ${recipe.difficulty <= 2 ? "BEGINNER" : recipe.difficulty <= 3 ? "INTERMEDIATE" : "ADVANCED"}
                </p>
                <h3>${escapeHTML(recipe.name)}</h3>
                <p>${escapeHTML(recipe.description)}</p>

                <div class="recipe-detail">
                    <strong>INGREDIENTS</strong>
                    <p>${escapeHTML(recipe.ingredients.join(", "))}</p>
                </div>

                <div class="recipe-detail">
                    <strong>STATION</strong>
                    <p>${escapeHTML(recipe.station)}</p>
                </div>

                <div class="recipe-detail">
                    <strong>INSTRUCTION</strong>
                    <p>${escapeHTML(recipe.instruction)}</p>
                </div>

                <div class="recipe-detail">
                    <strong>PREPARATION TIME</strong>
                    <p>${recipe.time} seconds</p>
                </div>
            </div>
        `;
    }

    function changeLibraryRecipe(direction) {
        currentLibraryIndex += direction;

        if (currentLibraryIndex < 0) {
            currentLibraryIndex = RECIPES.length - 1;
        }

        if (currentLibraryIndex >= RECIPES.length) {
            currentLibraryIndex = 0;
        }

        renderRecipeLibrary();
    }

    /* =====================================================
       21. INVENTORY
    ===================================================== */

    function openInventory() {
        renderInventory();
        show("inventoryModal");
    }

    function renderInventory() {
        $("inventoryContent").innerHTML = `
            <div class="inventory-card">
                <span>🌿</span>
                <div>
                    <strong>General Ingredients</strong>
                    <p>Available kitchen ingredients</p>
                </div>
                <b>${gameState.ingredients}</b>
            </div>

            <div class="inventory-card">
                <span>🪙</span>
                <div>
                    <strong>Restaurant Coins</strong>
                    <p>Available spending money</p>
                </div>
                <b>R${gameState.money}</b>
            </div>

            <div class="inventory-card">
                <span>⭐</span>
                <div>
                    <strong>Reputation</strong>
                    <p>Customer satisfaction reputation</p>
                </div>
                <b>${gameState.reputation}%</b>
            </div>

            <p class="management-note">
                Ingredients are automatically consumed when a cooking instruction is accepted.
                Successful orders earn restaurant coins.
            </p>
        `;
    }

    /* =====================================================
       22. UPGRADES
    ===================================================== */

    const UPGRADE_DATA = [
        {
            id: "betterEquipment",
            name: "Professional Equipment",
            description: "Improves kitchen cooking quality.",
            cost: 200
        },
        {
            id: "fasterKitchen",
            name: "Kitchen Efficiency",
            description: "Reduces cooking time by 15%.",
            cost: 250
        },
        {
            id: "betterTraining",
            name: "Staff Training",
            description: "Improves food quality and kitchen performance.",
            cost: 300
        }
    ];

    function openUpgrades() {
        renderUpgrades();
        show("upgradeModal");
    }

    function renderUpgrades() {
        $("upgradeContent").innerHTML = UPGRADE_DATA.map(upgrade => {
            const purchased = gameState.upgrades[upgrade.id];

            return `
                <div class="upgrade-card">
                    <div>
                        <strong>${escapeHTML(upgrade.name)}</strong>
                        <p>${escapeHTML(upgrade.description)}</p>
                    </div>

                    <button
                        class="secondary-button small-button"
                        data-upgrade="${upgrade.id}"
                        ${purchased || gameState.money < upgrade.cost ? "disabled" : ""}
                    >
                        ${purchased ? "PURCHASED" : `BUY R${upgrade.cost}`}
                    </button>
                </div>
            `;
        }).join("");
    }

    function purchaseUpgrade(upgradeId) {
        const upgrade = UPGRADE_DATA.find(item => item.id === upgradeId);

        if (!upgrade || gameState.upgrades[upgradeId]) return;

        if (gameState.money < upgrade.cost) {
            toast("Not enough coins for this upgrade.");
            return;
        }

        gameState.money -= upgrade.cost;
        gameState.dailyExpenses += upgrade.cost;
        gameState.upgrades[upgradeId] = true;

        toast(`${upgrade.name} purchased!`);

        renderUpgrades();
        updateAllUI();
        saveGame(false);
    }

    /* =====================================================
       23. SAVE AND LOAD
    ===================================================== */

    function saveGame(showMessage = true) {
        if (!gameState) return false;

        try {
            const data = {
                ...gameState,
                savedAt: Date.now()
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(data));

            if (showMessage) {
                toast("Restaurant progress saved successfully.");
            }

            return true;

        } catch (error) {
            console.error("Save failed:", error);

            if (showMessage) {
                toast("Unable to save your game.");
            }

            return false;
        }
    }

    function loadGame() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);

            if (!saved) {
                toast("No saved restaurant was found.");
                return false;
            }

            const data = JSON.parse(saved);

            if (
                !data ||
                !Array.isArray(data.staff) ||
                !Array.isArray(data.orders) ||
                !data.settings
            ) {
                throw new Error("Invalid save file.");
            }

            gameState = data;

            /* Recover the six original staff members. */

            gameState.staff = STAFF_TEMPLATE.map(template => {
                const existing = data.staff.find(
                    staff => staff.id === template.id
                );

                return {
                    ...template,
                    ...(existing || {}),
                    busy: false,
                    currentOrder: null
                };
            });

            /* Recover interrupted work safely. */

            gameState.orders.forEach(order => {
                if (order.status === "cooking") {
                    order.status = "greeted";
                    order.cookingRemaining = 0;
                }
            });

            gameState.staff.forEach(staff => {
                staff.busy = false;
                staff.currentOrder = null;
                staff.task = "Waiting";
            });

            selectedStaffId = null;
            selectedOrderId = null;

            paused = true;

            hide("mainMenu");
            hide("reportModal");
            hide("pauseModal");
            show("gameScreen");

            updateAllUI();
            drawKitchen();

            startGameLoop();

            paused = false;

            toast("Restaurant progress restored.");

            return true;

        } catch (error) {
            console.error("Load failed:", error);
            toast("The saved restaurant could not be loaded.");
            return false;
        }
    }

    /* =====================================================
       24. PAUSE AND MENU
    ===================================================== */

    function pauseGame() {
        if (!gameState) return;

        paused = true;

        show("pauseModal");
    }

    function resumeGame() {
        hide("pauseModal");

        paused = false;

        updateAllUI();
    }

    function returnToMenu() {
        paused = true;

        clearInterval(gameInterval);
        clearInterval(typingInterval);
        clearInterval(frontHouseInterval);

        hide("gameScreen");
        hide("pauseModal");
        hide("reportModal");
        hide("instructionModal");
        hide("frontHouseModal");

        show("mainMenu");

        gameState = null;

        selectedStaffId = null;
        selectedOrderId = null;
    }

    /* =====================================================
       25. SETTINGS
    ===================================================== */

    function openSettings() {
        const settings = gameState
            ? gameState.settings
            : DEFAULT_SETTINGS;

        $("gameSpeedInput").value = settings.gameSpeed;
        $("soundInput").checked = settings.sound;

        show("settingsModal");
    }

    function saveSettings() {
        const settings = {
            gameSpeed: Number($("gameSpeedInput").value),
            sound: $("soundInput").checked
        };

        if (gameState) {
            gameState.settings = settings;
        }

        hide("settingsModal");

        toast("Settings updated.");

        updateAllUI();
    }

    /* =====================================================
       26. ORDER DISPLAY
    ===================================================== */

    function renderOrders() {
        const list = $("orderList");

        const activeOrders = gameState.orders.filter(order =>
            order.status !== "served" &&
            order.status !== "lost"
        );

        setText("orderCount", activeOrders.length);

        if (activeOrders.length === 0) {
            list.innerHTML = `
                <div class="empty-message">
                    Waiting for customers...
                </div>
            `;

            return;
        }

        list.innerHTML = activeOrders.map(order => {
            let statusLabel = "WAITING";

            if (order.status === "greeted") statusLabel = "WELCOMED";
            if (order.status === "preparing") statusLabel = "PREPARING";
            if (order.status === "cooking") statusLabel = "COOKING";
            if (order.status === "ready") statusLabel = "READY TO SERVE";

            const patience = Math.max(0, order.patience);

            const selected = selectedOrderId === order.id
                ? "selected-order"
                : "";

            return `
                <button
                    class="order-card ${selected}"
                    data-order="${order.id}"
                    type="button"
                >
                    <div class="order-card-top">
                        <span class="customer-face">${order.icon}</span>

                        <div class="order-customer">
                            <strong>${escapeHTML(order.customer)}</strong>
                            <small>Customer #${order.id}</small>
                        </div>

                        <span class="order-status">${statusLabel}</span>
                    </div>

                    <div class="order-food">
                        🍽 ${escapeHTML(order.recipe)}
                    </div>

                    <div class="patience-track">
                        <div
                            class="patience-progress"
                            style="width:${patience}%"
                        ></div>
                    </div>

                    <small>Patience ${Math.round(patience)}%</small>
                </button>
            `;
        }).join("");
    }

    /* =====================================================
       27. HUD UPDATES
    ===================================================== */

    function updateAllUI() {
        if (!gameState) return;

        setText("dayDisplay", `${gameState.day} / ${MAX_DAYS}`);

        setText(
            "clockDisplay",
            formatClock(gameState.clockMinutes)
        );

        setText("moneyDisplay", `R${gameState.money}`);
        setText("qualityDisplay", `${Math.round(gameState.quality)}%`);
        setText("harmonyDisplay", `${Math.round(gameState.harmony)}%`);

        setText(
            "customerDisplay",
            `${gameState.served + gameState.lost} / ${gameState.totalCustomers}`
        );

        setText(
            "targetDisplay",
            `${gameState.successfulOrders} / ${gameState.target}`
        );

        const progress = Math.min(
            100,
            (gameState.successfulOrders / gameState.target) * 100
        );

        $("targetProgress").style.width = `${progress}%`;

        renderOrders();
        updateSelectedStaff();

        if ($("inventoryContent") &&
            !$("inventoryModal").classList.contains("hidden")) {
            renderInventory();
        }
    }

    /* =====================================================
       28. TOP-DOWN KITCHEN CANVAS
    ===================================================== */

    const canvas = $("kitchenCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    function roundedRect(context, x, y, width, height, radius, color) {
        context.fillStyle = color;
        context.beginPath();

        context.roundRect(
            x,
            y,
            width,
            height,
            radius
        );

        context.fill();
    }

    function drawKitchen() {
        if (!canvas || !ctx || !gameState) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        /* FLOOR */

        ctx.fillStyle = "#d5d0c5";
        ctx.fillRect(0, 0, width, height);

        /* Floor tiles */

        ctx.strokeStyle = "rgba(80,75,65,0.12)";
        ctx.lineWidth = 2;

        for (let x = 0; x < width; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        /* WALLS */

        ctx.fillStyle = "#34454a";
        ctx.fillRect(0, 0, width, 35);
        ctx.fillRect(0, 0, 35, height);
        ctx.fillRect(width - 35, 0, 35, height);

        /* RECEPTION */

        drawStation(60, 100, 240, 115, "RECEPTION", "#927a67");

        /* CUSTOMER AREA */

        drawStation(850, 90, 270, 160, "CUSTOMER AREA", "#a48c70");

        /* PREPARATION STATION */

        drawStation(100, 360, 270, 110, "PREPARATION", "#758d8b");

        /* COOKING STATION */

        drawStation(420, 330, 300, 125, "COOKING STATION", "#60787b");

        /* OVEN */

        drawStation(790, 330, 250, 125, "OVEN / GRILL", "#6b727b");

        /* STORAGE */

        drawStation(80, 560, 230, 95, "STORAGE", "#927c64");

        /* WASHING */

        drawStation(880, 560, 230, 95, "CLEANING", "#6b8990");

        /* PREP ITEMS */

        drawFoodItem(140, 395, "🥬");
        drawFoodItem(220, 395, "🔪");
        drawFoodItem(300, 395, "🥕");

        /* COOKING ITEMS */

        drawFoodItem(480, 380, "🍳");
        drawFoodItem(570, 380, "🍲");
        drawFoodItem(660, 380, "🥘");

        /* CUSTOMER TABLES */

        drawTable(910, 150);
        drawTable(1030, 150);

        /* STAFF */

        lastCanvasStaffPositions = [];

        gameState.staff.forEach(staff => {
            const x = staff.x * width;
            const y = staff.y * height;

            drawStaff(staff, x, y);

            lastCanvasStaffPositions.push({
                id: staff.id,
                x,
                y,
                radius: 48
            });
        });

        /* CURRENT CUSTOMER COUNT */

        ctx.fillStyle = "#24383b";
        ctx.font = "bold 22px Arial";
        ctx.fillText(
            `CUSTOMERS: ${gameState.served + gameState.lost}/${gameState.totalCustomers}`,
            420,
            55
        );
    }

    function drawStation(x, y, width, height, label, color) {
        roundedRect(ctx, x, y, width, height, 12, color);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 19px Arial";
        ctx.textAlign = "center";

        ctx.fillText(label, x + width / 2, y + 30);

        ctx.textAlign = "left";

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 10, y + 40, width - 20, height - 50);
    }

    function drawFoodItem(x, y, emoji) {
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(emoji, x, y);
        ctx.textAlign = "left";
    }

    function drawTable(x, y) {
        roundedRect(ctx, x, y, 75, 65, 12, "#80644c");

        ctx.fillStyle = "#c9aa82";
        ctx.fillRect(x + 8, y + 8, 59, 49);
    }

    function drawStaff(staff, x, y) {
        const selected = selectedStaffId === staff.id;

        /* Selection ring */

        if (selected) {
            ctx.beginPath();
            ctx.arc(x, y, 43, 0, Math.PI * 2);
            ctx.strokeStyle = "#f5c75e";
            ctx.lineWidth = 7;
            ctx.stroke();
        }

        /* Staff shadow */

        ctx.beginPath();
        ctx.ellipse(x, y + 23, 26, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();

        /* Body */

        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fillStyle = staff.color;
        ctx.fill();

        ctx.strokeStyle = "#34454a";
        ctx.lineWidth = 4;
        ctx.stroke();

        /* Face */

        ctx.fillStyle = "#34312f";
        ctx.beginPath();
        ctx.arc(x - 8, y - 5, 3, 0, Math.PI * 2);
        ctx.arc(x + 8, y - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y + 5, 8, 0.1, Math.PI - 0.1);
        ctx.strokeStyle = "#34312f";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Name */

        ctx.textAlign = "center";
        ctx.font = "bold 17px Arial";
        ctx.fillStyle = "#24383b";

        ctx.fillText(staff.name, x, y + 65);

        ctx.font = "13px Arial";
        ctx.fillText(staff.shortRole, x, y + 84);

        /* Task indicator */

        if (staff.busy) {
            ctx.fillStyle = "#d58a3d";
            ctx.beginPath();
            ctx.arc(x + 28, y - 27, 9, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.textAlign = "left";
    }

    /* =====================================================
       29. CANVAS INTERACTION
    ===================================================== */

    function handleCanvasClick(event) {
        if (!canvas || !gameState) return;

        const rect = canvas.getBoundingClientRect();

        const x = (event.clientX - rect.left) *
            (canvas.width / rect.width);

        const y = (event.clientY - rect.top) *
            (canvas.height / rect.height);

        for (const position of lastCanvasStaffPositions) {
            const distance = Math.sqrt(
                Math.pow(x - position.x, 2) +
                Math.pow(y - position.y, 2)
            );

            if (distance <= position.radius) {
                selectStaff(position.id);
                return;
            }
        }
    }

    /* =====================================================
       30. EVENT LISTENERS
    ===================================================== */

    function bindEvents() {

        $("newGameButton").addEventListener("click", () => {
            createNewGame();
        });

        $("resumeButton").addEventListener("click", () => {
            if (!loadGame()) {
                toast("Start a new restaurant first.");
            }
        });

        $("menuSettingsButton").addEventListener("click", openSettings);

        $("pauseButton").addEventListener("click", pauseGame);

        $("resumeGameButton").addEventListener("click", resumeGame);

        $("mainMenuButton").addEventListener("click", () => {
            saveGame(false);
            returnToMenu();
        });

        $("saveButton").addEventListener("click", () => {
            saveGame(true);
        });

        $("pauseInventoryButton").addEventListener("click", () => {
            openInventory();
        });

        $("inventoryButton").addEventListener("click", openInventory);

        $("upgradeButton").addEventListener("click", openUpgrades);

        $("pauseUpgradeButton").addEventListener("click", openUpgrades);

        $("recipeButton").addEventListener("click", () => {
            currentLibraryIndex = Math.max(0, gameState.day - 1);
            renderRecipeLibrary();
            show("recipeBookModal");
        });

        $("pauseRecipeButton").addEventListener("click", () => {
            currentLibraryIndex = Math.max(0, gameState.day - 1);
            renderRecipeLibrary();
            show("recipeBookModal");
        });

        $("pauseSettingsButton").addEventListener("click", openSettings);

        $("saveSettingsButton").addEventListener("click", saveSettings);

        $("nextDayButton").addEventListener("click", nextDay);

        $("reportMenuButton").addEventListener("click", () => {
            saveGame(false);
            returnToMenu();
        });

        $("submitInstructionButton").addEventListener(
            "click",
            submitCookingInstruction
        );

        $("submitFrontHouseButton").addEventListener(
            "click",
            submitFrontHouseInstruction
        );

        $("skipFrontHouseButton").addEventListener("click", () => {
            finishFrontHouseInstruction(false);
        });

        $("previousRecipeButton").addEventListener("click", () => {
            changeRecipe(-1);
        });

        $("nextRecipeButton").addEventListener("click", () => {
            changeRecipe(1);
        });

        $("libraryPreviousButton").addEventListener("click", () => {
            changeLibraryRecipe(-1);
        });

        $("libraryNextButton").addEventListener("click", () => {
            changeLibraryRecipe(1);
        });

        $("orderList").addEventListener("click", event => {
            const button = event.target.closest("[data-order]");

            if (!button) return;

            selectOrder(Number(button.dataset.order));
        });

        $("upgradeContent").addEventListener("click", event => {
            const button = event.target.closest("[data-upgrade]");

            if (!button) return;

            purchaseUpgrade(button.dataset.upgrade);
        });

        canvas.addEventListener("click", handleCanvasClick);

        /* Close modal buttons */

        document.querySelectorAll("[data-close]").forEach(button => {
            button.addEventListener("click", () => {
                const modalId = button.dataset.close;

                hide(modalId);

                if (modalId === "instructionModal") {
                    clearInterval(typingInterval);

                    if (currentInstructionOrder) {
                        const action = currentInstructionOrder;

                        action.staff.busy = false;
                        action.staff.currentOrder = null;
                        action.staff.task = "Waiting";

                        action.order.status = "greeted";

                        currentInstructionOrder = null;
                    }
                }

                if (modalId === "frontHouseModal") {
                    finishFrontHouseInstruction(false);
                }
            });
        });

        /* Entering a new instruction with Ctrl+Enter submits. */

        $("instructionInput").addEventListener("keydown", event => {
            if (event.key === "Enter" && event.ctrlKey) {
                submitCookingInstruction();
            }
        });

        $("frontHouseInput").addEventListener("keydown", event => {
            if (event.key === "Enter" && event.ctrlKey) {
                submitFrontHouseInstruction();
            }
        });
    }

    /* =====================================================
       31. INITIALISATION
    ===================================================== */

    function initialiseGame() {
        console.log("HIVEMIND: Kitchen Harmony initialising...");

        if (!canvas || !ctx) {
            console.error("Kitchen canvas was not found.");
            return;
        }

        bindEvents();

        hide("gameScreen");
        show("mainMenu");

        console.log("HIVEMIND game systems loaded.");
        console.log("Staff available:", STAFF_TEMPLATE.length);
        console.log("Recipes available:", RECIPES.length);
        console.log("Maximum days:", MAX_DAYS);

        const saved = localStorage.getItem(SAVE_KEY);

        if (!saved) {
            $("resumeButton").disabled = true;
            $("resumeButton").style.opacity = "0.5";
        } else {
            $("resumeButton").disabled = false;
            $("resumeButton").style.opacity = "1";
        }
    }

    document.addEventListener("DOMContentLoaded", initialiseGame);

})();

