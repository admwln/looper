import {
  getProject,
  getLoopOn,
  getMasterTurnaround,
  setMasterTurnaround,
} from "./helper-functions.js";

export default class Player {
  constructor() {
    this.playbackStartTime = 0;
    this.playbackStepCounter = 0;
    this.allGroups = [];
    this.stepDuration = 125;
  }

  updateStepDuration() {
    this.stepDuration = Tone.Time("16n").toMilliseconds();
  }

  getStepDuration() {
    return this.stepDuration;
  }

  setPlaybackStepCounter(newValue) {
    this.playbackStepCounter = newValue;
  }

  resetPlaybackStepCounter() {
    this.playbackStepCounter = 0;
  }

  getPlaybackStepCounter() {
    return this.playbackStepCounter;
  }

  setAllGroups(groups) {
    this.allGroups = groups;
  }

  getAllGroups() {
    return this.allGroups;
  }

  getPlaybackStartTime() {
    return this.playbackStartTime;
  }

  setPlaybackStartTime(newValue) {
    this.playbackStartTime = newValue;
    console.log("playbackStartTime set", this.playbackStartTime);
  }

  checkAllGroups(target) {
    const groupsToUpdate = [];
    this.allGroups.forEach((group) => {
      //console.log("checking", group);
      const section = group.getSection();
      // If group's section is not selected, return
      if (section.selected === false) {
        // The non-selected group's dynamicInterval should not be updated
        return;
      }
      // Pass current time to dynamicInterval.play(), instead of player's playbackStartTime
      group.dynamicInterval.play(target);
      //console.log("playing dynInt of group", group);
      // Push to groupsToUpdate
      groupsToUpdate.push(group);
    });
    // groupsToUpdate is an array of all groups in the selected section, groups that have been played
    groupsToUpdate.forEach((group) => {
      const stepCount = group.sequences[0].steps.length;
      group.dynamicInterval.update(stepCount, group);
    });
  }

  loop(diff, target) {
    if (getLoopOn() === false) return;
    setTimeout(() => {
      // If master group of current section has reached the end of its loop
      // and another section is queued, getMasterTurnaround() will be true
      // if so, find the queued section and select it
      if (getMasterTurnaround()) {
        const sections = getProject().sections;
        sections.forEach((section) => {
          // If the section is queued, and if masterTurnaround is true, its time to select the next section
          if (section.queued) {
            section.selectNext();
            setMasterTurnaround(false);
          }
        });
      }

      this.checkAllGroups(target);

      // Increase playback step counter
      this.setPlaybackStepCounter(this.getPlaybackStepCounter() + 1);

      // Use playbackStepCounter to determine time of next 16th note
      const nextTarget =
        this.getPlaybackStepCounter() * this.stepDuration +
        this.getPlaybackStartTime();
      // Get difference between nextTarget and now, represents time to next 16th note
      diff = nextTarget - performance.now();
      // Silent loop with short interval, updates diff and returns when diff is small enough
      if (diff > 50) {
        this.silentLoop(nextTarget);
      }

      // Check that loop is still on
      if (getLoopOn() === false) return;
      // Recursive call to loop()
      this.loop(diff, nextTarget);
    }, diff);
  }

  silentLoop(nextTarget) {
    setTimeout(() => {
      const diff = nextTarget - performance.now();
      if (diff < 25) return;
      this.silentLoop(nextTarget);
    }, 25);
  }
}
