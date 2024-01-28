import Step from "./Step.js";
import {
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class StepNo extends Step {
  constructor(noteName, pixelValue, stepNo, stepNoSeqId) {
    super(noteName, pixelValue);
    this.stepNo = stepNo;
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepNoSeq = findNestedProp(sequences, stepNoSeqId);
    // Add step to stepNoSeq
    stepNoSeq.steps.push(this);
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
