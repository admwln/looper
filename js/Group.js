import StepNoSeq from "./StepNoSeq.js";
import StepSeq from "./StepSeq.js";
import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Group {
  constructor(sectionId, instrumentId, measureLength) {
    this.id = "grp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    // Groups default to midi channel 1 on their respective instrument's output
    this.midiChannel = 1;
    const project = getProject();
    // Find instrument object by id
    const section = project.sections.find(
      (section) => section.id === sectionId
    );
    const instrument = section.instruments.find(
      (instrument) => instrument.id === instrumentId
    );
    instrument.groups.push(this);
    this.displayGroup(instrumentId);
    this.sequences = [
      new StepNoSeq(this.id, measureLength),
      new StepSeq(this.id, measureLength),
    ];
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
}
