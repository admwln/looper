let kick;
let snare;
let hihat;
let piano;
let bass;
let brass;
let flute;
let strings;

let lowPass;
let partA;
let partB;

const patternA = [
  { time: "0:0:0", duration: "8n", note: "C3", velocity: 0.9 },
  { time: "0:2:0", duration: "8n", note: "G3", velocity: 0.9 },
  { time: "0:2:2", duration: "8n", note: "B3", velocity: 0.5 },
];
const patternB = [
  { time: "0:1:0", duration: "8n", note: "E2", velocity: 0.5 },
  { time: "0:3:0", duration: "8n", note: "A2", velocity: 0.5 },
];

// Initialize audio context for tone.js
document.querySelector("#tone-js-init").addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio is all set!");

  // Filter
  lowPass = new Tone.Filter({
    frequency: 800,
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

  piano = new Tone.Synth({
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.005, // Attack time
      decay: 0.1, // Decay time
      sustain: 0.5, // Sustain level
      release: 1, // Release time
    },
  }).toDestination();

  bass = new Tone.MembraneSynth({
    envelope: {
      attack: 0.001, // Attack time
      decay: 0.1, // Decay time
      sustain: 0.2, // Sustain level
      release: 1.6, // Release time
    },
  }).toDestination();

  brass = new Tone.Synth({
    oscillator: {
      type: "sawtooth",
    },
    envelope: {
      attack: 0.1, // Attack time
      decay: 0.2, // Decay time
      sustain: 0.7, // Sustain level
      release: 0.5, // Release time
    },
  })
    .connect(lowPass)
    .toDestination();

  flute = new Tone.Synth({
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.001, // Attack time
      decay: 0.5, // Decay time
      sustain: 0.5, // Sustain level
      release: 1.6, // Release time
    },
  }).toDestination();

  strings = new Tone.PolySynth(Tone.Synth, {
    envelope: {
      attack: 0.005, // Attack time
      decay: 0.1, // Decay time
      sustain: 0.5, // Sustain level
      release: 1, // Release time
    },
  }).toDestination();

  // BPM
  Tone.Transport.bpm.value = 120;

  // PARTS
  partA = createPart(piano, patternA);
  partB = createPart(brass, patternB);
  partA.loop = true;
  partB.loop = true;
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
    if (instrument !== hihat && instrument !== snare) {
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
  partA.start(0);
  partB.start(0);
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
