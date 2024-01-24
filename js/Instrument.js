import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Instrument {
  constructor(name) {
    this.id = "ins" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.midiOut = "midi output goes here";
    this.sections = [];
    const project = getProject();
    project.instruments.push(this);
    this.displayInstrument();
    console.log(`Instrument "${this.name}" created`, getProject());
  }

  displayInstrument() {
    $(".project").append(
      `<section class="instrument" id='${this.id}'><h2>${this.name}</h2><div><button class='add-section'><i class="fa-solid fa-plus"></i> Section</button></div><input type='text' class='section-name' name='section-name' placeholder='Section name' /></section>`
    );
  }
}
