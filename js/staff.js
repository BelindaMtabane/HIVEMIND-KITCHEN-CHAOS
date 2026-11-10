
/* HIVEMIND: KITCHEN CHAOS - Staff System */

const staffMembers = [
    {
        id: 1,
        name: "Bella",
        role: "Receptionist",
        emoji: "👩‍💼",
        personality: "Dramatic",
        skill: 75,
        happiness: 85,
        energy: 90,
        experience: 0,
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
        emoji: "🧑‍🍳",
        personality: "Overconfident",
        skill: 70,
        happiness: 80,
        energy: 85,
        experience: 0,
        dialogue: [
            "I can carry seven plates. Probably. Let's not test that.",
            "I am basically the face of this restaurant.",
            "The customers love me. I think. One waved at me yesterday."
        ]
    },
    {
        id: 3,
        name: "Chef Oliver",
        role: "Chef",
        emoji: "👨‍🍳",
        personality: "Perfectionist",
        skill: 85,
        happiness: 75,
        energy: 80,
        experience: 0,
        dialogue: [
            "That potato was cut incorrectly. I will remember this.",
            "Cooking is an art. Please stop calling it food assembly.",
            "I need better equipment. My talent is being wasted."
        ]
    },
    {
        id: 4,
        name: "Tina",
        role: "Kitchen Assistant",
        emoji: "👩‍🍳",
        personality: "Energetic",
        skill: 65,
        happiness: 95,
        energy: 100,
        experience: 0,
        dialogue: [
            "I cleaned everything! Even things that weren't dirty!",
            "Let's make today amazing!",
            "I found a spoon behind the fridge. It has been there since 2019."
        ]
    },
    {
        id: 5,
        name: "Kevin",
        role: "Cleaner",
        emoji: "🧹",
        personality: "Sarcastic",
        skill: 60,
        happiness: 70,
        energy: 75,
        experience: 0,
        dialogue: [
            "I cleaned that floor five minutes ago. WHO IS DROPPING THINGS?",
            "I am starting to think the kitchen is actively fighting me.",
            "At least the mop understands me."
        ]
    },
    {
        id: 6,
        name: "Sam",
        role: "Kitchen Assistant",
        emoji: "🧑‍🍳",
        personality: "Sleepy",
        skill: 55,
        happiness: 80,
        energy: 60,
        experience: 0,
        dialogue: [
            "Is it lunchtime? I thought it was yesterday.",
            "I am awake. My body is here. My brain is on holiday.",
            "Can we install a coffee machine? Asking for a friend."
        ]
    }
];

// Display all staff members.
function renderStaff() {
    const container = document.getElementById("staff-list");

    if (!container) return;

    container.innerHTML = staffMembers.map(staff => `
        <article class="card staff-card">
            <div class="staff-avatar">${staff.emoji}</div>
            <h3>${staff.name}</h3>
            <p>${staff.role} · ${staff.personality}</p>

            <div class="staff-stats">
                ⭐ Skill: ${staff.skill}<br>
                ❤️ Happiness: ${staff.happiness}<br>
                ⚡ Energy: ${staff.energy}<br>
                🏆 XP: ${staff.experience}
            </div>

            <button onclick="talkToStaff(${staff.id})">
                Talk
            </button>

            <button class="secondary-button"
                onclick="trainStaff(${staff.id})">
                Train
            </button>

            <button class="secondary-button"
                onclick="assignStaffTask(${staff.id})">
                Assign Task
            </button>
        </article>
    `).join("");
}

// Open an individual staff conversation.
function talkToStaff(id) {
    const staff = staffMembers.find(member => member.id === id);

    if (!staff) return;

    const dialogue = staff.dialogue[
        Math.floor(Math.random() * staff.dialogue.length)
    ];

    alert(
        `${staff.emoji} ${staff.name}\n\n"${dialogue}"`
    );

    staff.happiness = Math.min(100, staff.happiness + 2);

    renderStaff();
}

