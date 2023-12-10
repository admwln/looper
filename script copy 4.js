// TODO: Get rid of duplicated code in click function for play button

// TODO: Before re-calling timer(), check if the interval until next step is greater than e.g. 250ms. If so, call silentTimer() which should loop every 250ms and check if the interval until next step is less than 250ms. If so, call timer() with the remaining interval. If not, call silentTimer() again.

// Initialize audio context for tone.js
let synth;
document.querySelector("#tone-js-init").addEventListener("click", async () => {
  await Tone.start();
  console.log("audio is ready");
  //create a synth and connect it to the main output (your speakers)
  synth = new Tone.MembraneSynth().toDestination();
});

let startingPoint;
let loopReset = true;
let loopRunning = false;
let round = 0;
let bar = 2000;
const lookAhead = 25;

const noteTimings = [0, 500, 1000];
// const noteTimings = [0, 500, 1000, 1125, 1250, 1500, 1625, 1750];
// const notes = ["C4", "E4", "G4", "B4", "C5", "B4", "G4", "E4"];
const notes = ["C1", "C1", "C1", "C1", "C1", "C1", "C1", "C1"];
// const noteTimings = [
//   0, 125, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500, 1625,
//   1750, 1875,
// ];

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  loopRunning = true;
  let index = 0;
  // If first step is 0, play first note immediately
  if (noteTimings[0] === 0) {
    // Set starting point
    startingPoint = performance.now();
    // Play note
    synth.triggerAttackRelease(notes[index], "8n");
    console.log(
      "Step: " +
        noteTimings[0] +
        " at " +
        parseInt(performance.now() - startingPoint)
    );
    createBlock();
    // !!!Following is duplicated from timer() function!!!
    index++;
    if (index < noteTimings.length) {
      const myInterval = startingPoint + noteTimings[index] - performance.now();

      // Pass next step to timer
      timer(noteTimings, index, myInterval);
    }

    if (index >= noteTimings.length) {
      const drift = performance.now() - (startingPoint + pattern[index - 1]);
      const myInterval = bar - pattern[index - 1] - drift + noteTimings[0];

      index = 0;
      // Update starting point
      startingPoint += bar;
      timer(noteTimings, index, myInterval);
    }
  }
  // If first step is other than 0, pass to timer with adjusted interval
  if (noteTimings[0] !== 0) {
    // Adjusted interval
    const myInterval = startingPoint + noteTimings[0] - performance.now();
    timer(noteTimings, 0, myInterval);
  }
});

function timer(pattern, index, interval) {
  if (!loopRunning) {
    return;
  }

  setTimeout(() => {
    if (!loopRunning) {
      return;
    }
    // Play note
    synth.triggerAttackRelease(notes[index], "8n");
    console.log(
      "Step: " +
        pattern[index] +
        " at " +
        parseInt(performance.now() - startingPoint)
    );
    createBlock();
    index++;
    if (index < pattern.length) {
      const myInterval = startingPoint + noteTimings[index] - performance.now();

      // If next step is more than lookAhead ms away, call silentTimer()
      if (myInterval > lookAhead) {
        const mySilentInterval = myInterval - lookAhead;
        silentTimer(pattern, index, mySilentInterval);
      }

      // If next step is less than or equal to lookAhead ms away, pass next step to timer
      if (myInterval <= lookAhead) {
        timer(pattern, index, myInterval);
      }
    }

    if (index >= pattern.length) {
      const drift = performance.now() - (startingPoint + pattern[index - 1]);
      const myInterval = bar - pattern[index - 1] - drift + noteTimings[0];

      index = 0;
      // Update starting point
      startingPoint += bar;
      timer(pattern, index, myInterval);
    }
  }, interval);
}

function silentTimer(pattern, index, interval) {
  console.log("silentTimer() called");
  if (!loopRunning) {
    return;
  }
  setTimeout(() => {
    if (!loopRunning) {
      return;
    }
    if (index < pattern.length) {
      const myInterval = startingPoint + noteTimings[index] - performance.now();

      // If next step is more than lookAhead ms away, call silentTimer()
      if (myInterval > lookAhead) {
        const mySilentInterval = myInterval - lookAhead;
        silentTimer(pattern, index, mySilentInterval);
      } else {
        // Pass next step to timer
        timer(pattern, index, myInterval);
        console.log("timer() called from silentTimer()");
      }
    }

    if (index >= pattern.length) {
      const drift = performance.now() - (startingPoint + pattern[index - 1]);
      const myInterval = bar - pattern[index - 1] - drift + noteTimings[0];

      index = 0;
      // Update starting point
      startingPoint += bar;
      // If next step is more than lookAhead ms away, call silentTimer()
      if (myInterval > lookAhead) {
        const mySilentInterval = myInterval - lookAhead;
        silentTimer(pattern, index, mySilentInterval);
      } else {
        // Pass next step to timer
        timer(pattern, index, myInterval);
        console.log("timer() called from silentTimer()");
      }
    }
  }, interval);
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
