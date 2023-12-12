// Initialize audio context for tone.js
let kick;
let snare;
let lowPass;
let snareLoop;
let kickLoop;
let index = 0;
const notes = [null, "A2", null, "F2", null, "D2", null, "F2"];
const snareSeq = [0, 1, 0, 1, 0, 1, 0, 1];

document.querySelector("#tone-js-init").addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio is all set!");

  // Filter
  lowPass = new Tone.Filter({
    frequency: 8000,
  }).toDestination();

  // Synths
  kick = new Tone.MembraneSynth({
    volume: 6,
  }).toDestination();

  snare = new Tone.NoiseSynth({
    volume: 3,
    noise: {
      type: "white",
      playbackRate: 3,
    },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.015,
      release: 0.003,
    },
  })
    .connect(lowPass)
    .toDestination();

  hihat = new Tone.NoiseSynth({
    volume: 3,
    noise: {
      type: "white",
      playbackRate: 2,
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.1,
      release: 0.02,
    },
  })
    .connect(lowPass)
    .toDestination();

  // BPM
  Tone.Transport.bpm.value = 120;

  // SNARE LOOP
  snareLoop = new Tone.Loop((time) => {
    if (snareSeq[index] === 1) {
      snare.triggerAttackRelease(/*notes[index], */ "4n", time);
      drawBlock();
      console.log(time);
    }
    index++;

    // Reset index when it reaches the end of the array
    if (index === notes.length) {
      index = 0;
    }
  }, "4n");

  // KICK LOOP
});

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  Tone.Transport.start();
  snareLoop.start(0);
});

const stop = document.querySelector("#stop");
stop.addEventListener("click", () => {
  Tone.Transport.stop();
  snareLoop.stop();
});

function drawBlock() {
  const body = document.querySelector("body");
  const block = document.createElement("div");
  block.classList.add("block");
  body.appendChild(block);
}
