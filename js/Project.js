import Section from "./Section.js";
import {
  getSectionName,
  setSectionName,
  setProject,
  getProject,
  nextChar,
} from "./helper-functions.js";

export default class Project {
  constructor() {
    this.name = "New project";
    this.sections = [];
    this.eventSeq = []; // new EventSeq() for chords, switching sections, etc.
    this.bpm = 120;
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
          <div class='heading-container'>
            <h1 class='project-heading'>${this.name}</h1>
            <button class='edit-heading'><i class="fa-solid fa-pencil"></i></button>
          </div>
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

  // Get all groups in any section
  getAllGroups() {
    const sections = getProject().sections;
    const groups = [];

    sections.forEach((section) => {
      section.instruments.forEach((instrument) => {
        instrument.groups.forEach((group) => {
          groups.push(group);
        });
      });
    });

    return groups;
  }

  // Get all groups in the currently selected section
  getSelectedGroups() {
    const sections = getProject().sections;
    const section = sections.find((section) => section.selected == true);
    // In section, find all instruments
    const instruments = section.instruments;

    const groups = [];

    // In instrument, find all groups
    instruments.forEach((instrument) => {
      instrument.groups.forEach((group) => {
        groups.push(group);
      });
    });

    return groups;
  }

  newSection() {
    const name =
      $("#section-name").val() == ""
        ? getSectionName()
        : $("#section-name").val();
    new Section(name);
    $("#section-name").val("");
    // Increment automatic section name by one character
    setSectionName(nextChar(getSectionName()));
  }
}
