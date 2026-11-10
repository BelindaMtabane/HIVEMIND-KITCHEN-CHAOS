
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
       3. STAFF AND DEPARTMENTS
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
            role: "Preparation Chef",
            shortRole: "Preparation",
            department: "preparation",
            color: "#e9b76b",
            task: "Preparing ingredients",
            x: 0.30,
            y: 0.48
        },
        {
            id: "tina",
            name: "Tina",
            role: "Cutting Chef",
            shortRole: "Cutting",
            department: "cutting",
            color: "#8ac5a2",
            task: "Chopping ingredients",
            x: 0.45,
            y: 0.48
        },
        {
            id: "sam",
            name: "Sam",
            role: "Cooking Chef",
            shortRole: "Cooking",
            department: "cooking",
            color: "#ad9bda",
            task: "Cooking meals",
            x: 0.60,
            y: 0.48
        },
        {
            id: "kevin",
            name: "Kevin",
            role: "Plating Chef",
            shortRole: "Plating",
            department: "plating",
            color: "#d4a36e",
            task: "Plating meals",
            x: 0.75,
            y: 0.48
        }
    ];

    const DEPARTMENTS = [
        {
            id: "preparation",
            name: "Preparation",
            description: "Wash and prepare ingredients.",
            duration: 3
        },
        {
            id: "cutting",
            name: "Cutting",
            description: "Chop and portion ingredients.",
            duration: 3
        },
        {
            id: "cooking",
            name: "Cooking",
            description: "Cook the customer's recipe.",
            duration: 0
        },
        {
            id: "plating",
            name: "Plating",
            description: "Finish and plate the meal.",
            duration: 3
        }
    ];

    const STAFF_COLORS = [
        "#e9b76b",
        "#8ac5a2",
        "#ad9bda",
        "#d4a36e",
        "#e9a0b1",
        "#7eabd9",
        "#d58b72",
        "#8eb7c9"
    ];

    const CUSTOMER_NAMES = [
        "Alex", "Jamie", "Taylor", "Jordan", "Morgan",
        "Casey", "Riley", "Avery", "Cameron", "Drew",
        "Sky", "Charlie", "Robin", "Sam", "Ellis"
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
    let currentDepartmentId = null;

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
        return gameState?.staff.find(member => member.id === id);
    }

    function getOrder(id) {
        return gameState?.orders.find(order => order.id === id);
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
        if (!staff) return;
        staff.task = task;
        updateSelectedStaff();
    }

    function safeBind(id, eventName, callback) {
        const element = $(id);

        if (element) {
            element.addEventListener(eventName, callback);
        }
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

            target,
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

            // *** Each starting chef has a department assignment.
            departmentAssignments: {
                preparation: ["olivia"],
                cutting: ["tina"],
                cooking: ["sam"],
                plating: ["kevin"]
            },

            // *** Bella and Marcus are assigned separately.
            frontHouseAssignments: {
                receptionist: false,
                waiter: false
            },

            // *** One new employee per department every seven completed days.
            staffRecruitmentCount: 0,

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
            staff.task = staff.frontHouse
                ? "Waiting"
                : `Assigned: ${getDepartmentName(staff.department)}`;
            staff.cooldown = 0;
        });

        selectedStaffId = null;
        selectedOrderId = null;

        hide("mainMenu");
        hide("reportModal");
        hide("pauseModal");
        show("gameScreen");

        setText(
            "targetExplanation",
            `Complete ${gameState.target} successful orders. ${EXTRA_CUSTOMERS} extra customers will arrive.`
        );

        updateAllUI();
        drawKitchen();

        // *** The first customer arrives immediately.
        createCustomer();

        startGameLoop();

        toast(`Day ${gameState.day} has started! Today's target: ${gameState.target}.`);
    }

    function getDepartmentName(id) {
        return DEPARTMENTS.find(department => department.id === id)?.name || "Unassigned";
    }

    /* =====================================================
       8. CUSTOMER GENERATION
    ===================================================== */

    function createCustomer() {
        if (!gameState || paused) return;

        if (gameState.customersCreated >= gameState.totalCustomers) {
            return;
        }

        const recipeIndex = (gameState.day - 1) % RECIPES.length;
        const recipe = getRecipe(recipeIndex);

        const order = {
            id: gameState.nextCustomerId++,
            customer: CUSTOMER_NAMES[
                randomNumber(0, CUSTOMER_NAMES.length - 1)
            ],
            recipeIndex,
            recipe: recipe.name,

            status: "waiting",
            assignedStaff: null,

            patience: 100,
            createdAt: gameState.clockMinutes,

            cookingRemaining: 0,
            quality: 100,
            greetingComplete: false,
            cookingComplete: false,
            served: false,

            // *** Track the automatic four-department workflow.
            pipelineStageIndex: 0,
            pipelineStageRemaining: 0,
            pipelineStaffId: null,
            ingredientsPaid: false
        };

        gameState.orders.push(order);
        gameState.customersCreated++;

        toast(`${order.customer} has arrived! Order: ${order.recipe}`);

        processReceptionQueue();
        updateAllUI();
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

            // *** Run the automatic kitchen departments.
            updateKitchenPipeline();

            // *** Process receptionist and waiter assignments.
            processReceptionQueue();
            processWaiterQueue();

            updateStaffCooldowns();
            updateCustomerArrivals();

            updateAllUI();
            drawKitchen();

            checkDayCompletion();

        }, 1000);
    }

    function updateGameTime() {
        const speed = Number(gameState.settings.gameSpeed) || 1;

        // One real second represents speed / 60 game minutes.
        // A full 12-hour restaurant day takes 12 real hours at normal speed.
        gameState.clockMinutes += speed / 60;

        if (gameState.clockMinutes >= DAY_START_MINUTES + DAY_LENGTH_MINUTES) {
            gameState.clockMinutes = DAY_START_MINUTES + DAY_LENGTH_MINUTES;
        }
    }

    function updateCustomerArrivals() {
        if (gameState.customersCreated >= gameState.totalCustomers) return;

        // *** Real-time arrival intervals: 10 seconds for Days 1–2, then 5.
        const arrivalInterval = gameState.day <= 2 ? 10 : 5;

        gameState.customerArrivalAccumulator += 1;

        if (gameState.customerArrivalAccumulator >= arrivalInterval) {
            gameState.customerArrivalAccumulator = 0;
            createCustomer();
        }
    }

    function updateCustomerPatience() {
        gameState.orders.forEach(order => {
            if (
                order.status === "served" ||
                order.status === "lost"
            ) {
                return;
            }

            const speed = Number(gameState.settings.gameSpeed) || 1;

            let patienceLoss = 0.015 * speed;

            if (
                order.status === "cooking" ||
                order.status === "plating"
            ) {
                patienceLoss *= 0.4;
            }

            order.patience = Math.max(0, order.patience - patienceLoss);

            if (order.patience <= 0) {
                loseCustomer(order);
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

        toast(`${staff.name} selected.`);
    }

    function updateSelectedStaff() {
        const staff = getStaff(selectedStaffId);

        if (!staff) {
            setText("selectedStaffLabel", "No staff selected");
            setText("selectedStaffName", "Select a staff member");
            setText("selectedStaffRole", "Click an NPC in the kitchen to begin.");
            setText("selectedStaffTask", "Waiting");
            setText("selectedAvatar", "?");
        } else {
            setText("selectedStaffLabel", `${staff.name} selected`);
            setText("selectedStaffName", staff.name);
            setText("selectedStaffRole", staff.role);
            setText("selectedStaffTask", staff.task);
            setText("selectedAvatar", staff.name.charAt(0));
        }

        const bella = getStaff("bella");
        const marcus = getStaff("marcus");

        setText(
            "bellaStatus",
            gameState?.frontHouseAssignments?.receptionist
                ? "ASSIGNED"
                : "UNASSIGNED"
        );

        setText(
            "marcusStatus",
            gameState?.frontHouseAssignments?.waiter
                ? "ASSIGNED"
                : "UNASSIGNED"
        );

        if (bella) {
            bella.task = gameState?.frontHouseAssignments?.receptionist
                ? "Registering customers"
                : "Waiting for assignment";
        }

        if (marcus) {
            marcus.task = gameState?.frontHouseAssignments?.waiter
                ? "Serving completed meals"
                : "Waiting for assignment";
        }
    }

    /* =====================================================
       11. DEPARTMENT STAFF ASSIGNMENTS
    ===================================================== */

    function assignStaffToDepartment(staffId, departmentId) {
        if (!gameState) return;

        const staff = getStaff(staffId);
        const department = DEPARTMENTS.find(item => item.id === departmentId);

        if (!staff || !department || staff.frontHouse) return;

        if (staff.busy) {
            toast(`${staff.name} is currently working on an order.`);
            return;
        }

        // *** Remove this employee from their previous department.
        Object.values(gameState.departmentAssignments).forEach(list => {
            const index = list.indexOf(staff.id);

            if (index !== -1) {
                list.splice(index, 1);
            }
        });

        // *** Assign the employee to the selected department.
        if (!gameState.departmentAssignments[departmentId]) {
            gameState.departmentAssignments[departmentId] = [];
        }

        gameState.departmentAssignments[departmentId].push(staff.id);

        staff.department = departmentId;
        staff.task = `Assigned: ${department.name}`;

        toast(`${staff.name} assigned to ${department.name}.`);

        renderDepartmentAssignments();
        updateAllUI();
        drawKitchen();
        saveGame(false);
    }

    function openDepartmentAssignment(departmentId) {
        if (!gameState) return;

        const department = DEPARTMENTS.find(item => item.id === departmentId);
        if (!department) return;

        currentDepartmentId = departmentId;

        setText("departmentModalTitle", `${department.name} Department`);
        setText("departmentModalDescription", department.description);

        renderDepartmentAssignmentOptions();

        show("departmentModal");
    }

    function renderDepartmentAssignmentOptions() {
        const container = $("departmentAssignmentContent");

        if (!container || !currentDepartmentId) return;

        const department = DEPARTMENTS.find(
            item => item.id === currentDepartmentId
        );

        const assignedIds =
            gameState.departmentAssignments[currentDepartmentId] || [];

        const availableStaff = gameState.staff.filter(staff =>
            !staff.frontHouse && !staff.busy
        );

        container.innerHTML = `
            <div class="department-assignment-list">
                <h4>Currently assigned</h4>

                ${
                    assignedIds.length
                        ? assignedIds.map(id => {
                            const staff = getStaff(id);

                            return staff
                                ? `<div class="department-staff-row">
                                    <strong>${escapeHTML(staff.name)}</strong>
                                    <span>${escapeHTML(staff.role)}</span>
                                    <button
                                        type="button"
                                        data-remove-department-staff="${escapeHTML(staff.id)}"
                                    >REMOVE</button>
                                </div>`
                                : "";
                        }).join("")
                        : "<p>No employees assigned yet.</p>"
                }

                <h4>Available employees</h4>

                ${
                    availableStaff.length
                        ? availableStaff
                            .filter(staff => !assignedIds.includes(staff.id))
                            .map(staff => `
                                <div class="department-staff-row">
                                    <strong>${escapeHTML(staff.name)}</strong>
                                    <span>${escapeHTML(staff.role)}</span>
                                    <button
                                        type="button"
                                        data-add-department-staff="${escapeHTML(staff.id)}"
                                    >ASSIGN</button>
                                </div>
                            `).join("")
                        : "<p>No available employees.</p>"
                }
            </div>
        `;
    }

    function removeStaffFromDepartment(staffId, departmentId) {
        const staff = getStaff(staffId);

        if (!staff || staff.busy) return;

        const list = gameState.departmentAssignments[departmentId] || [];
        const index = list.indexOf(staffId);

        if (index !== -1) {
            list.splice(index, 1);
        }

        staff.department = null;
        staff.task = "Unassigned";

        renderDepartmentAssignmentOptions();
        renderDepartmentAssignments();
        updateAllUI();
        drawKitchen();

        toast(`${staff.name} removed from ${getDepartmentName(departmentId)}.`);
        saveGame(false);
    }

    function renderDepartmentAssignments() {
        if (!gameState) return;

        const totalStaff = gameState.staff.filter(staff => !staff.frontHouse).length;

        setText("departmentStaffCount", `${totalStaff} kitchen employees`);

        DEPARTMENTS.forEach(department => {
            const ids = gameState.departmentAssignments[department.id] || [];
            const names = ids
                .map(id => getStaff(id)?.name)
                .filter(Boolean);

            setText(
                `${department.id}StaffStatus`,
                names.length ? names.join(", ") : "No staff assigned"
            );
        });
    }

    /* =====================================================
       12. RECEPTIONIST AND WAITER ASSIGNMENTS
    ===================================================== */

    function assignReceptionist() {
        if (!gameState) return;

        gameState.frontHouseAssignments.receptionist =
            !gameState.frontHouseAssignments.receptionist;

        const assigned = gameState.frontHouseAssignments.receptionist;
        const bella = getStaff("bella");

        if (bella) {
            bella.task = assigned ? "Registering customers" : "Waiting";
        }

        setText(
            "assignReceptionButton",
            assigned ? "UNASSIGN BELLA" : "ASSIGN BELLA"
        );

        toast(
            assigned
                ? "Bella is now handling customer registrations."
                : "Bella has been unassigned."
        );

        processReceptionQueue();
        updateAllUI();
        saveGame(false);
    }

    function assignWaiter() {
        if (!gameState) return;

        gameState.frontHouseAssignments.waiter =
            !gameState.frontHouseAssignments.waiter;

        const assigned = gameState.frontHouseAssignments.waiter;
        const marcus = getStaff("marcus");

        if (marcus) {
            marcus.task = assigned ? "Serving completed meals" : "Waiting";
        }

        setText(
            "assignWaiterButton",
            assigned ? "UNASSIGN MARCUS" : "ASSIGN MARCUS"
        );

        toast(
            assigned
                ? "Marcus is now responsible for serving meals."
                : "Marcus has been unassigned."
        );

        processWaiterQueue();
        updateAllUI();
        saveGame(false);
    }

    function processReceptionQueue() {
        if (!gameState || paused) return;
        if (!gameState.frontHouseAssignments.receptionist) return;

        const bella = getStaff("bella");
        if (!bella) return;

        gameState.orders.forEach(order => {
            if (order.status !== "waiting") return;

            order.status = "preparing";
            order.greetingComplete = true;
            order.pipelineStageIndex = 0;
            order.pipelineStageRemaining = 0;
            order.pipelineStaffId = null;

            toast(`Bella registered ${order.customer}'s order.`);
        });

        bella.task = "Registering customers";
    }

    function processWaiterQueue() {
        if (!gameState || paused) return;
        if (!gameState.frontHouseAssignments.waiter) return;

        const marcus = getStaff("marcus");
        if (!marcus) return;

        const readyOrders = gameState.orders.filter(
            order => order.status === "ready"
        );

        readyOrders.forEach(order => {
            if (order.served || order.status !== "ready") return;

            marcus.task = `Serving ${order.customer}`;
            serveCustomer(order);
        });

        marcus.task = "Serving completed meals";
    }

    /* =====================================================
       13. AUTOMATIC KITCHEN WORKFLOW
    ===================================================== */

    function getAvailableDepartmentStaff(departmentId) {
        const assignedStaff =
            gameState.departmentAssignments[departmentId] || [];

        return assignedStaff
            .map(id => getStaff(id))
            .find(staff => staff && !staff.busy && staff.cooldown <= 0);
    }

    function updateKitchenPipeline() {
        if (!gameState) return;

        const speed = Number(gameState.settings.gameSpeed) || 1;

        gameState.orders.forEach(order => {
            if (
                !["preparing", "cutting", "cooking", "plating"].includes(order.status)
            ) {
                return;
            }

            if (order.status === "lost" || order.status === "served") return;

            const stageIndex = order.pipelineStageIndex || 0;

            if (stageIndex >= DEPARTMENTS.length) {
                order.status = "ready";
                processWaiterQueue();
                return;
            }

            const department = DEPARTMENTS[stageIndex];

            let staff = order.pipelineStaffId
                ? getStaff(order.pipelineStaffId)
                : null;

            if (!staff) {
                staff = getAvailableDepartmentStaff(department.id);

                // Wait for an employee to become available.
                if (!staff) return;

                // Check ingredients before starting the cooking department.
                if (department.id === "cooking" && !order.ingredientsPaid) {
                    const recipe = getRecipe(order.recipeIndex);

                    if (gameState.ingredients < recipe.cost) {
                        toast(`Not enough ingredients for ${recipe.name}.`);
                        loseCustomer(order);
                        return;
                    }

                    gameState.ingredients -= recipe.cost;
                    gameState.dailyExpenses += recipe.cost;
                    order.ingredientsPaid = true;
                }

                staff.busy = true;
                staff.currentOrder = order.id;
                staff.task = `${department.name}: ${order.recipe}`;

                order.pipelineStaffId = staff.id;

                if (department.id === "cooking") {
                    const recipe = getRecipe(order.recipeIndex);

                    order.pipelineStageRemaining =
                        gameState.upgrades.fasterKitchen
                            ? recipe.time * 0.85
                            : recipe.time;
                } else {
                    order.pipelineStageRemaining = department.duration;
                }
            }

            order.pipelineStageRemaining -= speed;

            if (order.pipelineStageRemaining > 0) return;

            // Release the employee when the department is finished.
            staff.busy = false;
            staff.currentOrder = null;
            staff.cooldown = 0;
            staff.task = `Assigned: ${department.name}`;

            if (department.id === "cooking") {
                const recipe = getRecipe(order.recipeIndex);
                order.quality = calculateCookingQuality(recipe, staff);
            }

            order.pipelineStageIndex++;
            order.pipelineStaffId = null;
            order.pipelineStageRemaining = 0;

            if (order.pipelineStageIndex >= DEPARTMENTS.length) {
                order.status = "ready";
                order.cookingComplete = true;

                toast(`${order.recipe} is ready for Marcus!`);

                processWaiterQueue();
            } else {
                order.status = DEPARTMENTS[order.pipelineStageIndex].id;
            }
        });
    }

    function calculateCookingQuality(recipe, staff) {
        let quality = 100;

        quality += gameState.upgrades.betterTraining ? 5 : 0;
        quality += staff.id === "olivia" ? 5 : 0;

        if (recipe.difficulty >= 4 && staff.id !== "olivia") {
            quality -= 8;
        }

        if (gameState.upgrades.betterEquipment) {
            quality += 5;
        }

        return Math.min(100, quality);
    }

    /* =====================================================
       14. SERVING CUSTOMERS
    ===================================================== */

    function serveCustomer(order) {
        if (!order || order.served || order.status === "lost") return;

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
                staff.task = staff.department
                    ? `Assigned: ${getDepartmentName(staff.department)}`
                    : "Waiting";
            }
        });

        updateAllUI();

        toast(`Order completed! +R${earnings}`);

        checkDayCompletion();
    }

    /* =====================================================
       15. CUSTOMER LEAVING
    ===================================================== */

    function loseCustomer(order) {
        if (
            !order ||
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
                staff.task = staff.department
                    ? `Assigned: ${getDepartmentName(staff.department)}`
                    : "Waiting";
            }
        });

        order.pipelineStaffId = null;

        toast(`${order.customer} has left without being served.`);

        updateAllUI();
        drawKitchen();
        checkDayCompletion();
    }

    /* =====================================================
       16. WEEKLY STAFF RECRUITMENT
    ===================================================== */

    function recruitWeeklyStaff() {
        if (!gameState) return;

        const completedWeeks = Math.floor(gameState.completedDays / 7);

        if (completedWeeks <= gameState.staffRecruitmentCount) return;

        const newEmployees = [];

        DEPARTMENTS.forEach((department, index) => {
            const number = gameState.staff.length + 1;

            const name = `Staff ${number}`;

            const newStaff = {
                id: `staff_${Date.now()}_${number}_${index}`,
                name,
                role: `${department.name} Staff`,
                shortRole: department.name,
                department: department.id,
                color: STAFF_COLORS[
                    randomNumber(0, STAFF_COLORS.length - 1)
                ],
                task: `Assigned: ${department.name}`,
                x: 0.25 + (index * 0.16),
                y: 0.65,
                busy: false,
                currentOrder: null,
                cooldown: 0,
                frontHouse: false
            };

            gameState.staff.push(newStaff);

            gameState.departmentAssignments[department.id].push(newStaff.id);

            newEmployees.push(newStaff.name);
        });

        gameState.staffRecruitmentCount = completedWeeks;

        renderDepartmentAssignments();

        toast(
            `Weekly recruitment! Four new kitchen employees joined your team.`
        );

        saveGame(false);
    }

    /* =====================================================
       17. DAILY COMPLETION
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

        // *** Recruit one new employee in each department every seven days.
        if (gameState.completedDays % 7 === 0) {
            recruitWeeklyStaff();
        }

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

            setText(
                "reportMessage",
                `You completed your 30-day restaurant journey with R${gameState.money} and ${gameState.reputation}% reputation.`
            );

            if (nextButton) {
                nextButton.textContent = "RETURN TO MAIN MENU";
            }
        } else if (nextButton) {
            nextButton.textContent = "CONTINUE TO NEXT DAY";
        }

        saveGame(false);

        show("reportModal");

        updateAllUI();
    }

    /* =====================================================
       18. NEXT DAY
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

        gameState.staff.forEach(staff => {
            staff.busy = false;
            staff.currentOrder = null;
            staff.task = staff.department
                ? `Assigned: ${getDepartmentName(staff.department)}`
                : "Waiting";
        });

        const recipe = getRecipe(gameState.day - 1);

        toast(`Welcome to Day ${gameState.day}! New featured recipe: ${recipe.name}`);

        startDay();
        saveGame(false);
    }

    /* =====================================================
       19. RECIPE BOOK
    ===================================================== */

    function renderRecipeInstruction() {
        const recipe = getRecipe(currentRecipeIndex);

        setText(
            "recipePageDisplay",
            `PAGE ${currentRecipeIndex + 1} / ${RECIPES.length}`
        );

        setText(
            "recipeDifficulty",
            `${"★".repeat(recipe.difficulty)} ${recipe.difficulty === 1 ? "EASY" : recipe.difficulty <= 3 ? "MEDIUM" : "ADVANCED"} RECIPE`
        );

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

        const container = $("recipeLibraryContent");
        if (!container) return;

        container.innerHTML = `
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
       20. INVENTORY
    ===================================================== */

    function openInventory() {
        renderInventory();
        show("inventoryModal");
    }

    function renderInventory() {
        const container = $("inventoryContent");
        if (!container || !gameState) return;

        container.innerHTML = `
            <div class="inventory-card">
                <span>INGREDIENTS</span>
                <div>
                    <strong>General Ingredients</strong>
                    <p>Available kitchen ingredients</p>
                </div>
                <b>${gameState.ingredients}</b>
            </div>

            <div class="inventory-card">
                <span>COINS</span>
                <div>
                    <strong>Restaurant Coins</strong>
                    <p>Available spending money</p>
                </div>
                <b>R${gameState.money}</b>
            </div>

            <div class="inventory-card">
                <span>REPUTATION</span>
                <div>
                    <strong>Reputation</strong>
                    <p>Customer satisfaction reputation</p>
                </div>
                <b>${gameState.reputation}%</b>
            </div>

            <p class="management-note">
                Ingredients are automatically consumed when a meal reaches the cooking department.
                Successful orders earn restaurant coins.
            </p>
        `;
    }

    /* =====================================================
       21. UPGRADES
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
        const container = $("upgradeContent");
        if (!container || !gameState) return;

        container.innerHTML = UPGRADE_DATA.map(upgrade => {
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
       22. SAVE AND LOAD
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

            // *** Preserve all recruited employees, not just the original six.
            gameState.staff = data.staff.map(staff => ({
                ...staff,
                busy: false,
                currentOrder: null,
                cooldown: 0
            }));

            // *** Recover department assignments from older saves if needed.
            if (!gameState.departmentAssignments) {
                gameState.departmentAssignments = {
                    preparation: ["olivia"],
                    cutting: ["tina"],
                    cooking: ["sam"],
                    plating: ["kevin"]
                };
            }

            // *** Ensure all departments exist in the save.
            DEPARTMENTS.forEach(department => {
                if (!Array.isArray(gameState.departmentAssignments[department.id])) {
                    gameState.departmentAssignments[department.id] = [];
                }
            });

            // *** Recover receptionist and waiter assignment states.
            if (!gameState.frontHouseAssignments) {
                gameState.frontHouseAssignments = {
                    receptionist: false,
                    waiter: false
                };
            }

            if (typeof gameState.staffRecruitmentCount !== "number") {
                gameState.staffRecruitmentCount = 0;
            }

            if (!gameState.upgrades) {
                gameState.upgrades = {
                    betterEquipment: false,
                    fasterKitchen: false,
                    betterTraining: false
                };
            }

            if (!gameState.nextCustomerId) {
                gameState.nextCustomerId =
                    Math.max(0, ...gameState.orders.map(order => order.id)) + 1;
            }

            // *** Recover interrupted orders without losing customers.
            gameState.orders.forEach(order => {
                if (
                    order.status === "preparing" ||
                    order.status === "cutting" ||
                    order.status === "cooking" ||
                    order.status === "plating"
                ) {
                    order.pipelineStageIndex =
                        Math.max(0, DEPARTMENTS.findIndex(
                            department => department.id === order.status
                        ));

                    order.pipelineStageRemaining = 0;
                    order.pipelineStaffId = null;
                    order.ingredientsPaid = Boolean(order.ingredientsPaid);
                }

                if (order.status === "greeted") {
                    order.status = "preparing";
                    order.pipelineStageIndex = 0;
                    order.pipelineStageRemaining = 0;
                    order.pipelineStaffId = null;
                }
            });

            // *** Restore employee department links.
            gameState.staff.forEach(staff => {
                if (staff.frontHouse) return;

                const department = DEPARTMENTS.find(item =>
                    (gameState.departmentAssignments[item.id] || []).includes(staff.id)
                );

                staff.department = department?.id || staff.department || null;
                staff.task = staff.department
                    ? `Assigned: ${getDepartmentName(staff.department)}`
                    : "Unassigned";
            });

            selectedStaffId = null;
            selectedOrderId = null;

            paused = false;

            hide("mainMenu");
            hide("reportModal");
            hide("pauseModal");
            show("gameScreen");

            renderDepartmentAssignments();
            updateAllUI();
            drawKitchen();

            startGameLoop();

            toast("Restaurant progress restored.");

            return true;

        } catch (error) {
            console.error("Load failed:", error);
            toast("The saved restaurant could not be loaded.");
            return false;
        }
    }

    /* =====================================================
       23. PAUSE AND MENU
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
        hide("departmentModal");

        show("mainMenu");

        gameState = null;

        selectedStaffId = null;
        selectedOrderId = null;
    }

    /* =====================================================
       24. SETTINGS
    ===================================================== */

    function openSettings() {
        const settings = gameState
            ? gameState.settings
            : DEFAULT_SETTINGS;

        if ($("gameSpeedInput")) {
            $("gameSpeedInput").value = settings.gameSpeed;
        }

        if ($("soundInput")) {
            $("soundInput").checked = settings.sound;
        }

        show("settingsModal");
    }

    function saveSettings() {
        const settings = {
            gameSpeed: Number($("gameSpeedInput")?.value || 1),
            sound: $("soundInput")?.checked ?? true
        };

        if (gameState) {
            gameState.settings = settings;
        }

        hide("settingsModal");

        toast("Settings updated.");

        updateAllUI();
    }

    /* =====================================================
       25. ORDER DISPLAY
    ===================================================== */

    function renderOrders() {
        const list = $("orderList");
        if (!list || !gameState) return;

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

            if (order.status === "preparing") statusLabel = "PREPARING";
            if (order.status === "cutting") statusLabel = "CUTTING";
            if (order.status === "cooking") statusLabel = "COOKING";
            if (order.status === "plating") statusLabel = "PLATING";
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
                        <div class="order-customer">
                            <strong>${escapeHTML(order.customer)}</strong>
                            <small>Customer #${order.id}</small>
                        </div>

                        <span class="order-status">${statusLabel}</span>
                    </div>

                    <div class="order-food">
                        ${escapeHTML(order.recipe)}
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
       26. HUD UPDATES
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

        const progressElement = $("targetProgress");

        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }

        const arrivalInterval = gameState.day <= 2 ? 10 : 5;

        setText(
            "arrivalStatus",
            `New customers every ${arrivalInterval} seconds`
        );

        renderOrders();
        updateSelectedStaff();
        renderDepartmentAssignments();

        if (
            $("inventoryContent") &&
            $("inventoryModal") &&
            !$("inventoryModal").classList.contains("hidden")
        ) {
            renderInventory();
        }

        if (
            $("upgradeContent") &&
            $("upgradeModal") &&
            !$("upgradeModal").classList.contains("hidden")
        ) {
            renderUpgrades();
        }
    }

    /* =====================================================
       27. TOP-DOWN KITCHEN CANVAS
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

        // *** Dining floor.
        ctx.fillStyle = "#e7d9c4";
        ctx.fillRect(0, 0, width, height);

        // *** Floor tiles.
        ctx.strokeStyle = "rgba(80,75,65,0.10)";
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

        // *** Restaurant walls.
        ctx.fillStyle = "#34454a";
        ctx.fillRect(0, 0, width, 35);
        ctx.fillRect(0, 0, 35, height);
        ctx.fillRect(width - 35, 0, 35, height);

        // *** Reception.
        drawStation(60, 100, 240, 115, "RECEPTION", "#927a67");

        // *** Customer area.
        drawStation(350, 90, 330, 160, "DINING AREA", "#a48c70");

        // *** Preparation.
        drawStation(100, 360, 270, 110, "PREPARATION", "#758d8b");

        // *** Cutting.
        drawStation(410, 360, 250, 110, "CUTTING", "#80918a");

        // *** Cooking.
        drawStation(700, 360, 270, 110, "COOKING", "#60787b");

        // *** Plating.
        drawStation(1010, 360, 250, 110, "PLATING", "#927b92");

        // *** Storage and washing.
        drawStation(100, 560, 230, 95, "STORAGE", "#927c64");
        drawStation(950, 560, 230, 95, "CLEANING", "#6b8990");

        // *** Dining tables.
        drawTable(390, 145);
        drawTable(520, 145);

        // *** Staff positions.
        lastCanvasStaffPositions = [];

        gameState.staff.forEach((staff, index) => {
            let x = staff.x * width;
            let y = staff.y * height;

            // *** Keep recruited employees inside the kitchen area.
            if (staff.department && index >= STAFF_TEMPLATE.length) {
                const departmentIndex = DEPARTMENTS.findIndex(
                    department => department.id === staff.department
                );

                const assignedList =
                    gameState.departmentAssignments[staff.department] || [];

                const positionInDepartment = assignedList.indexOf(staff.id);

                x = 180 + (departmentIndex * 290);
                y = 500 + (Math.max(0, positionInDepartment) * 55);
            }

            drawStaff(staff, x, y);

            lastCanvasStaffPositions.push({
                id: staff.id,
                x,
                y,
                radius: 48
            });
        });

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

    function drawTable(x, y) {
        roundedRect(ctx, x, y, 75, 65, 12, "#80644c");

        ctx.fillStyle = "#c9aa82";
        ctx.fillRect(x + 8, y + 8, 59, 49);
    }

    function drawStaff(staff, x, y) {
        const selected = selectedStaffId === staff.id;

        // Selection ring.
        if (selected) {
            ctx.beginPath();
            ctx.arc(x, y, 43, 0, Math.PI * 2);
            ctx.strokeStyle = "#f5c75e";
            ctx.lineWidth = 7;
            ctx.stroke();
        }

        // Staff shadow.
        ctx.beginPath();
        ctx.ellipse(x, y + 23, 26, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();

        // Cartoon-style body.
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fillStyle = staff.color;
        ctx.fill();

        ctx.strokeStyle = "#34454a";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Face.
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

        // Name.
        ctx.textAlign = "center";
        ctx.font = "bold 17px Arial";
        ctx.fillStyle = "#24383b";
        ctx.fillText(staff.name, x, y + 65);

        ctx.font = "13px Arial";
        ctx.fillText(staff.shortRole, x, y + 84);

        // Busy indicator.
        if (staff.busy) {
            ctx.fillStyle = "#d58a3d";
            ctx.beginPath();
            ctx.arc(x + 28, y - 27, 9, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.textAlign = "left";
    }

    /* =====================================================
       28. CANVAS INTERACTION
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
       29. EVENT LISTENERS
    ===================================================== */

    function bindEvents() {
        safeBind("newGameButton", "click", createNewGame);

        safeBind("resumeButton", "click", () => {
            if (!loadGame()) {
                toast("Start a new restaurant first.");
            }
        });

        safeBind("menuSettingsButton", "click", openSettings);
        safeBind("pauseButton", "click", pauseGame);
        safeBind("resumeGameButton", "click", resumeGame);

        safeBind("mainMenuButton", "click", () => {
            saveGame(false);
            returnToMenu();
        });

        safeBind("saveButton", "click", () => saveGame(true));

        safeBind("pauseInventoryButton", "click", openInventory);
        safeBind("inventoryButton", "click", openInventory);
        safeBind("upgradeButton", "click", openUpgrades);
        safeBind("pauseUpgradeButton", "click", openUpgrades);

        safeBind("recipeButton", "click", () => {
            currentLibraryIndex = Math.max(0, gameState.day - 1);
            renderRecipeLibrary();
            show("recipeBookModal");
        });

        safeBind("pauseRecipeButton", "click", () => {
            currentLibraryIndex = Math.max(0, gameState.day - 1);
            renderRecipeLibrary();
            show("recipeBookModal");
        });

        safeBind("pauseSettingsButton", "click", openSettings);
        safeBind("saveSettingsButton", "click", saveSettings);
        safeBind("nextDayButton", "click", nextDay);

        safeBind("reportMenuButton", "click", () => {
            saveGame(false);
            returnToMenu();
        });

        // *** New front-of-house assignment buttons.
        safeBind("assignReceptionButton", "click", assignReceptionist);
        safeBind("assignWaiterButton", "click", assignWaiter);

        // *** Department assignment buttons.
        document.querySelectorAll("[data-assign-department]").forEach(button => {
            button.addEventListener("click", () => {
                openDepartmentAssignment(button.dataset.assignDepartment);
            });
        });

        // *** Department assignment modal interactions.
        safeBind("departmentAssignmentContent", "click", event => {
            const addButton = event.target.closest("[data-add-department-staff]");
            const removeButton = event.target.closest("[data-remove-department-staff]");

            if (addButton) {
                assignStaffToDepartment(
                    addButton.dataset.addDepartmentStaff,
                    currentDepartmentId
                );

                renderDepartmentAssignmentOptions();
            }

            if (removeButton) {
                removeStaffFromDepartment(
                    removeButton.dataset.removeDepartmentStaff,
                    currentDepartmentId
                );
            }
        });

        // *** Keep legacy instruction buttons harmless if the old modal remains.
        safeBind("submitInstructionButton", "click", submitCookingInstruction);
        safeBind("submitFrontHouseButton", "click", submitFrontHouseInstruction);

        safeBind("skipFrontHouseButton", "click", () => {
            finishFrontHouseInstruction(false);
        });

        safeBind("previousRecipeButton", "click", () => changeRecipe(-1));
        safeBind("nextRecipeButton", "click", () => changeRecipe(1));

        safeBind("libraryPreviousButton", "click", () => changeLibraryRecipe(-1));
        safeBind("libraryNextButton", "click", () => changeLibraryRecipe(1));

        safeBind("orderList", "click", event => {
            const button = event.target.closest("[data-order]");

            if (!button) return;

            selectedOrderId = Number(button.dataset.order);
            renderOrders();
        });

        safeBind("upgradeContent", "click", event => {
            const button = event.target.closest("[data-upgrade]");

            if (!button) return;

            purchaseUpgrade(button.dataset.upgrade);
        });

        if (canvas) {
            canvas.addEventListener("click", handleCanvasClick);
        }

        // Close modal buttons.
        document.querySelectorAll("[data-close]").forEach(button => {
            button.addEventListener("click", () => {
                const modalId = button.dataset.close;

                hide(modalId);

                if (modalId === "departmentModal") {
                    currentDepartmentId = null;
                }

                if (modalId === "instructionModal" && currentInstructionOrder) {
                    clearInterval(typingInterval);
                    currentInstructionOrder = null;
                }

                if (modalId === "frontHouseModal" && currentFrontHouseAction) {
                    finishFrontHouseInstruction(false);
                }
            });
        });
    }

    /* =====================================================
       30. INITIALISATION
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
        console.log("Departments available:", DEPARTMENTS.length);
        console.log("Maximum days:", MAX_DAYS);

        const saved = localStorage.getItem(SAVE_KEY);

        if (!saved) {
            if ($("resumeButton")) {
                $("resumeButton").disabled = true;
                $("resumeButton").style.opacity = "0.5";
            }
        } else if ($("resumeButton")) {
            $("resumeButton").disabled = false;
            $("resumeButton").style.opacity = "1";
        }
    }

    document.addEventListener("DOMContentLoaded", initialiseGame);

})();

