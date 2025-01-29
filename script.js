// Get references to elements
const decimalTimeElement = document.getElementById('decimal-time');
const hectoElement = document.getElementById('hecto');
const deckElement = document.getElementById('deck');
const ticksElement = document.getElementById('ticks');
const progressBar = document.getElementById('progress-bar');
const oldTimeElement = document.getElementById('old-time');
const currentMonthElement = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

// Constants
const REAL_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const yearStartDay = 0; // Fixed start on Monoday

// Update Decimal Time
function updateDecimalTime() {
    const now = new Date();
    const millisecondsSinceStartOfDay = (
        now.getHours() * 60 * 60 * 1000 +
        now.getMinutes() * 60 * 1000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds()
    );

    // Decimal time calculations
    let progressThroughDay = millisecondsSinceStartOfDay / REAL_DAY_IN_MS; // 0 to 1
    if (progressThroughDay > 0.99999) {
        progressThroughDay = 0;
    }
    const decimalTime = progressThroughDay * 10; // Decimal Day = 10 hours

    // Stringify and split decimal time into parcels
    let strDecimalTimeArray = (decimalTime * 10000).toFixed(0).toString().split('');

    // Fill with 0 if time less than 1 hecto
    const missingNumbers = 5 - strDecimalTimeArray.length;
    if (missingNumbers) {
        const fillWithZeroes = new Array(missingNumbers).fill(0);
        strDecimalTimeArray = fillWithZeroes.concat(strDecimalTimeArray);
    }

    const hecto = strDecimalTimeArray[0]; // Hecto (Decimal Hour)
    const deck = strDecimalTimeArray.slice(1, 3).join(''); // Deck (Decimal Minute)
    const ticks = strDecimalTimeArray.slice(3, 5).join(''); // Ticks (Decimal Second)
    const strDecimalTime = [hecto, deck, ticks].join('.');

    // Update text elements
    decimalTimeElement.textContent = strDecimalTime;
    hectoElement.textContent = hecto;
    deckElement.textContent = deck;
    ticksElement.textContent = ticks;

    // Update old time clock
    oldTimeElement.textContent = now.toLocaleTimeString();

    // Call the updateProgressBar function after updating the decimal time
    updateProgressBar(Number(hecto), Number(deck[0]));
}

// Refresh every 100 milliseconds
setInterval(updateDecimalTime, 100);

// Function to update the block-based progress bar
function updateProgressBar(hectos, decks) {
    progressBar.innerHTML = "";

    // Render hecto blocks (each hecto is a 10% block)
    for (let i = 0; i < hectos; i++) {
        const hectoBlock = document.createElement("div");
        hectoBlock.classList.add("hecto-block");
        progressBar.appendChild(hectoBlock);
    }

    // Render deck blocks (each deck is a 1% block)
    for (let i = 0; i < decks; i++) {
        const deckBlock = document.createElement("div");
        deckBlock.classList.add("deck-block");
        progressBar.appendChild(deckBlock);
    }

    // Render empty blocks (black space filling the remaining progress)
    const totalBlocks = hectos * 10 + decks; // Convert hectos to equivalent deck units
    const remainingBlocks = 10 - totalBlocks; // Ensure the total blocks fit within 100%
    for (let i = 0; i < remainingBlocks; i++) {
        const emptyBlock = document.createElement("div");
        emptyBlock.classList.add("hecto-block");
        emptyBlock.style.backgroundColor = "black"; // Empty block color
        progressBar.appendChild(emptyBlock);
    }
}

// Month names and their day lengths
const months = [
    { name: "Mono", days: 36 },
    { name: "Dua", days: 37 },
    { name: "Tri", days: 36 },
    { name: "Quad", days: 37 },
    { name: "Pent", days: 36 },
    { name: "Hex", days: 37 },
    { name: "Hept", days: 36 },
    { name: "Oct", days: 37 },
    { name: "Non", days: 36 },
    { name: "Dec", days: 37 },
];

// Determine the current DecaChron month
function getCurrentMegaMonth() {
    const startYear = 2000; // Calendar start year
    const now = new Date();
    const yearDiff = now.getFullYear() - startYear;

    // Calculate days since start of the DecaChron calendar
    let daysSinceStart = yearDiff * 365 + Math.floor(yearDiff / 4) - Math.floor(yearDiff / 100) + Math.floor(yearDiff / 400);
    daysSinceStart += Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)); // Add days in current year

    // Find the month
    let daysCount = 0;
    for (let i = 0; i < months.length; i++) {
        daysCount += months[i].days;
        if (daysSinceStart < daysCount) {
            return i;
        }
    }

    return 0; // Fallback (should never hit)
}

