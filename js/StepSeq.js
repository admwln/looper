import ControllerStep from "./ControllerStep.js";
import NoteStep from "./NoteStep.js";
import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class StepSeq {
  constructor(groupId, measureLength) {
    this.id = "sts" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteSteps = [];
    this.controllerSteps = [];
    this.initStepSeq(groupId, measureLength);
  }

  initStepSeq(groupId, measureLength) {
    // Create div to contain steps
    $("#" + groupId + " .scroll-container").append(
      `<div class="step-seq" id="${this.id}"><div class="note-seq"></div><div class="controller-seq"></div></div>`
    );

    for (let i = 1; i <= measureLength; i++) {
      const noteStep = new NoteStep("16n", 84, 60, 100, this.id);
      this.noteSteps.push(noteStep);
      const controllerStep = new ControllerStep("16n", 84, this.id);
      this.controllerSteps.push(controllerStep);
    }

    console.log(`Step seq created`, getProject());
  }
}
