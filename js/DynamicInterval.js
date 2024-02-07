import TriggerInterval from "./TriggerInterval.js";

import {
  setIdCounter,
  getIdCounter,
  getLoopOn,
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class DynamicInterval extends TriggerInterval {
  constructor(stepNo, min, max) {
    super(stepNo, min, max);
    this.id = "din" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.groupId = "";
  }

  play() {
    if (!getLoopOn()) {
      return;
    }
    if (this.steps.length === 0) {
      return;
    }
    console.log("Playing", this.steps);
    // Play each noteStep in dynamicInterval
    this.steps.forEach((step) => {
      // if (step.msFromLoopStart == 0) {
      //   step.playMidiNoteNow(); // without delay
      // } else {
      step.playMidiNote(); // with delay
      //}
    });
  }

  emptySteps() {
    this.steps = [];
  }

  update(stepCount, group) {
    const newStepNo = this.stepNo + 1;
    if (newStepNo > stepCount) {
      this.min = 0;
      this.max = Tone.Time("16n").toMilliseconds() - 1;
      this.stepNo = 1;
      this.harvestSteps(group);
      return;
    }

    const newMin = this.max + 1;
    const newMax = newMin + Tone.Time("16n").toMilliseconds() - 1;

    this.min = newMin;
    this.max = newMax;
    this.stepNo = newStepNo;
    this.emptySteps();
    this.harvestSteps(group);
  }

  harvestSteps(group) {
    //console.log("Harvesting steps for dynamic interval);
    // const harvestStart = performance.now();

    const sequences = group.sequences;

    // All except first sequence in sequences array
    const stepSeqs = sequences.filter(
      (sequence) => sequence.constructor.name === "StepSeq"
    );

    // All noteStep objects with state "on" in the group
    const groupNoteSteps = [];
    // For each stepSeq...
    stepSeqs.forEach((stepSeq) => {
      // ...find all noteSteps
      const noteSteps = stepSeq.noteSteps;
      // If they're "on", update their msFromLoopStart value ...and push them to groupNoteSteps
      noteSteps.forEach((noteStep) => {
        if (noteStep.state == "on") {
          noteStep.updateMsFromLoopStart();
          groupNoteSteps.push(noteStep);
        }
      });
    });

    // Check if any noteStep is within its time range
    groupNoteSteps.forEach((noteStep) => {
      if (
        noteStep.msFromLoopStart >= this.min &&
        noteStep.msFromLoopStart <= this.max
      ) {
        noteStep.setMsFromIntStart(this.stepNo);
        this.steps.push(noteStep);
      }
    });
    //const harvestEnd = performance.now();
    //console.log("Harvesting took", harvestEnd - harvestStart, "ms");
  }
}
