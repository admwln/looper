import Step from "./Step.js";
import StepSeq from "./StepSeq.js";
import {
  getLoopOn,
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
    this.msFromLoopStart = 0;
    this.muted = false;
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
      // If this state is on, add step to trigger interval
      if (newStep.state == "on") {
        newStep.updateMsFromLoopStart();
        newStep.addToTriggerInterval();
      }
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
    const nextStep = stepSeq.noteSteps[stepIndex + 1];
    const nextStepPixelValue = nextStep.pixelValue;
    // Calculate pixel value for extended step
    this.pixelValue = this.pixelValue + nextStepPixelValue;
    // Get note name for extended step
    this.noteName = getNoteName(this.pixelValue);
    // Update step in DOM
    this.updateStep();
    // If subsequent step state is on, remove from trigger interval
    //if (nextStep.state == "on") {
    nextStep.removeFromTriggerInterval();
    //}
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

  // PLAYBACK METHODS - second try
  playNoteStep(
    target,
    loopStart,
    round,
    noteStepIndex,
    stepSeq,
    sequenceLength
  ) {
    // If loop is off, return
    if (!getLoopOn()) {
      return;
    }

    const stepCount = stepSeq.noteSteps.length;

    // If noteStep is on, play it
    if (this.state == "on") {
      //console.log("Playing noteStep at: " + performance.now());
      console.log("Duration: " + Tone.Time(this.noteName).toSeconds() * 990);
      WebMidi.outputs[0].channels[1].playNote(this.pitch + 35, {
        duration: Tone.Time(this.noteName).toSeconds() * 990,
        rawAttack: this.velocity,
        time: target,
      });
    }

    // Increment noteStepIndex
    noteStepIndex++;
    // If next noteStep is off, noteStepIndex is incremented again, this should always skip a
    // off noteStep, directly succeeding an on noteStep
    // if (stepSeq.noteSteps[noteStepIndex].state == "off") {
    //   noteStepIndex++;
    //   console.log("skipping off noteStep");
    // }

    // If noteStepIndex is less than stepCount, queue next noteStep
    if (noteStepIndex < stepCount) {
      const nextNoteStep = stepSeq.noteSteps[noteStepIndex];
      // Calculate time at which nextNoteStep should be played
      let nextTarget;

      // Calculate nextTarget
      nextTarget =
        loopStart +
        sequenceLength * round +
        nextNoteStep.getNoteStepTime(stepSeq, noteStepIndex);

      // Queue next noteStep
      console.log("Will play next step at " + nextTarget);
      setTimeout(() => {
        nextNoteStep.playNoteStep(
          nextTarget,
          loopStart,
          round,
          noteStepIndex,
          stepSeq,
          sequenceLength
        );
      }, nextTarget - performance.now() - 10); // -10 is just a small buffer to avoid calling next note too late
      return;
    }

    // If noteStepIndex is equal to or more than stepCount, restart loop
    if (noteStepIndex >= stepCount) {
      noteStepIndex = 0;
      const nextNoteStep = stepSeq.noteSteps[noteStepIndex];
      round++;

      // Calculate nextTarget
      let nextTarget;
      nextTarget =
        loopStart +
        sequenceLength * round +
        nextNoteStep.getNoteStepTime(stepSeq, noteStepIndex);

      // Queue next noteStep
      console.log("Will restart loop at " + nextTarget);
      setTimeout(() => {
        nextNoteStep.playNoteStep(
          nextTarget,
          loopStart,
          round,
          noteStepIndex,
          stepSeq,
          sequenceLength
        );
      }, nextTarget - performance.now() - 10); // -10 is just a small buffer to avoid calling next note too late
    }
  }

  // Time in ms from loop start to this noteStep
  getNoteStepTime(stepSeq, noteStepIndex) {
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
    const stepSeqId = $("#" + this.id)
      .parent()
      .parent()
      .attr("id");
    const sequences = findAllNestedProps(getProject(), "sequences");
    const stepSeq = findNestedProp(sequences, stepSeqId);
    const noteStepIndex = stepSeq.noteSteps.findIndex(
      (noteStep) => noteStep.id == this.id
    );

    this.msFromLoopStart = this.getNoteStepTime(stepSeq, noteStepIndex);
  }

  //playMidiNote(counter, stepCount, stepNo) {
  // const target =
  //   this.msFromLoopStart -
  //   (counter % stepCount) * Tone.Time("16n").toMilliseconds();
  // console.log("Playing note at +" + target + "ms");

  playMidiNote(time) {
    if (!getLoopOn()) {
      return;
    }

    if (this.muted) {
      return;
    }

    const pitch = this.pitch;
    const duration = Tone.Time(this.noteName).toMilliseconds() * 0.99;
    const velocity = this.velocity;
    const target = this.msFromIntStart;
    const trigger = time + target + this.msFromIntStart + 125; // buffer 125ms

    WebMidi.outputs[0].channels[1].playNote(pitch + 35, {
      duration: duration,
      rawAttack: velocity,
      time: trigger,
      //time: "+" + target,
    });
    this.animateStep(trigger - performance.now());
    const delay = trigger - performance.now();
    console.log("playMidiNote trigger: " + trigger + " delay:" + delay);
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
