// Get references to elements
const decimalTimeElement = document.getElementById('decimal-time');
const hectoElement = document.getElementById('hecto');
const deckElement = document.getElementById('deck');
const ticksElement = document.getElementById('ticks');
const progressBar = document.getElementById('progress-bar');
const oldTimeElement = document.getElementById('old-time');

// Constants
const REAL_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
    if (progressThroughDay > 0.99999){
        progressThroughDay = 0;
    }
    const decimalTime = progressThroughDay * 10; // Decimal Day = 10 hours
    // Stringify and split decimal time into parcels
    let strDecimalTimeArray = (decimalTime * 10000).toFixed(0).toString().split('')
    // fill with 0 if time less than 1 hecto
    const missing_numbers = 5-strDecimalTimeArray.length;
    if (missing_numbers) {
        const fill_with_zeroes = new Array(missing_numbers).fill(0)
        strDecimalTimeArray = fill_with_zeroes.concat(strDecimalTimeArray)
        console.log(strDecimalTimeArray)
    }

    const hecto = strDecimalTimeArray[0]; // Hecto (Decimal Hour)
    const deck = strDecimalTimeArray.slice(1,3).join(''); // Deck (Decimal Minute)
    const ticks = strDecimalTimeArray.slice(3,5).join(''); // Ticks (Decimal Second)
    strDecimalTime = [hecto, deck, ticks].join('.')

    // Update progress bar width
    // progressBar.style.width = `${progressThroughDay * 100}%`;

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
    const progressBar = document.getElementById("progress-bar");

    // Clear the existing blocks
    progressBar.innerHTML = "";

    // Calculate hectos (full blocks) and decks (smaller blocks)
    // const hectos = Math.floor(decimalTime); // Full hectos (whole decimal hours)
    // const decks = Math.floor((decimalTime - hectos) * 10); // Decks (10ths of a decimal hour)

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
        emptyBlock.classList.add("hecto-block"); // Use hecto-block for empty blocks
        emptyBlock.style.backgroundColor = "black"; // Empty block color
        progressBar.appendChild(emptyBlock);
    }
}