import {
  setIdCounter,
  getIdCounter,
  getLoopOn,
  getProject,
  setMasterTurnaround,
} from "./helper-functions.js";

export default class DynamicInterval {
  constructor(stepNo, min, max) {
    this.id = "din" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.stepNo = stepNo;
    this.min = min;
    this.max = max;
    this.steps = [];
    this.groupId = "";
  }

  play(time) {
    if (!getLoopOn()) {
      return;
    }
    if (this.steps.length === 0) {
      return;
    }

    //console.log("Playing", this.steps);
    console.log("Playing dynamic interval", this);
    // Play each noteStep in dynamicInterval
    this.steps.forEach((step) => {
      step.playMidiNote(time);
    });
  }

  emptySteps() {
    this.steps = [];
  }

  update(stepCount, group) {
    const newStepNo = this.stepNo + 1;
    // This is where the end of the current loop is detected

    if (newStepNo > stepCount) {
      this.min = 0;
      this.max = parseInt(Tone.Time("16n").toMilliseconds()) - 1;
      this.stepNo = 1;
      this.emptySteps();
      this.harvestSteps(group);
      // If the group is a masterGroup and the section is not queued, switch to queued section
      if (!group.getSection().queued && group.masterGroup) {
        // The current masterGroup dynamicInterval is by definition reset to stepNo 1
        // How do we make sure that all other currently playing dynamicIntervals are reset to stepNo 1?
        // We could have a method in Group that resets all dynamicIntervals to stepNo 1
        // (except the masterGroup's dynamicInterval, which is already reset to stepNo 1)

        // Find the section object that has property queued set to true
        const project = getProject();
        const sections = project.sections;
        const nextSection = sections.find((section) => section.queued === true);
        // If next section is found, select it
        if (nextSection) {
          setMasterTurnaround(true);
          console.log("Master turnaround set to true");
        }
      }
      return;
    }

    const newMin = this.max + 1;
    const newMax = newMin + parseInt(Tone.Time("16n").toMilliseconds() - 1);

    this.min = newMin;
    this.max = newMax;
    this.stepNo = newStepNo;
    this.emptySteps();
    this.harvestSteps(group);

    // Could we trigger/queue updated dynamicInterval as soon as it has been updated?
    // this.play() but pass along value for toneCounter as it stood when dynamicInterval for previous stepNo
    // played
  }

  harvestSteps(group) {
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
  }
}
