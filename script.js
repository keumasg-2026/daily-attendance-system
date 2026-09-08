// ==========================================
// Daily Attendance System
// JavaScript Functionality
// ==========================================

const attendanceForm = document.getElementById("attendanceForm");

// Input fields
const totalEmployees = document.getElementById("totalEmployees");
const present = document.getElementById("present");
const absent = document.getElementById("absent");
const leave = document.getElementById("leave");
const dayOff = document.getElementById("dayOff");

// Summary fields
const summaryTotal = document.getElementById("summaryTotal");
const summaryPresent = document.getElementById("summaryPresent");
const summaryAbsent = document.getElementById("summaryAbsent");
const summaryLeave = document.getElementById("summaryLeave");
const summaryDayOff = document.getElementById("summaryDayOff");
const attendanceRate = document.getElementById("attendanceRate");

const validationMessage =
    document.getElementById("validationMessage");

// ==========================================
// Set today's date automatically
// ==========================================

const dateInput = document.getElementById("date");

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

dateInput.value = `${year}-${month}-${day}`;

// ==========================================
// Get attendance values
// ==========================================

function getAttendanceValues() {

    return {
        total: Number(totalEmployees.value) || 0,
        present: Number(present.value) || 0,
        absent: Number(absent.value) || 0,
        leave: Number(leave.value) || 0,
        dayOff: Number(dayOff.value) || 0
    };
}

// ==========================================
// Update summary
// ==========================================

function updateSummary() {

    const data = getAttendanceValues();

    summaryTotal.textContent = data.total;
    summaryPresent.textContent = data.present;
    summaryAbsent.textContent = data.absent;
    summaryLeave.textContent = data.leave;
    summaryDayOff.textContent = data.dayOff;

    if (data.total > 0) {

        const rate = (data.present / data.total) * 100;

        attendanceRate.textContent =
            `${rate.toFixed(2)}%`;

    } else {

        attendanceRate.textContent = "0%";
    }

    validateAttendance();
}

// ==========================================
// Validate attendance
// ==========================================

function validateAttendance() {

    const data = getAttendanceValues();

    const statusTotal =
        data.present +
        data.absent +
        data.leave +
        data.dayOff;

    if (data.total === 0) {

        validationMessage.textContent = "";
        return false;
    }

    if (statusTotal === data.total) {

        validationMessage.textContent =
            "✓ Attendance count is correct.";

        validationMessage.style.color = "green";

        return true;

    } else {

        validationMessage.textContent =
            `✗ Status total (${statusTotal}) does not match total employees (${data.total}).`;

        validationMessage.style.color = "red";

        return false;
    }
}

// ==========================================
// Listen for changes
// ==========================================

const attendanceInputs = [
    totalEmployees,
    present,
    absent,
    leave,
    dayOff
];

attendanceInputs.forEach(input => {

    input.addEventListener("input", updateSummary);

});

// ==========================================
// Form submission
// ==========================================

attendanceForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const data = getAttendanceValues();

    const isValid = validateAttendance();

    if (!isValid) {

        alert(
            "Please check the attendance numbers. " +
            "Present + Absent + Leave + Day Off " +
            "must equal Total Employees."
        );

        return;
    }

    const floor =
        document.getElementById("floor").value;

    const inspector =
        document.getElementById("inspector").value;

    const reportDate =
        document.getElementById("date").value;

    alert(
        `Attendance submitted successfully!\n\n` +
        `Date: ${reportDate}\n` +
        `Floor: ${floor}\n` +
        `Total Employees: ${data.total}\n` +
        `Present: ${data.present}\n` +
        `Absent: ${data.absent}\n` +
        `Leave: ${data.leave}\n` +
        `Day Off: ${data.dayOff}\n` +
        `Inspector: ${inspector}`
    );

});
