// TODO: Account for drift by checking against now()

let kick;
let snare;
let hihat;
let piano;
let bass;
let brass;
let flute;
let strings;
let lowPass;
let quarter;
let bar;
let sixteenth;

const patternA = [
  { time: 0, duration: "8n", note: "c3", velocity: 0.9 },
  { time: 4, duration: "8n", note: "d3", velocity: 0.9 },
  { time: 8, duration: "8n", note: "g3", velocity: 0.5 },
  { time: 10, duration: "8n", note: "b4", velocity: 0.5 },
  { time: 12, duration: "8n", note: "a4", velocity: 0.5 },
  { time: 14, duration: "8n", note: "d3", velocity: 0.5 },
];
const patternB = [
  { time: 0, duration: "8n", note: "c1", velocity: 0.9 },
  { time: 4, duration: "8n", note: "c1", velocity: 0.9 },
  { time: 8, duration: "8n", note: "c1", velocity: 0.5 },
  { time: 10, duration: "8n", note: "c1", velocity: 0.5 },
  { time: 12, duration: "8n", note: "c1", velocity: 0.5 },
  { time: 14, duration: "8n", note: "c1", velocity: 0.5 },
];

// Initialize audio context for tone.js
document.querySelector("#tone-js-init").addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio is all set!");

  // BPM
  Tone.Transport.bpm.value = 120;
  quarter = Tone.Time("4n").toSeconds();
  sixteenth = Tone.Time("16n").toSeconds();
  bar = Tone.Time("1m").toSeconds();

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
      attack: 0.01, // Attack time
      decay: 0.2, // Decay time
      sustain: 0.5, // Sustain level
      release: 1, // Release time
    },
  }).toDestination();

  bass = new Tone.FMSynth({
    harmonicity: 3, // Controls the ratio between the carrier and modulator frequencies
    modulationIndex: 10, // Controls the depth of the modulation
    oscillator: {
      type: "sine", // You can experiment with other waveforms like 'triangle' or 'square'
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 1,
    },
    modulation: {
      type: "square", // You can experiment with other waveforms for modulation
    },
  }).toDestination();

  brass = new Tone.Synth({
    volume: -22,
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
});

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  let index = 0;
  Tone.Transport.start();
  nextNote("0.005", index);
});

function nextNote(interval, index) {
  Tone.Transport.schedule((time) => {
    kick.triggerAttackRelease(
      patternB[index].note,
      patternB[index].duration,
      time
    );

    Tone.Draw.schedule(() => {
      drawBlock();
      index++;
      if (index === patternB.length) {
        console.log("end");
        index = 0;
        const nextInterval =
          bar -
          sixteenth * patternB[patternB.length - 1].time +
          sixteenth * patternB[0].time;
        nextNote(nextInterval, index);
        return;
      }

      if (index < patternB.length) {
        const nextInterval =
          sixteenth * (patternB[index].time - patternB[index - 1].time);
        nextNote(nextInterval, index);
        return;
      }
    }, time);
  }, "+" + interval);
}

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
