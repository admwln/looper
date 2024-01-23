import Step from "./Step.js";
// import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class StepNo extends Step {
  constructor(noteName, pixelValue, stepNo, stepNoSeqId) {
    super(noteName, pixelValue);
    this.stepNo = stepNo;
    this.displayStepNo(stepNoSeqId);
  }

  displayStepNo(stepNoSeqId) {
    $("#" + stepNoSeqId).append(
      `<div id="${this.id}" class="step">${this.stepNo}</div>`
    );
  }
}
