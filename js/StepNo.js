import Step from "./Step.js";
import {
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

export default class StepNo extends Step {
  constructor(noteName, pixelValue, stepNo, parentStepNoSeq) {
    super(noteName, pixelValue);
    this.stepNo = stepNo;
    this.parentStepNoSeq = parentStepNoSeq;
    // Add step to stepNoSeq
    parentStepNoSeq.steps.push(this);
  }

  displayStepNo(stepNoSeqId) {
    $("#" + stepNoSeqId).append(
      `<div id="${this.id}" class="step">${this.stepNo}</div>`
    );
  }

  // Remove stepNo from parent stepNoSeq
  deleteStepNo() {
    const stepNoSeq = this.parentStepNoSeq;
    stepNoSeq.pop();
    $("#" + this.id).remove();
  }
}
