---all done 

/* HIVEMIND: Kitchen Harmony
   Staff selection, roles and order assignment.
*/

(() => {
    "use strict";

    const staffMembers = [
        {
            id: "bella",
            name: "Bella",
            role: "Receptionist",
            specialty: "Customer reception",
            status: "Available",
            currentOrder: null
        },
        {
            id: "marcus",
            name: "Marcus",
            role: "Waiter",
            specialty: "Serving meals",
            status: "Available",
            currentOrder: null
        },
        {
            id: "olivia",
            name: "Chef Olivia",
            role: "Head Chef",
            specialty: "Cooking",
            status: "Available",
            currentOrder: null
        },
        {
            id: "tina",
            name: "Tina",
            role: "Food Preparation",
            specialty: "Preparing ingredients",
            status: "Available",
            currentOrder: null
        },
        {
            id: "sam",
            name: "Sam",
            role: "Kitchen Support",
            specialty: "Kitchen assistance",
            status: "Available",
            currentOrder: null
        },
        {
            id: "kevin",
            name: "Kevin",
            role: "Kitchen Support",
            specialty: "Kitchen assistance",
            status: "Available",
            currentOrder: null
        }
    ];

    let selectedStaffId = null;

    function notify(type, detail = {}) {
        window.dispatchEvent(
            new CustomEvent("hivemind:staff-" + type, {
                detail
            })
        );
    }

    function getStaff(staffId) {
        return staffMembers.find(staff => staff.id === staffId) || null;
    }

    function getStaffList() {
        return staffMembers.map(staff => ({ ...staff }));
    }

    function selectStaff(staffId) {
        const staff = getStaff(staffId);

        if (!staff) {
            return {
                success: false,
                message: "Staff member not found."
            };
        }

        selectedStaffId = staffId;

        notify("selected", {
            staff: { ...staff }
        });

        return {
            success: true,
            staff: { ...staff }
        };
    }

    function getSelectedStaff() {
        const staff = getStaff(selectedStaffId);
        return staff ? { ...staff } : null;
    }

    function assignOrder(orderId, staffId = selectedStaffId) {
        const staff = getStaff(staffId);

        if (!staff) {
            return {
                success: false,
                message: "Select a staff member first."
            };
        }

        if (staff.currentOrder !== null) {
            return {
                success: false,
                message: staff.name + " is already busy."
            };
        }

        const order = window.KitchenSimulation
            ?.getState()
            .orders.find(item => item.id === Number(orderId));

        if (!order) {
            return {
                success: false,
                message: "Order not found."
            };
        }

        if (staff.id === "bella" || staff.id === "marcus") {
            return {
                success: false,
                message: staff.name +
                    " cannot prepare kitchen orders. Assign a kitchen staff member."
            };
        }

        const result = window.KitchenSystem?.startOrder(
            Number(orderId),
            staff.id
        );

        if (!result || !result.success) {
            return {
                success: false,
                message: result?.message || "Could not assign this order."
            };
        }

        staff.currentOrder = Number(orderId);
        staff.status = "Working";

        notify("assigned", {
            staff: { ...staff },
            orderId: Number(orderId)
        });

        return {
            success: true,
            message: staff.name + " has started preparing the order.",
            staff: { ...staff }
        };
    }

    function submitInstruction(orderId, instruction) {
        const task = window.KitchenSystem?.getTask(orderId);

        if (!task) {
            return {
                success: false,
                message: "No active kitchen task found."
            };
        }

        const staff = getStaff(task.staffId);

        if (!staff) {
            return {
                success: false,
                message: "Assigned staff member not found."
            };
        }

        const result = window.KitchenSystem.submitInstruction(
            Number(orderId),
            instruction
        );

        if (result.success && result.completed) {
            staff.status = "Available";
            staff.currentOrder = null;

            notify("available", {
                staff: { ...staff },
                orderId: Number(orderId)
            });
        }

        return result;
    }

    function serveOrder(orderId) {
        const waiter = getStaff("marcus");

        if (!waiter) {
            return {
                success: false,
                message: "Waiter not found."
            };
        }

        if (waiter.status === "Working") {
            return {
                success: false,
                message: "Marcus is currently busy."
            };
        }

        waiter.status = "Working";
        waiter.currentOrder = Number(orderId);

        const result = window.KitchenSystem?.serveOrder(
            Number(orderId)
        );

        waiter.status = "Available";
        waiter.currentOrder = null;

        notify("served", {
            staff: { ...waiter },
            orderId: Number(orderId),
            success: Boolean(result?.success)
        });

        return result || {
            success: false,
            message: "Could not serve this order."
        };
    }

    function releaseStaff(staffId) {
        const staff = getStaff(staffId);

        if (!staff) return false;

        staff.currentOrder = null;
        staff.status = "Available";

        notify("available", {
            staff: { ...staff }
        });

        return true;
    }

    function reset() {
        selectedStaffId = null;

        staffMembers.forEach(staff => {
            staff.status = "Available";
            staff.currentOrder = null;
        });

        notify("reset");
    }

    window.staffMembers = staffMembers;

    window.StaffSystem = {
        getStaff,
        getStaffList,
        selectStaff,
        getSelectedStaff,
        assignOrder,
        submitInstruction,
        serveOrder,
        releaseStaff,
        reset
    };

    window.initialiseStaff = function () {
        reset();
        console.log("HIVEMIND: Six staff members initialised.");
        return true;
    };

    console.log("HIVEMIND Staff System loaded.");
})();

