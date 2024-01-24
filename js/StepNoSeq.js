import StepNo from "./StepNo.js";
import {
  getProject,
  setIdCounter,
  getIdCounter,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class StepNoSeq {
  constructor(groupId, measureLength) {
    this.id = "sns" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.steps = [];
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    // Add step no sequence to group
    group.sequences.push(this);
    this.initStepNoSeq(groupId, measureLength);
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
