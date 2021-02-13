var idNumber = 0;

function init() {
  showVersion();
  setupButtons();
  renderSettingsDiv();
}

function setupButtons() {
  let saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", function(){ saveSettings() });
  let addButton = document.getElementById("addButton");
  addButton.addEventListener("click", function(){ addForm() });
}

function addForm() {
  let formDiv = createFormDiv();
  const isMultiLines = true;
  getFormatInput(formDiv, isMultiLines);
  let settingsDiv = document.getElementById("settingsDiv");
  settingsDiv.appendChild(formDiv);
}

function deleteForm(id) {
  let div = document.getElementById(id);
  console.log(div);
  div.hidden = true;
}

function showVersion() {
  // TODO: manifest.jsonからversionを取得する
  const version = 0.1;
  let versionInfo = document.getElementById("versionInfo");
  versionInfo.innerText = `version ${version}`
}

function renderSettingsDiv() {
  let settingsDiv = document.getElementById("settingsDiv");
  chrome.storage.sync.get(['formats'], (storage) => {
    var formats = storage.formats;
    for (let format of formats) {
      let formDiv = createFormDiv();
      let nameInput = formDiv.querySelector('.lg-name');
      nameInput.value = format['name'];
      const isTextFormat = (format['format'] != null);
      if (isTextFormat) {
        const isMultiLines = format['format'].includes('\n');
        let formatInput = getFormatInput(formDiv, isMultiLines);
        formatInput.value = format['format'];
      }
      settingsDiv.appendChild(formDiv);
    }
  });
}

function getFormatInput(formDiv, isMultiLines) {
  let inputs = formDiv.querySelectorAll('.lg-format');
  let formatInput = isMultiLines ? inputs[1] : inputs[0];
  formatInput.hidden = false;
  return formatInput;
}

function createFormDiv() {
  // clone template div
  let div = document.getElementById('formTemplate').cloneNode(true);
  div.removeAttribute("id");
  div.hidden = false;
  // setup delete button
  let id = `form${idNumber}`;
  div.id = id;
  idNumber += 1;
  let deleteButton = div.querySelector(".lg-delete-button");
  deleteButton.addEventListener("click", function(){ deleteForm(id) });
  return div
}


function receiveInputs() {
  var formats = [];
  for (let i = 0; i <= idNumber; i++) {
    let formDiv = document.getElementById(`form${i}`);
    if ((formDiv != null) && (!formDiv.hidden)) {
      let name = formDiv.querySelector('.lg-name').value;
      let formatTags = formDiv.querySelectorAll('.lg-format');
      var format = null;
      for (let formatTag of formatTags) {
        if (!formatTag.hidden) {
          format = formatTag.value;
          break
        }
      }
      format = (format == "") ? null : format;
      const allNull = ((name == "") && (format == null));
      if (!allNull) {
        formats.push({ name: name, format: format });
      }
    }
  }
  return formats;
}


function saveSettings() {
  let formats = receiveInputs();
  chrome.storage.sync.set({ formats: formats });
  let notice = document.getElementById("saveNotice");
  notice.hidden = false;
}

init();