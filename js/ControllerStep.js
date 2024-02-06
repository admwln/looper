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
    this.muted = false;
    this.velocities = [];
  }

  pushControllerStep(stepSeq) {
    stepSeq.controllerSteps.push(this);
  }

  displayControllerStep(stepSeqId, groupId) {
    $("#" + stepSeqId + " .controller-seq").append(
      `<div id="${this.id}" class="step off" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
    // Find group object in project
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    if (!group.ccVisibility) {
      $("#" + this.id)
        .parent()
        .hide();
    }
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
      const newStep = new ControllerStep(this.noteName, this.pixelValue);
      newStep.state = this.state;
      newStep.insertControllerStep(this.id, i);
    }
  }

  // Splice this into right place in stepSeq.noteSteps, and add into DOM
  insertControllerStep(originalStepId, i) {
    const stepSeqId = $("#" + originalStepId)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    // Original step index
    const stepIndex = stepSeq.controllerSteps.findIndex(
      (step) => step.id == originalStepId
    );
    // i is added to stepIndex to account for the new step(s) that have been added
    stepSeq.controllerSteps.splice(stepIndex + i, 0, this);
    // Add this into DOM
    // i needs to be subtracted by
    $(
      "#" + stepSeqId + " .controller-seq .step:eq(" + (stepIndex + i - 1) + ")"
    ).after(
      `<div id="${this.id}" class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }

  joinControllerStep(stepIndex, stepSeqId) {
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);

    // Get pixel value of subsequent step
    const nextStepPixelValue =
      stepSeq.controllerSteps[stepIndex + 1].pixelValue;
    // Calculate pixel value for extended step
    this.pixelValue = this.pixelValue + nextStepPixelValue;
    // Get note name for extended step
    this.noteName = getNoteName(this.pixelValue);
    // Update step in DOM
    this.updateStep();
    // Remove subsequent step from controllerSteps array
    stepSeq.controllerSteps.splice(stepIndex + 1, 1);
    // Remove subsequent step from DOM
    $(
      "#" + stepSeqId + " .controller-seq .step:eq(" + (stepIndex + 1) + ")"
    ).remove();
  }

  // Delete controllerStep stepSeq.controllerSteps
  deleteControllerStep(stepSeqId) {
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const stepIndex = stepSeq.controllerSteps.findIndex(
      (step) => step.id == this.id
    );
    stepSeq.controllerSteps.splice(stepIndex, 1);
    $("#" + this.id).remove();
  }
}
