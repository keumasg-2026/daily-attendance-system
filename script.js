
/* =========================================================
   DAILY FLOOR ATTENDANCE SYSTEM
   Main JavaScript Logic
   Step 24G - Dynamic Supabase Data
   ========================================================= */


/* ================= SUPABASE CONFIGURATION ================= */

// Replace these placeholders with your existing Supabase values.
// NEVER use a secret or service_role key in frontend code.

const SUPABASE_URL = "https://fhrhjaluteifvuxcmgfc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1upuiGOZppDdTJhbaMiCQw_zrkI7UW2";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client initialized successfully");


/* ================= DATABASE CACHE ================= */

// Floor IDs and inspector IDs come from PostgreSQL.
// We no longer use hardcoded inspector names.

let floorsData = [];
let inspectorsData = [];
let databaseReady = false;


/* ================= FORM ELEMENTS ================= */

const form = document.getElementById("attendanceForm");

const dateInput = document.getElementById("date");

const floorInput = document.getElementById("floor");

const totalEmployeesInput =
    document.getElementById("totalEmployees");

const presentInput =
    document.getElementById("present");

const absentInput =
    document.getElementById("absent");

const leaveInput =
    document.getElementById("leave");

const dayOffInput =
    document.getElementById("dayOff");

const remarksInput =
    document.getElementById("remarks");

const inspectorName =
    document.getElementById("inspectorName");

const displayDate =
    document.getElementById("displayDate");

const validationMessage =
    document.getElementById("validationMessage");

const clearButton =
    document.getElementById("clearButton");


/* ================= SUMMARY ELEMENTS ================= */

const summaryTotal =
    document.getElementById("summaryTotal");

const summaryPresent =
    document.getElementById("summaryPresent");

const summaryAbsent =
    document.getElementById("summaryAbsent");

const summaryLeave =
    document.getElementById("summaryLeave");

const summaryDayOff =
    document.getElementById("summaryDayOff");

const attendanceRate =
    document.getElementById("attendanceRate");


/* ================= BANGLADESH DATE ================= */

// Always calculate today's date using Asia/Dhaka.
// This avoids incorrect dates when users are in other timezones.

