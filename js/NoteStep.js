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
      `<div id="${this.id}" class="step off" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
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
      newStep.insertNoteStep(this.id, i);
    }
  }

  // Splice this into right place in stepSeq.noteSteps, and add into DOM
  insertNoteStep(originalStepId, i) {
    const stepSeqId = $("#" + originalStepId)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    // Original step index
    const stepIndex = stepSeq.noteSteps.findIndex(
      (step) => step.id == originalStepId
    );
    // i is added to stepIndex to account for the new step(s) that have been added
    stepSeq.noteSteps.splice(stepIndex + i, 0, this);
    // Add this into DOM
    // i needs to be subtracted by 1 to account for the original step, which is still in the DOM
    $(
      "#" + stepSeqId + " .note-seq .step:eq(" + (stepIndex + i - 1) + ")"
    ).after(
      `<div id="${this.id}" class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
    );
  }

  joinNoteStep(stepIndex, stepSeqId) {
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);

    // Get pixel value of subsequent step
    const nextStepPixelValue = stepSeq.noteSteps[stepIndex + 1].pixelValue;
    // Calculate pixel value for extended step
    this.pixelValue = this.pixelValue + nextStepPixelValue;
    // Get note name for extended step
    this.noteName = getNoteName(this.pixelValue);
    // Update step in DOM
    this.updateStep();
    // Remove subsequent step from noteSteps array
    stepSeq.noteSteps.splice(stepIndex + 1, 1);
    // Remove subsequent step from DOM
    $(
      "#" + stepSeqId + " .note-seq .step:eq(" + (stepIndex + 1) + ")"
    ).remove();
  }

  // Delete noteStep from stepSeq.noteSteps, and from DOM
  deleteNoteStep(stepSeqId) {
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    // Get index of this in stepSeq.noteSteps
    const stepIndex = stepSeq.noteSteps.findIndex((step) => step.id == this.id);
    // Remove this from stepSeq.noteSteps
    stepSeq.noteSteps.splice(stepIndex, 1);
    // Remove this from DOM
    $("#" + this.id).remove();
  }
}
