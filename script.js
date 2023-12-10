// TODO: Switch from noteTimings to fill and back
// TODO: Play two patterns at once

// Initialize audio context for tone.js
let synth;
document.querySelector("#tone-js-init").addEventListener("click", async () => {
  await Tone.start();
  console.log("audio is ready");
  //create a synth and connect it to the main output (your speakers)
  // synth = new Tone.MembraneSynth().toDestination();
  synth = new Tone.Synth().toDestination();
});

let startingPoint;
let loopReset = true;
let loopRunning = false;
let round = 0;
let bar = 2000;
const lookAhead = 50;
const buffer = 10;

// const noteTimings = [0, 1500];
// const noteTimings = [0, 500, 1000, 1125, 1250, 1500, 1625, 1750];
// const notes = ["C4", "E4", "G4", "B4", "C5", "B4", "G4", "E4"];
// const notes = ["C1", "C1", "C1", "C1", "C1", "C1", "C1", "C1"];
// const noteTimings = [
//   0, 125, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500, 1625,
//   1750, 1875,
// ];

const noteTimings = [
  0, 125, 300, 500, 625, 800, 1125, 1400, 1500, 1625, 1750, 1900,
];

const fill = [0, 125, 250, 375, 625, 750, 1125, 1375, 1500, 1625, 1750, 1875];

// const notes, random notes in C dorian scale, same length as noteTimings
const notes = [
  "C4",
  "D4",
  "Eb4",
  "F4",
  "G4",
  "Ab4",
  "Bb4",
  "C5",
  "D5",
  "Eb5",
  "F5",
  "G5",
];

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  loopRunning = true;
  let index = 0;
  // If first step is 0, play first note immediately
  if (noteTimings[0] === 0) {
    // Set starting point
    startingPoint = Tone.now() * 1000;

    const delay = getDelay(noteTimings, index, startingPoint);
    // Play note
    synth.triggerAttackRelease(
      notes[index],
      "0.25",
      startingPoint / 1000 + delay / 1000
    );
    console.log(
      "Step: " +
        noteTimings[0] +
        " at " +
        parseInt(Tone.now() * 1000 - startingPoint)
    );
    createBlock();
    nextNote(noteTimings, index);
  }

  // If first step is other than 0, pass to timer with adjusted interval
  if (noteTimings[0] !== 0) {
    // Adjusted interval
    const interval = startingPoint + noteTimings[0] - Tone.now() * 1000;
    timerFork(noteTimings, 0, interval);
  }
});

function nextNote(pattern, index) {
  if (!loopRunning) {
    return;
  }

  // Increment index
  index++;

  // If index is less than pattern length, pass next step to timer() or silentTimer()
  if (index < pattern.length) {
    const interval = startingPoint + pattern[index] - Tone.now() * 1000;
    timerFork(pattern, index, interval);
  }

  // If index is greater than or equal to pattern length, restart loop by passing first step to timer() or silentTimer()
  if (index >= pattern.length) {
    const drift = Tone.now() * 1000 - (startingPoint + pattern[index - 1]);
    const interval = bar - pattern[index - 1] - drift + noteTimings[0];

    index = 0;
    // Update starting point
    startingPoint += bar;
    timerFork(pattern, index, interval);
  }
}

function timerFork(pattern, index, interval) {
  if (!loopRunning) {
    return;
  }

  // If next step is more than lookAhead ms away, pass next step to silentTimer()
  if (interval > lookAhead) {
    silentTimer(pattern, index);
  }

  // If next step is less than or equal to lookAhead ms away, pass next step to timer()
  if (interval <= lookAhead) {
    timer(pattern, index, interval);
  }
}

function timer(pattern, index, interval) {
  if (!loopRunning) {
    return;
  }

  setTimeout(() => {
    if (!loopRunning) {
      return;
    }

    const now = Tone.now() * 1000;
    const delay = getDelay(pattern, index, now);

    // Play note
    synth.triggerAttackRelease(notes[index], "0.25", now / 1000 + delay / 1000);
    console.log(
      "Step: " +
        pattern[index] +
        " at " +
        parseInt(now + delay - startingPoint - buffer)
    );
    createBlock();
    nextNote(pattern, index);
  }, interval);
}

let silentLoop;

function silentTimer(pattern, index) {
  console.log("silentTimer() called");
  if (!loopRunning) {
    clearInterval(silentLoop);
    return;
  }

  silentLoop = setInterval(() => {
    console.log("silentLoop running");
    if (!loopRunning) {
      clearInterval(silentLoop);
      return;
    }
    if (index < pattern.length) {
      const interval = startingPoint + pattern[index] - Tone.now() * 1000;

      // If next step is less than or equal to lookAhead ms away, pass next step to timer()
      if (interval <= lookAhead) {
        timer(pattern, index, interval);
        clearInterval(silentLoop);
        return;
      }
    }

    if (index >= pattern.length) {
      const drift = Tone.now() * 1000 - (startingPoint + pattern[index - 1]);
      const interval = bar - pattern[index - 1] - drift + pattern[0];

      index = 0;
      // Update starting point
      startingPoint += bar;

      // If next step is less than or equal to lookAhead ms away, pass next step to timer()
      if (interval <= lookAhead) {
        timer(pattern, index, interval);
        clearInterval(silentLoop);
        return;
      }
    }
  }, lookAhead);
}

const stop = document.querySelector("#stop");
stop.addEventListener("click", () => {
  loopRunning = false;
});

function createBlock() {
  const block = document.createElement("div");
  block.classList.add("block");
  document.body.appendChild(block);
}

function getDelay(pattern, index, now) {
  // Calculate drift and delay
  const drift = parseInt(now - startingPoint) - pattern[index];
  // Delay is never negative
  const delay = Math.max(0, buffer - drift);
  return delay;
}
