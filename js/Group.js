import Bundle from "./Bundle.js";
import StepNoSeq from "./StepNoSeq.js";
import StepSeq from "./StepSeq.js";
import StepNo from "./StepNo.js";
import NoteStep from "./NoteStep.js";
import ControllerStep from "./ControllerStep.js";
import TriggerInterval from "./TriggerInterval.js";
import {
  getProject,
  setIdCounter,
  getIdCounter,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class Group {
  constructor(instrumentId, measureLength) {
    this.id = "grp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    // Groups default to midi channel 1 on their respective instrument's output
    this.midiChannel = 1;
    this.sequences = [];
    this.ccVisibility = false;
    this.muted = false;
    this.triggerIntervals = [];
    const instruments = findAllNestedProps(getProject(), "instruments");
    const instrument = findNestedProp(instruments, instrumentId);
    // Add group to instrument
    instrument.groups.push(this);

    this.displayGroup(instrumentId);
    new StepNoSeq(this.id, measureLength);
    new StepSeq(this.id, measureLength);
    this.initTriggerIntervals();
    console.log(`Group created`);
  }

  displayGroup(instrumentId) {
    $("#" + instrumentId).append(
      `
      <section class='group' id='${this.id}'>
        <div class='scroll-container'></div>
        <div>
          <button class='scroll-group left'><i class='fa-solid fa-chevron-left'></i></button>
          <button class='scroll-group right'><i class='fa-solid fa-chevron-right'></i></button>
          <button class="add-step" style="margin-left:24px"><i class='fa-solid fa-plus'></i> Step</button>
          <button class="delete-step" style="margin-right:24px"><i class='fa-solid fa-minus'></i></button>
          <button class="add-bar"><i class='fa-solid fa-plus'></i> Bar</button>
          <button class="delete-bar" style="margin-right:24px"><i class='fa-solid fa-minus'></i></button>
          <button class="add-step-seq"><i class='fa-solid fa-plus'></i> Sequence</button>
          <button class="delete-step-seq" style="margin-right:24px"><i class='fa-solid fa-minus'></i></button>
          <button class="toggle-cc">CC</button>
        </div>
      </section>
      `
    );
  }

  // Extend group by x number of steps
  extendGroup(stepsToAdd, stepCount) {
    for (let i = 1; i <= stepsToAdd; i++) {
      // There is always just one StepNoSeq per group, add one StepNo to it
      const stepNoSeqId = this.sequences[0].id;
      const newStepNo = new StepNo("16n", 84, stepCount + i, stepNoSeqId);
      //this.sequences[0].steps.push(newStepNo);
      newStepNo.displayStepNo(stepNoSeqId);

      // Add a triggerInterval to this.triggerIntervals
      const min = (stepCount + i - 1) * Tone.Time("16n").toMilliseconds();
      const max = (stepCount + i) * Tone.Time("16n").toMilliseconds() - 1; // -1ms to avoid overlap with next min
      this.addTriggerInterval(stepCount + i, min, max);

      // How many sequences of the kind StepSeq are there in this group?
      const stepSeqs = this.sequences.filter(
        (sequence) => sequence.constructor.name === "StepSeq"
      ).length;
      for (let j = 0; j < stepSeqs; j++) {
        // For each step sequence, add a noteStep
        const stepSeqId = this.sequences[j + 1].id;
        const newNoteStep = new NoteStep("16n", 84, 1, 80, stepSeqId);
        // Find the stepSeq object in project by using stepSeqId
        const sequences = findAllNestedProps(getProject(), "sequences");
        const stepSeq = findNestedProp(sequences, stepSeqId);
        // Push newNoteStep into stepSeq.noteSteps
        newNoteStep.pushNoteStep(stepSeq);
        // Show newNoteStep in DOM
        newNoteStep.displayNoteStep(stepSeqId);
        // For each step sequence, add a controllerStep
        const newControllerStep = new ControllerStep("16n", 84, stepSeqId);
        // Push newControllerStep into stepSeq.controllerSteps
        newControllerStep.pushControllerStep(stepSeq);
        // Show newControllerStep in DOM
        newControllerStep.displayControllerStep(stepSeqId, this.id);
      }
    }
    console.log(`Group extended by ${stepsToAdd} steps`);
  }

  // Shorten group by x number of steps
  shortenGroup(stepsToDelete, stepCount) {
    // Check if stepsToDelete is greater than stepCount, if so, set stepsToDelete to stepCount,
    // this in order to avoid negative values
    stepsToDelete > stepCount ? (stepsToDelete = stepCount) : null;

    for (let i = 1; i <= stepsToDelete; i++) {
      // There is always just one StepNoSeq per group, remove one StepNo from it
      const stepNoSeqId = this.sequences[0].id;
      // Get last stepNo in stepNoSeq
      const stepNoToRemove = this.sequences[0].steps[stepCount - i];
      stepNoToRemove.deleteStepNo(stepNoSeqId);

      // Delete last triggerInterval from group.triggerIntervals array
      this.deleteLastTriggerInterval();

      // How many sequences of the kind StepSeq are there in this group?
      const stepSeqs = this.sequences.filter(
        (sequence) => sequence.constructor.name === "StepSeq"
      ).length;
      for (let j = 0; j < stepSeqs; j++) {
        // For each step sequence, remove a noteStep
        const stepSeqId = this.sequences[j + 1].id;
        // Find the stepSeq object in project by using stepSeqId
        const sequences = findAllNestedProps(getProject(), "sequences");
        const stepSeq = findNestedProp(sequences, stepSeqId);
        // Delete last noteStep from stepSeq.noteSteps
        const noteStepToRemove = stepSeq.noteSteps[stepCount - i];
        noteStepToRemove.deleteNoteStep(stepSeqId);
        // Delete last controllerStep from stepSeq.controllerSteps
        const controllerStepToRemove = stepSeq.controllerSteps[stepCount - i];
        controllerStepToRemove.deleteControllerStep(stepSeqId);
      }
    }
    console.log(`Group shortened by ${stepsToDelete} steps`);
  }

  deleteLastSeq(seqIndex) {
    this.sequences.pop();
    $("#" + this.id + " > div > div:eq(" + seqIndex + ")").remove();
  }

  toggleCcVisibility() {
    this.ccVisibility = !this.ccVisibility;
    // Find all controller seqs in this group
    const controllerSeqs = $("#" + this.id + " .controller-seq");
    // If ccVisibility is true, show all controller seqs
    // If ccVisibility is false, hide all controller seqs that are not on
    if (this.ccVisibility) {
      $(controllerSeqs).show();
    } else {
      $(controllerSeqs).each(function () {
        if ($(this).find(".on").length < 1) {
          $(this).hide();
        }
      });
    }
  }

  initTriggerIntervals() {
    const stepCount = this.sequences[0].steps.length;
    // For each sixteenth step in the group, create a triggerStep
    for (let i = 1; i <= stepCount; i++) {
      const min = (i - 1) * Tone.Time("16n").toMilliseconds();
      const max = i * Tone.Time("16n").toMilliseconds() - 1; // -1ms to avoid overlap with next min
      const triggerInterval = new TriggerInterval(i, min, max);
      // Push to triggerIntervals
      this.triggerIntervals.push(triggerInterval);
    }
  }

  addTriggerInterval(stepNo, min, max) {
    const triggerInterval = new TriggerInterval(stepNo, min, max);
    this.triggerIntervals.push(triggerInterval);
  }

  deleteLastTriggerInterval() {
    this.triggerIntervals.pop();
  }

  playTriggerIntervals(counter) {
    const stepCount = this.triggerIntervals.length;
    const triggerInterval = this.triggerIntervals[counter % stepCount];
    // If triggerInterval.steps.length is 0, return
    if (triggerInterval.steps.length === 0) {
      return;
    }
    // Play each noteStep in triggerInterval
    triggerInterval.steps.forEach((step) => {
      step.playMidiNote(counter, stepCount);
    });
  }

  // sortBundles() {
  //   const stepCount = this.sequences[0].steps.length;
  //   const groupBundles = [];
  //   // For all each sixteenth step in the group, create a bundle
  //   for (let i = 1; i <= stepCount; i++) {
  //     const min = (i - 1) * Tone.Time("16n").toMilliseconds();
  //     const max = i * Tone.Time("16n").toMilliseconds() - 1; // -1ms to avoid overlap with next min
  //     const bundle = new Bundle(i, min, max);
  //     // Push to groupBundles
  //     groupBundles.push(bundle);
  //   }

  //   // Find all stepSeqs in this group
  //   const stepSeqs = this.sequences.filter(
  //     (sequence) => sequence.constructor.name === "StepSeq"
  //   );
  //   console.log(stepSeqs);
  //   // All noteStep objects with state "on" in the group
  //   const groupNoteSteps = [];
  //   // For each stepSeq...
  //   stepSeqs.forEach((stepSeq) => {
  //     // ...find all noteSteps
  //     const noteSteps = stepSeq.noteSteps;
  //     // If they're "on", update their msFromLoopStart value ...and push them to groupNoteSteps
  //     noteSteps.forEach((noteStep) => {
  //       if (noteStep.state == "on") {
  //         noteStep.updateMsFromLoopStart();
  //         groupNoteSteps.push(noteStep);
  //       }
  //     });
  //   });

  //   // Loop through each bundle and check if any noteStep is within its time range
  //   groupBundles.forEach((bundle) => {
  //     groupNoteSteps.forEach((noteStep) => {
  //       if (
  //         noteStep.msFromLoopStart >= bundle.min &&
  //         noteStep.msFromLoopStart <= bundle.max
  //       ) {
  //         bundle.steps.push(noteStep);
  //       }
  //     });
  //   });
  //   return groupBundles;
  // }
}
