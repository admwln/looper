import { setProject, getProject } from "./setter-functions.js";

export default class Project {
  constructor(name) {
    this.name = name;
    this.sections = [];
    this.eventSeq = []; // new EventSeq() for chords, switching sections, etc.
    this.displayProject();
    setProject(this);
    console.log(`Project "${this.name}" created`);
  }

  displayProject() {
    $("body").append(
      `
      <main class='project'>
        <h1>${this.name}</h1>
        <div>
          <button class='add-section'><i class="fa-solid fa-plus"></i> Section</button>
        </div>
        <input type='text' id='section-name' name='section-name' placeholder='Section name' />
      </main>
      `
    );
  }
}
