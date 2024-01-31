import Step from "./Step.js";
import StepSeq from "./StepSeq.js";
import {
  getKick,
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
    this.velocityRange = [40, 80, 127];
    this.forks = [];
  }

  pushNoteStep(stepSeq) {
    stepSeq.noteSteps.push(this);
  }
  // These two methods could be combined into one method
  displayNoteStep(stepSeqId) {
    $("#" + stepSeqId + " .note-seq").append(
      `
      <div id="${this.id}" class="step off" data="${this.noteName}" style="width:${this.pixelValue}px;">  
      </div>
      `
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
      `
      <div id="${this.id}" class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;">
      </div>
      `
    );
    // If step is on, activate it in DOM
    if (this.state == "on") {
      this.displayActiveNoteStep();
    }
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

  displayActiveNoteStep() {
    const velocity = this.velocity;
    let opacity = velocity / 127;
    $("#" + this.id).css(
      "background-color",
      "rgba(14, 27, 37," + opacity + ")"
    );
    const html = `
      <div>
        <button class="note-step-btn velocity-btn"><i class="fa-solid fa-plus"></i></button>
        <div>
          <button class="note-step-btn pitch-up"><i class="fa-solid fa-chevron-up"></i></button>
          <button class="note-step-btn pitch-down"><i class="fa-solid fa-chevron-down"></i></button>
        </div>
        <span class="pitch-no">${this.pitch}</span>
      </div>
      `;
    $("#" + this.id).append(html);
  }

  removeActiveNoteStep() {
    $("#" + this.id + " > div").remove();
    $("#" + this.id).css("background-color", "transparent");
  }

  pitchUp() {
    this.pitch++;
    $("#" + this.id + " .pitch-no").text(this.pitch);
  }

  pitchDown() {
    if (this.pitch > 1) {
      this.pitch--;
      $("#" + this.id + " .pitch-no").text(this.pitch);
    }
  }

  changeVelocity() {
    const currentIndex = this.velocityRange.indexOf(this.velocity);
    const nextIndex = (currentIndex + 1) % this.velocityRange.length;
    this.velocity = this.velocityRange[nextIndex];
    $("#" + this.id).css(
      "background-color",
      "rgba(14, 27, 37," + this.velocity / 127 + ")"
    );
  }

  findFirstNoteStep() {
    const stepSeqId = $("#" + this.id)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const firstNoteStep = stepSeq.noteSteps.find(
      (noteStep) => noteStep.state == "on"
    );
    return firstNoteStep;
  }

  findNextNoteStep() {
    const stepSeqId = $("#" + this.id)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const stepIndex = stepSeq.noteSteps.findIndex((step) => step.id == this.id);
    const nextNoteStep = stepSeq.noteSteps.find(
      (noteStep, index) => index > stepIndex && noteStep.state == "on"
    );

    return nextNoteStep;
  }

  // Returns the time at which the step should be played, relative to the start of the loop
  getNoteStepTime() {
    const stepSeqId = $("#" + this.id)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const stepIndex = stepSeq.noteSteps.findIndex((step) => step.id == this.id);
    const precedingNoteSteps = stepSeq.noteSteps.filter(
      (noteStep, index) => index < stepIndex
    );
    let time = 0;
    precedingNoteSteps.forEach((noteStep) => {
      time += Tone.Time(noteStep.noteName).toSeconds() * 1000;
    });
    return time;
  }

  // Time is the time at which the step should be played
  playNoteStep(target, loopStart, round, sequenceLength) {
    let drift = target - performance.now();
    if (drift < 0) {
      drift = 0;
    }

    // Play note
    //setKickVolume((this.velocity / 12.7) * 0.25);
    getKick().triggerAttackRelease(
      "C1",
      this.noteName,
      "+" + drift / 1000,
      this.velocity / 127
    );

    // Find next noteStep in sequence with state "on"
    let nextNoteStep = this.findNextNoteStep();
    // Calculate time at which nextNoteStep should be played
    let nextTarget;
    // If nextNoteStep is defined, calculate nextTarget
    if (nextNoteStep) {
      nextTarget =
        loopStart + sequenceLength * round + nextNoteStep.getNoteStepTime();
    }

    // If nextNoteStep is undefined, find first noteStep and repeat loop
    if (!nextNoteStep) {
      nextNoteStep = this.findFirstNoteStep();
      round++;
      nextTarget =
        loopStart + sequenceLength * round + nextNoteStep.getNoteStepTime();
      if (round > 3) {
        return;
      }
    }

    // If nextTarget is more than 250ms away, start a loop that checks every 250ms
    if (nextTarget - performance.now() - drift > 250) {
      const silentLoop = setInterval(() => {
        console.log("silent loop running");
        if (nextTarget - performance.now() - drift < 250) {
          setTimeout(() => {
            // Play nextNoteStep
            nextNoteStep.playNoteStep(
              nextTarget,
              loopStart,
              round,
              sequenceLength
            );
          }, nextTarget - performance.now() - drift - 10);
          clearInterval(silentLoop);
          return;
        }
      }, 250);
    } else {
      setTimeout(() => {
        // Play nextNoteStep
        nextNoteStep.playNoteStep(nextTarget, loopStart, round, sequenceLength);
      }, nextTarget - performance.now() - drift - 10);
    }
  }
}
