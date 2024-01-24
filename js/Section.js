import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Section {
  // constructor(name, instrumentIndex) {
  constructor(name, instrumentId) {
    this.id = "sec" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.groups = [];
    //project.instruments[instrumentIndex].sections.push(this);
    // Find instrument object in project.instruments array by id
    const project = getProject();
    const instrument = project.instruments.find(
      (instrument) => instrument.id === instrumentId
    );
    instrument.sections.push(this);
    // this.displayInstrument(instrumentIndex);
    this.displaySection(instrumentId);
    console.log(`Section "${this.name}" created`, getProject());
  }

  displaySection(instrumentId) {
    $("#" + instrumentId).append(
      `<section class="section" id='${this.id}'><h3>${this.name}</h3><div><button class='add-group'><i class="fa-solid fa-plus"></i> Group</button></div></section>`
    );
  }
}