function getTodayDate() {

    const parts = new Intl.DateTimeFormat(
        "en-GB",
        {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(new Date());

    const values = {};

    parts.forEach(function (part) {
        values[part.type] = part.value;
    });

    return (
        values.year + "-" +
        values.month + "-" +
        values.day
    );
}


/* ================= DISPLAY DATE ================= */

function updateDisplayDate() {

    if (!dateInput.value) {
        displayDate.textContent = "--";
        return;
    }

    const date = new Date(
        dateInput.value + "T00:00:00Z"
    );

    displayDate.textContent =
        date.toLocaleDateString("en-GB", {
            timeZone: "UTC",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}


/* ================= LOAD FLOORS & INSPECTORS ================= */

async function loadDatabaseData() {

    databaseReady = false;

    floorInput.disabled = true;
    floorInput.innerHTML =
        '<option value="">Loading floors...</option>';

    inspectorName.textContent =
        "Loading inspector information...";

    try {

        // Retrieve active floors from PostgreSQL.

        const floorsResult = await supabaseClient
            .from("floors")
            .select("id, floor_name, status")
            .eq("status", true)
            .order("id", { ascending: true });

        if (floorsResult.error) {
            throw floorsResult.error;
        }

        // Retrieve active inspectors.

        const inspectorsResult = await supabaseClient
            .from("inspectors")
            .select("id, inspector_name, floor_id, status")
            .eq("status", true)
            .order("floor_id", { ascending: true });

        if (inspectorsResult.error) {
            throw inspectorsResult.error;
        }

        floorsData = floorsResult.data || [];
        inspectorsData = inspectorsResult.data || [];

        // Clear existing hardcoded dropdown options.

        floorInput.innerHTML = "";

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Select Floor";

        floorInput.appendChild(defaultOption);

        // Create dropdown options using actual database IDs.

        floorsData.forEach(function (floor) {

            const option =
                document.createElement("option");

            option.value = String(floor.id);
            option.textContent = floor.floor_name;

            floorInput.appendChild(option);
        });

        databaseReady = true;
        floorInput.disabled = false;

        inspectorName.textContent =
            "Select a floor";

        console.log(
            "Supabase floors retrieved successfully:",
            floorsData
        );

        console.log(
            "Supabase inspectors retrieved successfully:",
            inspectorsData
        );

        if (floorsData.length === 0) {
            floorInput.disabled = true;
            inspectorName.textContent =
                "No active floors available";
        }

    } catch (error) {

        console.error(
            "Failed to load attendance configuration:",
            error
        );

        floorInput.innerHTML =
            '<option value="">Unable to load floors</option>';

        inspectorName.textContent =
            "Database connection failed";

        validationMessage.textContent =
            "Unable to load floor information. Please refresh the page.";

        validationMessage.style.color = "#dc2626";
    }
}


/* ================= FIND ASSIGNED INSPECTOR ================= */

function getAssignedInspector() {

    const selectedFloorId =
        Number(floorInput.value);

    if (!selectedFloorId) {
        return null;
    }

    return inspectorsData.find(function (inspector) {
        return inspector.floor_id === selectedFloorId;
    }) || null;
}


/* ================= FLOOR CHANGE EVENT ================= */

floorInput.addEventListener("change", function () {

    if (!floorInput.value) {
        inspectorName.textContent =
            "Select a floor";
        return;
    }

    const assignedInspector =
        getAssignedInspector();

    if (assignedInspector) {

        inspectorName.textContent =
            assignedInspector.inspector_name;

    } else {

        inspectorName.textContent =
            "Inspector not assigned";
    }
});


/* ================= GET ATTENDANCE VALUES ================= */

function getAttendanceValues() {

    return {
        total: Number(totalEmployeesInput.value) || 0,
        present: Number(presentInput.value) || 0,
        absent: Number(absentInput.value) || 0,
        leave: Number(leaveInput.value) || 0,
        dayOff: Number(dayOffInput.value) || 0
    };
}


/* ================= UPDATE SUMMARY ================= */

function updateSummary() {

    const values = getAttendanceValues();

    summaryTotal.textContent = values.total;

    summaryPresent.textContent = values.present;

    summaryAbsent.textContent = values.absent;

    summaryLeave.textContent = values.leave;

    summaryDayOff.textContent = values.dayOff;

    if (values.total > 0) {

        const percentage =
            (values.present / values.total) * 100;

        attendanceRate.textContent =
            percentage.toFixed(2) + "%";

    } else {

        attendanceRate.textContent = "0%";
    }
}


/* ================= VALIDATION ================= */

function showValidationMessage(message, color) {

    validationMessage.textContent = message;
    validationMessage.style.color = color;
}


function validateAttendance() {

    const values = getAttendanceValues();

    const fields = [
        totalEmployeesInput,
        presentInput,
        absentInput,
        leaveInput,
        dayOffInput
    ];

    // Every attendance number must be provided.

    if (fields.some(function (field) {
        return field.value.trim() === "";
    })) {

        showValidationMessage(
            "Please complete all attendance fields.",
            "#dc2626"
        );

        return false;
    }

    const numbers = [
        values.total,
        values.present,
        values.absent,
        values.leave,
        values.dayOff
    ];

    // Only non-negative whole numbers are accepted.

    if (numbers.some(function (number) {
        return !Number.isSafeInteger(number) || number < 0;
    })) {

        showValidationMessage(
            "Attendance values must be non-negative whole numbers.",
            "#dc2626"
        );

        return false;
    }

    if (values.total <= 0) {

        showValidationMessage(
            "Please enter a total employee count greater than zero.",
            "#dc2626"
        );

        return false;
    }

    const calculatedTotal =
        values.present +
        values.absent +
        values.leave +
        values.dayOff;

    if (calculatedTotal !== values.total) {

        showValidationMessage(
            "Attendance total is " +
            calculatedTotal +
            ", but Total Employees is " +
            values.total +
            ". Please check the numbers.",
            "#dc2626"
        );

        return false;
    }

    showValidationMessage(
        "Attendance numbers are valid.",
        "#16a34a"
    );

    return true;
}


/* ================= INPUT EVENTS ================= */

const attendanceInputs = [
    totalEmployeesInput,
    presentInput,
    absentInput,
    leaveInput,
    dayOffInput
];

attendanceInputs.forEach(function (input) {

    input.addEventListener("input", function () {

        updateSummary();
        validateAttendance();
    });
});


/* ================= FORM SUBMISSION ================= */

form.addEventListener("submit", function (event) {

    event.preventDefault();

    // Database configuration must be loaded first.

    if (!databaseReady) {

        showValidationMessage(
            "Floor information is not ready. Please refresh the page.",
            "#dc2626"
        );

        return;
    }

    // Validate date.

    if (!dateInput.value) {

        showValidationMessage(
            "Please select an attendance date.",
            "#dc2626"
        );

        dateInput.focus();
        return;
    }

    // Validate floor.

    if (!floorInput.value) {

        showValidationMessage(
            "Please select a floor.",
            "#dc2626"
        );

        floorInput.focus();
        return;
    }

    // Validate inspector.

    const assignedInspector =
        getAssignedInspector();

    if (!assignedInspector) {

        showValidationMessage(
            "No active inspector is assigned to this floor.",
            "#dc2626"
        );

        return;
    }

    // Validate attendance numbers.

    if (!validateAttendance()) {
        return;
    }

    const values = getAttendanceValues();

    const attendancePercentage =
        (values.present / values.total) * 100;

    // Prepared for future authenticated submission.
    // This object is NOT inserted into Supabase yet.

    const attendanceData = {

        attendance_date: dateInput.value,

        floor_id: Number(floorInput.value),

        inspector_id: assignedInspector.id,

        total_employees: values.total,

        present: values.present,

        absent: values.absent,

        leave: values.leave,

        day_off: values.dayOff,

        remarks: remarksInput.value.trim()
    };

    console.log(
        "Attendance preview (not saved):",
        attendanceData
    );

    console.log(
        "Calculated present percentage:",
        attendancePercentage.toFixed(2) + "%"
    );

    showValidationMessage(
        "Attendance validated successfully. Database submission is not enabled yet.",
        "#16a34a"
    );

    alert(
        "Attendance validated successfully!\n\n" +
        "This is a preview only.\n" +
        "The record has NOT been saved to the database."
    );
});


/* ================= CLEAR BUTTON ================= */

clearButton.addEventListener("click", function () {

    // Clear all form fields.

    form.reset();

    // Restore Bangladesh's current date.

    dateInput.value = getTodayDate();

    // Reset floor and inspector.

    floorInput.value = "";

    inspectorName.textContent =
        "Select a floor";

    // Clear validation message.

    validationMessage.textContent = "";

    // Update date display and summary.

    updateDisplayDate();
    updateSummary();
});


/* ================= INITIALIZATION ================= */

dateInput.value = getTodayDate();

updateDisplayDate();

dateInput.addEventListener(
    "change",
    updateDisplayDate
);

updateSummary();

// Load real floors and inspectors from Supabase.

loadDatabaseData();
