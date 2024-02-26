import { getProject, setIdCounter, getIdCounter } from "./helper-functions.js";

export default class DotIndicator {
  constructor(group) {
    this.id = "dot" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.groupId = group.id;
    this.dotCount = 1;
    this.currentDot = 0; // zero indexed
    console.log(`Dot indicator "${this.id}" created`);
  }

  displayDots() {
    //console.log("this.currentDot on displayDots", this.currentDot);
    // First empty the dot-indicator
    $("#" + this.groupId + " .dot-indicator").empty();
    // Loop this.dotCount times and append a dot to the dot-indicator
    for (let i = 0; i < this.dotCount; i++) {
      if (i === this.currentDot) {
        this.appendDot(true);
      } else {
        this.appendDot(false);
      }
    }
  }

  appendDot(current) {
    if (current) {
      $("#" + this.groupId + " .dot-indicator").append(
        `<span class='dot current-dot'><i class="fa-solid fa-circle"></i></span>`
      );
    } else {
      $("#" + this.groupId + " .dot-indicator").append(
        `<span class='dot'><i class="fa-regular fa-circle"></i></span>`
      );
    }
  }

  setDotCount(newCount) {
    this.dotCount = newCount;
  }

  setCurrentDot(newCurrentDot) {
    this.currentDot = newCurrentDot;
  }

  extendShorten(group) {
    // How many times can the measureLength fit into the new groupLength?
    let dotsQuotient = Math.floor(group.groupLength / group.measureLength);
    let dotsRemainder = group.groupLength % group.measureLength;

    let dots = dotsQuotient;
    if (dotsRemainder > 0) {
      dots++;
    }
    this.setDotCount(dots);
    //console.log("dots", dots);

    this.setCurrentDot(dots - 1);
    //console.log("current dot", dots - 1);
  }
}
