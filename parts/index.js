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
let partC;

const patternA = [
  { time: "0:0:0", duration: "8n", note: "c1", velocity: 0.9 },
  { time: "0:2:0", duration: "8n", note: "c1", velocity: 0.9 },
  { time: "0:3:0", duration: "32n", note: "c1", velocity: 0.5 },
  { time: "0:3:0.5", duration: "32n", note: "c1", velocity: 0.5 },
  { time: "0:3:1", duration: "32n", note: "c1", velocity: 0.5 },
  { time: "0:3:1.5", duration: "32n", note: "c1", velocity: 0.5 },
];

const patternB = [
  { time: "0:1:0", duration: "8n", note: "E2", velocity: 0.5 },
  { time: "0:3:0", duration: "8n", note: "A2", velocity: 0.5 },
];

const patternC = [
  { time: "0:0:0", duration: "8n", note: "C3", velocity: 0.9 },
  { time: "0:1:0", duration: "8n", note: "E3", velocity: 0.9 },
  { time: "0:2:0", duration: "8n", note: "G3", velocity: 0.9 },
  { time: "0:3:0", duration: "8n", note: "A3", velocity: 0.9 },
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

  // BPM
  Tone.Transport.bpm.value = 140;

  // PARTS
  partA = createPart(kick, patternA);
  partB = createPart(brass, patternB);
  partC = createPart(piano, patternC);
  partA.loop = true;
  partA.loopEnd = "1m";
  partB.loop = true;
  partB.loopEnd = "1m";
  partC.loop = true;
  partC.loopEnd = "1m";
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
  }, pattern);
}

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  Tone.Transport.start();
  partA.start(0);
});

const stop = document.querySelector("#stop");
stop.addEventListener("click", () => {
  Tone.Transport.stop();
});

// When user clicks #switch, stop partA and start partC
const switchParts = document.querySelector("#switch");

switchParts.addEventListener("click", () => {
  // Get the current position of the transport
  const currentMeasure = Tone.Transport.position;

  // Split the current position to get the measure part
  const [measure] = currentMeasure.split(":");

  let nextMeasure = parseInt(measure) + 1;
  // Log the current measure
  console.log("currentMeasure:", `${measure}:3:3`);
  nextMeasure = Tone.Time(nextMeasure + ":0:0").toSeconds();
  const margin = Tone.Time("16n").toSeconds();

  // Function to switch between parts
  const switchPart = (currentPart, nextPart) => {
    console.log(`${currentPart.name} at next measure`);

    // Schedule a stop for the current part at the next measure
    Tone.Transport.scheduleOnce((time) => {
      Tone.Draw.schedule(() => {
        currentPart.stop(0);
        nextPart.start(0);
        console.log("Switch!");
      }, time);
      // }, `${measure}:3:3`);
    }, parseFloat(nextMeasure - margin));
  };

  // Check which part is currently playing and switch to the other
  if (partA.state === "started") {
    switchPart(partA, partC);
  } else if (partC.state === "started") {
    switchPart(partC, partA);
  }
});

function drawBlock() {
  const body = document.querySelector("body");
  const block = document.createElement("div");
  block.classList.add("block");
  body.appendChild(block);
}
