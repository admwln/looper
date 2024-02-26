import ControllerStep from "./ControllerStep.js";
import NoteStep from "./NoteStep.js";
import {
  getProject,
  setIdCounter,
  getIdCounter,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

export default class StepSeq {
  constructor(parentGroup, sequenceLength) {
    this.id = "sts" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteSteps = [];
    this.controllerSteps = [];
    this.muted = false;
    this.parentGroup = parentGroup;
    // Add step sequence to group
    //this.parentGroup.sequences.push(this);
    this.initStepSeq(sequenceLength);
  }

  initStepSeq(sequenceLength) {
    console.log("Init step seq");
    console.log("step seq parent group id", this.parentGroup.id);
    // Create div to contain steps
    $("#" + this.parentGroup.id + " .scroll-container").append(
      `
      <div class="step-seq" id="${this.id}">
        <div class="note-seq"></div>
        <div class="controller-seq"></div>
      </div>
      `
    );

    for (let i = 1; i <= sequenceLength; i++) {
      const noteStep = new NoteStep("16n", 84, 1, 80, this);
      noteStep.pushNoteStep();
      noteStep.displayNoteStep();
      const controllerStep = new ControllerStep("16n", 84, this);
      controllerStep.pushControllerStep();
      controllerStep.displayControllerStep();
    }

    console.log(`Step seq created`);
  }
}
