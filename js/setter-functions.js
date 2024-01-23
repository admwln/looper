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
