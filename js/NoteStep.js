import Step from "./Step.js";
import {
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class NoteStep extends Step {
  constructor(noteName, pixelValue, pitch, velocity, stepSeqId) {
    super(noteName, pixelValue);
    this.pitch = pitch;
    this.state = "off";
    this.velocity = velocity;
    this.forks = [];
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    // Add step to step sequence
    stepSeq.noteSteps.push(this);
  }

  displayNoteStep(stepSeqId) {
    $("#" + stepSeqId + " .note-seq").append(
      `<div id="${this.id}" class="step" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }
}
