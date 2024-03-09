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
    getKeyboard().clear();
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
    // Update keyboard
    getKeyboard().keys.forEach((key) => {
      if (currentChord.notes.includes(key.midiNote)) {
        key.on = true;
        $(`#${key.id}`).addClass("on");
      }
    });
    currentChord.updateKeyNos();
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
}
