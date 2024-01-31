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

  getSequenceLength() {
    const stepCount = this.noteSteps.length;
    const sequenceLength = stepCount * Tone.Time("16n").toSeconds() * 1000;
    return sequenceLength;
  }

  playNoteSeq(loopStart) {
    // If there are any noteSteps with state "on", play them
    if (this.noteSteps.some((noteStep) => noteStep.state === "on")) {
      console.log("loopStart: " + loopStart);
      // Find first noteStep in sequence with state "on"
      const noteStep = this.noteSteps.find(
        (noteStep) => noteStep.state === "on"
      );
      noteStep.playNoteStep(
        loopStart + noteStep.getNoteStepTime(),
        loopStart,
        0,
        this.getSequenceLength()
      );
    }
  }
}
