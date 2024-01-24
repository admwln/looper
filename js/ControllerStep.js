import Step from "./Step.js";
import {
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class ControllerStep extends Step {
  constructor(noteName, pixelValue, stepSeqId) {
    super(noteName, pixelValue);
    this.state = "off";
    this.velocities = [];
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    // Add step to step sequence
    stepSeq.controllerSteps.push(this);
  }

  displayControllerStep(stepSeqId) {
    $("#" + stepSeqId + " .controller-seq").append(
      `<div id="${this.id}" class="step" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }
}
