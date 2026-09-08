/* =========================================================
   DAILY FLOOR ATTENDANCE SYSTEM
   Main JavaScript Logic
   ========================================================= */


/* ================= FLOOR → INSPECTOR MAPPING ================= */

/*
   Temporary configuration.

   Later this information will come from the database.
   HR will be able to manage floors and inspectors
   without changing this JavaScript file.
*/

const floorInspectors = {

    "1st Floor": "Inspector A",

    "2nd Floor": "Inspector B",

    "3rd Floor": "Inspector C",

    "4th Floor": "Inspector D",

    "5th Floor": "Inspector E"

};


/* ================= ELEMENTS ================= */

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


/* ================= TODAY'S DATE ================= */

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* Set today's date */

const today = getTodayDate();

dateInput.value = today;


/* ================= DISPLAY DATE ================= */

function updateDisplayDate() {

    if (!dateInput.value) {

        displayDate.textContent = "--";

        return;
    }

    const date = new Date(
        dateInput.value + "T00:00:00"
    );

    const formattedDate =
        date.toLocaleDateString("en-GB", {

            day: "2-digit",

            month: "short",

            year: "numeric"

        });

    displayDate.textContent = formattedDate;
}


/* Initial date display */

updateDisplayDate();


/* Update when date changes */

dateInput.addEventListener(
    "change",
    updateDisplayDate
);


/* ================= FLOOR → INSPECTOR ================= */

floorInput.addEventListener(
    "change",
    function () {

        const selectedFloor =
            floorInput.value;

        if (!selectedFloor) {

            inspectorName.textContent =
                "Select a floor";

            return;
        }


        const assignedInspector =
            floorInspectors[selectedFloor];


        if (assignedInspector) {

            inspectorName.textContent =
                assignedInspector;

        } else {

            inspectorName.textContent =
                "Inspector not assigned";

        }

    }
);


/* ================= GET VALUES ================= */

function getAttendanceValues() {

    const total =
        Number(totalEmployeesInput.value) || 0;

    const present =
        Number(presentInput.value) || 0;

    const absent =
        Number(absentInput.value) || 0;

    const leave =
        Number(leaveInput.value) || 0;

    const dayOff =
        Number(dayOffInput.value) || 0;


    return {

        total,
        present,
        absent,
        leave,
        dayOff

    };

}


/* ================= UPDATE SUMMARY ================= */

function updateSummary() {

    const {

        total,
        present,
        absent,
        leave,
        dayOff

    } = getAttendanceValues();


    /* Numbers */

    summaryTotal.textContent =
        total;

    summaryPresent.textContent =
        present;

    summaryAbsent.textContent =
        absent;

    summaryLeave.textContent =
        leave;

    summaryDayOff.textContent =
        dayOff;


    /* Attendance percentage */

    if (total > 0) {

        const percentage =
            (present / total) * 100;

        attendanceRate.textContent =
            percentage.toFixed(2) + "%";

    } else {

        attendanceRate.textContent =
            "0%";

    }

}


/* ================= VALIDATION ================= */

function validateAttendance() {

    const {

        total,
        present,
        absent,
        leave,
        dayOff

    } = getAttendanceValues();


    const calculatedTotal =
        present +
        absent +
        leave +
        dayOff;


    /* No employee count */

    if (total <= 0) {

        validationMessage.textContent =
            "Please enter the total number of employees.";

        validationMessage.style.color =
            "#dc2626";

        return false;

    }


    /* Negative values */

    if (
        present < 0 ||
        absent < 0 ||
        leave < 0 ||
        dayOff < 0
    ) {

        validationMessage.textContent =
            "Attendance values cannot be negative.";

        validationMessage.style.color =
            "#dc2626";

        return false;

    }


    /* Attendance mismatch */

    if (calculatedTotal !== total) {

        validationMessage.textContent =
            `Attendance total is ${calculatedTotal}, but Total Employees is ${total}. Please check the numbers.`;

        validationMessage.style.color =
            "#dc2626";

        return false;

    }


    /* Valid */

    validationMessage.textContent =
        "Attendance numbers are valid.";

    validationMessage.style.color =
        "#16a34a";

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


attendanceInputs.forEach(

    function (input) {

        input.addEventListener(

            "input",

            function () {

                updateSummary();

                validateAttendance();

            }

        );

    }

);


/* ================= FORM SUBMIT ================= */

form.addEventListener(

    "submit",

    function (event) {

        event.preventDefault();


        /* Validate floor */

        if (!floorInput.value) {

            validationMessage.textContent =
                "Please select a floor.";

            validationMessage.style.color =
                "#dc2626";

            floorInput.focus();

            return;

        }


        /* Validate attendance */

        if (!validateAttendance()) {

            return;

        }


        /* Get values */

        const values =
            getAttendanceValues();


        const selectedFloor =
            floorInput.value;


        const assignedInspector =
            floorInspectors[selectedFloor];


        const attendancePercentage =
            (
                values.present /
                values.total *
                100
            ).toFixed(2);


        /*
           Temporary submission object.

           Later this exact object will be sent
           to the backend API and PostgreSQL database.
        */

        const attendanceData = {

            attendance_date:
                dateInput.value,

            floor:
                selectedFloor,

            inspector:
                assignedInspector,

            total_employees:
                values.total,

            present:
                values.present,

            absent:
                values.absent,

            leave:
                values.leave,

            day_off:
                values.dayOff,

            present_percentage:
                attendancePercentage,

            remarks:
                remarksInput.value.trim()

        };


        /* Temporary confirmation */

        console.log(
            "Attendance Data:",
            attendanceData
        );


        alert(
            "Attendance submitted successfully!"
        );

    }

);


/* ================= CLEAR BUTTON ================= */

const clearButton =
    document.getElementById("clearButton");

clearButton.addEventListener(
    "click",
    function () {

        // Clear all form fields
        form.reset();

        // Restore today's date
        dateInput.value = getTodayDate();

        // Clear floor
        floorInput.value = "";

        // Reset inspector
        inspectorName.textContent =
            "Select a floor";

        // Clear validation message
        validationMessage.textContent = "";

        // Update date display
        updateDisplayDate();

        // Update summary
        updateSummary();

    }
);

/* ================= INITIAL SUMMARY ================= */

updateSummary();
