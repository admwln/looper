import {
  getCurrentChord,
  getKeyboard,
  setIdCounter,
  getIdCounter,
  getProject,
} from "./helper-functions.js";

export default class Chord {
  constructor(name) {
    this.id = "crd" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.notes = [];
  }

  setName(newName) {
    this.name = newName;
  }

  addNote(midiNote) {
    this.notes.push(midiNote);
    this.sortNotes();
    this.updateKeyNos();
  }

  removeNote(midiNote) {
    const index = this.notes.indexOf(midiNote);
    this.notes.splice(index, 1);
    this.updateKeyNos();
  }

  sortNotes() {
    this.notes.sort((a, b) => a - b);
    // Remove duplicate notes
    this.notes = this.notes.filter(
      (note, index, self) => self.indexOf(note) === index
    );
  }

  updateKeyNos() {
    const keyboard = getKeyboard();
    const keys = keyboard.keys;
    // Find all keys with keys.on
    const currentKeys = keys.filter((key) => key.on);
    // For each key, find its index in currentKeys, and update the key-no span in the DOM
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const index = currentKeys.indexOf(key);

      if (index > -1) {
        $(`#${key.id} .key-no`).text(index + 1);
        continue;
      }
      $(`#${key.id} .key-no`).text("");
    }
  }

  save() {
    // Method is called on the current chord, this = current chord
    const chordName = prompt("Enter chord name");
    const chord = new Chord(chordName);
    const currentChordNotes = [...this.notes]; // Using spread operator for shallow copy
    currentChordNotes.forEach((note) => {
      chord.notes.push(note);
    });
    getProject().chords.push(chord);
    getKeyboard().updateChordList();
    chord.selectButton();
    // Update current chord id and name
    this.id = chord.id;
    this.name = chord.name;
  }

  select() {
    // Set current chord to selected chord
    const currentChord = getCurrentChord();
    currentChord.notes = [];
    // Copy of selected chord notes
    const selectedChordNotes = [...this.notes];
    selectedChordNotes.forEach((note) => {
      currentChord.notes.push(note);
    });
    // Update current chord id and name
    currentChord.name = this.name;
    currentChord.id = this.id;
    // Display selected/current chord on dom keyboard
    getKeyboard().displayCurrentChord();
  }

  selectButton() {
    $(`#${this.id}`).addClass("selected");
    $(`#${this.id}`).siblings().removeClass("selected");
  }

  delete() {
    // Method is called on the current chord, this = current chord
    getKeyboard().clear();
    const chordId = this.id;
    const chords = getProject().chords;
    // Find chord in project that corresponds to current chord, using chordId
    const index = chords.findIndex((chord) => chord.id === chordId);
    chords.splice(index, 1);
    getKeyboard().updateChordList();
    // Remove all notes from current chord, rename to "Current"
    this.notes = [];
    this.name = "Current";
    this.updateKeyNos(); // Clear key-nos
  }

  // Edit chord
  listen() {
    const currentChord = getCurrentChord();
    let buttonId = "";
    // Listen for edit chord buttons
    $(document).on("click", ".edit-chord", function () {
      buttonId = $(this).attr("id");
      if (buttonId === "octave-down") {
        currentChord.octaveDown();
        return;
      }
      if (buttonId === "octave-up") {
        currentChord.octaveUp();
        return;
      }
      if (buttonId === "invert-down") {
        currentChord.invertDown();
        return;
      }
      if (buttonId === "invert-up") {
        currentChord.invertUp();
        return;
      }
      if (buttonId === "drop-second") {
        currentChord.dropSecond();
        return;
      }
      if (buttonId === "open") {
        currentChord.open();
        return;
      }
      if (buttonId === "expand") {
        currentChord.expand();
        return;
      }
    });
  }

  octaveDown() {
    this.notes = this.notes.map((note) => note - 12);
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }
  octaveUp() {
    this.notes = this.notes.map((note) => note + 12);
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }
  invertDown() {
    const firstNote = this.notes[0];
    let lastNote = this.notes[this.notes.length - 1];
    this.notes.pop();
    while (lastNote >= firstNote) {
      lastNote -= 12;
    }
    this.notes.unshift(lastNote);
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }

  invertUp() {
    let firstNote = this.notes[0];
    const lastNote = this.notes[this.notes.length - 1];
    this.notes.shift();
    while (lastNote >= firstNote) {
      firstNote += 12;
    }
    this.notes.push(firstNote);
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }

  dropSecond() {
    const firstNote = this.notes[0];
    let secondNote = this.notes[1];
    // Remove second note from this.notes
    this.notes.splice(1, 1);
    while (secondNote >= firstNote) {
      secondNote -= 12;
    }
    // Push new second note to this.notes, then sort notes
    this.notes.unshift(secondNote);
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }

  open() {
    let openedChordNotes = [];
    let lastNote = this.notes[this.notes.length - 1];

    // First push every other note as is to opened chord
    for (let i = 0; i < this.notes.length; i += 2) {
      const myOpenedNote = this.notes[i];
      openedChordNotes.push(myOpenedNote);
    }

    //Then, starting with second note of chord, transpose every other note by
    // sufficient octaves to make it higher than last note
    for (let i = 1; i < this.notes.length; i += 2) {
      let myOpenedNote = this.notes[i];
      while (myOpenedNote <= lastNote) {
        myOpenedNote += 12;
      }
      lastNote = myOpenedNote;
      openedChordNotes.push(myOpenedNote);
    }

    this.notes = openedChordNotes;
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }

  expand() {
    const firstNote = this.notes[0];
    const lastNote = this.notes[this.notes.length - 1];
    const interval = lastNote - firstNote;
    let expandedNote;
    let expandedChordNotes = [];

    for (let i = 0; i < this.notes.length; i++) {
      expandedNote = this.notes[i];
      while (expandedNote <= lastNote) {
        if (interval > 12) expandedNote += 24;
        if (interval <= 12) expandedNote += 12;
      }
      expandedChordNotes.push(expandedNote);
    }
    // Add expanded chord notes to end of this.notes array
    expandedChordNotes.forEach((note) => {
      this.notes.push(note);
    });
    this.sortNotes();
    getKeyboard().displayCurrentChord();
  }
}
