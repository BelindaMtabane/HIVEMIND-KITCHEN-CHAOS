
/* HIVEMIND: Kitchen Harmony
   Kitchen and recipe instruction system.
   Connects recipe instructions to automatically generated orders.
*/

(() => {
    "use strict";

    // Preserve an existing recipe book if the project already has one.
    if (!window.KitchenRecipes) {
        window.KitchenRecipes = [
            {
                id: "chicken-teriyaki",
                name: "Chicken Teriyaki Bowl",
                price: 65,
                instructions: [
                    "Prepare the rice",
                    "Slice the chicken",
                    "Cook the chicken",
                    "Add teriyaki sauce",
                    "Plate the meal"
                ]
            },
            {
                id: "salmon-sushi",
                name: "Salmon Sushi Set",
                price: 85,
                instructions: [
                    "Prepare the sushi rice",
                    "Slice the salmon",
                    "Prepare the seaweed",
                    "Roll the sushi",
                    "Plate the sushi"
                ]
            },
            {
                id: "vegetable-ramen",
                name: "Vegetable Ramen",
                price: 60,
                instructions: [
                    "Prepare the noodles",
                    "Chop the vegetables",
                    "Prepare the broth",
                    "Cook the noodles",
                    "Assemble the ramen"
                ]
            }
        ];
    }

    const activeTasks = new Map();
    const completedTasks = new Map();

    function getSimulation() {
        return window.KitchenSimulation || null;
    }

    function getRecipe(recipeId) {
        const recipes = window.KitchenRecipes || [];

        return recipes.find(recipe =>
            String(recipe.id) === String(recipeId)
        ) || null;
    }

    function getOrder(orderId) {
        const simulation = getSimulation();

        if (!simulation) return null;

        return simulation.getState().orders.find(order =>
            Number(order.id) === Number(orderId)
        ) || null;
    }

    function getStaff(staffId) {
        const staff = window.staffMembers || [];

        if (Array.isArray(staff)) {
            return staff.find(member =>
                member.id === staffId ||
                member.name === staffId
            ) || null;
        }

        if (staff && typeof staff === "object") {
            return staff[staffId] || null;
        }

        return null;
    }

    function normaliseInstruction(value) {
        return String(value || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }

    function notify(type, detail = {}) {
        window.dispatchEvent(
            new CustomEvent("hivemind:kitchen-" + type, {
                detail
            })
        );
    }

    function getTask(orderId) {
        return activeTasks.get(Number(orderId)) || null;
    }

    function startOrder(orderId, staffId) {
        const simulation = getSimulation();

        if (!simulation) {
            return {
                success: false,
                message: "Kitchen simulation is not ready."
            };
        }

        const order = getOrder(orderId);

        if (!order) {
            return {
                success: false,
                message: "Order could not be found."
            };
        }

        if (activeTasks.has(Number(orderId))) {
            return {
                success: false,
                message: "This order is already being prepared."
            };
        }

        const recipe = getRecipe(order.recipeId);

        const instructions = recipe
            ? recipe.instructions
            : order.instructions;

        if (!Array.isArray(instructions) || instructions.length === 0) {
            return {
                success: false,
                message: "This recipe has no preparation instructions."
            };
        }

        const assigned = simulation.assignOrder(orderId, staffId);

        if (!assigned) {
            return {
                success: false,
                message: "Could not assign this order to that staff member."
            };
        }

        const task = {
            orderId: Number(orderId),
            staffId,
            recipeName: order.recipeName,
            instructions: [...instructions],
            currentStep: 0,
            totalSteps: instructions.length,
            startedAt: Date.now(),
            status: "preparing"
        };

        activeTasks.set(Number(orderId), task);

        notify("task-started", {
            task: { ...task }
        });

        return {
            success: true,
            message: "Order assigned. Begin the recipe instructions.",
            task: { ...task }
        };
    }

    function submitInstruction(orderId, typedInstruction) {
        const task = getTask(orderId);

        if (!task || task.status !== "preparing") {
            return {
                success: false,
                message: "There is no active preparation task for this order."
            };
        }

        const expected = task.instructions[task.currentStep];

        const typed = normaliseInstruction(typedInstruction);
        const correct = normaliseInstruction(expected);

        if (!typed) {
            return {
                success: false,
                message: "Enter the instruction before submitting."
            };
        }

        if (typed !== correct) {
            notify("instruction-incorrect", {
                orderId: task.orderId,
                staffId: task.staffId,
                expected,
                entered: typedInstruction,
                currentStep: task.currentStep + 1
            });

            return {
                success: false,
                message: "Incorrect instruction. Check the recipe book and try again.",
                expected,
                currentStep: task.currentStep + 1
            };
        }

        task.currentStep++;

        notify("instruction-correct", {
            orderId: task.orderId,
            staffId: task.staffId,
            instruction: expected,
            currentStep: task.currentStep,
            totalSteps: task.totalSteps
        });

        if (task.currentStep >= task.totalSteps) {
            return finishOrder(task.orderId);
        }

        return {
            success: true,
            completed: false,
            message: "Correct instruction. Continue to the next step.",
            nextInstruction: task.instructions[task.currentStep],
            currentStep: task.currentStep,
            totalSteps: task.totalSteps
        };
    }

    function finishOrder(orderId) {
        const simulation = getSimulation();
        const task = getTask(orderId);

        if (!simulation || !task) {
            return {
                success: false,
                message: "Preparation task could not be completed."
            };
        }

        task.status = "completed";
        task.completedAt = Date.now();

        const completed = simulation.completeOrder(orderId);

        if (!completed) {
            task.status = "preparing";

            return {
                success: false,
                message: "The simulation could not complete this order."
            };
        }

        activeTasks.delete(Number(orderId));
        completedTasks.set(Number(orderId), { ...task });

        notify("task-completed", {
            task: { ...task }
        });

        return {
            success: true,
            completed: true,
            message: "Meal completed. Ready for Marcus to serve.",
            task: { ...task }
        };
    }

    function serveOrder(orderId) {
        const simulation = getSimulation();

        if (!simulation) {
            return {
                success: false,
                message: "Kitchen simulation is not ready."
            };
        }

        const completed = completedTasks.get(Number(orderId));

        if (!completed) {
            return {
                success: false,
                message: "This meal has not been completed yet."
            };
        }

        const served = simulation.serveOrder(orderId);

        if (!served) {
            return {
                success: false,
                message: "The customer could not be served."
            };
        }

        completedTasks.delete(Number(orderId));

        notify("meal-served", {
            orderId: Number(orderId)
        });

        return {
            success: true,
            message: "Meal served and payment collected."
        };
    }

    function getRecipeInstructions(recipeId) {
        const recipe = getRecipe(recipeId);

        return recipe
            ? [...recipe.instructions]
            : [];
    }

    function getProgress(orderId) {
        const task = getTask(orderId);

        if (!task) {
            const completed = completedTasks.get(Number(orderId));

            if (completed) {
                return {
                    status: "completed",
                    currentStep: completed.totalSteps,
                    totalSteps: completed.totalSteps,
                    percentage: 100
                };
            }

            return null;
        }

        return {
            status: task.status,
            currentStep: task.currentStep,
            totalSteps: task.totalSteps,
            percentage: Math.round(
                (task.currentStep / task.totalSteps) * 100
            )
        };
    }

    function getActiveTasks() {
        return Array.from(activeTasks.values()).map(task => ({
            ...task
        }));
    }

    function getCompletedTasks() {
        return Array.from(completedTasks.values()).map(task => ({
            ...task
        }));
    }

    function reset() {
        activeTasks.clear();
        completedTasks.clear();

        notify("reset");
    }

    window.KitchenSystem = {
        startOrder,
        submitInstruction,
        finishOrder,
        serveOrder,
        getRecipeInstructions,
        getProgress,
        getActiveTasks,
        getCompletedTasks,
        getTask,
        reset
    };

    // Compatibility with existing project initialisation.
    window.initialiseKitchen = function () {
        reset();
        console.log("HIVEMIND Kitchen System initialised.");
        return true;
    };

    console.log("HIVEMIND Kitchen System loaded.");
})();

