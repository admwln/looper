import { setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Bundle {
  constructor(stepNo, min, max) {
    this.stepNo = stepNo;
    this.min = min;
    this.max = max;
    this.steps = [];
  }
}
