import {
  setIdCounter,
  getIdCounter,
  getLoopOn,
  getProject,
  getStepWidth,
  setMasterTurnaround,
} from "./helper-functions.js";

export default class PlayHead {
  constructor(stepNo, min, max, parentGroup) {
    this.id = "din" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.stepNo = stepNo;
    this.min = min;
    this.max = max;
    this.steps = [];
    this.groupId = "";
    this.parentGroup = parentGroup;
  }

  play(time) {
    if (!getLoopOn()) return;
    if (this.steps.length === 0) return;
    let muted = false;
    if (this.parentGroup.muted) muted = true;
    if (this.parentGroup.parentInstrument.muted) muted = true;

    const instrument = this.parentGroup.parentInstrument;
    const midiOut = instrument.midiOut;
    const output = WebMidi.getOutputByName(midiOut);
    //console.log("Playing", this.steps);
    //console.log("Playing play head", this);
    // Play each noteStep in playHead
    this.steps.forEach((step) => {
      // Check if step is a noteStep or a controllerStep
      if (step.constructor.name === "NoteStep") {
        step.playMidiNote(time, output, muted);
      }

      if (step.constructor.name === "ControllerStep") {
        console.log("Playing controller step", step);
        //step.playMidiCc(time, output, muted);
      }
    });
  }

  emptySteps() {
    this.steps = [];
  }

  reset(group) {
    console.log("Resetting play head", this);
    this.min = 0;
    this.max = parseInt(Tone.Time("16n").toMilliseconds()) - 1;
    this.stepNo = 1;
    this.emptySteps();
    this.harvestSteps(group);
    // Reset dotIndicator to first dot
    group.dotIndicator.setCurrentDot(0);
    // Reset scroll position all the way to the left of group
    group.scrollLeft(group.groupLength * getStepWidth(), false);
  }

  update(stepCount, group) {
    const newStepNo = this.stepNo + 1;

    // If group.autoScroll is true, check if newStepNo is a scrollpoint
    if (group.autoScroll) {
      // If newStepNo is divisible by group.measureLength, that step represents a scrollpoint
      if (newStepNo % group.measureLength === 0) {
        // Scrollpoint detected!

        // Determine if the group should be scrolled right or left?
        if (newStepNo >= stepCount) {
          // Scroll all the way to the left
          //console.log("Scrolling all the way to the left");
          group.scrollLeft(stepCount * getStepWidth());
        }
        if (newStepNo < stepCount) {
          // Scroll one measureWidth to the right
          console.log("Scrolling one measureWidth to the right");
          // true = increment currentDot
          group.scrollRight(group.measureLength * getStepWidth(), true);
        }
      }
    }

    // This is where the end of the current loop is detected
    // If the new stepNo is greater than the stepCount, reset the playHead
    // or if a new section is queued, reset all current playHeads and select the new section
    if (newStepNo > stepCount) {
      // END OF LOOP!

      // If the group is a masterGroup and the section is not queued, switch to queued section
      if (!group.getSection().queued && group.masterGroup) {
        const project = getProject();
        const sections = project.sections;
        const selectedGroups = project.getSelectedGroups();

        selectedGroups.forEach((group) => {
          // Reset playHead of each group in the current section
          group.playHead.reset(group);
        });

        // Find the section object that has property queued set to true
        const nextSection = sections.find((section) => section.queued === true);
        // If next section is found, select it
        if (nextSection) {
          setMasterTurnaround(true);
          console.log("Master turnaround set to true");
        }
        return;
      }

      this.reset(group);
      return;
    }

    const newMin = this.max + 1;
    const newMax = newMin + parseInt(Tone.Time("16n").toMilliseconds() - 1);

    this.min = newMin;
    this.max = newMax;
    this.stepNo = newStepNo;
    this.emptySteps();
    this.harvestSteps(group);

    // Could we trigger/queue updated playHead as soon as it has been updated?
    // this.play() but pass along value for toneCounter as it stood when playHead for previous stepNo
    // played
  }

  harvestSteps(group) {
    const sequences = group.sequences;
    // All except first sequence in sequences array
    const stepSeqs = sequences.filter(
      (sequence) => sequence.constructor.name === "StepSeq"
    );

    // All noteStep and controllerStep objects with state "on" in the group
    const groupStepsOn = [];

    // For each stepSeq...
    stepSeqs.forEach((stepSeq) => {
      const groupStepsAll = [];
      // ...find all noteSteps and controllerSteps in current group and push to groupStepsAll
      stepSeq.noteSteps.forEach((noteStep) => {
        groupStepsAll.push(noteStep);
      });

      stepSeq.controllerSteps.forEach((controllerStep) => {
        groupStepsAll.push(controllerStep);
      });
      // If a step is "on", update its msFromLoopStart value ...and push it to groupStepsOn
      groupStepsAll.forEach((step) => {
        if (step.state == "on") {
          step.updateMsFromLoopStart();
          groupStepsOn.push(step);
        }
      });
    });

    // Check if any step is within its time range
    groupStepsOn.forEach((step) => {
      if (
        step.msFromLoopStart >= this.min &&
        step.msFromLoopStart <= this.max
      ) {
        step.setMsFromIntStart(this.stepNo);
        this.steps.push(step);
      }
    });
  }
}
