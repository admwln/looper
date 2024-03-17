import Step from "./Step.js";
import { getCurrentChord, getLoopOn, getNoteName } from "./helper-functions.js";

export default class NoteStep extends Step {
  constructor(noteName, pixelValue, pitch, velocity, parentStepSeq) {
    super(noteName, pixelValue);
    this.pitch = pitch;
    this.state = "off";
    this.velocity = velocity;
    this.velocityRange = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    this.forks = [];
    this.msFromLoopStart = 0;
    this.offset = 0;
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

  joinNoteStep(stepIndex) {
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
      "#" + stepSeq.id + " .note-seq .step:eq(" + (stepIndex + 1) + ")"
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
    this.displayVelocity();
    const html = `
      <div class="note-step-btns">
      <div>
        <button class="note-step-btn velocity-up"><i class="fa-solid fa-plus"></i></button>
        <button class="note-step-btn velocity-down"><i class="fa-solid fa-minus"></i></button>
      </div>
        <button class="note-step-btn offset-up"><i class="fa-solid fa-chevron-right"></i></button>
        <button class="note-step-btn pitch-no">${this.pitch}</button>
      </div>
      <div class="offset-indicator" style="width: ${this.offset}%"></div>
      `;
    $("#" + this.id).append(html);
  }

  removeActiveNoteStep() {
    $("#" + this.id + " > div").remove();
    $("#" + this.id).css("background", "transparent");
  }

  // pitchUp() {
  //   this.pitch++;
  //   $("#" + this.id + " .pitch-no").text(this.pitch);
  // }

  pitchUp() {
    const currentChordLength = getCurrentChord().notes.length;
    if (this.pitch < currentChordLength) {
      this.pitch++;
    } else {
      this.pitch = 1;
    }
    $("#" + this.id + " .pitch-no").text(this.pitch);
  }

  // pitchDown() {
  //   if (this.pitch > 1) {
  //     this.pitch--;
  //     $("#" + this.id + " .pitch-no").text(this.pitch);
  //   }
  // }

  velocityUp() {
    const currentIndex = this.velocityRange.indexOf(this.velocity);
    const nextIndex = (currentIndex + 1) % this.velocityRange.length;
    this.velocity = this.velocityRange[nextIndex];
    this.displayVelocity();
  }

  velocityDown() {
    const currentIndex = this.velocityRange.indexOf(this.velocity);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.velocityRange.length - 1;
    }
    this.velocity = this.velocityRange[prevIndex];
    this.displayVelocity();
  }

  offsetUp() {
    const offsetRange = [0, 4, 8, 12, 16, 24, 32, 40, 48, 50];
    const currentIndex = offsetRange.indexOf(this.offset);
    const nextIndex = (currentIndex + 1) % offsetRange.length;
    this.offset = offsetRange[nextIndex];
    $(".offset-span").text(`+${this.offset}`);
    this.displayOffset();
  }

  displayOffset() {
    $("#" + this.id + " .offset-indicator").css("width", this.offset + "%");
  }

  displayVelocity() {
    let percent = Math.round(this.velocity * 100);
    $("#" + this.id).css(
      "background",
      "linear-gradient(to top, rgba(14, 27, 37, 1) 0%, rgba(14, 27, 37, 1) " +
        percent +
        "%,transparent " +
        percent +
        "%)"
    );
  }

  // Time in ms from loop start to this noteStep
  getMsFromLoopStart(stepSeq, noteStepIndex) {
    const precedingNoteSteps = stepSeq.noteSteps.filter(
      (noteStep, index) => index < noteStepIndex
    );
    // Should offset always be relative to 16n?
    const offset =
      this.offset * 0.01 * Tone.Time(this.noteName).toMilliseconds();
    let time = 0;
    precedingNoteSteps.forEach((noteStep) => {
      time += Tone.Time(noteStep.noteName).toMilliseconds();
    });
    return Math.round(parseFloat(time + offset)); // Rounding to avoid floating point errors
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

  playMidiNote(time, output, muted) {
    if (!getLoopOn()) {
      return;
    }

    if (this.muted) muted = true;

    if (time - performance.now() < -5 || time - performance.now() > 5) {
      console.log("Diff target-now " + (time - performance.now()));
    }

    const noteIndex = this.pitch - 1;

    // Get midi note from current chord or instrument's locked chord
    let midiNote;
    if (this.parentStepSeq.parentGroup.parentInstrument.lockedChord == null) {
      midiNote = getCurrentChord().notes[noteIndex];
    } else {
      midiNote =
        this.parentStepSeq.parentGroup.parentInstrument.lockedChord.notes[
          noteIndex
        ];
    }
    // 99% of note duration to avoid overlap, parseInt to avoid floating point errors
    const duration = parseInt(Tone.Time(this.noteName).toMilliseconds() * 0.99);
    const velocity = this.velocity;
    const trigger = time + this.msFromIntStart + 20; // + buffer (ms)

    // Only actually play note if not muted
    if (!muted) {
      output.channels[1].playNote(midiNote, {
        duration: duration,
        attack: velocity,
        time: trigger,
      });
    }
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

  // Edit noteStep
  edit() {
    $(".edit-note-step").remove();
    // Remove editing class from all steps
    $(".step").removeClass("editing");

    if (this.state == "off") return;

    // Change step border color
    $("#" + this.id).addClass("editing");

    // Edit form in DOM
    const html = `
      <div class='edit-note-step'>
        <div>
          <i class="fa-solid fa-music"></i>
          <input class='pitch' type='number' value='${
            this.pitch
          }' min='1' style='width: 40px;'>
        </div>
        <div>
          <i class="fa-solid fa-chart-simple"></i>
          <input class='velocity' type='range' min='0' max='100' value='${
            this.velocity * 100
          }' style='width: 60px;'>
          <span class='velocity-span'>${this.velocity * 100}%</span>
        </div>
        <div>
          <i class="fa-regular fa-clock"></i>
          <input class='offset' type='range' min='0' max='50' value='${
            this.offset
          }' style='width: 60px;'>
          <span class='offset-span'>+${this.offset}</span>
        </div>
      </div>
    `;
    $(".top-row").append(html);

    // Event listeners
    $(".pitch").on("input", (e) => {
      this.pitch = parseInt(e.target.value);
      $("#" + this.id + " .pitch-no").text(this.pitch);
    });

    $(".velocity").on("input", (e) => {
      this.velocity = e.target.value * 0.01;
      this.displayVelocity();
      $(".velocity-span").text(`${e.target.value}%`);
    });

    $(".offset").on("input", (e) => {
      this.offset = parseInt(e.target.value);
      $(".offset-span").text(`+${this.offset}`);
      this.displayOffset();
    });

    // Remove edit form when clicking outside of it
    $(document).on("click", (e) => {
      if (
        $(e.target).hasClass("edit-note-step") ||
        $(e.target).parent().parent().hasClass("edit-note-step") ||
        $(e.target).hasClass("note-step-btn") ||
        $(e.target).parent().hasClass("note-step-btn") ||
        $(e.target).hasClass("step") ||
        $(e.target).parent().hasClass("step")
      ) {
        return;
      }
      $(".edit-note-step").remove();
      $(".step").removeClass("editing");
    });
  }
}
