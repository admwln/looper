const bpm = 120;
const interval = 60000 / bpm;

const myPattern = [0, 500, 1000, 1500];

let currentBeat = 0;
let expected = Date.now() + interval;

function playNote() {
  // Trigger the note at the current beat
  // ...

  // Schedule the next beat
  currentBeat = (currentBeat + 1) % myPattern.length;
  if (currentBeat === 0) {
    // A whole bar has elapsed, reset the sequence
    // ...
  } else {
    expected += interval;
    setTimeout(playNote, Math.max(0, interval - (Date.now() - expected)));
  }
}

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  console.log("play");
  playNote();
});
