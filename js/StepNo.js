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
  deleteStepNo(stepNoSeqId) {
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepNoSeq = findNestedProp(sequences, stepNoSeqId);
    const stepNoIndex = stepNoSeq.steps.indexOf(this);
    stepNoSeq.steps.splice(stepNoIndex, 1);
    $("#" + this.id).remove();
  }
}
