import { setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Key {
  constructor(midiNote) {
    this.id = "key" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.midiNote = midiNote;
    this.color = this.getColor(midiNote);
    this.html = this.createHtml();
  }

  getColor(midiNote) {
    const black = [1, 3, 6, 8, 10]; // C notes are divisible by 12, so we can use the remainder to determine the color.
    const remainder = midiNote % 12;
    console.log("remainder", remainder);
    if (black.includes(remainder)) {
      return "black";
    }
    return "white";
  }

  createHtml() {
    return `
      <li class='key ${this.color}' id='${this.id}' data='${this.midiNote}'></li>
    `;
  }
}
