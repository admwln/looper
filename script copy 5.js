// TODO: Get rid of duplicated code in click function for play button

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
const noteTimings = [
  0, 125, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500, 1625,
  1750, 1875,
];
// const notes, random notes in C major scale, same length as noteTimings
const notes = [
  "C4",
  "D4",
  "F4",
  "C6",
  "G4",
  "A4",
  "C5",
  "E4",
  "D5",
  "E5",
  "F5",
  "B5",
  "G5",
  "A5",
  "B4",
  "D6",
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
    timer(noteTimings, 0, interval);
  }
});

function nextNote(pattern, index) {
  index++;
  if (index < pattern.length) {
    const interval = startingPoint + pattern[index] - Tone.now() * 1000;

    // Pass next step to timer
    timer(pattern, index, interval);
  }

  if (index >= pattern.length) {
    const drift = Tone.now() * 1000 - (startingPoint + pattern[index - 1]);
    const interval = bar - pattern[index - 1] - drift + pattern[0];

    index = 0;
    // Update starting point
    startingPoint += bar;
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
    index++;
    // if (index < pattern.length) {
    //   const interval = startingPoint + pattern[index] - Tone.now() * 1000;

    //   // Pass next step to timer
    //   timer(pattern, index, interval);
    // }

    // if (index >= pattern.length) {
    //   const drift = Tone.now() * 1000 - (startingPoint + pattern[index - 1]);
    //   const interval = bar - pattern[index - 1] - drift + pattern[0];

    //   index = 0;
    //   // Update starting point
    //   startingPoint += bar;
    //   timer(pattern, index, interval);
    // }
    if (index < pattern.length) {
      const interval = startingPoint + pattern[index] - Tone.now() * 1000;

      // If next step is more than lookAhead ms away, call startSilentTimer()
      if (interval > lookAhead) {
        startSilentTimer(pattern, index);
      }

      // If next step is less than or equal to lookAhead ms away, pass next step to timer
      if (interval <= lookAhead) {
        timer(pattern, index, interval);
      }
    }

    if (index >= pattern.length) {
      const drift = Tone.now() * 1000 - (startingPoint + pattern[index - 1]);
      const interval = bar - pattern[index - 1] - drift + noteTimings[0];

      index = 0;
      // Update starting point
      startingPoint += bar;
      timer(pattern, index, interval);
    }
  }, interval);
}

let silentLoop;

function startSilentTimer(pattern, index) {
  console.log("startSilentTimer() called");
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
