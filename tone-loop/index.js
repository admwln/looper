// Initialize audio context for tone.js
let kick;
let snare;
let lowPass;
let snareSequence;
let kickSequence;
let hihatSequence;

const notes = [];
const kickNoteValues = ["C4", "C5", "C6", "C4", "C1", "C1", "C1", "C1"];

const snareSeq = [0, 0, 1, 0, 0, 0, 1, 0];
const kickSeq = [1, 0, 0, 0, 1, 1, 0, 0];
const hihatSeq = [1, 1, 1, 1, 1, 1, 1, 1];

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
  Tone.Transport.bpm.value = 90;

  // SEQS
  snareSequence = createSequence(snare, snareSeq, notes);
  kickSequence = createSequence(kick, kickSeq, kickNoteValues);
  hihatSequence = createSequence(hihat, hihatSeq, notes);
});

function createSequence(instrument, sequence, noteValues) {
  let index = 0;
  return new Tone.Sequence(
    (time, note) => {
      if (note === 1) {
        let noteValue = noteValues[index];
        if (instrument === kick) {
          instrument.triggerAttackRelease(noteValue, "8n", time);
        } else {
          instrument.triggerAttackRelease("8n", time);
        }

        Tone.Draw.schedule(() => {
          drawBlock();
        }, time);
        index++;
        if (index === noteValues.length) {
          index = 0;
        }
      }
    },
    sequence,
    "8n"
  );
}

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  Tone.Transport.start();
  snareSequence.start(0);
  kickSequence.start(0);
  hihatSequence.start(0);
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
