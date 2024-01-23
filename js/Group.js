import StepNoSeq from "./StepNoSeq.js";
import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Group {
  constructor(sectionId) {
    this.id = "grp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.sequences = [new StepNoSeq()]; // As default, create a new StepNoSequence, NoteSequence and ControllerSequence ... new NoteSeq(), new ControllerSeq()
    // Find section object in project.instruments array by id
    const project = getProject();
    const section = project.instruments
      .map((instrument) => instrument.sections)
      .flat()
      .find((section) => section.id === sectionId);
    section.groups.push(this);

    this.displayGroup(sectionId);
    console.log(`Group created`, getProject());
  }

  displayGroup(sectionId) {
    $("#" + sectionId).append(
      `<section class='group' id='${this.id}'><div class='scroll-container'></div><div><button class='scroll-row left'><i class='fa-solid fa-chevron-left'></i></button><button class='scroll-row right'><i class='fa-solid fa-chevron-right'></i></button></div></section>`
    );
  }
}
