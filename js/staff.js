
// =====================================================
// HIVEMIND: KITCHEN HARMONY
// STAFF MANAGEMENT SYSTEM
// =====================================================

"use strict";

/* -----------------------------------------------------
   STAFF DATA
   ----------------------------------------------------- */

const staffMembers = [
    {
        id: 1,
        name: "Bella",
        role: "Receptionist",
        department: "Reception and Customer Service",
        emoji: "👩‍💼",
        personality: "Dramatic",
        skill: 75,
        happiness: 85,
        energy: 90,
        experience: 0,
        status: "Available",
        currentTask: null,
        dialogue: [
            "I have handled three customers today. I deserve a holiday.",
            "Someone asked me where the kitchen is. We are IN A RESTAURANT.",
            "I am smiling professionally, but internally I am screaming."
        ]
    },
    {
        id: 2,
        name: "Marcus",
        role: "Waiter",
        department: "Waiting and Serving",
        emoji: "🧑‍🍳",
        personality: "Overconfident",
        skill: 70,
        happiness: 80,
        energy: 85,
        experience: 0,
        status: "Available",
        currentTask: null,
        dialogue: [
            "I can carry seven plates. Probably. Let's not test that.",
            "I am basically the face of this restaurant.",
            "The customers love me. I think. One waved at me yesterday."
        ]
    },
    {
        id: 3,
        name: "Chef Olivia",
        role: "Main Chef",
        department: "Main Cooking",
        emoji: "👩‍🍳",
        personality: "Perfectionist",
        skill: 85,
        happiness: 75,
        energy: 80,
        experience: 0,
        status: "Available",
        currentTask: null,
        dialogue: [
            "That potato was cut incorrectly. I will remember this.",
            "Cooking is an art. Please stop calling it food assembly.",
            "I need better equipment. My talent is being wasted."
        ]
    },
    {
        id: 4,
        name: "Tina",
        role: "Food Preparation Assistant",
        department: "Food Preparation",
        emoji: "👩‍🍳",
        personality: "Energetic",
        skill: 65,
        happiness: 95,
        energy: 100,
        experience: 0,
        status: "Available",
        currentTask: null,
        dialogue: [
            "I cleaned everything! Even things that weren't dirty!",
            "Let's make today amazing!",
            "I found a spoon behind the fridge. It has been there since 2019."
        ]
    },
    {
        id: 5,
        name: "Kevin",
        role: "Kitchen Support",
        department: "Kitchen Support",
        emoji: "🧹",
        personality: "Sarcastic",
        skill: 60,
        happiness: 70,
        energy: 75,
        experience: 0,
        status: "Available",
        currentTask: null,
        dialogue: [
            "I cleaned that floor five minutes ago. WHO IS DROPPING THINGS?",
            "I am starting to think the kitchen is actively fighting me.",
            "At least the mop understands me."
        ]
    },
    {
        id: 6,
        name: "Sam",
        role: "Kitchen Support",
        department: "Kitchen Support",
        emoji: "🧑‍🍳",
        personality: "Sleepy",
        skill: 55,
        happiness: 80,
        energy: 60,
        experience: 0,
        status: "Available",
        currentTask: null,
        dialogue: [
            "Is it lunchtime? I thought it was yesterday.",
            "I am awake. My body is here. My brain is on holiday.",
            "Can we install a coffee machine? Asking for a friend."
        ]
    }
];

/* -----------------------------------------------------
   STAFF UTILITIES
   ----------------------------------------------------- */

// *** Use the shared game state.
function getStaffGameState() {
    return window.gameState ||
        (typeof gameState !== "undefined" ? gameState : null);
}

function getStaffById(id) {
    return staffMembers.find(
        member => String(member.id) === String(id)
    );
}

function isStaffAvailable(member) {
    return member &&
        member.status !== "Working" &&
        member.status !== "Resting" &&
        member.energy > 0;
}

function updateStaffResources() {
    if (typeof window.updateResources === "function") {
        window.updateResources();
    }

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }
}