// Load the current month
let currentMonthIndex = getCurrentMegaMonth();
currentMonthElement.textContent = months[currentMonthIndex].name;

// Update navigation buttons
function updateNavButtons() {
    prevMonthButton.disabled = currentMonthIndex === 0;
    nextMonthButton.disabled = currentMonthIndex === months.length - 1;
}

// Navigate to the previous month
prevMonthButton.addEventListener("click", () => {
    if (currentMonthIndex > 0) {
        currentMonthIndex--;
        currentMonthElement.textContent = months[currentMonthIndex].name;
        updateNavButtons();
        generateCalendarGrid(); // Update the calendar grid
    }
});

// Navigate to the next month
nextMonthButton.addEventListener("click", () => {
    if (currentMonthIndex < months.length - 1) {
        currentMonthIndex++;
        currentMonthElement.textContent = months[currentMonthIndex].name;
        updateNavButtons();
        generateCalendarGrid(); // Update the calendar grid
    }
});

// Initialize navigation buttons
updateNavButtons();

// Calendar grid setup
const calendarGrid = document.querySelector(".calendar-grid");
const weekdayRow = document.querySelector(".weekday-row");

// Weekday names (DecaChron)
const weekdays = ["Primis", "Secundis", "Tertis", "Quartis", "Quintis", "Hexis", "Septis", "Octis", "Novis", "Decis"];

function calculateFirstWeekdayOfMonth(year, monthIndex) {
    let totalDays = 0;

    // Add days from previous years
    for (let yearCounter = 2000; yearCounter < year; yearCounter++) {
        totalDays += 365;
        if ((yearCounter % 4 === 0 && yearCounter % 100 !== 0) || yearCounter % 400 === 0) {
            totalDays += 1; // Leap year
        }
    }

    // Add days from previous months in the current year
    for (let i = 0; i < monthIndex; i++) {
        totalDays += months[i].days;
    }

    // Calculate weekday offset
    return (yearStartDay + totalDays) % weekdays.length;
}

// Adjusted generateCalendarGrid function
function generateCalendarGrid() {
    calendarGrid.innerHTML = "";

    const daysInMonth = months[currentMonthIndex].days;

    // Calculate the first weekday of the current month
    const now = new Date();
    const firstWeekday = calculateFirstWeekdayOfMonth(now.getFullYear(), currentMonthIndex);

    // Fill the weekday row dynamically
    weekdayRow.innerHTML = "";
    weekdays.forEach(day => {
        const cell = document.createElement("div");
        cell.className = "weekday-cell";
        cell.textContent = day;
        weekdayRow.appendChild(cell);
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstWeekday; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-cell empty";
        calendarGrid.appendChild(emptyCell);
    }

    // Add cells for each day in the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-cell";
        cell.textContent = day;
        calendarGrid.appendChild(cell);
    }

    // Add empty cells for remaining days to complete the grid
    let totalCellsInGrid = 40; // 10 columns x 4 rows

    if (daysInMonth === 36 && firstWeekday > 4) { // if first weekday is more than 4th day of week, add extra row
        totalCellsInGrid = 50;
        }
    else if (daysInMonth === 37 && firstWeekday > 3) { // if first weekday is more than 3rd day of week, add extra row
        totalCellsInGrid = 50;
        }

const currentCellsInGrid = firstWeekday + daysInMonth;
const remainingCells = totalCellsInGrid - currentCellsInGrid;

    for (let i = 0; i < remainingCells; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-cell hidden";
        calendarGrid.appendChild(emptyCell);
    }

    adjustWeekdayBar()
}

// Adjust weekday bar for screen size
function adjustWeekdayBar() {
    const isSmallScreen = window.innerWidth <= 1100; // Small screen threshold for 5 characters
    const isExtraSmallScreen = window.innerWidth <= 800; // Extra small screen threshold for 2 characters
    weekdayRow.innerHTML = "";

    weekdays.forEach(day => {
        const cell = document.createElement("div");
        cell.className = "weekday-cell";
        
        if (isExtraSmallScreen) {
            cell.textContent = day.substring(0, 2); // Abbreviate to 2 characters for very small screens
        } else if (isSmallScreen) {
            cell.textContent = day.substring(0, 5); // Abbreviate to 5 characters for small screens
        } else {
            cell.textContent = day; // Full name for larger screens
        }

        weekdayRow.appendChild(cell);
    });
}

// Call adjustWeekdayBar after the DOM is fully loaded
window.addEventListener("DOMContentLoaded", adjustWeekdayBar);

// Listen for resize events to dynamically adjust the weekday bar
window.addEventListener("resize", adjustWeekdayBar);
adjustWeekdayBar(); // Initial adjustment

// Initialize the calendar grid
generateCalendarGrid();
