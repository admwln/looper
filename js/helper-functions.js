let _project = {};

export function setProject(newProject) {
  _project = newProject;
}

export function getProject() {
  return _project;
}

let _idCounter = 0;

export function setIdCounter(newValue) {
  _idCounter = newValue;
}

export function getIdCounter() {
  return _idCounter;
}

let _loopOn = false;

export function getLoopOn() {
  return _loopOn;
}

export function setLoopOn(newValue) {
  _loopOn = newValue;
}

let _masterTurnaround = false;

export function getMasterTurnaround() {
  return _masterTurnaround;
}

export function setMasterTurnaround(newValue) {
  _masterTurnaround = newValue;
}

let _sectionName = "A";

export function getSectionName() {
  return _sectionName;
}

export function setSectionName(newValue) {
  _sectionName = newValue;
}

let _stepWidth = 84;

export function getStepWidth() {
  return _stepWidth;
}

export function nextChar(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

export function findAllNestedProps(obj, propName) {
  console.log("findAllNestedProps called", obj, propName);
  let results = [];
  if (obj.hasOwnProperty(propName)) {
    results.push(obj[propName]);
  }
  for (let i = 0; i < Object.keys(obj).length; i++) {
    if (typeof obj[Object.keys(obj)[i]] === "object") {
      results = results.concat(
        findAllNestedProps(obj[Object.keys(obj)[i]], propName)
      );
    }
  }
  return results;
}

export function findNestedProp(haystack, id) {
  let object = null;
  for (let i = 0; i < haystack.length; i++) {
    object = haystack[i].find((object) => object.id === id);
    if (object) break;
  }
  return object;
}

// Maybe make getNoteName() and getPixelValue() a method of Step or some
// kind of globally accessible function. This would mean that each step would
// only have to have a noteName - the pixelValue would be calculated as needed.
let noteMap = new Map([
  [21, "64n"],
  [63, "32n."],
  [42, "32n"],
  [126, "16n."],
  [84, "16n"],
  [28, "32t"],
  [252, "8n."],
  [168, "8n"],
  [56, "16t"],
  [504, "4n."],
  [336, "4n"],
  [112, "8t"],
  [1008, "2n."],
  [672, "2n"],
  [224, "4t"],
  [1344, "1n"],
]);

export function getNoteName(pixelValue) {
  return noteMap.get(pixelValue);
}
