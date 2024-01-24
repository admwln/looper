import { setProject, getProject } from "./setter-functions.js";

export default class Project {
  constructor(name) {
    this.name = name;
    this.instruments = [];
    this.eventSeq = []; // new EventSeq() for chords, switching sections, etc.
    this.displayProject();
    setProject(this);
    console.log(`Project "${this.name}" created`, getProject());
  }

  displayProject() {
    $("body").append(
      `<main class='project'><h1>${this.name}</h1><div><button id='add-instrument'><i class="fa-solid fa-plus"></i> Instrument</button></div><input type='text' id='instrument-name' name='instrument-name' placeholder='Instrument name' /></main>`
    );
  }
}
