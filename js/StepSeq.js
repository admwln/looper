import ControllerStep from "./ControllerStep.js";
import NoteStep from "./NoteStep.js";
import { setIdCounter, getIdCounter } from "./helper-functions.js";

export default class StepSeq {
  constructor(parentGroup) {
    this.id = "sts" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteSteps = [];
    this.controllerSteps = [];
    this.muted = false;
    this.parentGroup = parentGroup;
    // Add step sequence to group
    //this.parentGroup.sequences.push(this);
    this.initStepSeq();
  }

  initStepSeq() {
    const sequenceLength = this.parentGroup.sequences[0].steps.length;
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
      const noteStep = new NoteStep("16n", 84, 1, 0.8, this);
      noteStep.pushNoteStep();
      noteStep.displayNoteStep();
      const controllerStep = new ControllerStep("16n", 84, this);
      controllerStep.pushControllerStep();
      controllerStep.displayControllerStep();
    }

    console.log(`Step seq created`);
  }
}
