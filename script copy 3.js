let startingPoint;
let loopReset = true;
let loopRunning = false;
let round = 0;
let bar = 2000;

const myPattern = [0, 500, 1000, 1125, 1250, 1500, 1625, 1750];
// const myPattern = [
//   0, 125, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500, 1625,
//   1750, 1875,
// ];

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  loopRunning = true;
  let index = 0;
  // If first step is 0, play first note immediately
  if (myPattern[0] === 0) {
    // Set starting point
    startingPoint = performance.now();
    // Play note
    console.log(
      "Step: " + myPattern[0] + " at " + performance.now() + " Drift: N/A"
    );
    const block = document.createElement("div");
    block.classList.add("block");
    document.body.appendChild(block);

    // !!!Following is duplicated from timer() function!!!
    index++;
    if (index < myPattern.length) {
      const myInterval = startingPoint + myPattern[index] - performance.now();

      // Pass next step to timer
      timer(myPattern, index, myInterval);
    }

    if (index >= myPattern.length) {
      const myInterval =
        startingPoint +
        bar -
        myPattern[index - 1] +
        myPattern[0] -
        performance.now();

      index = 0;
      // Update starting point
      startingPoint += bar;
      timer(myPattern, index, myInterval);
    }
  }
  // If first step is other than 0, pass to timer with adjusted interval
  if (myPattern[0] !== 0) {
    // Adjusted interval
    const myInterval = startingPoint + myPattern[0] - performance.now();
    timer(myPattern, 0, myInterval);
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
    const target = startingPoint + pattern[index];
    const drift = performance.now() - target;
    console.log(
      "Step: " +
        pattern[index] +
        " at " +
        performance.now() +
        " Drift: " +
        drift
    );
    const block = document.createElement("div");
    block.classList.add("block");
    document.body.appendChild(block);

    index++;
    if (index < pattern.length) {
      const myInterval = pattern[index] - pattern[index - 1] - drift;

      // Pass next step to timer
      timer(pattern, index, myInterval);
    }

    if (index >= pattern.length) {
      const myInterval = bar - pattern[index - 1] - drift + myPattern[0];

      index = 0;
      // Update starting point
      startingPoint += bar;
      timer(pattern, index, myInterval);
    }
  }, interval);
}

const stop = document.querySelector("#stop");
stop.addEventListener("click", () => {
  loopRunning = false;
});
