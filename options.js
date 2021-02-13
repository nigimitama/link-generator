/*
TODO:
- delete button
- handling '\n'


*/
function init() {
  showVersion();
  let updateButton = document.getElementById("updateButton");
  updateButton.addEventListener("click", function(){ updateSettings() });
  renderSettingsDiv()
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
      let nameInput = formDiv.querySelector('.lg-name').querySelector('input');
      nameInput.value = format['name'];
      const isTextFormat = (format['format'] != null);
      if (isTextFormat) {
        let formatInput = getFormatInput(formDiv, format);
        formatInput.value = format['format'];
      }
      settingsDiv.appendChild(formDiv);
    }
  });
}

function getFormatInput(formDiv, format) {
  let inputs = formDiv.querySelectorAll('.lg-format');
  console.log(inputs);
  const isMultiLines = format['format'].includes('\n');
  let formatInput = isMultiLines ? inputs[1] : inputs[0];
  formatInput.hidden = false;
  return formatInput;
}

function createFormDiv() {
  let div = document.getElementById('formTemplate').cloneNode(true);
  div.removeAttribute("id");
  div.hidden = false;
  return div
}

function updateSettings() {

}

init();