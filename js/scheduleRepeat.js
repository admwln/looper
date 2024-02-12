// Before play button event listener:
// let transportId; // Tone.Transport.scheduleRepeat id

// When stop has been clicked:
// Tone.Transport.stop();
// Tone.Transport.clear(transportId);

// Start the transport after 0 seconds and save the start time
// console.log("playbackStartTime", playbackStartTime);
// const playbackStartTimeSec = playbackStartTime / 1000;
// Called before let playbackStartTime;

//Tone.Transport.start();
// Called right before setLoopOn(true);

// MAIN LOOP --------------------------------------------------------------
// Tone.js loop every 16th note
// let mainLoop = Tone.Transport.scheduleRepeat(
//   (time) => {
//     // If master group of current section has reached the end of its loop
//     // and another section is queued, getMasterTurnaround() will be true
//     // if so, find the queued section and select it
//     if (getMasterTurnaround()) {
//       const sections = getProject().sections;
//       sections.forEach((section) => {
//         // If the section is queued, and if masterTurnaround is true, its time to select the next section
//         if (section.queued) {
//           section.selectNext();
//           setMasterTurnaround(false);
//         }
//       });
//     }

//     // Tone.Draw will fire at exact "time" of Tone.Transport.scheduleRepeat(), ie every 16th note
//     Tone.Draw.schedule(function () {
//       // On first loop, update playbackStartTime, update inside Tone.Draw to get as current a time as possible
//       if (getPlaybackStepCounter() === 0) {
//         playbackStartTime = performance.now();
//         console.log("playbackStartTime updated", playbackStartTime);
//       }

//       // Use playbackStepCounter to determine time of 16th note
//       const now =
//         getPlaybackStepCounter() * stepDuration + playbackStartTime;

//       let groupsToUpdate = [];
//       allGroups.forEach((group) => {
//         const section = group.getSection();
//         // If group's section is not selected, return
//         if (section.selected === false) {
//           // The non-selected group's dynamicInterval should not be updated
//           return;
//         }
//         // Pass time of current repeat to dynamicInterval.play(), instead of Tone.js's time
//         group.dynamicInterval.play(now);
//         // Push to groupsToUpdate
//         groupsToUpdate.push(group);
//       });
//       // GroupsToUpdate is an array of all groups in the selected section, groups that have been played
//       groupsToUpdate.forEach((group) => {
//         const stepCount = group.sequences[0].steps.length;
//         group.dynamicInterval.update(stepCount, group);
//       });

//       // Increase playback step counter
//       setPlaybackStepCounter(getPlaybackStepCounter() + 1);
//     }, time);
//   },
//   "16n"
//   //"+0.005"
// );
// transportId = mainLoop;
