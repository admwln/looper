import Step from "./Step.js";
import {
  getProject,
  getNoteName,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class ControllerStep extends Step {
  constructor(noteName, pixelValue) {
    super(noteName, pixelValue);
    this.state = "off";
    this.velocities = [];
  }

  pushControllerStep(stepSeq) {
    stepSeq.controllerSteps.push(this);
  }

  displayControllerStep(stepSeqId) {
    $("#" + stepSeqId + " .controller-seq").append(
      `<div id="${this.id}" class="step off" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }

  splitControllerStep(splitBy) {
    // Calculate pixel value for new steps
    this.pixelValue = this.pixelValue / splitBy;
    // Get note name for new steps
    this.noteName = getNoteName(this.pixelValue);
    this.updateStep();

    // Create new step(s)
    for (let i = 1; i < splitBy; i++) {
      // Get id of parent StepSeq
      const stepSeqId = $("#" + this.id)
        .parent()
        .parent()
        .attr("id");

      const newStep = new ControllerStep(this.noteName, this.pixelValue);
      newStep.state = this.state;
      newStep.spliceControllerStep(this.id);
      newStep.insertNewControllerStep(this.id);
    }
  }

  // Name splice could be ambiguous because it could also mean to remove an element
  spliceControllerStep(originalStepId) {
    const stepSeqId = $("#" + originalStepId)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const stepIndex = stepSeq.controllerSteps.findIndex(
      (step) => step.id == originalStepId
    );
    stepSeq.controllerSteps.splice(stepIndex, 0, this);
  }
  // Maybe join method above and below into one method
  insertNewControllerStep(originalStepId) {
    $("#" + originalStepId).after(
      `<div id="${this.id}" class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }
}
