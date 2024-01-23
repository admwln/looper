import StepNo from "./StepNo.js";
import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class StepNoSeq {
  constructor(groupId, measureLength) {
    this.id = "sns" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.steps = [];
    this.initStepNoSeq(groupId, measureLength);
    // On construction, this.steps[] should be populated with 16n steps * current measure length
    // We may have to pass the current measure length as an argument to the constructor
  }

  initStepNoSeq(groupId, measureLength) {
    // Create div to contain steps
    $("#" + groupId + " .scroll-container").append(
      `<div class="step-no-seq" id="${this.id}"></div>`
    );

    for (let i = 1; i <= measureLength; i++) {
      const stepNo = new StepNo("16n", 84, i, this.id);
      this.steps.push(stepNo);
    }

    console.log(`Step no seq created`, getProject());
  }
}
