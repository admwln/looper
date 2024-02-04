import { setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Bundle {
  constructor(stepNo, min, max) {
    this.stepNo = stepNo;
    this.min = min;
    this.max = max;
    this.steps = [];
  }

  // playBundle(counter, time) {
  //   const stepCount = this.steps.length;
  //   // If stepCount is 0, return
  //   if (stepCount === 0) {
  //     return;
  //   }
  //   const step = this.steps[counter % stepCount];
  //   console.log("step:", step);
  // }
}