// Train a staff member.
function trainStaff(id) {
    const staff = staffMembers.find(member => member.id === id);

    if (!staff) return;

    if (typeof gameState === "undefined" || gameState.money < 50) {
        alert("Not enough money! Training costs $50.");
        return;
    }

    if (staff.skill >= 100) {
        alert(`${staff.name} has reached maximum skill!`);
        return;
    }

    gameState.money -= 50;
    staff.skill = Math.min(100, staff.skill + 5);
    staff.experience += 10;
    staff.happiness = Math.min(100, staff.happiness + 3);

    updateResources();
    renderStaff();
    saveGame();

    alert(`${staff.name} completed training! Skill increased.`);
}

// Assign a simple task to a staff member.
function assignStaffTask(id) {
    const staff = staffMembers.find(member => member.id === id);

    if (!staff) return;

    staff.experience += 5;
    staff.energy = Math.max(0, staff.energy - 5);

    if (typeof gameState !== "undefined") {
        gameState.ingredients += 5;
    }

    updateResources();
    renderStaff();
    saveGame();

    alert(
        `${staff.name} completed a task!\n` +
        `+5 Ingredients\n+5 XP`
    );
}

// Return staff data for saving.
function getStaffSaveData() {
    return staffMembers.map(staff => ({ ...staff }));
}

// Restore saved staff data.
function loadStaffSaveData(savedStaff) {
    if (!Array.isArray(savedStaff)) return;

    savedStaff.forEach(saved => {
        const staff = staffMembers.find(member => member.id === saved.id);

        if (staff) {
            staff.skill = saved.skill;
            staff.happiness = saved.happiness;
            staff.energy = saved.energy;
            staff.experience = saved.experience;
        }
    });

    renderStaff();
}

/* ============================================
   HIVEMIND: KITCHEN HARMONY
   STAFF ACTIVITY INTEGRATION
   ============================================ */

// *** Expose the existing staff collection to the simulation.
if (typeof staffMembers !== "undefined") {
    window.staffMembers = staffMembers;
}

// *** Add working information to each staff member.
function initialiseStaffActivity() {
    const members = window.staffMembers || [];

    members.forEach(member => {
        // *** Preserve existing values when available.
        if (typeof member.status === "undefined") {
            member.status = "Available";
        }

        if (typeof member.currentTask === "undefined") {
            member.currentTask = null;
        }

        if (typeof member.energy === "undefined") {
            member.energy = 100;
        }

        if (typeof member.experience === "undefined") {
            member.experience = 0;
        }
    });

    console.log(
        "Staff activity ready:",
        members.length,
        "staff members"
    );
}

// *** Assign a staff member to a kitchen task.
function startStaffActivity(staffIndex, taskName) {
    const members = window.staffMembers || [];
    const member = members[staffIndex];

    if (!member) {
        console.warn("Staff member not found:", staffIndex);
        return false;
    }

    if (member.status === "Working") {
        console.warn(member.name, "is already working.");
        return false;
    }

    if (member.energy <= 0) {
        console.warn(member.name, "needs to rest.");
        return false;
    }

    member.status = "Working";
    member.currentTask = taskName;

    console.log(
        member.name,
        "started:",
        taskName
    );

    return true;
}

// *** Finish a task and award staff experience.
function finishStaffActivity(staffIndex) {
    const members = window.staffMembers || [];
    const member = members[staffIndex];

    if (!member) return;

    member.status = "Available";
    member.currentTask = null;
    member.experience = (member.experience || 0) + 5;
    member.energy = Math.max(0, member.energy - 5);

    console.log(
        member.name,
        "completed a task. Experience:",
        member.experience
    );
}

// *** Restore staff energy.
function restoreStaffEnergy() {
    const members = window.staffMembers || [];

    members.forEach(member => {
        member.energy = Math.min(
            100,
            (member.energy || 0) + 15
        );
    });

    console.log("Staff energy restored.");
}

// *** Make activity functions available to other scripts.
window.StaffActivity = {
    initialise: initialiseStaffActivity,
    start: startStaffActivity,
    finish: finishStaffActivity,
    restoreEnergy: restoreStaffEnergy
};

// *** Initialise after the page loads.
document.addEventListener("DOMContentLoaded", () => {
    initialiseStaffActivity();
});



