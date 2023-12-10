let startingPoint;
let loopReset = true;
let loopRunning = false;
let round = 0;
let bar = 2000;

const myPattern = [0, 125, 250, 500, 750, 1000, 1250, 1500, 1750];

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  loopRunning = true;
  playLoop(myPattern);
});

const stop = document.querySelector("#stop");
stop.addEventListener("click", () => {
  loopRunning = false;
});

function playLoop(pattern, index, interval) {
  if (!loopRunning) {
    return;
  }

  // Set starting point at first call
  if (round === 0) {
    startingPoint = performance.now();
  }

  // First step of pattern:
  //If pattern starts on 0
  if (myPattern[0] === 0) {
    startingPoint += round * bar;
    console.log("starting point: " + startingPoint);
    console.log("Play note: " + myPattern[0] + " at " + performance.now());
    console.log("index", 0);

    //Pass next step to timer
    const interval = myPattern[1] - myPattern[0];
    timer(myPattern, 1, interval);
  }
  //If pattern starts on sth other than 0
  if (myPattern[0] !== 0) {
    startingPoint += round * bar;
    console.log("starting point: " + startingPoint);
    // Calculate starting point
    const interval = myPattern[0];
    timer(pattern, 0, interval);
  }
}

function timer(pattern, index, interval) {
  if (!loopRunning) {
    return;
  }

  setTimeout(() => {
    const target = startingPoint + pattern[index];
    const drift = performance.now() - target;
    console.log(
      "Play note: " +
        pattern[index] +
        " at " +
        performance.now() +
        " Drift: " +
        drift
    );
    console.log("index", index);
    console.log("Step: ", pattern[index]);
    index++;
    if (index < pattern.length) {
      const myInterval = pattern[index] - pattern[index - 1] - drift;

      // Pass next step to timer
      timer(pattern, index, myInterval);
    }

    if (index >= pattern.length) {
      const myInterval = bar - pattern[index - 1] - drift;

      index = 0;
      playLoop(pattern, index, myInterval);
    }
  }, interval);
}
