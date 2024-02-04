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
      </main>
      `
    );

    $(".top-row").append(
      `
        <div>
          <h1>${this.name}</h1>
          <div>
            <button class='add-section'><i class="fa-solid fa-plus"></i> Section</button>
          </div>
          <input type='text' id='section-name' name='section-name' placeholder='Section name' />
        </div>
      `
    );
  }

  getStepNoSeqs() {
    const stepNoSeqs = [];
    const sections = this.sections;
    // Find all instrument objects in section with selected property set to true
    const section = sections.find((section) => section.selected == true);
    const instruments = section.instruments;
    // In each instrument, find all stepNoSeqs
    instruments.forEach((instrument) => {
      const groups = instrument.groups;
      // In each group, find all sequences
      groups.forEach((group) => {
        const sequences = group.sequences;
        // Find all stepNoSeqs in group
        const seqs = sequences.filter(
          (sequence) => sequence.constructor.name === "StepNoSeq"
        );
        // Push stepNoSeqs to stepNoSeqs array
        seqs.forEach((seq) => {
          stepNoSeqs.push(seq);
        });
      });
    });
    return stepNoSeqs;
  }
}
