import { getProject, setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Instrument {
  constructor(name, sectionId) {
    this.id = "ins" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.midiOut = "midi output goes here";
    this.midiChannel = 1;
    this.groups = [];
    this.muted = false;
    this.sectionId = sectionId;
    const project = getProject();
    // Find section object in project.sections array by id
    const section = project.sections.find(
      (section) => section.id === sectionId
    );
    // Add instrument to section.instruments array
    section.instruments.push(this);
    this.displayInstrument(sectionId);
    console.log(`Instrument "${this.name}" created`);
  }

  displayInstrument(sectionId) {
    $("#" + sectionId).append(
      `
      <section class="instrument" id='${this.id}'>
        <div class='heading-container'>
          <h3 class="instrument-heading">${this.name}</h3>
          <button class='edit-heading'><i class="fa-solid fa-pencil"></i></button>
        </div>
        <div><button class='add-group'><i class="fa-solid fa-plus"></i> Group</button></div>
      </section>`
    );
  }
}
