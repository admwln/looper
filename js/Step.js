import {
  getProject,
  setIdCounter,
  getIdCounter,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class Step {
  constructor(noteName, pixelValue) {
    this.id = "stp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteName = noteName;
    this.pixelValue = pixelValue;
    this.state = "off";
  }

  toggleState() {
    if (this.state == "off") {
      this.state = "on";
      this.updateMsFromLoopStart();
      this.addToTriggerInterval();
      $("#" + this.id)
        .removeClass("off")
        .addClass("on");
    } else {
      this.state = "off";
      this.removeFromTriggerInterval();
      $("#" + this.id)
        .removeClass("on")
        .addClass("off");
    }
  }

  updateStep() {
    $("#" + this.id).css("width", this.pixelValue);
    $("#" + this.id).attr("data", this.noteName);
  }

  // Trigger interval logic
  addToTriggerInterval() {
    // Find the group this step belongs to
    const group = this.findGroup();
    const triggerIntervals = group.triggerIntervals;

    triggerIntervals.forEach((triggerInterval) => {
      if (
        this.msFromLoopStart >= triggerInterval.min &&
        this.msFromLoopStart <= triggerInterval.max
      ) {
        triggerInterval.steps.push(this);
      }
    });
  }

  removeFromTriggerInterval() {
    const group = this.findGroup();
    const triggerIntervals = group.triggerIntervals;
    triggerIntervals.forEach((triggerInterval) => {
      // Look in each triggerInterval.steps for step with identical id to this.id and remove it
      const index = triggerInterval.steps.findIndex(
        (step) => step.id === this.id
      );
      if (index > -1) {
        triggerInterval.steps.splice(index, 1);
      }
    });
  }

  findGroup() {
    const groupId = $("#" + this.id)
      .closest(".group")
      .attr("id");
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    return group;
  }

  getMsFromIntStart(stepNo) {
    // stepNo of triggerInterval
    const msFromIntStart =
      this.msFromLoopStart - (stepNo - 1) * Tone.Time("16n").toMilliseconds();
    return msFromIntStart;
  }
}
