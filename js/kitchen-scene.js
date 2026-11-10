
/* =========================================================
   HIVEMIND: KITCHEN HARMONY
   MAIN 2D KITCHEN GAME SCENE
   ========================================================= */

(() => {
    "use strict";

    const GAME_WIDTH = 1280;
    const GAME_HEIGHT = 720;

    const COLORS = {
        wall: "#d8b58c",
        wallDark: "#9c7558",
        floor: "#b7a18a",
        floorLight: "#cbb69e",
        counter: "#6d8790",
        counterTop: "#a9c1bd",
        counterDark: "#425d66",
        wood: "#986748",
        gold: "#ffd16b",
        cream: "#fff2dc",
        green: "#83c995",
        red: "#ed7777",
        blue: "#79c5df",
        dark: "#253841"
    };

    const STAFF_COLORS = [
        "#f2a65a",
        "#76b8df",
        "#d78ac5",
        "#8fc77f",
        "#e47e71",
        "#c5a5ed"
    ];

    const HOME_POSITIONS = [
        { x: 490, y: 335 },
        { x: 600, y: 330 },
        { x: 720, y: 355 },
        { x: 820, y: 390 },
        { x: 510, y: 570 },
        { x: 750, y: 570 }
    ];

    const STATIONS = {
        prep: { x: 620, y: 490 },
        stove: { x: 925, y: 335 }
    };

    const scene = {
        canvas: null,
        ctx: null,
        selectedStaff: null,
        actors: [],
        animationFrame: null,
        lastFrame: 0,
        ready: false,
        message: "Select a staff member, then select an order."
    };

    /* ---------------------------------------------------------
       CREATE THE GAME SCREEN
       --------------------------------------------------------- */

    function createGameScreen() {
        if (document.getElementById("kitchen-game-screen")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "kitchen-game-scene-style";

        style.textContent = `
            /* *** FULL-SCREEN GAME CONTAINER */
            html,
            body {
                width: 100%;
                height: 100%;
                min-height: 100%;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }

            /* *** HIDE THE OLD DASHBOARD, KEEP ITS SCRIPTS RUNNING */
            #game {
                display: none !important;
            }

            #kitchen-game-screen {
                position: fixed;
                inset: 0;
                z-index: 99999;
                width: 100vw;
                height: 100vh;
                height: 100dvh;
                max-width: none;
                margin: 0;
                padding: 0;
                overflow: hidden;
                background: #263b45;
                border: none;
                border-radius: 0;
                box-shadow: none;
            }

            /* *** CANVAS FILLS THE ENTIRE GAME SCREEN */
            #kitchen-game-canvas {
                position: absolute;
                inset: 0;
                display: block;
                width: 100%;
                height: 100%;
                aspect-ratio: auto;
                touch-action: none;
                cursor: pointer;
            }

            /* *** HELP BAR SITS ABOVE THE CANVAS */
            #kitchen-game-help {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
                min-height: 42px;
                box-sizing: border-box;
                padding: 9px 18px;
                color: #fff2dc;
                background: rgba(28, 48, 57, .96);
                font-size: 13px;
            }

            #kitchen-game-help strong {
                color: #ffd16b;
            }

            #kitchen-game-help button {
                background: #ffd16b;
                color: #293943;
                border: 0;
                border-radius: 9px;
                padding: 9px 14px;
                font-weight: bold;
                cursor: pointer;
            }

            #kitchen-game-help button:hover {
                background: #ffe19a;
            }

            /* Keep the original simulation DOM available
               for its JavaScript assignment functions. */
            #shift-simulation {
                display: none !important;
            }

            @media(max-width: 600px) {
                #kitchen-game-help {
                    font-size: 11px;
                    padding: 7px 10px;
                }

                #kitchen-game-help button {
                    padding: 7px 10px;
                }
            }
        `;

        document.head.appendChild(style);

        const wrapper = document.createElement("div");
        wrapper.id = "kitchen-game-screen";

        wrapper.innerHTML = `
            <canvas
                id="kitchen-game-canvas"
                aria-label="Interactive two-dimensional restaurant kitchen"
            >
                Your browser does not support the game canvas.
            </canvas>

            <div id="kitchen-game-help">
                <span>
                    <strong>HOW TO PLAY:</strong>
                    Select a staff member, then click an order ticket.
                </span>

                <button id="game-new-order">
                    + New Order
                </button>
            </div>
        `;

        /* *** THE GAME IS NOW ADDED DIRECTLY TO THE PAGE */
        document.body.appendChild(wrapper);

        scene.canvas = document.getElementById(
            "kitchen-game-canvas"
        );

        scene.ctx = scene.canvas.getContext("2d");

        /* *** SET THE CANVAS TO THE CURRENT SCREEN SIZE */
        resizeGameCanvas();

        /* *** UPDATE THE CANVAS WHEN THE BROWSER RESIZES */
        window.addEventListener("resize", resizeGameCanvas);

        document.getElementById("game-new-order")
            .addEventListener("click", createNewOrder);

        scene.canvas.addEventListener(
            "pointerdown",
            handlePointerDown
        );

        initialiseActors();

        scene.ready = true;

        console.log("Kitchen Harmony: 2D game scene created.");
        console.log("Kitchen Harmony: Full-screen mode enabled.");
    }

    /* ---------------------------------------------------------
       *** RESPONSIVE CANVAS RESIZING
       --------------------------------------------------------- */

    function resizeGameCanvas() {
        if (!scene.canvas || !scene.ctx) return;

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        /* *** USE THE ACTUAL BROWSER VIEWPORT */
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        scene.canvas.width = Math.round(screenWidth * pixelRatio);
        scene.canvas.height = Math.round(screenHeight * pixelRatio);

        /* *** SCALE THE ORIGINAL 1280 x 720 GAME WORLD */
        const scaleX = scene.canvas.width / GAME_WIDTH;
        const scaleY = scene.canvas.height / GAME_HEIGHT;

        scene.ctx.setTransform(
            scaleX,
            0,
            0,
            scaleY,
            0,
            0
        );

        console.log(
            "Kitchen canvas resized:",
            screenWidth,
            "x",
            screenHeight
        );
    }

    /* ---------------------------------------------------------
       STAFF CHARACTERS
       --------------------------------------------------------- */

    function getStaff() {
        return window.staffMembers || [];
    }

    function initialiseActors() {
        const members = getStaff();
        const total = Math.max(6, members.length);

        scene.actors = [];

        for (let i = 0; i < total; i++) {
            const home = HOME_POSITIONS[i % HOME_POSITIONS.length];

            scene.actors.push({
                index: i,
                x: home.x,
                y: home.y,
                targetX: home.x,
                targetY: home.y,
                color: STAFF_COLORS[i % STAFF_COLORS.length],
                walk: Math.random() * 10,
                facing: 1
            });
        }
    }

    function getStaffName(index) {
        const member = getStaff()[index];

        if (!member) {
            return `Staff ${index + 1}`;
        }

        return (
            member.name ||
            member.fullName ||
            `Staff ${index + 1}`
        );
    }

    function getStaffTask(index) {
        const members = getStaff();
        const member = members[index];

        if (!member) return null;

        const state = window.KitchenSimulation?.getState();

        if (!state) return null;

        return state.orders.find(order =>
            order.assigned &&
            !order.completed &&
            order.staffIndex === index
        ) || null;
    }

    function updateActors(delta) {
        scene.actors.forEach(actor => {
            const task = getStaffTask(actor.index);

            let target;

            if (task) {
                target = STATIONS[task.dish.station] ||
                    STATIONS.prep;
            } else {
                target = HOME_POSITIONS[
                    actor.index % HOME_POSITIONS.length
                ];
            }

            actor.targetX = target.x;
            actor.targetY = target.y;

            const dx = actor.targetX - actor.x;
            const dy = actor.targetY - actor.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 2) {
                const speed = 105 * delta;

                actor.x += (dx / distance) * speed;
                actor.y += (dy / distance) * speed;

                actor.facing = dx >= 0 ? 1 : -1;
                actor.walk += delta * 9;
            } else {
                actor.walk = Math.sin(performance.now() / 220) * 0.3;
            }
        });
    }

    /* ---------------------------------------------------------
       DRAWING HELPERS
       --------------------------------------------------------- */

    function roundedRect(x, y, width, height, radius, color) {
        const ctx = scene.ctx;

        ctx.fillStyle = color;
        ctx.beginPath();

        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(
            x + width, y,
            x + width, y + radius
        );

        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(
            x + width, y + height,
            x + width - radius, y + height
        );

        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(
            x, y + height,
            x, y + height - radius
        );

        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(
            x, y,
            x + radius, y
        );

        ctx.closePath();
        ctx.fill();
    }

    function drawText(text, x, y, size = 16, color = COLORS.cream) {
        const ctx = scene.ctx;

        ctx.fillStyle = color;
        ctx.font = `bold ${size}px Trebuchet MS, Arial`;
        ctx.fillText(text, x, y);
    }

    function drawCircle(x, y, radius, color) {
        const ctx = scene.ctx;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    /* ---------------------------------------------------------
       KITCHEN ENVIRONMENT
       --------------------------------------------------------- */

    function drawFloor() {
        const ctx = scene.ctx;

        ctx.fillStyle = COLORS.floor;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const tileSize = 55;

        for (let y = 105; y < GAME_HEIGHT; y += tileSize) {
            for (let x = 265; x < GAME_WIDTH; x += tileSize) {
                const alternate =
                    (Math.floor(x / tileSize) +
                     Math.floor(y / tileSize)) % 2 === 0;

                ctx.fillStyle = alternate
                    ? COLORS.floorLight
                    : COLORS.floor;

                ctx.fillRect(x, y, tileSize, tileSize);

                ctx.strokeStyle = "rgba(75,55,42,.12)";
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }

        /* Kitchen walls */
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(265, 105, 1015, 65);

        ctx.fillStyle = COLORS.wallDark;
        ctx.fillRect(265, 160, 1015, 10);

        /* Wall decoration */
        roundedRect(315, 120, 100, 34, 6, "#f2e3c9");
        drawText("KITCHEN", 332, 143, 15, "#785b44");

        roundedRect(1090, 120, 120, 32, 6, "#f2e3c9");
        drawText("FRESH FOOD", 1100, 142, 12, "#785b44");
    }

    function drawHud() {
        const ctx = scene.ctx;
        const state = window.gameState || {};

        ctx.fillStyle = "#1c3039";
        ctx.fillRect(0, 0, GAME_WIDTH, 105);

        drawText("HIVEMIND", 25, 40, 25, COLORS.gold);
        drawText("KITCHEN HARMONY", 27, 65, 12, "#b9c9c8");

        roundedRect(285, 20, 180, 65, 12, "#344b55");
        drawText("💰 MONEY", 305, 43, 12, "#b9c9c8");
        drawText(`$${state.money ?? 0}`, 305, 70, 21, COLORS.gold);

        roundedRect(480, 20, 180, 65, 12, "#344b55");
        drawText("🥕 INGREDIENTS", 500, 43, 12, "#b9c9c8");
        drawText(`${state.ingredients ?? 0}`, 500, 70, 21, COLORS.green);

        roundedRect(675, 20, 170, 65, 12, "#344b55");
        drawText("⭐ REPUTATION", 695, 43, 12, "#b9c9c8");
        drawText(`${state.reputation ?? 0}`, 695, 70, 21, COLORS.gold);

        roundedRect(860, 20, 150, 65, 12, "#344b55");
        drawText("📅 DAY", 880, 43, 12, "#b9c9c8");
        drawText(`${state.day ?? 1}`, 880, 70, 21, COLORS.blue);

        roundedRect(1025, 20, 225, 65, 12, "#344b55");
        drawText("RESTAURANT STATUS", 1045, 43, 12, "#b9c9c8");
        drawText("● OPEN FOR SERVICE", 1045, 70, 14, COLORS.green);
    }

    /* ---------------------------------------------------------
       LEFT ORDER BOARD
       --------------------------------------------------------- */

    function drawOrderBoard() {
        const ctx = scene.ctx;

        ctx.fillStyle = "#293d46";
        ctx.fillRect(0, 105, 265, 615);

        drawText("CUSTOMER ORDERS", 20, 140, 19, COLORS.gold);
        drawText("Select a ticket to assign it", 20, 163, 11, "#c5d0ce");

        roundedRect(18, 178, 229, 47, 9, "#e7ae58");

        drawText("+ NEW CUSTOMER ORDER", 39, 207, 14, "#3a3025");

        const orders =
            window.KitchenSimulation?.getState()?.orders || [];

        const visible = orders.slice(-5);

        visible.forEach((order, index) => {
            const y = 241 + index * 91;

            const isCompleted = order.completed;
            const isAssigned = order.assigned;

            const selectedColor = isCompleted
                ? "#315b49"
                : isAssigned
                    ? "#475b5e"
                    : "#405761";

            roundedRect(16, y, 233, 80, 10, selectedColor);

            drawCircle(45, y + 29, 19, "#293d46");

            drawText(order.dish.icon, 31, y + 37, 21);

            drawText(
                order.dish.name,
                74,
                y + 26,
                13,
                COLORS.cream
            );

            drawText(
                isCompleted
                    ? "COMPLETED"
                    : isAssigned
                        ? `${order.staffName} working`
                        : `Reward: $${order.dish.reward}`,
                74,
                y + 47,
                10,
                isCompleted ? COLORS.green : COLORS.gold
            );

            if (!isCompleted && !isAssigned) {
                drawText("CLICK TO ASSIGN", 74, y + 65, 9, COLORS.blue);
            }

            roundedRect(18, y + 72, 229, 4, 2, "#172b33");

            if (order.progress > 0) {
                roundedRect(
                    18,
                    y + 72,
                    229 * (order.progress / 100),
                    4,
                    2,
                    COLORS.green
                );
            }
        });

        if (visible.length === 0) {
            drawText("No orders yet!", 53, 315, 15, COLORS.cream);
            drawText("Create an order to begin.", 35, 340, 11, "#c5d0ce");
        }
    }

    /* ---------------------------------------------------------
       KITCHEN EQUIPMENT
       --------------------------------------------------------- */

    function drawFridge(x, y) {
        roundedRect(x, y, 115, 155, 9, "#91b8c2");
        roundedRect(x + 7, y + 8, 101, 68, 5, "#d5e4e2");
        roundedRect(x + 7, y + 83, 101, 63, 5, "#d5e4e2");

        scene.ctx.fillStyle = "#657f86";
        scene.ctx.fillRect(x + 88, y + 25, 5, 30);
        scene.ctx.fillRect(x + 88, y + 105, 5, 25);

        drawText("FRIDGE", x + 27, y + 174, 12);
        drawText("🥕", x + 23, y + 51, 20);
        drawText("🥬", x + 61, y + 51, 20);
    }

    function drawPrepCounter() {
        roundedRect(505, 425, 245, 135, 12, COLORS.counterDark);
        roundedRect(515, 414, 225, 112, 10, COLORS.counterTop);

        drawText("PREPARATION", 555, 407, 13, COLORS.dark);

        /* Chopping boards */
        roundedRect(535, 445, 80, 57, 8, COLORS.wood);
        roundedRect(625, 445, 85, 57, 8, COLORS.wood);

        drawText("🥕", 551, 482, 25);
        drawText("🥬", 650, 482, 25);

        drawText("🔪", 585, 490, 16);
    }

    function drawStove() {
        roundedRect(840, 245, 230, 150, 12, "#465b64");
        roundedRect(850, 253, 210, 126, 8, "#a7b7b7");

        drawText("COOKING STATION", 880, 237, 13);

        const burners = [
            [890, 295],
            [980, 295],
            [890, 350],
            [980, 350]
        ];

        burners.forEach(([x, y]) => {
            drawCircle(x, y, 23, "#46515a");
            drawCircle(x, y, 14, "#202c33");
            drawCircle(x, y, 7, "#e17f4d");
        });

        drawText("🍳", 1030, 330, 25);
    }

    function drawServingCounter() {
        roundedRect(1035, 480, 195, 95, 11, COLORS.wood);
        roundedRect(1043, 470, 179, 70, 8, "#d9c5a1");

        drawText("SERVING WINDOW", 1060, 461, 12);
        drawText("🍽️", 1070, 513, 27);
        drawText("🥘", 1140, 513, 27);
    }

    function drawSink() {
        roundedRect(310, 500, 130, 105, 10, COLORS.counterDark);
        roundedRect(318, 490, 114, 86, 9, "#9cb9c0");

        drawCircle(375, 529, 28, "#547d89");
        drawCircle(375, 529, 19, "#b6d9dc");

        drawText("🚰", 352, 552, 21);
        drawText("WASHING", 337, 622, 11);
    }

    function drawKitchen() {
        drawFloor();
        drawFridge(315, 235);
        drawPrepCounter();
        drawStove();
        drawServingCounter();
        drawSink();

        /* Decorative plants */
        drawText("🪴", 1160, 220, 35);
        drawText("🪴", 465, 280, 30);

        /* Ceiling lights */
        drawCircle(740, 205, 9, "#ffe2a1");
        drawCircle(1120, 400, 9, "#ffe2a1");
    }

    /* ---------------------------------------------------------
       DRAW STAFF CHARACTERS
       --------------------------------------------------------- */

    function drawStaff(actor) {
        const ctx = scene.ctx;
        const index = actor.index;
        const member = getStaff()[index];

        const name = getStaffName(index);
        const task = getStaffTask(index);

        const isSelected = scene.selectedStaff === index;
        const isWorking = Boolean(task);

        const bob = isWorking
            ? Math.abs(Math.sin(actor.walk)) * 4
            : Math.sin(performance.now() / 350 + index) * 2;

        /* Selected staff glow */
        if (isSelected) {
            ctx.beginPath();
            ctx.ellipse(
                actor.x,
                actor.y + 24,
                37,
                13,
                0,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "rgba(255,209,107,.35)";
            ctx.fill();

            ctx.strokeStyle = COLORS.gold;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        /* Shadow */
        ctx.beginPath();
        ctx.ellipse(
            actor.x,
            actor.y + 27,
            24,
            9,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgba(35,40,38,.25)";
        ctx.fill();

        /* Legs */
        roundedRect(
            actor.x - 13,
            actor.y + 8 - bob,
            10,
            22,
            4,
            "#34414b"
        );

        roundedRect(
            actor.x + 3,
            actor.y + 8 - bob,
            10,
            22,
            4,
            "#34414b"
        );

        /* Shoes */
        roundedRect(actor.x - 17, actor.y + 25 - bob, 17, 8, 4, "#26343a");
        roundedRect(actor.x + 1, actor.y + 25 - bob, 17, 8, 4, "#26343a");

        /* Body / apron */
        roundedRect(
            actor.x - 20,
            actor.y - 15 - bob,
            40,
            34,
            9,
            actor.color
        );

        roundedRect(
            actor.x - 12,
            actor.y - 5 - bob,
            24,
            24,
            5,
            "#f2e4cb"
        );

        /* Head */
        drawCircle(
            actor.x,
            actor.y - 28 - bob,
            19,
            "#dca47d"
        );

        /* Hair */
        drawCircle(
            actor.x,
            actor.y - 41 - bob,
            17,
            "#4b342d"
        );

        roundedRect(
            actor.x - 17,
            actor.y - 34 - bob,
            34,
            12,
            5,
            "#4b342d"
        );

        /* Face */
        drawCircle(actor.x - 7, actor.y - 27 - bob, 2, "#342a28");
        drawCircle(actor.x + 7, actor.y - 27 - bob, 2, "#342a28");

        /* Chef hat */
        roundedRect(
            actor.x - 17,
            actor.y - 55 - bob,
            34,
            12,
            5,
            "#fff9ee"
        );

        drawCircle(actor.x - 9, actor.y - 56 - bob, 8, "#fff9ee");
        drawCircle(actor.x + 9, actor.y - 56 - bob, 8, "#fff9ee");

        /* Character name */
        ctx.textAlign = "center";
        drawText(name, actor.x, actor.y + 48, 12, COLORS.cream);

        if (isWorking) {
            drawText("WORKING", actor.x, actor.y + 63, 9, COLORS.green);
            drawText("🍳", actor.x + 25, actor.y - 35, 15);
        } else {
            drawText("AVAILABLE", actor.x, actor.y + 63, 9, "#d3d9d4");
        }

        if (member?.energy <= 0) {
            drawText("REST", actor.x, actor.y - 72, 10, COLORS.red);
        }

        ctx.textAlign = "left";
    }

    /* ---------------------------------------------------------
       POINTER INTERACTION
       --------------------------------------------------------- */

    function handlePointerDown(event) {
        const rect = scene.canvas.getBoundingClientRect();

        /* *** MAP SCREEN POINTER POSITION TO GAME COORDINATES */
        const scaleX = GAME_WIDTH / rect.width;
        const scaleY = GAME_HEIGHT / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        /* New order button */
        if (x >= 18 && x <= 247 && y >= 178 && y <= 225) {
            createNewOrder();
            return;
        }

        /* Select staff */
        const clickedActor = [...scene.actors].reverse().find(actor => {
            const dx = x - actor.x;
            const dy = y - (actor.y - 15);

            return Math.sqrt(dx * dx + dy * dy) < 35;
        });

        if (clickedActor) {
            scene.selectedStaff = clickedActor.index;

            scene.message =
                `${getStaffName(clickedActor.index)} selected. Choose an order.`;

            return;
        }

        /* Assign selected staff to an order ticket */
        const state = window.KitchenSimulation?.getState();

        if (!state) return;

        const visibleOrders = state.orders.slice(-5);

        const clickedTicket = visibleOrders.find((order, index) => {
            const ticketY = 241 + index * 91;

            return (
                x >= 16 &&
                x <= 249 &&
                y >= ticketY &&
                y <= ticketY + 80
            );
        });

        if (clickedTicket) {
            assignSelectedStaff(clickedTicket);
        }
    }

    function assignSelectedStaff(order) {
        if (scene.selectedStaff === null) {
            scene.message = "Select a staff member first.";
            return;
        }

        if (order.completed || order.assigned) {
            scene.message = "That order is already being handled.";
            return;
        }

        const select = document.querySelector(
            `[data-order-staff="${order.id}"]`
        );

        if (!select) {
            scene.message = "Order assignment interface is unavailable.";
            console.warn(
                "No assignment selector found for order:",
                order.id
            );
            return;
        }

        select.value = String(scene.selectedStaff);

        window.KitchenSimulation?.assignOrder(order.id);

        scene.message =
            `${getStaffName(scene.selectedStaff)} assigned to ${order.dish.name}.`;

        scene.selectedStaff = null;
    }

    function createNewOrder() {
        if (window.KitchenSimulation?.createOrder) {
            window.KitchenSimulation.createOrder();
            scene.message = "A new customer order has arrived!";
        } else {
            scene.message = "The order system has not loaded yet.";
            console.error("KitchenSimulation.createOrder is unavailable.");
        }
    }

    /* ---------------------------------------------------------
       MAIN GAME LOOP
       --------------------------------------------------------- */

    function drawScene() {
        const ctx = scene.ctx;

        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        drawHud();
        drawKitchen();
        drawOrderBoard();

        /* Draw staff in their current depth order */
        [...scene.actors]
            .sort((a, b) => a.y - b.y)
            .forEach(drawStaff);

        /* Selected character information */
        if (scene.selectedStaff !== null) {
            roundedRect(475, 625, 490, 43, 10, "#263b45");

            drawText(
                `${getStaffName(scene.selectedStaff)} SELECTED — Choose an order ticket`,
                500,
                652,
                14,
                COLORS.gold
            );
        }
    }

    function animate(timestamp) {
        if (!scene.ready) return;

        const delta = scene.lastFrame
            ? Math.min((timestamp - scene.lastFrame) / 1000, 0.05)
            : 0;

        scene.lastFrame = timestamp;

        updateActors(delta);
        drawScene();

        scene.animationFrame =
            window.requestAnimationFrame(animate);
    }

    /* ---------------------------------------------------------
       START GAME SCENE
       --------------------------------------------------------- */

    function initialise() {
        if (!window.KitchenSimulation) {
            console.error(
                "KitchenSimulation must load before kitchen-scene.js"
            );
            return;
        }

        createGameScreen();

        /* *** PREVENT DUPLICATE ANIMATION LOOPS */
        if (scene.animationFrame) {
            window.cancelAnimationFrame(scene.animationFrame);
        }

        scene.lastFrame = 0;

        scene.animationFrame =
            window.requestAnimationFrame(animate);

        console.log("HIVEMIND 2D kitchen is running!");
        console.log("Game viewport:", window.innerWidth, "x", window.innerHeight);
        console.log("Canvas ready:", Boolean(scene.canvas));
    }

    window.KitchenScene = {
        initialise,
        getSelectedStaff: () => scene.selectedStaff
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }

})();


