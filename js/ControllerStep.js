import Step from "./Step.js";
// import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class ControllerStep extends Step {
  constructor(noteName, pixelValue, stepSeqId) {
    super(noteName, pixelValue);
    this.state = "off";
    this.velocities = [];
    this.displayControllerStep(stepSeqId);
  }

  displayControllerStep(stepSeqId) {
    $("#" + stepSeqId + " .controller-seq").append(
      `<div id="${this.id}" class="step" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }
}
