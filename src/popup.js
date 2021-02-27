// get current tab when this extension is clicked
window.onload = async function onLoad() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  init(tab.url, tab.title);
}


function init(url, title) {
  renderPopup(url, title);
  setupEdit();
}

function setupEdit() {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  currentUrl.addEventListener("input", function(){ updatePopup() });
  currentTitle.addEventListener("input", function(){ updatePopup() });
}


function updatePopup() {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  clearPopup();
  renderPopup(currentUrl.value, currentTitle.value);
}


function renderPopup(url, title) {
  showLinks(url, title);
  showCurrent(url, title);
}


function clearPopup() {
  var linksDiv = document.getElementById("linksDiv");
  var child;
  while (linksDiv.children.length > 0) {
    child = linksDiv.children[0];
    linksDiv.removeChild(child);
  }
}


function showCurrent(url, title) {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  currentUrl.value = url;
  currentTitle.value = title;
}


// show links on popup.html
function showLinks(url, title) {
  let linksDiv = document.getElementById("linksDiv");
  generateLinks(linksDiv, url, title);
}


function generateLinks(linksDiv, url, title) {
  chrome.storage.sync.get(['formats'], (storage) => {
    var formats = storage.formats;
    for (let format of formats) {
      let name = format['name'];
      // create new div
      let linkDiv = createContentDiv();
      // add header
      let header = linkDiv.querySelector('.lg-header');
      header.innerText = name;
      // add link text
      const asText = (format['format'] != null);
      if (asText) {
        linkDiv = addLinkText(linkDiv, url, title, format);
      } else {
        linkDiv = addLinkHtml(linkDiv, url, title);
      }
      linksDiv.appendChild(linkDiv);
    }
  });
}


function addLinkText(linkDiv, url, title, format) {
  const name = format['name'];
  const link = formatLinkText(format['format'], url, title);
  // add link text
  let linkTexts = linkDiv.querySelectorAll('.lg-link-text');
  const isMultiLines = format['format'].includes('\n');
  let linkText = isMultiLines ? linkTexts[1] : linkTexts[0];
  linkText.value = link;
  linkText.id = name;
  linkText.hidden = false;
  // add copy button
  let button = linkDiv.querySelector('.lg-copy-button');
  button.addEventListener("click", function(){ copyToClipboard(name) });
  // NOTE: CSPの関係上onclickは許可されないが、addEventListenerは許可される
  return linkDiv;
}


function addLinkHtml(linkDiv, url, title) {
  let containerDiv = linkDiv.querySelector('.container');
  linkDiv.removeChild(containerDiv);
  // add a-tag
  let a = document.createElement('a');
  a.href = url;
  a.innerText = title;
  linkDiv.appendChild(a);
  return linkDiv;
}


function formatLinkText(format, url, title) {
  const link = format.replace('%title%', title).replace('%url%', url);
  return link;
}


function createContentDiv() {
  let contentDiv = document.getElementById('contentTemplate').cloneNode(true);
  contentDiv.removeAttribute("id");
  contentDiv.hidden = false;
  return contentDiv
}


function copyToClipboard(name) {
  let target = document.getElementById(name);
  target.select();
  document.execCommand("copy");
}