/* -----------------------------------------------------
   DISPLAY STAFF
   ----------------------------------------------------- */

function renderStaff() {
    const container = document.getElementById("staff-list");

    if (!container) return;

    container.innerHTML = staffMembers.map(staff => `
        <article class="card staff-card">

            <div class="staff-avatar">
                ${staff.emoji}
            </div>

            <h3>${staff.name}</h3>

            <p>
                ${staff.role}
            </p>

            <p>
                <small>${staff.department}</small>
            </p>

            <p>
                <strong>Personality:</strong>
                ${staff.personality}
            </p>

            <div class="staff-status">
                <strong>Status:</strong>
                <span class="${
                    staff.status === "Working"
                        ? "staff-working"
                        : staff.status === "Resting"
                            ? "staff-resting"
                            : "staff-available"
                }">
                    ${staff.status}
                </span>
            </div>

            ${
                staff.currentTask
                ? `
                    <p class="staff-current-task">
                        🔧 ${staff.currentTask}
                    </p>
                `
                : ""
            }

            <div class="staff-stats">
                ⭐ Skill: ${staff.skill}<br>
                ❤️ Happiness: ${staff.happiness}<br>
                ⚡ Energy: ${staff.energy}<br>
                🏆 XP: ${staff.experience}
            </div>

            <button
                onclick="talkToStaff(${staff.id})"
            >
                Talk
            </button>

            <button
                class="secondary-button"
                onclick="trainStaff(${staff.id})"
                ${staff.status === "Working" ? "disabled" : ""}
            >
                Train
            </button>

            <button
                class="secondary-button"
                onclick="assignStaffTask(${staff.id})"
                ${!isStaffAvailable(staff) ? "disabled" : ""}
            >
                Assign Task
            </button>

            ${
                staff.status === "Working"
                ? `
                    <button
                        class="secondary-button"
                        onclick="cancelStaffTask(${staff.id})"
                    >
                        Cancel Task
                    </button>
                `
                : ""
            }

        </article>
    `).join("");
}

/* -----------------------------------------------------
   STAFF CONVERSATIONS
   ----------------------------------------------------- */

function talkToStaff(id) {
    const staff = getStaffById(id);

    if (!staff) return;

    const dialogue = staff.dialogue[
        Math.floor(Math.random() * staff.dialogue.length)
    ];

    alert(
        `${staff.emoji} ${staff.name}\n\n"${dialogue}"`
    );

    staff.happiness = Math.min(
        100,
        staff.happiness + 2
    );

    renderStaff();

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }
}

/* -----------------------------------------------------
   STAFF TRAINING
   ----------------------------------------------------- */

function trainStaff(id) {
    const staff = getStaffById(id);
    const state = getStaffGameState();

    if (!staff) return;

    if (!state) {
        alert("Game data is not ready.");
        return;
    }

    if (staff.status === "Working") {
        alert(`${staff.name} is currently working.`);
        return;
    }

    if (staff.energy <= 0) {
        alert(`${staff.name} is exhausted and needs to rest.`);
        return;
    }

    if (staff.skill >= 100) {
        alert(`${staff.name} has reached maximum skill!`);
        return;
    }

    // *** CHANGED: Training uses South African rand.
    const trainingCost = 50;

    if (Number(state.money || 0) < trainingCost) {
        alert("Not enough money! Training costs R50.");
        return;
    }

    // *** Apply the training cost and skill improvement.
    state.money -= trainingCost;

    staff.skill = Math.min(
        100,
        staff.skill + 5
    );

    staff.experience += 10;

    staff.happiness = Math.min(
        100,
        staff.happiness + 3
    );

    // *** Training uses energy.
    staff.energy = Math.max(
        0,
        staff.energy - 5
    );

    updateStaffResources();
    renderStaff();

    alert(
        `${staff.name} completed training! 🎓\n` +
        `Skill increased to ${staff.skill}.`
    );
}

/* -----------------------------------------------------
   STAFF TASK MANAGEMENT
   ----------------------------------------------------- */

const staffTaskTimers = new Map();

