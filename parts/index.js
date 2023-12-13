// Initialize audio context for tone.js
let kick;
let snare;
let hihat;

let lowPass;
let kickPart;
let snarePart;

const kickPattern = [
  { time: "0:0:0", duration: "8n", note: "C1", velocity: 0.9 },
  { time: "0:2:0", duration: "8n", note: "C1", velocity: 0.9 },
  { time: "0:2:2", duration: "8n", note: "C1", velocity: 0.5 },
];
const snarePattern = [
  { time: "0:1:0", duration: "8n", velocity: 0.5 },
  { time: "0:3:0", duration: "8n", velocity: 0.5 },
];

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
      decay: 0.015,
      sustain: 0.015,
      release: 0.02,
    },
  })
    .connect(lowPass)
    .toDestination();

  // BPM
  Tone.Transport.bpm.value = 120;

  // PARTS
  kickPart = createPart(kick, kickPattern);
  snarePart = createPart(snare, snarePattern);
  kickPart.loop = true;
  snarePart.loop = true;
});

function createPart(instrument, pattern) {
  return new Tone.Part((time, note) => {
    console.log(
      "Instrument: " +
        instrument +
        " Note: " +
        note.note +
        " at " +
        parseInt(time * 1000)
    );
    if (instrument === kick) {
      instrument.triggerAttackRelease(
        note.note,
        note.duration,
        time,
        note.velocity
      );
    } else {
      instrument.triggerAttackRelease(note.duration, time, note.velocity);
    }
    Tone.Draw.schedule(() => {
      drawBlock();
    }, time);
  }, pattern).start(0);
}

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  Tone.Transport.start();
  kickPart.start(0);
  snarePart.start(0);
});

const stop = document.querySelector("#stop");
stop.addEventListener("click", () => {
  Tone.Transport.stop();
});

function drawBlock() {
  const body = document.querySelector("body");
  const block = document.createElement("div");
  block.classList.add("block");
  body.appendChild(block);
}
