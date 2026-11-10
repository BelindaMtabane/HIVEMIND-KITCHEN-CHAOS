
"use strict";

/* =========================================================
   HIVEMIND: KITCHEN HARMONY
   Main game controller
   ========================================================= */

const Game = (() => {
  const SAVE_KEY = "hivemind_kitchen_harmony_v1";

  const CONFIG = {
    startingMoney: 500,
    startingIngredients: 80,
    startingQuality: 85,
    startingHarmony: 75,
    startingUtensils: 90,
    startingEfficiency: 75,
    dayStart: 8 * 60,
    dayEnd: 20 * 60,
    secondsPerGameMinute: 5,
    customerArrivalMin: 12000,
    customerArrivalMax: 20000,
    customerPatience: 100,
    ingredientPurchaseCost: 50,
    ingredientPurchaseAmount: 30
  };

  const STAFF_STARTERS = [
    {
      id: "bella",
      name: "Bella",
      role: "Receptionist",
      department: "Reception",
      emoji: "👩🏻‍💼",
      description: "Welcomes customers and manages the front of house.",
      tasks: ["Welcome customer", "Confirm customer order"]
    },
    {
      id: "marcus",
      name: "Marcus",
      role: "Waiter",
      department: "Service",
      emoji: "👨🏽‍🍳",
      description: "Responsible for delivering completed meals.",
      tasks: ["Deliver the order", "Serve the customer"]
    },
    {
      id: "olivia",
      name: "Chef Olivia",
      role: "Head Chef",
      department: "Cooking",
      emoji: "👩🏻‍🍳",
      description: "Supervises cooking and manages the main kitchen.",
      tasks: ["Cook the meal", "Check food quality"]
    },
    {
      id: "tina",
      name: "Tina",
      role: "Preparation Cook",
      department: "Preparation",
      emoji: "👩🏽‍🍳",
      description: "Prepares ingredients and organises the kitchen.",
      tasks: ["Prepare ingredients", "Check ingredients"]
    },
    {
      id: "sam",
      name: "Sam",
      role: "Kitchen Assistant",
      department: "Kitchen Support",
      emoji: "👨🏻‍🍳",
      description: "Supports food preparation and kitchen operations.",
      tasks: ["Prepare ingredients", "Assist the chef", "Clean station"]
    },
    {
      id: "kevin",
      name: "Kevin",
      role: "Kitchen Assistant",
      department: "Kitchen Support",
      emoji: "👨🏾‍🍳",
      description: "Supports the team and maintains kitchen equipment.",
      tasks: ["Assist the chef", "Clean station", "Plate the meal"]
    }
  ];

  const ORDER_STEPS = [
    {
      instruction: "Prepare ingredients",
      description: "Prepare the ingredients for this order.",
      department: "Preparation",
      station: "prepStationStatus",
      status: "Preparing"
    },
    {
      instruction: "Cook the meal",
      description: "Cook the order and monitor its progress.",
      department: "Cooking",
      station: "cookStationStatus",
      status: "Cooking"
    },
    {
      instruction: "Plate the meal",
      description: "Plate and check the completed meal.",
      department: "Plating",
      station: "plateStationStatus",
      status: "Plating"
    },
    {
      instruction: "Deliver the order",
      description: "Deliver the completed order to the customer.",
      department: "Service",
      station: null,
      status: "Ready"
    }
  ];

  const UPGRADES = [
    {
      id: "equipment",
      name: "Better kitchen equipment",
      description: "Improves kitchen efficiency.",
      cost: 180,
      bonus: 10
    },
    {
      id: "utensils",
      name: "Professional utensils",
      description: "Improves utensil condition.",
      cost: 120,
      bonus: 15
    },
    {
      id: "quality",
      name: "Food quality training",
      description: "Improves overall food quality.",
      cost: 200,
      bonus: 8
    },
    {
      id: "harmony",
      name: "Team coordination training",
      description: "Improves kitchen harmony.",
      cost: 160,
      bonus: 10
    }
  ];

  let state = createNewState();
  let gameInterval = null;
  let arrivalTimeout = null;
  let selectedStaffId = null;
  let selectedInstruction = null;
  let settingsReturnToGame = false;
  let paused = true;
  let audioContext = null;

  function createNewState() {
    return {
      day: 1,
      clock: CONFIG.dayStart,
      money: CONFIG.startingMoney,
      ingredients: CONFIG.startingIngredients,
      quality: CONFIG.startingQuality,
      harmony: CONFIG.startingHarmony,
      utensils: CONFIG.startingUtensils,
      efficiency: CONFIG.startingEfficiency,

      staff: STAFF_STARTERS.map(person => ({
        ...person,
        status: "Available",
        currentTask: "Waiting for instructions",
        assignedOrder: null,
        experience: 0,
        completedTasks: 0
      })),

      orders: [],
      customersServed: 0,
      customersLost: 0,
      customersArrived: 0,
      totalOrders: 0,
      completedOrders: 0,
      incorrectInstructions: 0,
      correctInstructions: 0,
      moneyEarnedToday: 0,
      moneySpentToday: 0,
      ingredientsUsedToday: 0,
      staffHired: 0,
      purchasedUpgrades: [],
      transactions: [],
      history: [],
      running: false,
      settings: {
        musicVolume: 45,
        soundVolume: 65,
        gameSpeed: 1
      },
      dayStatistics: null
    };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function show(elementId) {
    const element = $(elementId);
    if (element) element.classList.remove("hidden");
  }

  function hide(elementId) {
    const element = $(elementId);
    if (element) element.classList.add("hidden");
  }

  function formatMoney(value) {
    return "R" + Math.floor(value).toLocaleString("en-ZA");
  }

  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function toast(message, type = "success") {
    const container = $("toastContainer");
    if (!container) return;

    const element = document.createElement("div");
    element.className = `toast ${type}`;
    element.textContent = message;
    container.appendChild(element);

    setTimeout(() => element.remove(), 3500);
  }

  function message(text) {
    if ($("activityMessage")) {
      $("activityMessage").textContent = text;
    }
  }

  function playSound(frequency = 520, duration = 0.08) {
    if (state.settings.soundVolume <= 0) return;

    try {
      audioContext = audioContext || new (
        window.AudioContext || window.webkitAudioContext
      )();

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.frequency.value = frequency;
      gain.gain.value = state.settings.soundVolume / 100 * 0.04;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Audio is unavailable:", error);
    }
  }

  /* ---------------------------------------------------------
     SAVE AND LOAD
     --------------------------------------------------------- */

  function saveGame() {
    try {
      const saveData = {
        ...state,
        running: false
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      toast("Restaurant saved successfully.");
      return true;
    } catch (error) {
      console.error("Save failed:", error);
      toast("Could not save the restaurant.", "warning");
      return false;
    }
  }

  function loadGame() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return false;

      const loaded = JSON.parse(saved);

      if (!loaded || !Array.isArray(loaded.staff)) {
        return false;
      }

      state = {
        ...createNewState(),
        ...loaded,
        running: false
      };

      if (!state.settings) {
        state.settings = createNewState().settings;
      }

      state.orders = Array.isArray(state.orders) ? state.orders : [];
      state.staff = Array.isArray(state.staff) ? state.staff : [];

      selectedStaffId = state.staff[0]?.id || null;

      return true;
    } catch (error) {
      console.error("Load failed:", error);
      return false;
    }
  }

  function hasSave() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  /* ---------------------------------------------------------
     MENU AND SETTINGS
     --------------------------------------------------------- */

  function startNewGame() {
    stopTimers();

    if (hasSave()) {
      const accepted = window.confirm(
        "Starting a new restaurant will replace your saved restaurant. Continue?"
      );

      if (!accepted) return;
    }

    state = createNewState();
    selectedStaffId = "bella";
    paused = false;

    hide("mainMenu");
    hide("settingsScreen");
    hide("pauseModal");
    hide("reportModal");
    show("gameScreen");

    renderAll();
    beginDay();
  }

  function resumeGame() {
    if (!loadGame()) {
      toast("No saved restaurant was found.", "warning");
      return;
    }

    paused = false;

    hide("mainMenu");
    hide("settingsScreen");
    hide("pauseModal");
    show("gameScreen");

    renderAll();
    beginDay();
    message("Welcome back to your restaurant.");
  }

  function openMainMenu() {
    stopTimers();
    paused = true;
    state.running = false;

    hide("gameScreen");
    hide("pauseModal");
    hide("reportModal");
    hide("settingsScreen");
    show("mainMenu");

    updateMenuButtons();
  }

  function updateMenuButtons() {
    if ($("resumeButton")) {
      $("resumeButton").disabled = !hasSave();
      $("resumeButton").style.opacity = hasSave() ? "1" : ".4";
    }
  }

  function openSettings(fromGame = false) {
    settingsReturnToGame = fromGame;

    hide("mainMenu");
    hide("gameScreen");
    hide("pauseModal");
    show("settingsScreen");

    $("musicVolume").value = state.settings.musicVolume;
    $("soundVolume").value = state.settings.soundVolume;
    $("gameSpeed").value = state.settings.gameSpeed;
  }

  function closeSettings() {
    hide("settingsScreen");

    if (settingsReturnToGame) {
      show("gameScreen");
      show("pauseModal");
    } else {
      show("mainMenu");
    }

    updateMenuButtons();
  }

  function saveSettings() {
    state.settings.musicVolume = Number($("musicVolume").value);
    state.settings.soundVolume = Number($("soundVolume").value);
    state.settings.gameSpeed = Number($("gameSpeed").value);

    saveGame();
    closeSettings();
    toast("Settings updated.");
  }

  /* ---------------------------------------------------------
     DAY MANAGEMENT
     --------------------------------------------------------- */

  function beginDay() {
    if (state.clock >= CONFIG.dayEnd) {
      state.clock = CONFIG.dayStart;
    }

    state.running = true;
    paused = false;

    state.dayStatistics = {
      startedAt: Date.now()
    };

    message(`Day ${state.day} is now open. Welcome your customers!`);

    renderAll();
    startTimers();
    saveGame();
  }

  function startTimers() {
    stopTimers();

    gameInterval = setInterval(
      gameTick,
      1000
    );

    scheduleCustomerArrival();
  }

  function stopTimers() {
    if (gameInterval) clearInterval(gameInterval);
    if (arrivalTimeout) clearTimeout(arrivalTimeout);

    gameInterval = null;
    arrivalTimeout = null;
  }

  function gameTick() {
    if (!state.running || paused) return;

    const minutesPassed = Math.round(
      CONFIG.secondsPerGameMinute * state.settings.gameSpeed
    );

    state.clock += minutesPassed;

    updateClock();
    updateCustomerPatience();
    updateCookingProgress();
    updateStaffScene();

    if (state.clock >= CONFIG.dayEnd) {
      closeDay();
    }

    if (Math.random() < 0.03) {
      saveGameSilently();
    }
  }

  function updateClock() {
    const hours = Math.floor(state.clock / 60);
    const minutes = state.clock % 60;

    const time = `${String(hours % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    if ($("clockDisplay")) {
      $("clockDisplay").textContent = time;
    }
  }

  function closeDay() {
    if (!state.running) return;

    state.running = false;
    paused = true;
    stopTimers();

    const report = {
      day: state.day,
      served: state.customersServed,
      lost: state.customersLost,
      orders: state.totalOrders,
      completed: state.completedOrders,
      revenue: state.moneyEarnedToday,
      expenses: state.moneySpentToday,
      profit: state.moneyEarnedToday - state.moneySpentToday,
      quality: state.quality,
      harmony: state.harmony,
      correct: state.correctInstructions,
      incorrect: state.incorrectInstructions
    };

    state.history.push(report);

    saveGameSilently();
    renderReport(report);
    show("reportModal");

    playSound(390, .3);
  }

  function nextDay() {
    hide("reportModal");

    state.day += 1;
    state.clock = CONFIG.dayStart;

    state.orders = [];
    state.moneyEarnedToday = 0;
    state.moneySpentToday = 0;
    state.ingredientsUsedToday = 0;
    state.customersServed = 0;
    state.customersLost = 0;
    state.customersArrived = 0;
    state.totalOrders = 0;
    state.completedOrders = 0;
    state.correctInstructions = 0;
    state.incorrectInstructions = 0;

    state.staff.forEach(person => {
      person.status = "Available";
      person.currentTask = "Waiting for instructions";
      person.assignedOrder = null;
    });

    if (state.day % 7 === 1 && state.day > 1) {
      recruitStaffMember();
    }

    selectedStaffId = state.staff[0]?.id || null;

    beginDay();
  }

  function renderReport(report) {
    $("reportTitle").textContent = `Day ${report.day} complete!`;
    $("reportSubtitle").textContent =
      "Your restaurant has closed. Here is today's performance.";

    $("reportContent").innerHTML = `
      <div class="report-grid">
        <div class="report-stat">
          <small>Customers served</small>
          <strong>${report.served}</strong>
        </div>
        <div class="report-stat">
          <small>Customers lost</small>
          <strong>${report.lost}</strong>
        </div>
        <div class="report-stat">
          <small>Orders completed</small>
          <strong>${report.completed}</strong>
        </div>
        <div class="report-stat">
          <small>Revenue</small>
          <strong>${formatMoney(report.revenue)}</strong>
        </div>
        <div class="report-stat">
          <small>Expenses</small>
          <strong>${formatMoney(report.expenses)}</strong>
        </div>
        <div class="report-stat">
          <small>Daily profit</small>
          <strong>${formatMoney(report.profit)}</strong>
        </div>
        <div class="report-stat">
          <small>Food quality</small>
          <strong>${report.quality}%</strong>
        </div>
        <div class="report-stat">
          <small>Kitchen harmony</small>
          <strong>${report.harmony}%</strong>
        </div>
        <div class="report-stat">
          <small>Correct instructions</small>
          <strong>${report.correct}</strong>
        </div>
        <div class="report-stat">
          <small>Incorrect instructions</small>
          <strong>${report.incorrect}</strong>
        </div>
      </div>
      <div class="report-feedback">
        <strong>Kitchen feedback</strong><br>
        ${getDailyFeedback(report)}
      </div>
    `;
  }

  function getDailyFeedback(report) {
    if (report.lost > 2) {
      return "Several customers left before receiving their orders. Try assigning instructions earlier and keeping an eye on waiting customers.";
    }

    if (report.quality < 65) {
      return "Food quality needs attention. Make sure the correct employees are handling each preparation stage.";
    }

    if (report.incorrect > report.correct) {
      return "Your team experienced several instruction misunderstandings. Use the instruction menu and check the recipe requirements.";
    }

    if (report.harmony >= 85) {
      return "Wonderful coordination! Your kitchen worked together effectively today.";
    }

    return "A good day's work. Continue improving timing, staff coordination and food quality.";
  }

  /* ---------------------------------------------------------
     CUSTOMER ARRIVALS AND ORDERS
     --------------------------------------------------------- */

  function scheduleCustomerArrival() {
    if (!state.running || paused) return;

    const delay = randomNumber(
      CONFIG.customerArrivalMin,
      CONFIG.customerArrivalMax
    );

    arrivalTimeout = setTimeout(() => {
      if (!state.running || paused) return;

      createCustomer();
      scheduleCustomerArrival();
    }, delay / state.settings.gameSpeed);
  }

  function createCustomer() {
    const customerNames = [
      "Amara", "Daniel", "Lerato", "James",
      "Nandi", "Thabo", "Mia", "Noah",
      "Zanele", "Ethan", "Ava", "Liam"
    ];

    const dishes = [
      "House Meal",
      "Daily Special",
      "Chef's Choice",
      "Fresh Drink"
    ];

    const price = randomNumber(65, 130);

    const order = {
      id: "ORD-" + Date.now() + "-" + randomNumber(100, 999),
      customer: randomItem(customerNames),
      dish: randomItem(dishes),
      price,
      patience: CONFIG.customerPatience,
      step: 0,
      status: "Waiting",
      progress: 0,
      createdAt: Date.now(),
      assignedStaff: []
    };

    state.orders.push(order);
    state.customersArrived++;
    state.totalOrders++;

    const receptionist = state.staff.find(
      person => person.id === "bella"
    );

    if (receptionist) {
      receptionist.status = "Working";
      receptionist.currentTask = "Welcoming a customer";
    }

    state.harmony = Math.min(100, state.harmony + 1);

    message(`${order.customer} has arrived and placed an order.`);
    toast(`${order.customer} placed a new order.`);
    playSound(620, .09);

    renderOrders();
    renderStaff();
    updateHUD();
  }

  function updateCustomerPatience() {
    state.orders.forEach(order => {
      if (order.status === "Completed") return;

      order.patience = Math.max(0, order.patience - 0.25);

      if (order.patience <= 0) {
        loseCustomer(order);
      }
    });

    state.orders = state.orders.filter(
      order => order.status !== "Lost"
    );

    renderOrders();
  }

  function loseCustomer(order) {
    if (order.status === "Lost" || order.status === "Completed") return;

    order.status = "Lost";
    state.customersLost++;
    state.quality = Math.max(0, state.quality - 3);
    state.harmony = Math.max(0, state.harmony - 5);

    state.orders = state.orders.filter(item => item.id !== order.id);

    state.staff.forEach(person => {
      if (person.assignedOrder === order.id) {
        person.assignedOrder = null;
        person.status = "Available";
        person.currentTask = "Waiting for instructions";
      }
    });

    message(`${order.customer} became impatient and left.`);
    toast("A customer left without their order.", "warning");

    renderAll();
  }

  /* ---------------------------------------------------------
     STAFF MANAGEMENT
     --------------------------------------------------------- */

  function getSelectedStaff() {
    return state.staff.find(person => person.id === selectedStaffId);
  }

  function selectStaff(id) {
    const person = state.staff.find(member => member.id === id);
    if (!person) return;

    selectedStaffId = id;
    renderStaff();
    renderSelectedStaff();

    playSound(440, .06);
  }

  function renderStaff() {
    if (!$("staffList")) return;

    $("staffCount").textContent = state.staff.length;

    $("staffList").innerHTML = state.staff.map(person => `
      <button class="staff-member ${person.id === selectedStaffId ? "selected" : ""}"
        data-staff-id="${person.id}">
        <span class="staff-avatar">${person.emoji}</span>
        <span class="staff-info">
          <strong>${escapeHTML(person.name)}</strong>
          <small>${escapeHTML(person.role)}</small>
        </span>
        <span class="staff-state">${escapeHTML(person.status)}</span>
      </button>
    `).join("");

    document.querySelectorAll("[data-staff-id]").forEach(button => {
      button.addEventListener("click", () => {
        selectStaff(button.dataset.staffId);
      });
    });

    updateStaffScene();
    renderSelectedStaff();
  }

  function renderSelectedStaff() {
    const person = getSelectedStaff();
    const container = $("selectedStaffDetails");
    const button = $("instructionButton");

    if (!person || !container) {
      container.innerHTML = "<p>Select a team member.</p>";
      button.disabled = true;
      return;
    }

    container.innerHTML = `
      <div class="selected-name">${person.emoji} ${escapeHTML(person.name)}</div>
      <p class="selected-description">
        ${escapeHTML(person.description)}
      </p>
      <p class="selected-task">
        Current task: ${escapeHTML(person.currentTask)}
      </p>
      <p class="selected-description">
        Completed tasks: ${person.completedTasks}
        · Experience: ${person.experience}
      </p>
    `;

    button.disabled = !state.running || person.status === "Working";
  }

  function updateStaffScene() {
    const container = $("staffScene");
    if (!container) return;

    container.innerHTML = state.staff.slice(0, 9).map(person => `
      <div class="scene-employee">
        <span class="person">${person.emoji}</span>
        <strong>${escapeHTML(person.name)}</strong>
        <small>${escapeHTML(person.status)}</small>
      </div>
    `).join("");
  }

  function recruitStaffMember() {
    const departments = [
      "Grilling", "Cutting", "Sautéing",
      "Sauces", "Baking", "Plating",
      "Drinks", "Cleaning"
    ];

    const firstNames = [
      "Alex", "Jamie", "Taylor", "Morgan",
      "Riley", "Jordan", "Casey", "Avery"
    ];

    const name = randomItem(firstNames);
    const department = randomItem(departments);

    const employee = {
      id: "staff-" + Date.now(),
      name,
      role: "Kitchen Assistant",
      department,
      emoji: "🧑🏽‍🍳",
      description: `A newly recruited member of the ${department} department.`,
      tasks: ["Assist the chef", "Clean station", "Prepare ingredients"],
      status: "Available",
      currentTask: "Learning the kitchen",
      assignedOrder: null,
      experience: 0,
      completedTasks: 0
    };

    state.staff.push(employee);
    state.staffHired++;

    message(`${name} has joined the kitchen team!`);
    toast(`${name} joined your restaurant.`);
  }

  /* ---------------------------------------------------------
     INSTRUCTION SYSTEM
     --------------------------------------------------------- */

  function getAvailableTasks(person) {
    if (person.id === "bella") {
      return [
        "Welcome customer",
        "Confirm customer order"
      ];
    }

    if (person.id === "marcus") {
      return [
        "Deliver the order",
        "Serve the customer"
      ];
    }

    if (person.id === "olivia") {
      return [
        "Cook the meal",
        "Check food quality",
        "Assist the chef"
      ];
    }

    if (person.id === "tina") {
      return [
        "Prepare ingredients",
        "Check ingredients"
      ];
    }

    return [
      "Prepare ingredients",
      "Cook the meal",
      "Plate the meal",
      "Assist the chef",
      "Clean station"
    ];
  }

  function openInstructionModal() {
    const person = getSelectedStaff();

    if (!person || !state.running || person.status === "Working") return;

    selectedInstruction = null;

    $("instructionTitle").textContent = `Instructions for ${person.name}`;
    $("instructionDescription").textContent =
      `Choose a task for ${person.name}. Use the exact instruction wording.`;

    $("instructionFeedback").textContent = "";
    $("instructionInput").value = "";

    const options = getAvailableTasks(person);

    $("instructionOptions").innerHTML = options.map(task => `
      <button class="instruction-option" data-instruction="${task}">
        ${task}
      </button>
    `).join("");

    document.querySelectorAll("[data-instruction]").forEach(button => {
      button.addEventListener("click", () => {
        selectedInstruction = button.dataset.instruction;

        document.querySelectorAll(".instruction-option").forEach(item => {
          item.classList.toggle("selected", item === button);
        });

        $("instructionInput").value = selectedInstruction;
      });
    });

    show("instructionModal");
    $("instructionInput").focus();
  }

  function submitInstruction(event) {
    event.preventDefault();

    const person = getSelectedStaff();
    if (!person) return;

    const typed = $("instructionInput").value.trim();

    if (!typed) {
      $("instructionFeedback").textContent = "Please type an instruction.";
      return;
    }

    const task = getAvailableTasks(person).find(
      item => item.toLowerCase() === typed.toLowerCase()
    );

    if (!task) {
      state.incorrectInstructions++;
      state.quality = Math.max(0, state.quality - 2);
      state.harmony = Math.max(0, state.harmony - 3);

      $("instructionFeedback").textContent =
        "That instruction was not recognised. Check the available task wording.";

      toast("Incorrect instruction.", "warning");
      playSound(190, .13);
      updateHUD();
      return;
    }

    executeInstruction(person, task);
  }

  function executeInstruction(person, task) {
    if (!state.running) return;

    if (person.id === "bella") {
      executeReceptionTask(person, task);
      return;
    }

    if (person.id === "marcus") {
      executeServiceTask(person, task);
      return;
    }

    if (task === "Clean station") {
      executeCleaningTask(person);
      return;
    }

    const order = getNextOrderForTask(task);

    if (!order) {
      $("instructionFeedback").textContent =
        "There is no suitable order waiting for this task.";

      toast("No matching order is waiting.", "warning");
      return;
    }

    const expected = ORDER_STEPS[order.step];

    if (!expected || expected.instruction !== task) {
      state.incorrectInstructions++;
      state.harmony = Math.max(0, state.harmony - 2);

      $("instructionFeedback").textContent =
        `This order needs: ${expected?.instruction || "another task"}.`;

      toast("That is not the next required order step.", "warning");
      updateHUD();
      return;
    }

    if (state.ingredients <= 0 && order.step === 0) {
      $("instructionFeedback").textContent =
        "There are not enough ingredients. Restock your kitchen first.";
      toast("Insufficient ingredients.", "warning");
      return;
    }

    startOrderTask(person, order, expected);
  }

  function getNextOrderForTask(task) {
    const stepIndex = ORDER_STEPS.findIndex(
      step => step.instruction === task
    );

    if (stepIndex < 0) return null;

    return state.orders.find(order =>
      order.step === stepIndex &&
      order.status !== "Completed" &&
      order.status !== "Lost"
    ) || null;
  }

  function startOrderTask(person, order, step) {
    person.status = "Working";
    person.currentTask = step.instruction;
    person.assignedOrder = order.id;

    order.status = step.status;
    order.progress = 0;
    order.assignedStaff.push(person.name);

    if (order.step === 0) {
      state.ingredients = Math.max(0, state.ingredients - 2);
      state.ingredientsUsedToday += 2;
    }

    order.step++;

    state.correctInstructions++;
    state.harmony = Math.min(100, state.harmony + 2);

    const taskDuration = order.step === 2 ? 8 : 5;

    order.taskTime = taskDuration;
    order.taskStartedAt = Date.now();

    $("instructionFeedback").textContent =
      `${person.name} is now working on ${order.dish}.`;

    message(`${person.name}: ${step.instruction}.`);
    toast(`${person.name} started ${step.instruction.toLowerCase()}.`);

    playSound(650, .08);

    renderAll();
    hide("instructionModal");
    saveGameSilently();
  }

  function executeReceptionTask(person, task) {
    if (task === "Welcome customer") {
      const waiting = state.orders.find(order => order.step === 0);

      if (!waiting) {
        toast("There are no customers waiting.", "warning");
        return;
      }

      waiting.patience = Math.min(100, waiting.patience + 15);
      person.currentTask = "Welcomed a customer";
    } else {
      const waiting = state.orders.find(order => order.step === 0);

      if (!waiting) {
        toast("There is no order to confirm.", "warning");
        return;
      }

      waiting.patience = Math.min(100, waiting.patience + 10);
      person.currentTask = "Confirmed an order";
    }

    person.status = "Available";
    person.completedTasks++;
    person.experience++;
    state.correctInstructions++;
    state.harmony = Math.min(100, state.harmony + 2);

    hide("instructionModal");
    toast(`${person.name} completed the reception task.`);
    renderAll();
  }

  function executeServiceTask(person, task) {
    const order = state.orders.find(item =>
      item.step === 4 &&
      item.status === "Ready"
    );

    if (!order) {
      toast("There are no completed meals ready for delivery.", "warning");
      return;
    }

    if (task === "Serve the customer" || task === "Deliver the order") {
      completeOrder(person, order);
    }
  }

  function executeCleaningTask(person) {
    person.status = "Working";
    person.currentTask = "Cleaning station";

    setTimeout(() => {
      person.status = "Available";
      person.currentTask = "Waiting for instructions";
      person.completedTasks++;
      person.experience++;

      state.utensils = Math.min(100, state.utensils + 5);
      state.harmony = Math.min(100, state.harmony + 2);

      toast(`${person.name} cleaned a kitchen station.`);
      renderAll();
    }, 3000);

    hide("instructionModal");
    renderAll();
  }

  /* ---------------------------------------------------------
     ORDER PROGRESS
     --------------------------------------------------------- */

  function updateCookingProgress() {
    state.orders.forEach(order => {
      if (!order.taskStartedAt || !order.taskTime) return;

      if (order.status === "Ready" || order.status === "Completed") return;

      const elapsed = (Date.now() - order.taskStartedAt) / 1000;
      const progress = Math.min(100, elapsed / order.taskTime * 100);

      order.progress = Math.floor(progress);

      if (progress >= 100) {
        finishOrderStep(order);
      }
    });
  }

  function finishOrderStep(order) {
    const employee = state.staff.find(
      person => person.assignedOrder === order.id
    );

    if (employee) {
      employee.status = "Available";
      employee.currentTask = "Waiting for instructions";
      employee.assignedOrder = null;
      employee.completedTasks++;
      employee.experience++;
    }

    order.taskStartedAt = null;
    order.taskTime = null;
    order.progress = 0;

    if (order.step >= 4) {
      order.status = "Ready";
      message(`${order.dish} is ready for delivery.`);
      toast(`${order.dish} is ready!`);
      playSound(740, .15);
    } else {
      order.status = "Waiting";
      message(`${order.dish}: the next preparation step is ready.`);
    }

    renderAll();
  }

  function completeOrder(person, order) {
    order.status = "Completed";

    const payment = order.price;

    state.money += payment;
    state.moneyEarnedToday += payment;
    state.completedOrders++;
    state.customersServed++;

    state.quality = Math.min(100, state.quality + 1);
    state.harmony = Math.min(100, state.harmony + 3);

    person.status = "Available";
    person.currentTask = "Waiting for instructions";
    person.assignedOrder = null;
    person.completedTasks++;
    person.experience++;

    state.transactions.push({
      type: "Income",
      description: `Completed ${order.dish}`,
      amount: payment,
      day: state.day,
      time: state.clock
    });

    state.orders = state.orders.filter(item => item.id !== order.id);

    hide("instructionModal");

    toast(`${formatMoney(payment)} earned from ${order.customer}'s order.`);
    message(`${person.name} delivered ${order.dish}. Payment received.`);

    playSound(780, .16);
    renderAll();
    saveGameSilently();
  }

  /* ---------------------------------------------------------
     INVENTORY AND ECONOMY
     --------------------------------------------------------- */

  function buyIngredients() {
    const cost = CONFIG.ingredientPurchaseCost;

    if (state.money < cost) {
      toast("Not enough money to buy ingredients.", "warning");
      return;
    }

    state.money -= cost;
    state.ingredients += CONFIG.ingredientPurchaseAmount;

    state.moneySpentToday += cost;

    state.transactions.push({
      type: "Expense",
      description: "Ingredient purchase",
      amount: cost,
      day: state.day,
      time: state.clock
    });

    toast("30 ingredients added to your inventory.");
    renderAll();
    renderInventory();
    saveGameSilently();
  }

  function renderInventory() {
    $("inventoryContent").innerHTML = `
      <div class="inventory-line">
        <span>🥬 Ingredients</span>
        <strong>${state.ingredients}</strong>
      </div>
      <div class="inventory-line">
        <span>🍴 Utensil condition</span>
        <strong>${state.utensils}%</strong>
      </div>
      <div class="inventory-line">
        <span>⚡ Kitchen efficiency</span>
        <strong>${state.efficiency}%</strong>
      </div>
      <div class="inventory-line">
        <span>💰 Available money</span>
        <strong>${formatMoney(state.money)}</strong>
      </div>
    `;
  }

  /* ---------------------------------------------------------
     UPGRADES
     --------------------------------------------------------- */

  function renderUpgrades() {
    $("upgradeList").innerHTML = UPGRADES.map(upgrade => {
      const purchased = state.purchasedUpgrades.includes(upgrade.id);
      const affordable = state.money >= upgrade.cost;

      return `
        <div class="upgrade-card">
          <div>
            <h3>${escapeHTML(upgrade.name)}</h3>
            <p>${escapeHTML(upgrade.description)}</p>
            <p><strong>${formatMoney(upgrade.cost)}</strong></p>
          </div>
          <button data-upgrade="${upgrade.id}"
            ${purchased || !affordable ? "disabled" : ""}>
            ${purchased ? "PURCHASED" : affordable ? "UPGRADE" : "INSUFFICIENT FUNDS"}
          </button>
        </div>
      `;
    }).join("");

    document.querySelectorAll("[data-upgrade]").forEach(button => {
      button.addEventListener("click", () => {
        purchaseUpgrade(button.dataset.upgrade);
      });
    });
  }

  function purchaseUpgrade(id) {
    const upgrade = UPGRADES.find(item => item.id === id);
    if (!upgrade) return;

    if (state.purchasedUpgrades.includes(id)) return;

    if (state.money < upgrade.cost) {
      toast("Insufficient funds.", "warning");
      return;
    }

    state.money -= upgrade.cost;
    state.moneySpentToday += upgrade.cost;
    state.purchasedUpgrades.push(id);

    switch (id) {
      case "equipment":
        state.efficiency = Math.min(100, state.efficiency + upgrade.bonus);
        break;
      case "utensils":
        state.utensils = Math.min(100, state.utensils + upgrade.bonus);
        break;
      case "quality":
        state.quality = Math.min(100, state.quality + upgrade.bonus);
        break;
      case "harmony":
        state.harmony = Math.min(100, state.harmony + upgrade.bonus);
        break;
    }

    state.transactions.push({
      type: "Expense",
      description: upgrade.name,
      amount: upgrade.cost,
      day: state.day,
      time: state.clock
    });

    toast(`${upgrade.name} purchased!`);
    renderAll();
    renderUpgrades();
    saveGameSilently();
  }

  /* ---------------------------------------------------------
     RECIPE BOOK
     --------------------------------------------------------- */

  function renderRecipes() {
    const recipes = [
      {
        name: "House Meal",
        category: "Main meal",
        steps: ORDER_STEPS.map(step => step.instruction)
      },
      {
        name: "Daily Special",
        category: "Main meal",
        steps: ORDER_STEPS.map(step => step.instruction)
      },
      {
        name: "Chef's Choice",
        category: "Main meal",
        steps: ORDER_STEPS.map(step => step.instruction)
      },
      {
        name: "Fresh Drink",
        category: "Beverage",
        steps: ORDER_STEPS.map(step => step.instruction)
      }
    ];

    $("recipeList").innerHTML = recipes.map(recipe => `
      <div class="recipe-card">
        <h3>${escapeHTML(recipe.name)}</h3>
        <p>${escapeHTML(recipe.category)} · Starter workflow template</p>
        <ol class="recipe-steps">
          ${recipe.steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}
        </ol>
      </div>
    `).join("");
  }

  /* ---------------------------------------------------------
     HUD AND DISPLAY
     --------------------------------------------------------- */

  function updateHUD() {
    $("dayLabel").textContent = `DAY ${state.day}`;
    $("moneyDisplay").textContent = formatMoney(state.money);
    $("qualityDisplay").textContent = `${Math.round(state.quality)}%`;
    $("harmonyDisplay").textContent = `${Math.round(state.harmony)}%`;
    $("ingredientDisplay").textContent = state.ingredients;
    $("utensilDisplay").textContent = `${state.utensils}%`;
    $("efficiencyDisplay").textContent = `${state.efficiency}%`;

    $("customerCount").textContent = state.customersServed;
    $("waitingCount").textContent = state.orders.length;
    $("orderCount").textContent = state.orders.length;

    $("staffCount").textContent = state.staff.length;
    $("restaurantStatus").textContent = state.running ? "KITCHEN OPEN" : "KITCHEN CLOSED";

    updateClock();
  }

  function renderOrders() {
    const container = $("ordersList");
    if (!container) return;

    if (state.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          No active orders.<br>
          New customers will arrive automatically.
        </div>
      `;
      return;
    }

    container.innerHTML = state.orders.map(order => {
      const next = ORDER_STEPS[order.step];
      const ready = order.status === "Ready";

      let statusText = order.status;

      if (order.status === "Preparing") statusText = "Preparing";
      if (order.status === "Cooking") statusText = "Cooking";
      if (order.status === "Plating") statusText = "Plating";

      return `
        <div class="order-card">
          <div class="order-card-top">
            <h3>${escapeHTML(order.dish)}</h3>
            <span class="order-status ${ready ? "ready" : order.status === "Cooking" ? "cooking" : ""}">
              ${statusText}
            </span>
          </div>
          <p>${escapeHTML(order.customer)} · ${formatMoney(order.price)}</p>
          <p>Order ${escapeHTML(order.id.slice(-7))}</p>
          <div class="patience-track">
            <div class="patience-bar" style="width:${order.patience}%"></div>
          </div>
          <p>${ready ? "Waiting for waiter delivery" : `Next: ${next?.instruction || "Complete order"}`}</p>
          ${ready ? `<button class="order-action" data-deliver="${order.id}">DELIVER ORDER</button>` : ""}
        </div>
      `;
    }).join("");

    document.querySelectorAll("[data-deliver]").forEach(button => {
      button.addEventListener("click", () => {
        const waiter = state.staff.find(person => person.id === "marcus");

        if (!waiter) return;

        selectStaff(waiter.id);
        openInstructionModal();

        selectedInstruction = "Deliver the order";
        $("instructionInput").value = "Deliver the order";
        document.querySelectorAll(".instruction-option").forEach(option => {
          option.classList.toggle(
            "selected",
            option.dataset.instruction === "Deliver the order"
          );
        });
      });
    });
  }

  function renderAll() {
    updateHUD();
    renderOrders();
    renderStaff();
    renderSelectedStaff();
    updateStaffScene();
  }

  function saveGameSilently() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ ...state, running: false })
      );
    } catch (error) {
      console.warn("Automatic saving unavailable:", error);
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  /* ---------------------------------------------------------
     PAUSE
     --------------------------------------------------------- */

  function pauseGame() {
    if (!state.running) return;

    paused = true;
    state.running = false;
    stopTimers();

    show("pauseModal");
    saveGameSilently();
  }

  function resumeGame() {
    hide("pauseModal");

    paused = false;
    state.running = true;

    startTimers();
    message("The kitchen is back in action!");
  }

  function closePauseToMenu() {
    saveGameSilently();
    openMainMenu();
  }

  /* ---------------------------------------------------------
     USER INTERFACE EVENTS
     --------------------------------------------------------- */

  function bindEvents() {
    $("playButton").addEventListener("click", startNewGame);
    $("resumeButton").addEventListener("click", resumeGame);
    $("settingsButton").addEventListener("click", () => openSettings(false));

    $("closeSettingsButton").addEventListener("click", closeSettings);
    $("saveSettingsButton").addEventListener("click", saveSettings);

    $("pauseButton").addEventListener("click", pauseGame);
    $("continueButton").addEventListener("click", resumeGame);

    $("pauseSaveButton").addEventListener("click", saveGame);
    $("pauseSettingsButton").addEventListener("click", () => openSettings(true));
    $("returnMenuButton").addEventListener("click", closePauseToMenu);

    $("instructionButton").addEventListener("click", openInstructionModal);
    $("instructionForm").addEventListener("submit", submitInstruction);

    $("recipeButton").addEventListener("click", () => {
      renderRecipes();
      show("recipeModal");
    });

    $("inventoryButton").addEventListener("click", () => {
      renderInventory();
      show("inventoryModal");
    });

    $("upgradeButton").addEventListener("click", () => {
      renderUpgrades();
      show("upgradeModal");
    });

    $("menuButton").addEventListener("click", pauseGame);

    $("buyIngredientsButton").addEventListener("click", buyIngredients);
    $("nextDayButton").addEventListener("click", nextDay);

    document.querySelectorAll("[data-close]").forEach(button => {
      button.addEventListener("click", () => {
        hide(button.dataset.close);
      });
    });

    document.querySelectorAll(".modal-overlay").forEach(modal => {
      modal.addEventListener("click", event => {
        if (event.target === modal && modal.id !== "reportModal") {
          hide(modal.id);
        }
      });
    });

    window.addEventListener("beforeunload", saveGameSilently);
  }

  /* ---------------------------------------------------------
     INITIALISATION
     --------------------------------------------------------- */

  function init() {
    bindEvents();
    updateMenuButtons();

    console.log("HIVEMIND: Kitchen Harmony initialised.");
    console.log("Staff members:", STAFF_STARTERS.length);
    console.log("Starting restaurant balance:", formatMoney(CONFIG.startingMoney));
    console.log("Game systems ready.");
  }

  return {
    init,
    saveGame,
    loadGame,
    startNewGame,
    resumeGame
  };
})();

document.addEventListener("DOMContentLoaded", Game.init);