// *** Assign a timed task instead of awarding ingredients instantly.
function assignStaffTask(id) {
    const staff = getStaffById(id);

    if (!staff) return false;

    if (!isStaffAvailable(staff)) {
        alert(`${staff.name} is unavailable or needs to rest.`);
        return false;
    }

    // *** Task duration is affected by staff skill and prep upgrades.
    const skillMultiplier = 1 + (staff.skill / 100);

    const prepMultiplier =
        window.KitchenUpgradeEffects?.staffEfficiency?.() || 1;

    const baseDuration = 10;

    const duration = Math.max(
        4,
        Math.ceil(
            baseDuration /
            (skillMultiplier * prepMultiplier)
        )
    );

    staff.status = "Working";
    staff.currentTask = "General kitchen duties";

    renderStaff();

    console.log(
        `${staff.name} started a task. Duration: ${duration} seconds.`
    );

    const timer = setTimeout(() => {
        finishGeneralStaffTask(id);
    }, duration * 1000);

    staffTaskTimers.set(id, timer);

    return true;
}

// *** Complete general staff work and award experience only.
function finishGeneralStaffTask(id) {
    const staff = getStaffById(id);

    if (
        !staff ||
        staff.status !== "Working" ||
        staff.currentTask !== "General kitchen duties"
    ) return;

    staffTaskTimers.delete(id);

    staff.status = "Available";
    staff.currentTask = null;

    staff.experience += 5;

    staff.energy = Math.max(
        0,
        staff.energy - 5
    );

    staff.happiness = Math.min(
        100,
        staff.happiness + 1
    );

    renderStaff();

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    alert(
        `${staff.name} completed their task!\n` +
        `+5 XP\n` +
        `Energy: ${staff.energy}`
    );

    console.log(
        `${staff.name} completed general staff duties.`
    );
}

// *** Cancel a general task safely.
function cancelStaffTask(id) {
    const staff = getStaffById(id);

    if (!staff || staff.status !== "Working") return false;

    // *** Only cancel general tasks here.
    // *** KitchenSimulation manages restaurant order assignments.
    if (staff.currentTask !== "General kitchen duties") {
        alert(
            "This staff member is assigned to a customer order. " +
            "Cancel that assignment from the order card."
        );

        return false;
    }

    const timer = staffTaskTimers.get(id);

    if (timer) {
        clearTimeout(timer);
        staffTaskTimers.delete(id);
    }

    staff.status = "Available";
    staff.currentTask = null;

    renderStaff();

    console.log(`${staff.name}'s task was cancelled.`);

    return true;
}

/* -----------------------------------------------------
   STAFF ENERGY
   ----------------------------------------------------- */

// *** Restore energy without exceeding 100.
function restoreStaffEnergy(amount = 15) {
    staffMembers.forEach(staff => {
        if (staff.status === "Working") return;

        staff.energy = Math.min(
            100,
            staff.energy + amount
        );

        if (staff.energy > 0 && staff.status === "Resting") {
            staff.status = "Available";
        }
    });

    renderStaff();

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    console.log("Staff energy restored.");
}

// *** Allow exhausted staff to recover.
function restStaff(id) {
    const staff = getStaffById(id);

    if (!staff) return false;

    if (staff.status === "Working") {
        alert(`${staff.name} must finish or cancel their task first.`);
        return false;
    }

    staff.status = "Resting";
    staff.currentTask = "Resting";

    staff.energy = Math.min(
        100,
        staff.energy + 25
    );

    staff.status = "Available";
    staff.currentTask = null;

    renderStaff();

    if (typeof window.saveGame === "function") {
        window.saveGame();
    }

    return true;
}

/* -----------------------------------------------------
   STAFF SAVE DATA
   ----------------------------------------------------- */

// *** Preserve staff progression when saving.
function getStaffSaveData() {
    return staffMembers.map(staff => ({
        id: staff.id,
        skill: staff.skill,
        happiness: staff.happiness,
        energy: staff.energy,
        experience: staff.experience
    }));
}

