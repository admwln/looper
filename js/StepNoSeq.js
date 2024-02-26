import StepNo from "./StepNo.js";
import { setIdCounter, getIdCounter } from "./helper-functions.js";

export default class StepNoSeq {
  constructor(parentGroup, groupId, length) {
    this.id = "sns" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.steps = [];
    this.parentGroup = parentGroup;
    this.initStepNoSeq(groupId, length);
  }

  initStepNoSeq(groupId, length) {
    // Create div to contain steps
    $("#" + groupId + " .scroll-container").append(
      `<div class="step-no-seq" id="${this.id}"></div>`
    );

    for (let i = 1; i <= length; i++) {
      const stepNo = new StepNo("16n", 84, i, this);
      //this.steps.push(stepNo);
      stepNo.displayStepNo(this.id);
    }

    console.log(`Step no seq created`);
  }

  popStepNo() {
    this.steps.pop();
    $("#" + this.id + " .step:last-of-type").remove();
  }
}
