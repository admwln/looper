import { setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Step {
  constructor(noteName, pixelValue) {
    this.id = "stp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteName = noteName;
    this.pixelValue = pixelValue;
  }
}