// *** Restore saved staff progression.
function loadStaffSaveData(savedStaff) {
    if (!Array.isArray(savedStaff)) return;

    savedStaff.forEach(saved => {
        const staff = getStaffById(saved.id);

        if (!staff) return;

        staff.skill = Math.max(
            0,
            Math.min(100, Number(saved.skill ?? staff.skill))
        );

        staff.happiness = Math.max(
            0,
            Math.min(100, Number(saved.happiness ?? staff.happiness))
        );

        staff.energy = Math.max(
            0,
            Math.min(100, Number(saved.energy ?? staff.energy))
        );

        staff.experience = Math.max(
            0,
            Number(saved.experience ?? staff.experience)
        );

        // *** Never restore an unfinished working task from a save.
        staff.status = "Available";
        staff.currentTask = null;
    });

    renderStaff();

    console.log("Staff progression restored.");
}

/* -----------------------------------------------------
   STAFF ACTIVITY INTEGRATION
   ----------------------------------------------------- */

// *** Keep the existing staff collection accessible to other scripts.
window.staffMembers = staffMembers;

// *** Initialise staff activity without overwriting saved progression.
function initialiseStaffActivity() {
    staffMembers.forEach(member => {
        if (typeof member.status !== "string") {
            member.status = "Available";
        }

        if (typeof member.currentTask === "undefined") {
            member.currentTask = null;
        }

        if (typeof member.energy !== "number") {
            member.energy = 100;
        }

        if (typeof member.experience !== "number") {
            member.experience = 0;
        }
    });

    console.log(
        "Staff activity ready:",
        staffMembers.length,
        "staff members."
    );

    renderStaff();
}

// *** Start a task using the staff member's array position.
// *** The simulation also stores the stable staff ID.
function startStaffActivity(staffIndex, taskName) {
    const member = staffMembers[staffIndex];

    if (!member) {
        console.warn("Staff member not found:", staffIndex);
        return false;
    }

    if (!isStaffAvailable(member)) {
        console.warn(member.name, "is unavailable.");
        return false;
    }

    member.status = "Working";
    member.currentTask = taskName;

    renderStaff();

    console.log(
        member.name,
        "started:",
        taskName
    );

    return true;
}

// *** Finish a kitchen order and award experience.
function finishStaffActivity(staffIndex) {
    const member = staffMembers[staffIndex];

    if (!member || member.status !== "Working") return false;

    member.status = "Available";
    member.currentTask = null;

    member.experience =
        (member.experience || 0) + 5;

    member.energy = Math.max(
        0,
        member.energy - 5
    );

    renderStaff();

    console.log(
        member.name,
        "completed a kitchen task. XP:",
        member.experience
    );

    return true;
}

// *** Cancel a kitchen order assignment without awarding XP.
function cancelStaffActivity(staffIndex) {
    const member = staffMembers[staffIndex];

    if (!member || member.status !== "Working") return false;

    member.status = "Available";
    member.currentTask = null;

    renderStaff();

    console.log(
        member.name,
        "was released from their task."
    );

    return true;
}

/* -----------------------------------------------------
   PUBLIC STAFF API
   ----------------------------------------------------- */

window.StaffActivity = {
    initialise: initialiseStaffActivity,
    start: startStaffActivity,
    finish: finishStaffActivity,
    cancel: cancelStaffActivity,
    restoreEnergy: restoreStaffEnergy
};

window.staffMembers = staffMembers;

window.renderStaff = renderStaff;
window.talkToStaff = talkToStaff;
window.trainStaff = trainStaff;
window.assignStaffTask = assignStaffTask;
window.cancelStaffTask = cancelStaffTask;
window.finishGeneralStaffTask = finishGeneralStaffTask;
window.restoreStaffEnergy = restoreStaffEnergy;
window.restStaff = restStaff;
window.getStaffSaveData = getStaffSaveData;
window.loadStaffSaveData = loadStaffSaveData;

/* -----------------------------------------------------
   INITIALISATION
   ----------------------------------------------------- */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiseStaffActivity
    );
} else {
    initialiseStaffActivity();
}
