import Step from "./Step.js";
import {
  getLoopOn,
  getProject,
  getNoteName,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

export default class NoteStep extends Step {
  constructor(noteName, pixelValue, pitch, velocity, parentStepSeq) {
    super(noteName, pixelValue);
    this.pitch = pitch;
    this.state = "off";
    this.velocity = velocity;
    this.velocityRange = [40, 80, 127];
    this.forks = [];
    this.msFromLoopStart = 0;
    this.muted = false;
    this.parentStepSeq = parentStepSeq;
  }

  pushNoteStep() {
    this.parentStepSeq.noteSteps.push(this);
  }
  // These two methods could be combined into one method
  displayNoteStep() {
    $("#" + this.parentStepSeq.id + " .note-seq").append(
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
        this.velocity,
        this.parentStepSeq
      );
      newStep.state = this.state;
      newStep.insertNoteStep(this.id, i);
      // If this state is on, add step to trigger interval
      if (newStep.state == "on") {
        newStep.updateMsFromLoopStart();
        //newStep.addToTriggerInterval();
      }
    }
  }

  // Splice this into right place in stepSeq.noteSteps, and add into DOM
  insertNoteStep(originalStepId, i) {
    const stepSeq = this.parentStepSeq;
    // Original step index
    const stepIndex = stepSeq.noteSteps.findIndex(
      (step) => step.id == originalStepId
    );
    // i is added to stepIndex to account for the new step(s) that have been added
    stepSeq.noteSteps.splice(stepIndex + i, 0, this);
    // Add this into DOM
    // i needs to be subtracted by 1 to account for the original step, which is still in the DOM
    $(
      "#" + stepSeq.id + " .note-seq .step:eq(" + (stepIndex + i - 1) + ")"
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
    const stepSeq = this.parentStepSeq;

    // Get pixel value of subsequent step
    const nextStep = stepSeq.noteSteps[stepIndex + 1];
    const nextStepPixelValue = nextStep.pixelValue;
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
  deleteNoteStep() {
    const stepSeq = this.parentStepSeq;
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

  // Time in ms from loop start to this noteStep
  getMsFromLoopStart(stepSeq, noteStepIndex) {
    const precedingNoteSteps = stepSeq.noteSteps.filter(
      (noteStep, index) => index < noteStepIndex
    );
    let time = 0;
    precedingNoteSteps.forEach((noteStep) => {
      time += Tone.Time(noteStep.noteName).toMilliseconds();
    });
    return Math.round(parseFloat(time)); // Rounding to avoid floating point errors
  }

  // Update msFromLoopStart for single noteStep
  updateMsFromLoopStart() {
    // Find index of this noteStep in stepSeq.noteSteps
    const stepSeq = this.parentStepSeq;
    const noteStepIndex = stepSeq.noteSteps.findIndex(
      (noteStep) => noteStep.id == this.id
    );
    this.msFromLoopStart = this.getMsFromLoopStart(stepSeq, noteStepIndex);
  }

  playMidiNote(time, output) {
    if (!getLoopOn()) {
      return;
    }

    if (this.muted) {
      return;
    }

    if (time - performance.now() < -5 || time - performance.now() > 5) {
      console.log("Diff target-now " + (time - performance.now()));
    }

    const pitch = this.pitch;
    // 99% of note duration to avoid overlap, parseInt to avoid floating point errors
    const duration = parseInt(Tone.Time(this.noteName).toMilliseconds() * 0.99);
    const velocity = this.velocity;

    const trigger = time + this.msFromIntStart + 20; // + buffer (ms)

    output.channels[1].playNote(pitch + 35, {
      duration: duration,
      rawAttack: velocity,
      time: trigger,
    });
    this.animateStep(trigger - parseInt(performance.now()));
    const delay = parseInt(trigger - parseInt(performance.now()));
    if (delay < 5 || delay > 20) {
      console.log("playMidiNote delay incl. buffer (20ms):" + delay + "ms");
    }
  }

  animateStep(target) {
    const stepDuration = Tone.Time(this.noteName).toMilliseconds();
    $("#" + this.id).animate({ opacity: 1 }, target, function () {
      $(this).animate({ opacity: 0 }, 5, function () {
        $(this).animate({ opacity: 0 }, stepDuration * 0.95 - 5, function () {
          $(this).animate({ opacity: 1 }, stepDuration * 0.05);
        });
      });
    });
  }
}
