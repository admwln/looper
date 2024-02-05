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
        triggerInterval.steps.push(this.id);
      }
    });
  }

  removeFromTriggerInterval() {
    const group = this.findGroup();
    const triggerIntervals = group.triggerIntervals;

    triggerIntervals.forEach((triggerInterval) => {
      const index = triggerInterval.steps.indexOf(this.id);
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
}
