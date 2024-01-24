import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Instrument {
  constructor(name, sectionId) {
    this.id = "ins" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.midiOut = "midi output goes here";
    this.midiChannel = 1;
    this.groups = [];
    const project = getProject();
    // Find section object in project.sections array by id
    const section = project.sections.find(
      (section) => section.id === sectionId
    );
    // Add instrument to section.instruments array
    section.instruments.push(this);
    this.displayInstrument(sectionId);
    console.log(`Instrument "${this.name}" created`, getProject());
  }

  displayInstrument(sectionId) {
    $("#" + sectionId).append(
      `
      <section class="instrument" id='${this.id}'>
        <h3>${this.name}</h3>
        <div><button class='add-group'><i class="fa-solid fa-plus"></i> Group</button></div>
      </section>`
    );
  }
}
