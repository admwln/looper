import Step from "./Step.js";
import {
  getProject,
  getNoteName,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class NoteStep extends Step {
  constructor(noteName, pixelValue, pitch, velocity) {
    super(noteName, pixelValue);
    this.pitch = pitch;
    this.state = "off";
    this.velocity = velocity;
    this.forks = [];
  }

  pushNoteStep(stepSeq) {
    stepSeq.noteSteps.push(this);
  }
  // These two methods could be combined into one method
  displayNoteStep(stepSeqId) {
    $("#" + stepSeqId + " .note-seq").append(
      `<div id="${this.id}" class="step" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }

  splitNoteStep(splitBy) {
    // Calculate pixel value for new steps
    this.pixelValue = this.pixelValue / splitBy;
    // Get note name for new steps
    this.noteName = getNoteName(this.pixelValue);
    this.updateStep();

    // Create new step(s)
    for (let i = 1; i < splitBy; i++) {
      const newStep = new NoteStep(
        this.noteName,
        this.pixelValue,
        this.pitch,
        this.velocity
      );
      newStep.state = this.state;
      newStep.spliceNoteStep(this.id);
      newStep.insertNewNoteStep(this.id);
    }
  }

  // Add this into right place in stepSeq.noteSteps
  spliceNoteStep(originalStepId) {
    const stepSeqId = $("#" + originalStepId)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const stepIndex = stepSeq.noteSteps.findIndex(
      (step) => step.id == originalStepId
    );
    stepSeq.noteSteps.splice(stepIndex, 0, this);
  }
  // Maybe join method above and below into one method
  insertNewNoteStep(originalStepId) {
    $("#" + originalStepId).after(
      `<div id="${this.id}" class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }
}
