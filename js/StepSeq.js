import ControllerStep from "./ControllerStep.js";
import NoteStep from "./NoteStep.js";
import {
  getProject,
  setIdCounter,
  getIdCounter,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class StepSeq {
  constructor(groupId, sequenceLength) {
    this.id = "sts" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteSteps = [];
    this.controllerSteps = [];
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    // Add step sequence to group
    group.sequences.push(this);
    this.initStepSeq(groupId, sequenceLength);
  }

  initStepSeq(groupId, sequenceLength) {
    // Create div to contain steps
    $("#" + groupId + " .scroll-container").append(
      `<div class="step-seq" id="${this.id}"><div class="note-seq"></div><div class="controller-seq"></div></div>`
    );

    for (let i = 1; i <= sequenceLength; i++) {
      const noteStep = new NoteStep("16n", 84, 1, 80, this.id);
      noteStep.pushNoteStep(this);
      noteStep.displayNoteStep(this.id);
      const controllerStep = new ControllerStep("16n", 84);
      controllerStep.pushControllerStep(this);
      controllerStep.displayControllerStep(this.id, groupId);
    }

    console.log(`Step seq created`);
  }

  // PLAYBACK METHODS - second try
  playNoteSeq(loopStart, group) {
    // Will always start on first noteStep, whether it's on or off
    // Method on noteStep will check if it's on or off
    const firstNoteStep = this.noteSteps[0];
    // Calculate time at which firstNoteStep should be played
    let target = loopStart;
    let sequenceLength =
      group.sequences[0].steps.length * Tone.Time("16n").toSeconds() * 1000;
    // Queue noteStep
    console.log("Will play first step at " + target);
    setTimeout(() => {
      firstNoteStep.playNoteStep(
        target, // Target is equal to loopStart, because it's the first noteStep
        loopStart, // Loop start, in milliseconds, set when play button is pressed (includes latency buffer)
        0, // Round counter (how many times the loop has been played)
        0, // Index of first noteStep in sequence
        this, // This StepSeq object
        sequenceLength // Sequence length in milliseconds
      );
    }, target - performance.now() - 10);

    // noteStep.playNoteStep(
    //   loopStart, // Target is equal to loopStart, because it's the first noteStep
    //   loopStart, // Loop start, in milliseconds, set when play button is pressed
    //   0, // Round counter (how many times the loop has been played)
    //   0, // Index of noteStep in sequence
    //   this // StepSeq object
    // );
  }

  // PLAYBACK METHODS - first try
  // getSequenceLength() {
  //   const stepCount = this.noteSteps.length;
  //   const sequenceLength = stepCount * Tone.Time("16n").toSeconds() * 1000;
  //   return parseInt(sequenceLength);
  // }
  // playNoteSeq(loopStart) {
  //   // If there are any noteSteps with state "on", play them
  //   if (this.noteSteps.some((noteStep) => noteStep.state === "on")) {
  //     console.log("loopStart: " + loopStart);
  //     // Find first noteStep in sequence with state "on"
  //     const noteStep = this.noteSteps.find(
  //       (noteStep) => noteStep.state === "on"
  //     );
  //     noteStep.playNoteStep(
  //       loopStart + noteStep.getNoteStepTime(),
  //       loopStart,
  //       0,
  //       this.getSequenceLength()
  //     );
  //   }
  // }
}
