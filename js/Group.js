import StepNoSeq from "./StepNoSeq.js";
import StepSeq from "./StepSeq.js";
import StepNo from "./StepNo.js";
import NoteStep from "./NoteStep.js";
import ControllerStep from "./ControllerStep.js";
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
    const instruments = findAllNestedProps(getProject(), "instruments");
    const instrument = findNestedProp(instruments, instrumentId);
    // Add group to instrument
    instrument.groups.push(this);

    this.displayGroup(instrumentId);
    new StepNoSeq(this.id, measureLength);
    new StepSeq(this.id, measureLength);
    console.log(`Group created`, getProject());
  }

  displayGroup(instrumentId) {
    $("#" + instrumentId).append(
      `
      <section class='group' id='${this.id}'>
        <div class='scroll-container'></div>
        <div>
          <button class='scroll-row left'><i class='fa-solid fa-chevron-left'></i></button>
          <button class='scroll-row right'><i class='fa-solid fa-chevron-right'></i></button>
          <button class="add-step"><i class='fa-solid fa-plus'></i> Step</button>
          <button class="add-step-seq"><i class='fa-solid fa-plus'></i> Sequence</button>
          <button class="toggle-cc">CC</button>
        </div>
      </section>
      `
    );
  }

  // Extend group by x number of steps
  extendGroup(steps, stepCount) {
    for (let i = 1; i <= steps; i++) {
      // There is always just one StepNoSeq per group, add one StepNo to it
      const stepNoSeqId = this.sequences[0].id;
      const newStepNo = new StepNo("16n", 84, stepCount + i, stepNoSeqId);
      //this.sequences[0].steps.push(newStepNo);
      newStepNo.displayStepNo(stepNoSeqId);

      // How many sequences of the kind StepSeq are there in this group?
      const stepSeqs = this.sequences.filter(
        (sequence) => sequence.constructor.name === "StepSeq"
      ).length;
      for (let j = 0; j < stepSeqs; j++) {
        // For each step sequence, add a noteStep
        const stepSeqId = this.sequences[j + 1].id;
        const newNoteStep = new NoteStep("16n", 84, 60, 100, stepSeqId);
        //this.sequences[j + 1].noteSteps.push(newNoteStep);
        newNoteStep.displayNoteStep(stepSeqId);
        // For each step sequence, add a controllerStep
        const newControllerStep = new ControllerStep("16n", 84, stepSeqId);
        //this.sequences[j + 1].controllerSteps.push(newControllerStep);
        newControllerStep.displayControllerStep(stepSeqId);
      }
    }
    console.log(`Group extended`, getProject());
  }
}
