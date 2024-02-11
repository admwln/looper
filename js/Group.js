import DynamicInterval from "./DynamicInterval.js";
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
} from "./helper-functions.js";

export default class Group {
  constructor(instrumentId, measureLength) {
    this.id = "grp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    // Groups default to midi channel 1 on their respective instrument's output
    this.midiChannel = 1;
    this.sequences = [];
    this.ccVisibility = false;
    this.muted = false;
    this.dynamicInterval = {};
    this.masterGroup = false;
    const instruments = findAllNestedProps(getProject(), "instruments");
    const instrument = findNestedProp(instruments, instrumentId);
    this.instrumentId = instrumentId;
    this.sectionId = instrument.sectionId;
    // Add group to instrument
    instrument.groups.push(this);

    this.displayGroup(instrumentId);
    new StepNoSeq(this.id, measureLength);
    new StepSeq(this.id, measureLength);
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
          <button class="toggle-cc" style="margin-right:24px">CC</button>
          <label for="master-group-${this.id}">Master</label>
          <input type="radio" class="master-group-radio" name="master-group-section-${this.sectionId}" id="master-group-${this.id}" value="${this.id}" checked="checked" />
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

  initDynamicInterval(stepNo, min, max) {
    const dynamicInterval = new DynamicInterval(stepNo, min, max);
    this.dynamicInterval = dynamicInterval;
    this.dynamicInterval.groupId = this.id;
    this.dynamicInterval.harvestSteps(this);
  }

  // Get section that this group belongs to
  getSection() {
    const sectionId = this.sectionId;
    // Get section object in project by using sectionId
    const sections = findAllNestedProps(getProject(), "sections");
    const section = findNestedProp(sections, sectionId);
    return section;
  }

  makeMaster() {
    this.masterGroup = true;
    // Find all other groups in this section
    const section = this.getSection();
    const instruments = section.instruments;
    // Get all groups in this section
    const groups = [];
    instruments.forEach((instrument) => {
      groups.push(...instrument.groups);
    });
    // Set all other groups to masterGroup = false
    groups.forEach((group) => {
      if (group.id !== this.id) {
        group.masterGroup = false;
      }
    });
  }
}
